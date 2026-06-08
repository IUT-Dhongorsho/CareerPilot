import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../../db/index.js';
import { messages } from '../../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { getEmbedding } from '../rag/embeddings.js';
import { similaritySearch } from '../rag/vectorStore.js';
import { searchJobsOnSerpapi } from '../jobSearch/serpapiClient.js';
import { computeFitScore } from '../../utils/fitScoreCalculator.js';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error('[ChatService] GEMINI_API_KEY is missing from environment variables!');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel(
  { model: 'gemini-3.5-flash' },
  { apiVersion: 'v1' }
);

/**
 * Retrieves messages for a session.
 */
export async function getHistory(sessionId: string) {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(asc(messages.createdAt));
}

/**
 * Detects if the user wants to search for jobs and extracts parameters.
 */
async function detectJobSearchIntent(content: string) {
  const prompt = `Analyze the user message and determine if they are explicitly asking to find or search for jobs.
  If yes, construct an extensive search query for Google Jobs (SerpApi).
  The query should be descriptive, including the job title and any specific technologies or seniority levels mentioned.
  
  Example:
  User: "Find me ML jobs"
  Response: { "isSearch": true, "q": "Machine Learning Engineer Python AI", "location": "Dhaka" }

  Respond ONLY with a JSON object: { "isSearch": boolean, "q": string | null, "location": string | null }

  User Message: "${content}"`;

  try {
    console.log(`[ChatService] Detecting intent for: "${content}" using model: gemini-3.5-flash`);
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    console.log(`[ChatService] Intent detection raw response: ${text}`);
    
    // Extract JSON from potential markdown or conversational filler
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { isSearch: false, q: null, location: null };
  } catch (error) {
    console.error('[ChatService] Intent detection error details:', error);
    return { isSearch: false, q: null, location: null };
  }
}

/**
 * Uses Gemini to turn history + new message into a standalone search query.
 */
export async function condenseQuery(history: any[], newMessage: string) {
  if (history.length === 0) return newMessage;

  try {
    const chatContext = history
      .slice(-5) // Take last 5 messages for context
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `Given the following chat history and a new user message, condense them into a single, standalone search query that captures the user's intent. The query should be optimized for searching through CV documents.
  
Chat History:
${chatContext}

New Message: ${newMessage}

Standalone Query:`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('[ChatService] condenseQuery error:', error);
    return newMessage;
  }
}

/**
 * Uses Gemini to generate a hypothetical CV snippet (HyDE).
 */
export async function expandQuery(query: string) {
  try {
    const prompt = `You are an expert career consultant. Given the search query below, generate a hypothetical short paragraph or bullet points from a professional CV that would perfectly address this query.
  
Query: ${query}

Hypothetical CV Snippet:`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('[ChatService] expandQuery error:', error);
    return query;
  }
}

/**
 * Processes a new message with RAG logic.
 */
export async function processMessage(userId: string, sessionId: string, content: string) {
  // 1. Get history
  const history = await getHistory(sessionId);

  // 2. Detect Job Search Intent
  const intent = await detectJobSearchIntent(content);
  let jobResults: any[] | undefined = undefined;
  let jobContext = "";

  if (intent.isSearch && intent.q) {
    console.log(`[ChatService] Job search detected: ${intent.q} in ${intent.location}`);
    const rawJobs = await searchJobsOnSerpapi(intent.q, intent.location || 'Dhaka');
    
    // Enrich with Fit Score (RAG)
    jobResults = await Promise.all(
      rawJobs.slice(0, 5).map(async (job: any) => {
        const fit = await computeFitScore(userId, job.description || '');
        return {
          id: job.job_id || Math.random().toString(),
          title: job.title,
          company: job.company_name,
          location: job.location,
          salary: job.salary || 'Not specified',
          fitScore: fit.score,
          description: job.description,
          link: job.link || job.related_links?.[0]?.link || `https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.company_name)}&ibp=htl;jobs`,
        };
      })
    );

    jobContext = `I found some job matches for you:
${jobResults.map(j => `- ${j.title} at ${j.company} (Fit Score: ${j.fitScore}%, Link: ${j.link || 'N/A'})`).join('\n')}
`;
  }

  // 3. Condense Query for CV RAG
  const condensedQuery = await condenseQuery(history, content);
  
  // 4. Embed condensed query directly
  const embedding = await getEmbedding(condensedQuery);

  // 5. Similarity search in cv_chunks
  const contextChunks = await similaritySearch(userId, embedding);
  const context = contextChunks.length > 0 
    ? contextChunks.join('\n---\n') 
    : "No relevant CV context found.";

  // 6. Prompt Gemini with context + history + message
  const chat = model.startChat({
    history: history
      .slice(-10)
      .filter(m => m.content && m.content.trim() !== '') // Filter out empty messages
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  const systemInstruction = `You are CareerPilot, a helpful and professional AI career assistant. 
Use the provided CV context to answer the user's message accurately.
${jobContext ? `\nJobs context:\n${jobContext}\nIf jobs were found, summarize why they are a good fit based on the CV.` : ''}

CV Context:
${context}`;

  const fullPrompt = `${systemInstruction}\n\nUser: ${content}`;

  const result = await chat.sendMessage(fullPrompt);
  const assistantResponse = result.response.text().trim();

  // 7. Save user and assistant messages to the DB
  await db.insert(messages).values([
    {
      sessionId: sessionId as any,
      role: 'user',
      content: content,
    },
    {
      sessionId: sessionId as any,
      role: 'assistant',
      content: assistantResponse,
      metadata: jobResults ? { jobResults } : null,
    },
  ]);

  return { content: assistantResponse, jobResults };
}
