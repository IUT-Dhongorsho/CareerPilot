# CareerPilot – Development Context & Planning

## 1. Project Goal
Build an AI-powered career co-pilot that:
- Knows the user’s CV (RAG)
- Hunts jobs with fit scores
- Drafts cover letters, analyses skill gaps, builds roadmaps
- Tracks applications (Kanban, calendar, to‑do, progress)
- Sends proactive nudges

## 2. Architecture
- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4 + Zustand + Framer Motion
- **Backend:** Express + TypeScript + Supabase (PostgreSQL + pgvector) + Groq (Llama 3) + SerpAPI + Hugging Face embeddings
- **Real‑time:** WebSockets (Socket.IO) for notifications; optional SSE
- **Deployment:** Frontend → Vercel, Backend → Render

## 3. Frontend (Completed – mock data)
- Landing page, login/signup (mock), CV upload lock screen
- Dashboard with sidebar (Apply, Kanban, Calendar, To‑Do, Progress)
- Chat interface with intent routing (job search, fit score, cover letter, roadmap)
- Job cards with fit scores and “Add to Kanban”
- Kanban board with drag‑drop (DnD Kit)
- Calendar (FullCalendar) – events from job deadlines + to‑dos
- To‑do list (manual + auto‑created)
- Progress dashboard (stats, streak, roadmap completion)
- All data persists via Zustand + localStorage
- Framer Motion animations (page transitions, hover, message bubbles)
- **No real backend yet** – everything works with mock data.

## 4. Backend – Team Distribution
| Person | Role | Tasks |
|--------|------|-------|
| **Person A** | Infrastructure, Auth, Notifications | Supabase setup, Drizzle ORM, WebSocket + Web Push, auth middleware, chat + LLM endpoints, SSE nudges |
| **Person B (you)** | RAG Pipeline | CV upload, text extraction, chunking, embeddings (Hugging Face), pgvector storage, similarity search, expose `getUserCVChunks()` |
| **Person C** | Jobs & Tracker | SerpAPI integration, fit score calculation, Kanban/Calendar/Todo CRUD endpoints |

## 5. Your (Person B) Completed RAG Implementation
- **Files created:**
  - `src/utils/pdfParser.ts`, `src/utils/docxParser.ts`
  - `src/services/rag/chunker.ts` (recursive chunking)
  - `src/services/rag/embeddings.ts` (Hugging Face `all-MiniLM-L6-v2`)
  - `src/services/rag/vectorStore.ts` (Supabase pgvector)
  - `src/services/rag/retriever.ts` (exports `getUserCVChunks`)
  - `src/controllers/cvController.ts` (upload endpoint)
  - `src/routes/cvRoutes.ts`
- **Supabase setup:** Enabled `pgvector`, created `cv_chunks` table, similarity search function.
- **Environment:** Added `HF_TOKEN` (Hugging Face) and ensured all other backend env variables.
- **Integration:** Route registered in main server; uses teammate’s auth middleware and Supabase client.

## 6. Next Steps
- Person A and Person C will complete their endpoints.
- You will help Person A import `getUserCVChunks` into the chat controller.
- Once all endpoints are ready, frontend will swap mock APIs for real ones (`VITE_USE_MOCK=false`).

## 7. Known Issues & Fixes
- `obug` package age violation – resolved by deleting `pnpm-lock.yaml` and reinstalling.
- Merge conflicts when pulling teammate’s branch – resolved by accepting their versions.

## 8. Useful Commands
```bash
# Run backend
cd backend && pnpm dev

# Test CV upload
curl -X POST http://localhost:8005/api/cv/upload \
  -H "Authorization: Bearer <token>" \
  -F "cv=@/path/to/cv.pdf"

# Regenerate lockfile if needed
rm pnpm-lock.yaml && pnpm install --no-frozen-lockfile