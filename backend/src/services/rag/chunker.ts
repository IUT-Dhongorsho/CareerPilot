export function recursiveChunk(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;
    if (end > text.length) end = text.length;
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}
