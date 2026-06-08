import { db } from '../../db/index.js';
import { messages } from '../../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { getEmbedding } from '../rag/embeddings.js';
import { similaritySearch } from '../rag/vectorStore.js';
import { searchJobsOnSerpapi } from '../jobSearch/serpapiClient.js';
import { computeFitScore } from '../../utils/fitScoreCalculator.js';
import { generateGroqResponse } from '../llm/groqClient.js';
import * as dotenv from 'dotenv';

dotenv.config();

export async function getHistory(sessionId: string) {
  return await db.select().from(messages).where(eq(messages.sessionId, sessionId)).orderBy(asc(messages.createdAt));
}

async function detectJobSearchIntent(content: string) {
  const prompt = `Analyze if user wants to search jobs. Return JSON: {"isSearch":boolean,"q":string|null,"location":string|null}\nMessage: "${content}"`;
  try {
    const text = await generateGroqResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { isSearch: false, q: null, location: null };
  } catch (error) {
    console.error('Intent detection error:', error);
    return { isSearch: false, q: null, location: null };
  }
}

export async function condenseQuery(history: any[], newMessage: string) {
  if (history.length === 0) return newMessage;
  const chatContext = history.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
  const prompt = `Condense into standalone search query.\nHistory:\n${chatContext}\nNew: ${newMessage}\nStandalone query:`;
  try {
    return await generateGroqResponse(prompt);
  } catch (error) {
    console.error(error);
    return newMessage;
  }
}

export async function processMessage(userId: string, sessionId: string, content: string) {
  const history = await getHistory(sessionId);
  const intent = await detectJobSearchIntent(content);
  let jobResults: any[] | undefined;
  let jobContext = "";

  if (intent.isSearch && intent.q) {
    const rawJobs = await searchJobsOnSerpapi(intent.q, intent.location || 'Dhaka');
    jobResults = await Promise.all(rawJobs.slice(0, 5).map(async (job: any) => {
      const fit = await computeFitScore(userId, job.description || '');
      return {
        id: job.job_id || Math.random().toString(),
        title: job.title,
        company: job.company_name,
        location: job.location,
        salary: job.salary || 'Not specified',
        fitScore: fit.score,
        description: job.description,
        link: job.link || `https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.company_name)}&ibp=htl;jobs`,
      };
    }));
    jobContext = `Job matches:\n${jobResults.map(j => `- ${j.title} at ${j.company} (Fit: ${j.fitScore}%)`).join('\n')}\n`;
  }

  const condensedQuery = await condenseQuery(history, content);
  const embedding = await getEmbedding(condensedQuery);
  const contextChunks = await similaritySearch(userId, embedding);
  const cvContext = contextChunks.length ? contextChunks.join('\n---\n') : "No CV context found.";

  const systemInstruction = `You are CareerPilot, an AI career assistant. Use the provided CV context and job listings to answer.\n\nCV Context:\n${cvContext}\n${jobContext}`;
  const fullPrompt = `${systemInstruction}\n\nUser: ${content}`;
  const assistantResponse = await generateGroqResponse(fullPrompt);

  await db.insert(messages).values([
    { sessionId: sessionId as any, role: 'user', content },
    { sessionId: sessionId as any, role: 'assistant', content: assistantResponse, metadata: jobResults ? { jobResults } : null },
  ]);

  return { content: assistantResponse, jobResults };
}
