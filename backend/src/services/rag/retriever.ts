import { getEmbedding } from './embeddings.js';
import { similaritySearch } from './vectorStore.js';

export async function getUserCVChunks(userId: string, query: string, topK: number = 5): Promise<string[]> {
  const embedding = await getEmbedding(query);
  return await similaritySearch(userId, embedding, topK);
}
