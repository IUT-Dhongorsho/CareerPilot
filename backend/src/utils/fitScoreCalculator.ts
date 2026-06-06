import { getUserCVChunks } from '../services/rag/retriever.js';
import { getEmbedding } from '../services/rag/embeddings.js';

export async function computeFitScore(userId: string, jobDescription: string): Promise<{ score: number; matchingSkills: string[]; missingSkills: string[] }> {
  try {
    // Retrieve relevant CV chunks
    const cvChunks = await getUserCVChunks(userId, jobDescription, 5);
    const cvText = cvChunks.join(' ');

    // Simple keyword overlap (you can enhance with embedding similarity)
    const jobWords = jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const cvWords = new Set(cvText.toLowerCase().split(/\W+/));
    const matching = jobWords.filter(w => cvWords.has(w));
    const score = Math.min(100, Math.round((matching.length / Math.max(1, jobWords.length)) * 100));
    return {
      score,
      matchingSkills: matching.slice(0, 5),
      missingSkills: [], // optional: compute missing from job requirements
    };
  } catch (error) {
    console.error('Fit score error:', error);
    return { score: 50, matchingSkills: [], missingSkills: [] };
  }
}
