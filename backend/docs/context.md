# CareerPilot Backend – Implementation Context (Final)

## Overview

This document describes the **backend services** built for CareerPilot, focusing on:

- RAG (Retrieval-Augmented Generation) pipeline
- Job search with cosine similarity fit score
- Tracker (Kanban, Todos, Calendar)
- Profile extraction and CV analysis
- Mock interview system with Redis sessions
- Rate limiting and security

All services are built with **Express + TypeScript**, **Supabase (PostgreSQL + pgvector)**, **Groq (Llama 3)**, **Transformers.js** (local embeddings), **Redis** (session store), and **express-rate-limit**.

---

# 1. RAG Pipeline (CV Upload → Chunks → Embeddings → Storage)

## File Locations

### Routes
- `src/routes/cvRoutes.ts`

### Controller
- `src/controllers/cvController.ts`

### Services (`src/services/rag/`)
- `chunker.ts` – recursive text splitting (size 500, overlap 50)
- `embeddings.ts` – local embedding via Transformers.js (`Xenova/all-MiniLM-L6-v2`)
- `vectorStore.ts` – insert & similarity search in Supabase pgvector
- `retriever.ts` – public function `getUserCVChunks(userId, query, topK)`

### Utils
- `src/utils/pdfParser.ts` (`pdfjs-dist`)
- `src/utils/docxParser.ts` (`mammoth`)

## Flow

1. `POST /api/cv/upload` (`multipart/form-data`, field `cv`)
2. `authMiddleware` attaches `req.user.id` (JWT).
3. `cvController.handleUpload`
   - Parses file (PDF/DOCX/TXT) to plain text.
   - `recursiveChunk(text)` → array of chunks.
   - For each chunk:
     - `getEmbedding(chunk)` (local model, no external API).
     - `insertChunk(userId, chunkText, embedding)` → stores in Supabase table `cv_chunks`.
4. Returns:

```json
{
  "success": true,
  "chunksCount": "N"
}
```

## Database Table (Supabase + pgvector)

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE cv_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(384),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Retrieval Function (Exported for Other Services)

```ts
export async function getUserCVChunks(
  userId: string,
  query: string,
  topK = 5
): Promise<string[]>
```

### Behavior

- Embeds query using the same local model.
- Calls Supabase RPC `match_cv_chunks` (cosine similarity, threshold `0.7`).
- Returns top-K `chunk_text` entries.

---

# 2. Job Search + Cosine Similarity Fit Score

## File Locations

### Routes
- `src/routes/jobsRoutes.ts`

### Controller
- `src/controllers/jobsController.ts`

### Services
- `src/services/jobSearch/serpapiClient.ts`

### Utils
- `src/utils/fitScoreCalculator.ts`
- `src/utils/cosineSimilarity.ts`

## Flow

### Endpoint

```http
GET /api/jobs/search?q=<query>&location=<city>
```

(Auth required)

### Process

`jobsController.searchJobs`

1. Calls:

```ts
searchJobsOnSerpapi(query, location)
```

2. Retrieves jobs from SerpAPI Google Jobs.
3. For each job:
   - Calls:

```ts
computeFitScore(userId, jobDescription)
```

4. Retrieves CV chunks:

```ts
getUserCVChunks(userId, jobDescription, 5)
```

5. Embeds:
   - CV text
   - Job description

6. Computes cosine similarity.

7. Calculates:

```ts
Score = Math.round(similarity * 100);
```

8. Extracts:
   - Matching skills
   - Missing skills

9. Returns:

```json
{
  "jobs": []
}
```

## Cosine Similarity Implementation

```ts
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    magA = 0,
    magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
```

---

# 3. Tracker CRUD (Kanban, Todos, Calendar)

## File Locations

### Routes
- `src/routes/trackerRoutes.ts`

### Controller
- `src/controllers/trackerController.ts`

### Database Tables
- `kanban_items`
- `todos`

> No separate calendar table. Calendar events are derived.

## Endpoints (All Require Authentication)

| Method | Endpoint | Description |
|----------|----------|----------|
| GET | `/api/tracker/kanban` | Returns `{ applied, interviewing, offer, rejected }` |
| POST | `/api/tracker/kanban` | Body: `{ job, status }` → add job |
| PUT | `/api/tracker/kanban/move` | Body: `{ jobId, toStatus }` → move job |
| GET | `/api/tracker/todos` | Returns `{ todos: [...] }` |
| POST | `/api/tracker/todos` | Body: `{ text, dueDate }` → create todo |
| PUT | `/api/tracker/todos/:id` | Body: `{ completed }` → toggle todo |
| GET | `/api/tracker/calendar` | Returns events from deadlines and due dates |

