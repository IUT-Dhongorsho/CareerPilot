# CareerPilot Backend Context

This document provides technical details for the frontend team to integrate with the CareerPilot backend.

## 1. Authentication Flow
The backend uses **Supabase Auth** with local data syncing.

*   **Auth Token:** The frontend must handle login via Supabase and send the `access_token` in the `Authorization` header as a Bearer token: `Authorization: Bearer <token>`.
*   **User Sync:** After a successful signup on the frontend, call `POST /api/auth/sync` with the user profile data. This ensures the backend has a local record of the user.

### Auth Endpoints
*   `POST /api/auth/sync`: Syncs Supabase user to local DB.
    *   **Body:** `{ id: string, email: string, fullName?: string, avatarUrl?: string }`

## 2. Notification System
The notification system is multi-channel: **Database**, **WebSocket**, and **Web Push (VAPID)**.

### REST Endpoints
*   `GET /api/notifications`: Retrieve all notifications for the authenticated user.
*   `PATCH /api/notifications/:id/read`: Mark a specific notification as read.
*   `PATCH /api/notifications/read-all`: Mark all notifications as read.

### WebSocket Integration
*   **URL:** `http://localhost:8005` (or current PORT)
*   **Handshake Auth:** Pass the auth token in the `auth` object:
    ```javascript
    const socket = io(BACKEND_URL, {
      auth: { token: supabase.session().access_token }
    });
    ```
*   **Events:**
    *   `notification:new`: Emitted when a new notification is generated. Payload: `{ id, type, message, isRead, createdAt }`.

### Web Push (VAPID)
*   **Public Key:** (Stored in `.env` as `VAPID_PUBLIC_KEY`)
*   **Flow:** Use the Browser Push API to get a `Subscription` object and save it via the future `POST /api/notifications/subscribe` (or similar service call).

## 3. Standard Response Format
All HTTP responses follow this structure:
*   **Success:** `{ success: true, payload: data, message: "..." }`
*   **Error:** `{ success: false, error: details, message: "..." }`

## 4. Current Backend Capabilities
- [x] JWT Authentication & Local Session Verification.
- [x] Local User Profile Management.
- [x] Real-time Notifications via WebSockets.
- [x] Persistent Notification History (DB).
- [x] Web Push Notification (VAPID) support.
- [x] Automated Test Suite (100% core coverage).

## 5. Development Info
*   **Base URL:** `http://localhost:8005/api`
*   **Health Check:** `GET /health`
*   **Database:** Drizzle ORM (PostgreSQL via Supabase).
