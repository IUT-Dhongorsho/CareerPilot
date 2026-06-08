# CareerPilot Backend – Project Context & Architecture

## Overview
CareerPilot is an AI-powered career assistant that helps users optimize their CVs, find matching jobs, and track their applications. This document provides a comprehensive overview of the backend services, architecture, and workflows to ensure seamless onboarding for AI and human developers.

### Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Runtime** | Node.js (Express 5 + TypeScript) |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Drizzle ORM |
| **Vector Search** | pgvector (384 dimensions) |
| **Embeddings** | Transformers.js (Local: `Xenova/all-MiniLM-L6-v2`) |
| **LLM** | Groq (Llama 3.1 / Llama 3) |
| **Cache/Sessions** | Redis |
| **Auth** | Supabase Auth (JWT with JWKS verification) |
| **Parsing** | pdfjs-dist, mammoth |

---

## 1. Core Architecture & Workflow

### User Synchronization (Shadow DB)
To maintain referential integrity and performance, we sync Supabase users into a local `users` table.
- **Endpoint**: `POST /api/auth/sync`
- **Workflow**: Frontend calls this after login/signup. Backend creates or updates the user record in PostgreSQL.
- **Middleware**: `authMiddleware` verifies the JWT via `utils/jwt.ts` (JWKS) and ensures the user exists in the local `users` table.

### RAG Pipeline (CV Intelligence)
1. **Upload**: `POST /api/cv/upload` parses PDF/DOCX into text.
2. **Chunking**: Text is split into overlapping chunks (size 500, overlap 50).
3. **Embedding**: Each chunk is embedded locally using Transformers.js.
4. **Storage**: Chunks and vectors are stored in the `cv_chunks` table using Drizzle + `pgvector`.
5. **Retrieval**: `getUserCVChunks` uses `cosineDistance` to fetch the most relevant parts of the CV for AI prompts.

---

## 2. API Endpoints

### 🔐 Authentication & Sync
- `POST /api/auth/sync`: Hydrate shadow `users` table with Supabase UID and metadata.

### 📄 CV & AI Analysis
- `POST /api/cv/upload`: Upload and process CV (PDF/DOCX).
- `POST /api/cv/profile`: Extract professional profile (JSON) using Groq.
- `POST /api/cv/analyze`: Generate ATS score and structured feedback.

### 💼 Job Discovery
- `GET /api/jobs/search?q=&location=`: Search via SerpApi with personalized **Fit Score** (Cosine Similarity between CV chunks and job description).

### 📋 Application Tracker (Kanban & Tasks)
- `GET /api/tracker/kanban`: Fetch applications by status.
- `POST /api/tracker/kanban`: Add job to tracker.
- `PUT /api/tracker/kanban/move`: Update application status.
- `GET /api/tracker/todos`: Fetch user tasks.
- `POST /api/tracker/todos`: Create task.
- `GET /api/tracker/calendar`: Unified view of deadlines and tasks.

### 🎙️ AI Interview
- `POST /api/interview/start`: Initialize Redis-backed interview session.
- `POST /api/interview/answer`: Submit answer, get feedback, and next question.

### 🔔 Notifications
- `GET /api/notifications`: Retrieve user alerts.
- `PATCH /api/notifications/:id/read`: Mark as read.

---

## 3. Database Schema (Drizzle)
Key tables defined in `src/db/schema.ts`:
- `users`: Core user profile (Primary Key is Supabase UID).
- `cv_chunks`: RAG data with `vector(384)` embeddings.
- `kanban_items`: Application tracking data.
- `todos`: User tasks.
- `notifications`: Real-time system alerts.
- `chat_sessions` & `messages`: AI chat history.

---

## 4. Operational Notes & Plans

### Current Implementation Status
- [x] JWT verification with JWKS support.
- [x] User sync between Supabase and shadow DB.
- [x] RAG pipeline using Drizzle and local embeddings.
- [x] Similarity search using Drizzle vector operators.

### Critical AI Instructions
- **Models**: Use `llama-3.1-70b-versatile` or `llama3-8b-8192` on Groq (Avoid decommissioned `llama3-70b-8192`).
- **DB Access**: Always use `db` (Drizzle) for queries. Avoid direct `supabase` client calls for database operations.
- **Auth**: Always protect routes with `authMiddleware` unless specified.
- **Modularity**: Keep JWT logic in `utils/jwt.ts` and API response logic in `utils/apiResponse.ts`.

### Planned Fixes
1. Update `profileController.ts` and `interviewController.ts` to use active Groq models.
2. Refactor remaining Supabase client calls in `trackerController.ts` to use Drizzle.
3. Implement WebSocket events for real-time notifications in `notification.service.ts`.
