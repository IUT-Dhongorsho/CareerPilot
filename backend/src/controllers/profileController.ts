import { Request, Response } from 'express';
import { similaritySearch } from '../services/rag/vectorStore.js';
import { getEmbedding } from '../services/rag/embeddings.js';
import { generateGroqResponse } from '../services/llm/groqClient.js';

export const extractProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const dummyQuery = "extract name email skills experience education";
    const embedding = await getEmbedding(dummyQuery);
    const chunks = await similaritySearch(userId, embedding, 10);
    const cvText = chunks.join('\n');

    const prompt = `Extract from CV. Return ONLY JSON: {"name":"","email":"","skills":[],"experience":[],"education":[]}\nCV:\n${cvText}`;
    const text = await generateGroqResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const profile = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to extract profile' });
  }
};

export const analyzeCV = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const embedding = await getEmbedding("cv feedback improvements");
    const chunks = await similaritySearch(userId, embedding, 15);
    const cvText = chunks.join('\n');

    const prompt = `You are a career coach. Analyze CV:\n${cvText}\nProvide feedback (strengths, weaknesses, ATS, improvements).`;
    const feedback = await generateGroqResponse(prompt);
    res.json({ success: true, feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze CV' });
  }
};
