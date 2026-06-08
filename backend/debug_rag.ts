import { getUserCVChunks } from './src/services/rag/retriever.js';
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const userId = '32e164a8-c4b0-4357-b41a-3b7fb3a9cadb';

async function debug() {
  try {
    console.log('Fetching chunks...');
    const chunks = await getUserCVChunks(userId, 'experience skills', 5);
    console.log('Chunks found:', chunks);
    
    if (chunks.length === 0) {
      console.log('No chunks found. Similarity search might be failing or threshold too high.');
      return;
    }

    const prompt = `Extract info from: ${chunks.join('\n')}. Return JSON.`;
    console.log('Calling Groq...');
    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
    });
    console.log('Groq Response:', completion.choices[0].message.content);
  } catch (err) {
    console.error('Debug Error:', err);
  }
}

debug();
