import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function test() {
  console.log('Using API Key:', process.env.GEMINI_API_KEY?.substring(0, 5) + '...');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' }, { apiVersion: 'v1beta' });

  try {
    console.log('Sending request to Gemini...');
    const result = await model.generateContent('Hello, are you there?');
    console.log('Response:', result.response.text());
  } catch (error: any) {
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    if (error.cause) {
      console.error('Error Cause:', error.cause);
    }
    if (error.stack) {
      console.error('Stack Trace:', error.stack);
    }
  }
}

test();
