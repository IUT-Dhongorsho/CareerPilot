import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { socketAuthMiddleware } from './socket.middleware';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).user.id;
    console.log(`User connected: ${userId} (${socket.id})`);

    // Join a private room for targeted notifications
    socket.join(userId);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
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
