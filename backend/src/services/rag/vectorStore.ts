import { supabase } from '../../utils/supabase-client.js'; // adjust path to his supabase client if different

export async function insertChunk(userId: string, chunkText: string, embedding: number[], metadata?: any) {
  const { error } = await supabase.from('cv_chunks').insert({
    user_id: userId,
    chunk_text: chunkText,
    embedding,
    metadata: metadata || {},
  });
  if (error) throw error;
}

export async function similaritySearch(userId: string, queryEmbedding: number[], topK: number = 5) {
  const { data, error } = await supabase.rpc('match_cv_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: topK,
    p_user_id: userId,
  });
  if (error) throw error;
  return data.map((row: any) => row.chunk_text);
}
