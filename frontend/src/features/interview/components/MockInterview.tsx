import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Play, Square, MicOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Vapi from '@vapi-ai/web';
import apiClient from '../../../lib/api/axiosClient';
import { useTrackerStore } from '../../tracker/store/trackerSlice';

interface VoiceVisualizerProps {
  volume: number;
  isSpeaking: boolean;
}

interface VapiConfig {
  publicKey: string;
  assistantId: string;
  assistantOverride: Record<string, unknown>;
  sessionId: string;
}

const VoiceVisualizer = ({ volume, isSpeaking }: VoiceVisualizerProps) => {
  return (
    <div className="flex items-center justify-center gap-1.5 h-16">
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: isSpeaking ? [12, 12 + volume * 60, 12] : 12,
            opacity: isSpeaking ? [0.4, 1, 0.4] : 0.3,
          }}
          transition={{
            repeat: Infinity,
            duration: 0.6,
            delay: i * 0.04,
          }}
          className={`w-2 rounded-full ${isSpeaking ? 'bg-blue-600' : 'bg-gray-400'}`}
        />
      ))}
    </div>
  );
};

export default function MockInterview() {
  const { kanban, fetchKanban } = useTrackerStore();

  useEffect(() => {
    fetchKanban();
  }, [fetchKanban]);
  
  // Defensive check for kanban and its properties
  const rawJobs = kanban ? [
    ...(Array.isArray(kanban.wishlist) ? kanban.wishlist : []),
    ...(Array.isArray(kanban.applied) ? kanban.applied : []),
    ...(Array.isArray(kanban.interviewing) ? kanban.interviewing : []),
    ...(Array.isArray(kanban.offer) ? kanban.offer : []),
    ...(Array.isArray(kanban.rejected) ? kanban.rejected : []),
  ] : [];

  // Deduplicate jobs by ID
  const allJobs = Array.from(new Map(rawJobs.map(job => [job.id, job])).values());

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'summarizing'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);

  const startSession = useCallback(async (jobId: string) => {
    try {
      setError(null);
      setCallStatus('connecting');
      setActiveJobId(jobId);

      // Fetch config from backend
      const response = await apiClient.get<VapiConfig>(`/interview/vapi-config/${jobId}`);
      const { publicKey, assistantId, assistantOverride, sessionId } = response;

      if (!publicKey || !assistantId) {
        throw new Error('Invalid Vapi configuration received from server');
      }

      // Initialize Vapi
      const vapi = new Vapi(publicKey);
      setVapiInstance(vapi);

      // Setup event listeners
      vapi.on('call-start', () => {
        setCallStatus('active');
      });

      vapi.on('call-end', () => {
        setCallStatus('summarizing');
        // Clear active job after some delay to show summary state
        setTimeout(() => {
           setCallStatus('idle');
           setActiveJobId(null);
        }, 8000);
      });

      vapi.on('speech-start', () => setIsSpeaking(true));
      vapi.on('speech-end', () => setIsSpeaking(false));
      vapi.on('volume-level', (level: number) => setVolume(level));

      vapi.on('error', (err: Error) => {
        console.error('Vapi error:', err);
        setError('Connection error. Please check your microphone and try again.');
        setCallStatus('idle');
      });

      // Start the call
      await vapi.start(assistantId, {
        assistantOverride,
        metadata: { sessionId },
      });

    } catch (err: unknown) {
      console.error('Failed to start interview:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize the interview. Please try again.';
      setError(errorMessage);
      setCallStatus('idle');
      setActiveJobId(null);
    }
  }, []);

  const endCall = useCallback(() => {
    if (vapiInstance) {
      vapiInstance.stop();
    }
  }, [vapiInstance]);

  const toggleMute = useCallback(() => {
    if (vapiInstance) {
      const newMuted = !isMuted;
      vapiInstance.setMuted(newMuted);
      setIsMuted(newMuted);
    }
  }, [vapiInstance, isMuted]);

  useEffect(() => {
    return () => {
      if (vapiInstance) {
        vapiInstance.stop();
      }
    };
  }, [vapiInstance]);

  const activeJob = allJobs.find(j => j.id === activeJobId);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">AI Mock Interview</h1>
        <p className="text-gray-500 mt-3 text-lg">Hone your skills with real-time voice feedback from our AI interviewer.</p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700 shadow-sm"
        >
          <div className="bg-red-100 p-2 rounded-full">
            <AlertCircle size={20} />
          </div>
          <p className="font-medium">{error}</p>
        </motion.div>
      )}

      {callStatus === 'idle' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allJobs.length > 0 ? (
            allJobs.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                      <Mic size={24} />
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
                      {job.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-2xl text-gray-900 leading-tight">{job.title}</h3>
                  <p className="text-gray-500 font-medium mt-2">{job.company}</p>
                </div>
                <button
                  onClick={() => startSession(job.id)}
                  className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100 group"
                >
                  <Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                  Start Session
                </button>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-24 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-500">
              <div className="bg-white p-6 rounded-full shadow-inner mb-6">
                <Mic size={48} className="text-gray-300" />
              </div>
              <p className="text-xl font-bold text-gray-700">No jobs in your tracker</p>
              <p className="text-gray-500 mt-2 max-w-xs text-center">Add jobs to your tracker to unlock personalized AI interview sessions.</p>
            </div>
          )}
          <button className="bg-gray-50/30 rounded-3xl p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 text-gray-400 hover:bg-gray-50 transition-colors group">
            <div className="p-4 rounded-full border-2 border-dashed border-gray-200 group-hover:border-blue-400 group-hover:text-blue-500 transition-colors">
              <Mic size={32} />
            </div>
            <span className="font-bold">Add new session</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden max-w-3xl mx-auto">
          <div className="p-10 md:p-16 text-center">
            <AnimatePresence mode="wait">
              {callStatus === 'connecting' && (
                <motion.div
                  key="connecting"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="py-12"
                >
                  <div className="relative inline-block mb-10">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75" />
                    <div className="relative bg-blue-600 p-8 rounded-full text-white shadow-2xl shadow-blue-200">
                      <Loader2 size={48} className="animate-spin" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-900">Setting up your interview</h2>
                  <p className="text-gray-500 mt-4 text-lg">Preparing context for <span className="text-blue-600 font-bold">{activeJob?.title}</span></p>
                </motion.div>
              )}

              {callStatus === 'active' && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6"
                >
                  <div className="mb-12">
                    <div className="inline-block px-4 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4">
                      Live Interview
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">{activeJob?.title}</h2>
                    <p className="text-gray-500 mt-2 text-lg font-medium">{activeJob?.company}</p>
                  </div>

                  <div className="bg-gray-50 rounded-[2.5rem] p-12 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-100">
                      <motion.div 
                        className="h-full bg-blue-600"
                        animate={{ width: isSpeaking ? '100%' : '0%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <VoiceVisualizer volume={volume} isSpeaking={isSpeaking} />
                    <p className={`text-sm font-bold mt-8 uppercase tracking-widest transition-colors ${isSpeaking ? 'text-blue-600' : 'text-gray-400'}`}>
                      {isSpeaking ? 'AI is speaking...' : 'We are listening...'}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-8">
                    <button
                      onClick={toggleMute}
                      className={`p-6 rounded-full transition-all shadow-lg ${
                        isMuted 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>
                    
                    <button
                      onClick={endCall}
                      className="px-12 py-6 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] font-black transition-all flex items-center gap-3 shadow-2xl shadow-red-100 hover:scale-105 active:scale-95"
                    >
                      <Square size={22} fill="currentColor" />
                      End Interview
                    </button>
                  </div>
                </motion.div>
              )}

              {callStatus === 'summarizing' && (
                <motion.div
                  key="summarizing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12"
                >
                  <div className="bg-green-100 text-green-600 p-8 rounded-full inline-block mb-10 shadow-lg shadow-green-50">
                    <CheckCircle2 size={56} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-900">Session Completed!</h2>
                  <p className="text-gray-500 mt-4 text-lg max-w-sm mx-auto leading-relaxed">
                    Excellent work! Our AI is now evaluating your performance and generating your personalized feedback.
                  </p>
                  
                  <div className="mt-12 p-8 bg-blue-50/50 rounded-[2rem] text-left border border-blue-100/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-blue-700 font-bold text-lg mb-3">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Generating Feedback Report</span>
                    </div>
                    <p className="text-blue-600/70 leading-relaxed font-medium">
                      Our summarizer is analyzing the transcript and scoring your responses. This usually takes less than a minute. You'll find the report in your dashboard soon.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
