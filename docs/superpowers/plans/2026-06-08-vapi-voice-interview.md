# Vapi Voice Mock Interview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a real-time voice mock interview feature using Vapi, personalized with user's CV and job description, with a post-interview summary report.

**Architecture:** Client-side Vapi Web SDK for audio, Backend for RAG context injection and webhook processing for summary generation via Groq.

**Tech Stack:** React, Express, Drizzle ORM, Vapi Web SDK, Groq (Llama-3), Redis.

---

### Task 1: Database Schema Update

**Files:**
- Modify: `backend/src/db/schema.ts`
- Create: Drizzle migration

- [ ] **Step 1: Add `interview_sessions` table to schema**

```typescript
// backend/src/db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users'; // Assuming users table exists
import { jobs } from './jobs';   // Assuming jobs table exists

export const interviewStatusEnum = pgEnum('interview_status', ['started', 'completed', 'failed']);

export const interviewSessions = pgTable('interview_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  jobId: uuid('job_id').references(() => jobs.id).notNull(),
  vapiCallId: text('vapi_call_id'),
  status: interviewStatusEnum('status').default('started').notNull(),
  transcript: text('transcript'),
  summary: jsonb('summary'), // { score: number, strengths: string[], improvements: string[], feedback: string }
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

- [ ] **Step 2: Generate and run migration**
Run: `cd backend && npx drizzle-kit generate && npx drizzle-kit migrate`
Expected: Database updated with new table.

- [ ] **Step 3: Commit**
```bash
git add backend/src/db/schema.ts backend/drizzle/*
git commit -m "db: add interview_sessions table"
```

---

### Task 2: Vapi Configuration Endpoint

**Files:**
- Create: `backend/src/controllers/vapiController.ts`
- Modify: `backend/src/routes/interviewRoutes.ts`

- [ ] **Step 1: Create the vapiController**

```typescript
// backend/src/controllers/vapiController.ts
import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { jobs } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { getUserCVChunks } from '../services/rag/retriever.js';

export const getVapiConfig = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { jobId } = req.params;

  const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) });
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const cvChunks = await getUserCVChunks(userId, job.title, 10);
  const cvText = cvChunks.join('\n');

  const assistantOverride = {
    variableOverrides: {
      job_title: job.title,
      job_description: job.description,
      candidate_cv: cvText
    }
  };

  res.json({
    publicKey: process.env.VAPI_PUBLIC_KEY,
    assistantId: process.env.VAPI_ASSISTANT_ID,
    assistantOverride
  });
};
```

- [ ] **Step 2: Register the route**

```typescript
// backend/src/routes/interviewRoutes.ts
import { getVapiConfig } from '../controllers/vapiController.js';
// ... existing imports
router.get('/vapi-config/:jobId', authMiddleware, getVapiConfig);
```

- [ ] **Step 3: Commit**
```bash
git add backend/src/controllers/vapiController.ts backend/src/routes/interviewRoutes.ts
git commit -m "feat: add vapi-config endpoint"
```

---

### Task 3: Vapi Webhook Handler & Summarization

**Files:**
- Create: `backend/src/services/interview/summarizer.ts`
- Modify: `backend/src/controllers/vapiController.ts`
- Modify: `backend/src/app.ts`

- [ ] **Step 1: Implement the summarizer service**

```typescript
// backend/src/services/interview/summarizer.ts
import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateInterviewSummary = async (transcript: string, jobTitle: string) => {
  const prompt = `Analyze the following interview transcript for a ${jobTitle} position. 
  Return a JSON object with keys: score (1-10), strengths (array of strings), improvements (array of strings), feedback (string).
  
  Transcript: ${transcript}`;

  const completion = await groq.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });

  return JSON.parse(completion.choices[0]?.message?.content || '{}');
};
```

- [ ] **Step 2: Add Webhook Handler**

```typescript
// backend/src/controllers/vapiController.ts (Add this)
export const handleVapiWebhook = async (req: Request, res: Response) => {
  const { type, call } = req.body;
  if (type === 'call.ended') {
    const { transcript, id: vapiCallId } = call;
    // Find session or create one based on metadata if needed
    // For now, let's assume we update the most recent session for this vapiCallId
    // logic to update DB and call generateInterviewSummary
  }
  res.sendStatus(200);
};
```

- [ ] **Step 3: Register Webhook in App**
```typescript
// backend/src/app.ts
import { handleVapiWebhook } from './controllers/vapiController.js';
app.post('/api/webhooks/vapi', handleVapiWebhook);
```

- [ ] **Step 4: Commit**
```bash
git add backend/src/services/interview/summarizer.ts backend/src/controllers/vapiController.ts backend/src/app.ts
git commit -m "feat: add vapi webhook and summarizer"
```

---

### Task 4: Frontend Vapi Integration

**Files:**
- Modify: `frontend/src/features/interview/components/MockInterview.tsx`
- Install: `@vapi-ai/web`

- [ ] **Step 1: Install Vapi Web SDK**
Run: `cd frontend && pnpm add @vapi-ai/web`

- [ ] **Step 2: Implement Voice UI**

```typescript
// frontend/src/features/interview/components/MockInterview.tsx
import Vapi from '@vapi-ai/web';
const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

// Add state for call
const [callStatus, setCallStatus] = useState<'idle' | 'active' | 'summarizing'>('idle');

const startVoiceCall = async (jobId: string) => {
  const config = await fetchVapiConfig(jobId);
  vapi.start(config.assistantId, config.assistantOverride);
  setCallStatus('active');
};

vapi.on('call-end', () => setCallStatus('summarizing'));
```

- [ ] **Step 3: Commit**
```bash
git add frontend/package.json frontend/src/features/interview/components/MockInterview.tsx
git commit -m "feat: integrate vapi web sdk in frontend"
```
