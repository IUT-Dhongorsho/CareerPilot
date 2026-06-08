import { Groq } from 'groq-sdk';

const genAI = new Groq(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // Use gemini-2.0-flash (free tier)

// In‑memory cache
const cache = new Map<string, { data: string; expires: number }>();

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateWithRetry(prompt: string, userId?: string, maxRetries = 3): Promise<string> {
  const cacheKey = `${userId || 'global'}:${prompt.slice(0, 200)}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateGroqResponse(prompt);
      const text = result.response.text();
      cache.set(cacheKey, { data: text, expires: Date.now() + 60000 });
      return text;
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error.message?.includes('429') || error.status === 429;
      if (!isRateLimit || attempt === maxRetries) break;
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(`[Gemini] Rate limited, retry in ${delay}ms (attempt ${attempt}/${maxRetries})`);
      await sleep(delay);
    }
  }
  throw lastError;
}
