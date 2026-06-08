import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../../db/index.js';
import { messages } from '../../db/schema.js';
import { eq, asc } from 'drizzle-orm';
import { getEmbedding } from '../rag/embeddings.js';
import { similaritySearch } from '../rag/vectorStore.js';
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
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
 * Uses Gemini to turn history + new message into a standalone search query.
 */
export async function condenseQuery(history: any[], newMessage: string) {
  if (history.length === 0) return newMessage;

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
}

/**
 * Uses Gemini to generate a hypothetical CV snippet (HyDE).
 */
export async function expandQuery(query: string) {
  const prompt = `You are an expert career consultant. Given the search query below, generate a hypothetical short paragraph or bullet points from a professional CV that would perfectly address this query.
  
Query: ${query}

Hypothetical CV Snippet:`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * Processes a new message with RAG logic.
 */
export async function processMessage(userId: string, sessionId: string, content: string) {
  // 1. Get history
  const history = await getHistory(sessionId);

  // 2. Condense Query
  const condensedQuery = await condenseQuery(history, content);
  console.log(`[ChatService] Condensed Query: ${condensedQuery}`);

  // 3. Embed condensed query directly (Removing HyDE for better accuracy)
  const embedding = await getEmbedding(condensedQuery);

  // 4. Similarity search in cv_chunks
  const contextChunks = await similaritySearch(userId, embedding);
  const context = contextChunks.length > 0 
    ? contextChunks.join('\n---\n') 
    : "No relevant CV context found.";

  // 6. Prompt Gemini with context + history + message
  const chat = model.startChat({
    history: history.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  const systemInstruction = `You are CareerPilot, a helpful and professional AI career assistant. 
Use the provided CV context to answer the user's message accurately.
If the information is not in the CV context, use your general career knowledge but clearly state if you are deviating from the CV.

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
    },
  ]);

  return assistantResponse;
}
