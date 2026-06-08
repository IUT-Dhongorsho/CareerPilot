import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { kanbanItems, interviewSessions } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { getUserCVChunks } from '../services/rag/retriever.js';
import { generateInterviewSummary } from '../services/interview/summarizer.js';

export const getVapiConfig = async (req: Request, res: Response) => {
  console.log('[getVapiConfig] Request received', { jobId: req.params.jobId, userId: (req as any).user?.id });
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      console.error('[getVapiConfig] Unauthorized: No userId in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { jobId } = req.params;
    if (!jobId) {
      console.error('[getVapiConfig] Bad Request: Missing jobId');
      return res.status(400).json({ error: 'Missing jobId' });
    }

    // Validate jobId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      console.error('[getVapiConfig] Invalid jobId format:', jobId);
      return res.status(400).json({ 
        error: 'Invalid Job ID format', 
        details: 'The interview feature requires jobs to be saved in your tracker (database). Mock jobs from search results are not supported.' 
      });
    }

    console.log('[getVapiConfig] Fetching job details...');
    // Fetch job details from kanbanItems table
    const [job] = await db
      .select()
      .from(kanbanItems)
      .where(and(eq(kanbanItems.id, jobId), eq(kanbanItems.userId, userId)))
      .limit(1);

    if (!job) {
      console.error('[getVapiConfig] Job not found', { jobId, userId });
      return res.status(404).json({ error: 'Job not found in your tracker. Please make sure the job is added to your Kanban board.' });
    }

    console.log('[getVapiConfig] Creating interview session...');
    // Create interview session record
    const [session] = await db
      .insert(interviewSessions)
      .values({
        userId,
        jobId: job.id,
        status: 'started',
      })
      .returning();

    console.log('[getVapiConfig] Session created', { sessionId: session.id });

    console.log('[getVapiConfig] Fetching CV chunks...');
    // Get context from user's CV
    const cvChunks = await getUserCVChunks(userId, `Interview preparation for ${job.jobTitle} position at ${job.company}`, 10);
    const candidateCv = cvChunks.join('\n') || 'No CV information available.';
    console.log(`[getVapiConfig] Found ${cvChunks.length} CV chunks`);

    // Structure response as requested by frontend
    const response = {
      publicKey: process.env.VAPI_PUBLIC_KEY,
      assistantId: process.env.VAPI_ASSISTANT_ID,
      sessionId: session.id,
      assistantOverride: {
        variableOverrides: {
          job_title: job.jobTitle,
          job_description: job.jobDescription || 'No description provided',
          candidate_cv: candidateCv,
        },
      },
    };

    console.log('[getVapiConfig] Sending success response');
    res.json(response);
  } catch (error: any) {
    console.error('[getVapiConfig] Error:', error);
    res.status(500).json({ error: 'Failed to generate Vapi configuration', details: error.message });
  }
};

export const handleVapiWebhook = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || message.type !== 'call.ended') {
      console.log(`[VapiWebhook] Ignored message type: ${message?.type}`);
      return res.status(200).json({ status: 'ignored' });
    }

    const { call, transcript } = message;
    const vapiCallId = call.id;
    const metadata = call.metadata || {};
    const sessionId = metadata.sessionId;

    console.log(`[VapiWebhook] Processing call.ended for sessionId: ${sessionId}, callId: ${vapiCallId}`);

    if (!sessionId) {
      console.error('[VapiWebhook] No sessionId found in Vapi metadata');
      return res.status(400).json({ error: 'Missing sessionId in metadata' });
    }

    // Fetch session and job title for better summary
    const sessionWithJob = await db.query.interviewSessions.findFirst({
      where: eq(interviewSessions.id, sessionId),
      with: {
        job: true,
      },
    });

    const jobTitle = sessionWithJob?.job?.jobTitle || 'Unknown Position';

    // Generate summary using Groq
    const summary = await generateInterviewSummary(transcript, jobTitle);

    // Update DB
    await db
      .update(interviewSessions)
      .set({
        transcript,
        summary,
        status: 'completed',
        vapiCallId,
      })
      .where(eq(interviewSessions.id, sessionId));

    console.log(`[VapiWebhook] Successfully updated session ${sessionId}`);

    res.json({ status: 'success' });
  } catch (error) {
    console.error('[VapiWebhook] Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
