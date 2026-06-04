# CareerPilot – Agentic Career Co‑pilot

**Your AI platform that knows you — hunts jobs, scores your fit, drafts applications, and builds your learning roadmap.**

Built for the **Codesprint_poridhi (2026)** hackathon.  
**Winning focus:** true RAG grounded in your CV, programmatic fit scores, real‑time notifications, and a fully integrated productivity tracker.

---

## 🚀 The Problem We Solve

Job seekers face a fragmented mess: scattered job boards, generic AI tools with no memory of who they are, zero visibility into skill gaps, and no accountability for applications or learning goals.

**CareerPilot** brings everything into one agentic platform. The AI doesn’t just answer questions – it actively works for you, grounded in **your real CV**.

---

## 🧠 Core Innovation – RAG with Hybrid Retrieval

Every response from our AI is grounded in the user’s actual CV – no hallucinations.

### Chunking Strategy
- **Recursive character splitting** with overlap (chunk size 500, overlap 50) to preserve semantic boundaries.
- Section‑aware splitting: experience, education, skills, projects are kept distinct when possible.

### Embedding Model
- **Hugging Face `sentence-transformers/all-MiniLM-L6-v2`** (free, 384‑dim vectors) via Inference API.
- Fast, lightweight, and excellent for resume‑job similarity.

### Vector Database
- **pgvector** inside Supabase (PostgreSQL).
- Enables **hybrid search**: dense vector similarity (cosine) + sparse keyword matching (BM25).
- Metadata filtering by user ID, skill tags, and section type.

### Retrieval Pipeline
1. **Query expansion** – LLM rewrites user query for better recall.
2. **Hybrid search** – retrieves top‑20 chunks.
3. **Cross‑encoder reranking** (planned) – reorders by relevance using a small transformer.
4. **Context compression** – keeps only the most relevant sentences from each chunk to fit into Llama 3’s context.

This ensures the AI sees exactly the right parts of your CV to answer accurately.

---

## 🛠️ Tech Stack (Production‑Grade, Hackathon‑Fast)

| Layer | Technology |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **State Management** | Zustand + BroadcastChannel API (cross‑tab sync) |
| **Backend** | Express.js, TypeScript, REST API |
| **Auth** | Supabase Auth (JWT) |
| **Database** | Supabase PostgreSQL + pgvector |
| **LLM** | Groq (Llama 3 70B) – fast, free tier |
| **Embeddings** | Hugging Face Inference API (all‑MiniLM‑L6‑v2) |
| **Job Search** | SerpAPI (Google Jobs) – real listings |
| **Real‑time** | Server‑Sent Events (SSE) for AI nudges & deadline reminders |
| **Deployment** | Vercel (frontend), Render (backend) |
| **Package Manager** | `pnpm` – fast, disk‑efficient |

---

## ✨ Four Pillars – Fully Implemented

### 1. Job Hunter Agent
- Natural language input: *“Find me ML internships in Dhaka open this month”*
- Calls **SerpAPI** → returns structured job cards with:
  - Role, company, salary range, deadline, location
  - **Fit score** (0–100%) computed programmatically (cosine similarity + keyword overlap)
  - Explanation of why each job matches (or doesn’t) based on CV chunks

### 2. Profile & Resume Intelligence (RAG Core)
- Upload PDF/DOCX → text extraction → chunking → embedding → pgvector.
- Every downstream feature (job matching, cover letters, gap analysis, roadmap) uses **retrieval‑augmented generation** from this store.

### 3. Personal AI Assistant (Chat)
- Conversational interface with full CV context.
- Handles all required queries:
  - *“Am I ready for this Data Engineer role?”* → verdict + reasoning grounded in CV.
  - *“What skills am I missing for a Google internship?”* → skill gap analysis.
  - *“Build me a 3‑month roadmap to become job‑ready”* → weekly plan with resources.
  - *“Draft a cover letter for this job posting”* → personalised letter referencing actual experience.
- **Intent classification** (regex + LLM) routes queries to the right handler.

### 4. Productivity & Progress Tracker
- **Kanban board** (Applied / Interviewing / Offer / Rejected) with drag‑drop.
- **Calendar view** – deadlines from jobs + to‑do due dates.
- **To‑do list** – auto‑created from AI roadmaps or user goals.
- **Progress dashboard** – weekly stats: applications sent, skills added, roadmap completion, streak counter.
- **AI Nudges** via SSE – proactive reminders like: *“You haven’t applied this week. Here are 3 openings matching your profile.”*

---

## 📐 Fit Score – Programmatic, Not Guessed

```python
# Simplified logic
semantic_score = cosine_similarity(cv_embedding, job_embedding)
keyword_score = len(cv_skills ∩ job_skills) / len(job_skills)
fit_score = (0.6 * semantic_score + 0.4 * keyword_score) * 100

Returns score + matching skills + missing skills + recommendation.
```
---

## 🔔 Real‑time Notifications with SSE

- Backend maintains persistent `EventSource` connections.
- Every minute, background worker checks:
  - **Inactivity nudge** (no application >3 days) → calls SerpAPI with user’s top skills.
  - **Upcoming deadlines** (kanban items + to‑dos due within 24h).
- Pushes JSON notifications to the frontend bell icon.
- No polling – instant, efficient, and hackathon‑impressive.

---

## 🧪 Evaluation Suite (Bonus)

We provide **5 documented test cases** (in `/tests`) covering:
1. CV upload → chunking → embedding storage
2. Live job search with fit score validation
3. Fit score accuracy (expected >70% for matching CV)
4. Cover letter generation (contains skill from CV)
5. Inactivity nudge (returns 3 job suggestions)

Run with `pnpm test` in backend.

---

## 🏗️ Setup & Installation (using pnpm)

### Prerequisites
- Node.js 18+
- `pnpm` installed globally (`npm i -g pnpm`)
- Supabase account (free tier)
- Groq API key (free)
- SerpAPI key (free trial)
- Hugging Face token (free)

### Clone & Install

```bash
git clone https://github.com/yourteam/careerpilot.git
```
```bash
cd careerpilot
```
```bash
pnpm install   # installs dependencies for frontend & backend (workspaces)
```
### Environment Variables

Copy `.env.example` to `frontend/.env` and `backend/.env` – fill in your keys.

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:5001/api

# backend/.env
PORT=5001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
GROQ_API_KEY=your_groq_key
SERPAPI_KEY=your_serpapi_key
HF_TOKEN=your_huggingface_token
JWT_SECRET=your_jwt_secret
```
### Database Setup (Supabase)

Run the SQL in the Supabase SQL editor (provided in `docs/schema.sql`). Enables pgvector and creates tables for `cv_chunks`, `kanban_items`, `todos`.

### Run Locally

```bash
# Terminal 1 – backend
cd backend
pnpm dev   # starts on http://localhost:5001

# Terminal 2 – frontend
cd frontend
pnpm dev   # starts on http://localhost:5173
```