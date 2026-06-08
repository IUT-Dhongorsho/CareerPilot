import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Use the recommended model from Groq's deprecation notice
const MODEL = 'llama-3.3-70b-versatile';

export async function generateGroqResponse(prompt: string, maxRetries = 2): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });
      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response');
      return content;
    } catch (err: any) {
      const isRateLimit = err.status === 429 || err.message?.includes('rate');
      if (isRateLimit && attempt < maxRetries) {
        const delay = 1000 * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}
