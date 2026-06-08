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

export async function clearUserChunks(userId: string) {
  console.log(`Clearing existing chunks for user ${userId}`);
  await db.delete(cvChunks).where(eq(cvChunks.userId, userId));
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
    .where(
      and(
        eq(cvChunks.userId, userId),
        gt(similarity, 0.7) // match_threshold
      )
    )
    .orderBy((t) => desc(t.similarity))
    .limit(topK);

  return results.map((row) => row.chunkText);
}
