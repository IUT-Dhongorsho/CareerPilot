import { pipeline } from '@huggingface/transformers';

let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    console.log('Loading embedding model (first run may take a moment)...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const extractor = await getEmbedder();
  const result = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}
