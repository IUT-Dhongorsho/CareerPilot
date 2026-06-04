import { Request, Response } from 'express';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { extractTextFromDOCX } from '../utils/docxParser.js';
import { recursiveChunk } from '../services/rag/chunker.js';
import { getEmbedding } from '../services/rag/embeddings.js';
import { insertChunk } from '../services/rag/vectorStore.js';

export const handleUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get user ID from auth middleware (must be attached by authMiddleware)
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user ID' });
    }

    const buffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    let text = '';

    if (mimeType === 'application/pdf') {
      text = await extractTextFromPDF(buffer);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractTextFromDOCX(buffer);
    } else if (mimeType === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Only PDF, DOCX, or TXT allowed' });
    }

    const chunks = recursiveChunk(text, 500, 50);
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      await insertChunk(userId, chunk, embedding);
    }

    res.json({ success: true, chunksCount: chunks.length });
  } catch (error) {
    console.error('CV processing error:', error);
    res.status(500).json({ error: `Failed to process CV: ${(error as Error).message}` });
  }
};
