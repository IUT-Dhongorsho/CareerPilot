# Design Doc: Real-Time Voice Mock Interview with Vapi

## 1. Overview
Implement a robust, real-time voice-based mock interview system using Vapi. Users can practice interviews tailored to specific job applications in their tracker, using their own CV context. Feedback is provided as a detailed summary after the session.

## 2. Architecture

### 2.1 Components
- **Vapi Dashboard**: Configuration of the AI Assistant (Voice: Deepgram, LLM: GPT-4/Llama-3, Transcriber).
- **Backend (Express/Node.js)**: 
    - Fetches Job and RAG context (CV).
    - Generates dynamic prompts for Vapi.
    - Processes post-call webhooks to generate feedback via Groq.
- **Frontend (React)**: 
    - UI for session selection and voice interaction.
    - Integrates `@vapi-ai/web` SDK for WebRTC audio.

## 3. Data Flow
1. **Initiation**: User selects a job and clicks "Start Voice Interview".
2. **Context Prep**: Frontend requests config from `GET /interview/vapi-config/:jobId`.
3. **Prompt Generation**: 
    - Backend fetches job description from DB.
    - Backend fetches top-K CV chunks via existing RAG service.
    - Backend assembles a system prompt override.
4. **Call Start**: Frontend initializes the Vapi SDK with the `assistantOverride` and starts the call.
5. **Real-time Interaction**: User and AI converse via WebRTC.
6. **Webhook Processing**: 
    - Upon call completion, Vapi sends a `call.ended` webhook with the full transcript.
    - Backend sends transcript to Groq with an "Evaluator" prompt.
    - Backend saves the resulting JSON feedback (score, strengths, areas for improvement) to the database.

## 4. Technical Specifications

### 4.1 Backend
- **New Endpoints**:
    - `GET /api/interview/vapi-config/:jobId`: Returns Vapi public key and `assistantOverride`.
    - `POST /api/webhooks/vapi`: Receives call reports and triggers summary generation.
- **Summary Generation Prompt**:
    ```text
    Analyze the following interview transcript for a {{jobTitle}} position.
    Transcript: {{transcript}}
    
    Return a JSON object:
    {
      "score": number (1-10),
      "strengths": string[],
      "improvements": string[],
      "technical_feedback": string,
      "communication_feedback": string
    }
    ```

### 4.2 Frontend
- **SDK**: `@vapi-ai/web`
- **UI States**:
    - `Selection`: Pick a job to interview for.
    - `Active`: Voice visualizer, Mute toggle, End Call button.
    - `Processing`: "Generating your feedback report..."
    - `Result`: Display the summary and score.

### 4.3 Database Updates
- **Table: `interview_sessions`**:
    - `id`: UUID (PK)
    - `userId`: UUID (FK)
    - `jobId`: UUID (FK)
    - `vapiCallId`: String
    - `status`: Enum (started, completed, failed)
    - `transcript`: Text
    - `summary`: JSONB
    - `createdAt`: Timestamp

## 5. Security & Robustness
- **Vapi Webhook Validation**: Verify webhook origin using Vapi's shared secret.
- **Timeout Management**: Set `maxDuration` in Vapi config to prevent infinite calls.
- **Error Handling**: Graceful UI handling for microphone denial or API failures.
