# CareerPilot Backend – Implementation Context

## Overview

This document describes the **backend services** built for CareerPilot, focusing on:
- RAG (Retrieval-Augmented Generation) pipeline  
- Job search with fit scores  
- Tracker (Kanban, Todos, Calendar)  
- Profile extraction and CV analysis  
- Mock interview system  

All services are built with **Express + TypeScript**, **Supabase (PostgreSQL + pgvector)**, **Groq (Llama 3)**, and **Transformers.js** for local embeddings.

---

## 1. RAG Pipeline (CV Upload → Chunks → Embeddings → Storage)

### File Locations
- **Routes:** `src/routes/cvRoutes.ts`
- **Controller:** `src/controllers/cvController.ts`
- **Services:** `src/services/rag/`
  - `chunker.ts` – recursive text splitting
  - `embeddings.ts` – local embedding via Transformers.js
  - `vectorStore.ts` – insert & similarity search in Supabase
  - `retriever.ts` – public function `getUserCVChunks(userId, query, topK)`
- **Utils:** `src/utils/pdfParser.ts`, `src/utils/docxParser.ts` – PDF/DOCX text extraction

### Flow
1. `POST /api/cv/upload` (multipart/form-data, field `cv`)
2. `authMiddleware` attaches `req.user.id`.
3. `cvController.handleUpload`:
   - Parses file based on MIME type (PDF → `pdfjs-dist`, DOCX → `mammoth`, TXT → `buffer.toString()`).
   - Calls `recursiveChunk(text, 500, 50)` → array of text chunks.
   - For each chunk, calls `getEmbedding(chunk)` – uses Transformers.js with `Xenova/all-MiniLM-L6-v2` (local model, no external API).
   - Calls `insertChunk(userId, chunkText, embedding)` – stores in Supabase table `cv_chunks`.
4. Returns `{ success: true, chunksCount: N }`.

### Database Table
```sql
CREATE TABLE cv_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(384),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);