import { useChatStore } from '../store/chatSlice';
import { useCVStore } from '../../cv/store/cvSlice';
import { useJobsStore } from '../../jobs/store/jobsSlice';
import { sendMessage } from '../services';

export const useChat = () => {
  const { addMessage, setLoading, messages } = useChatStore();
  const { chunks } = useCVStore();
  const { setResults } = useJobsStore();

  const sendUserMessage = async (text: string) => {
    if (!text.trim()) return;

    addMessage({ role: 'user', content: text });
    setLoading(true);

    try {
      // Use mock chat API (can be replaced later)
      const response = await sendMessage(text, chunks);
      
      if (response.type === 'job_cards' && response.jobs) {
        setResults(response.jobs);
      }
      
      addMessage({
        role: 'assistant',
        content: response.content,
        jobResults: response.type === 'job_cards' ? response.jobs : undefined,
      });
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage: sendUserMessage, isLoading: useChatStore((s) => s.isLoading) };
};
