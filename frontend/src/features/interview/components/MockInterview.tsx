import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Play, MessageSquare } from 'lucide-react';

interface Session {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  status: 'pending' | 'active' | 'completed';
}

const mockSessions: Session[] = [
  { id: '1', jobTitle: 'ML Engineer', company: 'Google', date: '2026-06-10', status: 'pending' },
  { id: '2', jobTitle: 'Full Stack Developer', company: 'Microsoft', date: '2026-06-12', status: 'pending' },
];

export default function MockInterview() {
  const [sessions, setSessions] = useState(mockSessions);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const startSession = (sessionId: string) => {
    setActiveSession(sessionId);
    setMessages([{ role: 'ai', content: 'Tell me about a challenging project you worked on.' }]);
  };

  const sendAnswer = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: 'Great! Next question: How do you handle tight deadlines?' }]);
      setLoading(false);
    }, 1000);
  };

  const closeSession = () => {
    setActiveSession(null);
    setMessages([]);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mock Interview Practice</h1>
      {!activeSession ? (
        <div className="grid md:grid-cols-2 gap-4">
          {sessions.map(session => (
            <motion.div key={session.id} whileHover={{ y: -4 }} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg">{session.jobTitle}</h3>
              <p className="text-sm text-gray-500">{session.company}</p>
              <p className="text-xs text-gray-400 mt-1">Added on {session.date}</p>
              <button onClick={() => startSession(session.id)} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2">
                <Play size={14} /> Start Interview
              </button>
            </motion.div>
          ))}
          <button className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-gray-500 hover:bg-gray-50">
            <Mic size={24} />
            <span>Add new interview</span>
          </button>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col h-[500px]">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="font-semibold">Mock Interview</h2>
            <button onClick={closeSession} className="text-sm text-gray-500">Exit</button>
          </div>
          <div className="flex-1 overflow-y-auto mt-3 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-gray-400 text-sm">AI is thinking...</div>}
          </div>
          <div className="mt-3 flex gap-2 border-t pt-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Your answer..."
              className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
              onKeyPress={(e) => e.key === 'Enter' && sendAnswer()}
            />
            <button onClick={sendAnswer} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
