import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { redis } from '../config/redis';
import { socketAuthMiddleware } from './socket.middleware.js';
import * as ChatService from '../services/chat/chat.service.js';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', async (socket: Socket) => {
    const userId = (socket as any).user.id;
    console.log(`User connected: ${userId} (${socket.id})`);

    // Set online status in Redis
    await redis.set(`user:${userId}:status`, 'online');

    // Join a private room for targeted notifications
    socket.join(userId);

    socket.on('disconnect', async () => {
      socket.on('chat:send', async (data: { sessionId: string; content: string }) => {
        try {
          const { sessionId, content } = data;
          console.log(`[WS] Message from ${userId} in session ${sessionId}`);

          const response = await ChatService.processMessage(userId, sessionId, content);

          socket.emit('chat:receive', {
            sessionId,
            role: 'assistant',
            content: response,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('[WS] Chat error:', error);
          socket.emit('chat:error', { message: (error as Error).message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Remove online status or set to offline
        await redis.del(`user:${userId}:status`);
      });
    });

    return io;
  };

  export const getIO = () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  };

// 'chatGrok:userId' --persist
// 'interview:jobId:userId' --1hr
// 'notification:userId' --1hr
