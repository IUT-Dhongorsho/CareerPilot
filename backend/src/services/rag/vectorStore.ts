import { db } from '../../db/index.js';
import { cvChunks } from '../../db/schema.js';
import { eq, and, cosineDistance, gt, sql, desc } from 'drizzle-orm';

export async function insertChunk(userId: string, chunkText: string, embedding: number[], metadata?: any) {
  await db.insert(cvChunks).values({
    userId,
    chunkText,
    embedding,
    metadata: metadata || {},
  });
}

export async function similaritySearch(userId: string, queryEmbedding: number[], topK: number = 5) {
  // Similarity = 1 - Cosine Distance
  const similarity = sql<number>`1 - (${cosineDistance(cvChunks.embedding, queryEmbedding)})`;

  const results = await db
    .select({
      chunkText: cvChunks.chunkText,
      similarity: similarity,
    })
    .from(cvChunks)
    .where(eq(cvChunks.userId, userId)) // Remove similarity filter for debugging
    .orderBy((t) => desc(t.similarity))
    .limit(topK);

  console.log(`[VectorStore] Debug: Found ${results.length} total chunks for user ${userId}.`);
  results.forEach((r, i) => {
    console.log(`  [Chunk ${i}] Similarity: ${r.similarity.toFixed(4)} | Text: ${r.chunkText.substring(0, 50)}...`);
  });

  const filteredResults = results.filter(r => r.similarity > 0.5);
  return filteredResults.map((row) => row.chunkText);
}
