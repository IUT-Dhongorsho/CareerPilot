# Chat + Modern RAG Implementation Plan (No Git/Schema Changes)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a real-time chat system using Gemini with Modern RAG (Query Condensing and Expansion) powered by pgvector, using ONLY existing database tables and avoiding git commands.

**Architecture:** WebSockets (Socket.io) for real-time messaging, Gemini for LLM, and pgvector for semantic search.

**Tech Stack:** Node.js, Express, Socket.io, @google/generative-ai, Drizzle ORM.

---

### Task 1: Backend Dependencies

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/.env.example`

- [ ] **Step 1: Install Dependencies**
  Run: `pnpm add @google/generative-ai` in `backend/`
- [ ] **Step 2: Update .env.example**
  Add `GEMINI_API_KEY=your_gemini_api_key`

### Task 2: Backend Chat Service

**Files:**
- Create: `backend/src/services/chat/chat.service.ts`

- [ ] **Step 1: Create the service with RAG logic**
  Implementation includes `condenseQuery`, `expandQuery`, and `processMessage`.

### Task 3: Backend API & WebSockets

**Files:**
- Create: `backend/src/controllers/chatController.ts`
- Create: `backend/src/routes/chatRoutes.ts`
- Modify: `backend/src/app.ts`
- Modify: `backend/src/ws/index.ts`

- [ ] **Step 1: Implement REST controllers and routes**
- [ ] **Step 2: Register routes in app.ts**
- [ ] **Step 3: Add chat listeners to socket initialization in ws/index.ts**
- [x] **Step 4: Fix chat initialization and authentication**
  - Fix redundant `.data` access in `ChatInterface.tsx`
  - Update `socketAuthMiddleware` to use unified `verifyToken` utility
  - Implement real-time session auto-initialization

### Task 4: Frontend Hook

**Files:**
- Create: `frontend/src/features/chat/hooks/useChatSocket.ts`

- [ ] **Step 1: Implement useChatSocket for real-time communication**
