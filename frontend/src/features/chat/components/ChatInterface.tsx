import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatSocket } from '../hooks/useChatSocket';
import { useChatStore } from '../store/chatSlice';
import MessageBubble from './MessageBubble';
import JobList from '../../jobs/components/JobList';
import { useJobsStore } from '../../jobs/store/jobsSlice';
import { fadeInUp } from '../../../lib/animations';
import axios from '../../../lib/api/axiosClient';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const { messages, isLoading, currentSessionId, setSessionId } = useChatStore();
  const { sendMessage } = useChatSocket(currentSessionId);
  const { results: jobs } = useJobsStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      if (currentSessionId) return;
      
      try {
        // Try to get the latest session or create a new one
        const sessions = await axios.get<any[]>('/chat/sessions');
        
        if (sessions && sessions.length > 0) {
          setSessionId(sessions[0].id);
          // History will be loaded by store or on-demand if needed
        } else {
          const newSession = await axios.post<any>('/chat/sessions', { title: 'Career Chat' });
          if (newSession && newSession.id) {
            setSessionId(newSession.id);
          }
        }
      } catch (error) {
        console.error('Failed to init chat session:', error);
      }
    };

    initSession();
  }, [currentSessionId, setSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, jobs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentSessionId) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex h-full gap-6">
      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-surface rounded-xl shadow-sm overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-surface-muted rounded-2xl px-4 py-2 text-text-muted">
                  Thinking...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="border-t border-border p-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything... e.g., Find me ML jobs in Dhaka"
            className="flex-1 p-2 bg-bg border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="bg-primary text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Send
          </motion.button>
        </form>
      </div>

      {/* Job results panel (only visible when there are jobs) */}
      {jobs.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="w-80 bg-surface rounded-xl shadow-sm p-4 overflow-y-auto"
        >
          <h3 className="font-bold text-lg mb-3">Job Matches</h3>
          <JobList />
        </motion.div>
      )}
    </div>
  );
}
