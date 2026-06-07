import { getUserCVChunks } from '../services/rag/retriever.js';
import { getEmbedding } from '../services/rag/embeddings.js';
import { cosineSimilarity } from './cosineSimilarity.js';

export async function computeFitScore(userId: string, jobDescription: string): Promise<{ score: number; matchingSkills: string[]; missingSkills: string[] }> {
  try {
    const cvChunks = await getUserCVChunks(userId, jobDescription, 5);
    const cvText = cvChunks.join(' ');
    
    const cvEmbedding = await getEmbedding(cvText);
    const jobEmbedding = await getEmbedding(jobDescription);
    const similarity = cosineSimilarity(cvEmbedding, jobEmbedding);
    const score = Math.min(100, Math.max(0, Math.round(similarity * 100)));

    // Simple keyword extraction for matching/missing (optional, can be enhanced)
    const jobWords = new Set(jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    const cvWords = new Set(cvText.toLowerCase().split(/\W+/));
    const matching = [...jobWords].filter(w => cvWords.has(w));
    const missing = [...jobWords].filter(w => !cvWords.has(w)).slice(0, 5);

    return { score, matchingSkills: matching.slice(0, 5), missingSkills: missing };
  } catch (error) {
    console.error('Fit score error:', error);
    return { score: 50, matchingSkills: [], missingSkills: [] };
  }
}
