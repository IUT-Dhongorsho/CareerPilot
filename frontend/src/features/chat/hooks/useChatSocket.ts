import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../auth/store/authSlice';
import { useChatStore } from '../store/chatSlice';

// Base URL for the backend, deriving the socket URL by stripping /api if present
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8005';
const SOCKET_URL = BACKEND_URL.replace(/\/api$/, '');

/**
 * Hook for real-time chat communication via Socket.io
 * @param sessionId The ID of the current chat session
 */
export const useChatSocket = (sessionId: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const { session } = useAuthStore();
  const { addMessage, setLoading } = useChatStore();

  useEffect(() => {
    // Only connect if we have a valid session, token, and sessionId
    if (!session?.access_token || !sessionId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      auth: {
        token: session.access_token,
      },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to chat socket');
    });

    // Listen for incoming messages from the assistant
    socket.on('chat:receive', (data: { sessionId: string; role: string; content: string; jobResults?: any[] }) => {
      // Ensure the message belongs to the current session
      if (data.sessionId === sessionId) {
        addMessage({
          role: data.role as 'user' | 'assistant',
          content: data.content,
          jobResults: data.jobResults,
        });
        setLoading(false);
      }
    });

    // Listen for chat errors
    socket.on('chat:error', (error: { message: string }) => {
      console.error('Socket chat error:', error);
      addMessage({
        role: 'assistant',
        content: `Error: ${error.message}`,
      });
      setLoading(false);
    });

    // Connection error handling
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setLoading(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from chat socket:', reason);
    });

    // Cleanup on unmount or session/token change
    return () => {
      if (socket) {
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [session?.access_token, sessionId, addMessage, setLoading]);

  /**
   * Sends a message to the assistant via the socket
   * @param content The text content of the message
   */
  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !socketRef.current.connected || !content.trim()) {
      console.warn('Cannot send message: socket not connected or content empty');
      return;
    }

    setLoading(true);
    
    // Add user message to the local store immediately for better UX
    addMessage({ 
      role: 'user', 
      content 
    });

    // Emit the message to the backend
    socketRef.current.emit('chat:send', {
      sessionId,
      content,
    });
  }, [sessionId, addMessage, setLoading]);

  return {
    sendMessage,
    isConnected: socketRef.current?.connected || false,
  };
};