### Persistence

All data is stored in Supabase.

No in-memory storage is used.

---

# 4. Profile Extraction & CV Analysis

## File Locations

### Routes
- `src/routes/profileRoutes.ts`

### Controller
- `src/controllers/profileController.ts`

### Dependencies
- `getUserCVChunks`
- Groq LLM

## Endpoints

### POST `/api/cv/profile`

#### Purpose

Extract structured profile information:

- Name
- Email
- Phone
- Education
- Experience
- Skills
- Certifications

#### Flow

1. Calls:

```ts
getUserCVChunks(
  userId,
  "name email phone education experience skills certifications",
  15
)
```

2. Sends chunks to Groq with JSON extraction prompt.
3. Returns:

```json
{
  "success": true,
  "profile": {}
}
```

---

### POST `/api/cv/analyze`

#### Purpose

Generate ATS score and resume feedback.

#### Flow

1. Calls:

```ts
getUserCVChunks(
  userId,
  "resume feedback structure skills improvements",
  20
)
```

2. Sends chunks to Groq with structured feedback prompt.
3. Returns:

```json
{
  "success": true,
  "feedback": {}
}
```

### Environment Requirement

```env
GROQ_API_KEY=your_api_key
```

---

# 5. Mock Interview System with Redis Sessions

## File Locations

### Routes
- `src/routes/interviewRoutes.ts`

### Controller
- `src/controllers/interviewController.ts`

### Session Service
- `src/services/interview/sessions.ts`

### Config
- `src/config/redis.ts`

## Session Storage – Redis

### Why Redis?

- Persistent
- Shared across instances
- Auto-expiry
- Production-ready

### Configuration

- TTL: `3600` seconds (1 hour)
- Key pattern:

```text
interview:<sessionId>
```

- Value: JSON session state

### Operations

- `createSession`
- `getSession`
- `updateSession`
- `deleteSession`

## Endpoints

### POST `/api/interview/start`

#### Request Body

```json
{
  "jobTitle": "",
  "jobDescription": ""
}
```

#### Flow

1. Retrieves relevant CV chunks.
2. Groq generates first question.
3. Creates Redis session.
4. Stores initial state.
5. Returns:

```json
{
  "sessionId": "",
  "question": "",
  "questionNumber": 1
}
```

---

### POST `/api/interview/answer`

#### Request Body

```json
{
  "sessionId": "",
  "answer": ""
}
```

#### Flow

1. Validates session ownership.
2. Stores answer.
3. If fewer than 5 questions asked:
   - Groq generates feedback.
   - Groq generates next question.
   - Updates Redis session.
4. If interview is complete:
   - Groq generates final evaluation.

#### Returns

```json
{
  "feedback": "",
  "nextQuestion": "",
  "isComplete": false,
  "questionNumber": 2
}
```

---

### GET `/api/interview/state/:sessionId`

Returns current interview state:

- Questions
- Answers
- Current index

### Persistence

No database persistence.

Redis ephemeral storage is sufficient for the hackathon.

---

# 6. Authentication & Security

## Authentication

### Middleware

```text
src/middleware/authMiddleware.ts
```

(Implemented by teammate)

### Responsibilities

- Verifies JWT from:

```http
Authorization: Bearer <token>
```

- Attaches:

```ts
req.user.id
```

to the request object.

---

## Rate Limiting

### Package

```text
express-rate-limit
```

### Configuration

Applied globally to:

```text
/api/*
```

Limit:

```text
100 requests per minute per IP
```

Purpose:

- Prevent abuse
- Reduce spam
- Protect API resources

---

## HTTPS

Not implemented locally.

Deployment platforms such as:

- Render
- Vercel

provide HTTPS automatically.

---

# Technology Stack Summary

| Layer | Technology |
|---------|------------|
| Backend | Express + TypeScript |
| Database | Supabase PostgreSQL |
| Vector Search | pgvector |
| Embeddings | Transformers.js (`Xenova/all-MiniLM-L6-v2`) |
| LLM | Groq (Llama 3) |
| Cache / Sessions | Redis |
| Auth | JWT |
| Rate Limiting | express-rate-limit |
| File Parsing | pdfjs-dist, mammoth |
| Job Aggregation | SerpAPI Google Jobs |
