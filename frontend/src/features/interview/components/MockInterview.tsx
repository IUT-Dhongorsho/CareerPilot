import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Loader2 } from 'lucide-react';

export default function MockInterview() {
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const startInterview = async () => {
    setLoading(true);
    // Mock – replace with real API call
    setTimeout(() => {
      setSessionId('mock-session');
      setQuestion('Tell me about a time you solved a difficult technical problem.');
      setStarted(true);
      setLoading(false);
    }, 1000);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    // Mock
    setTimeout(() => {
      setFeedback('Good answer! You demonstrated problem-solving skills. Next question: How do you handle tight deadlines?');
      setQuestion('How do you handle tight deadlines?');
      setAnswer('');
      setLoading(false);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mock Interview Practice</h1>
      {!started ? (
        <button
          onClick={startInterview}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Mic />} Start New Interview
        </button>
      ) : (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
            <p className="text-lg font-medium">Question:</p>
            <p className="text-gray-800 text-xl mt-2">{question}</p>
          </div>
          <div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400"
              placeholder="Type your answer..."
            />
            <button
              onClick={submitAnswer}
              disabled={loading || !answer.trim()}
              className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send />} Submit Answer
            </button>
          </div>
          {feedback && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="font-semibold">Feedback:</p>
              <p className="text-gray-700">{feedback}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
