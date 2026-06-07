import { useChatStore } from '../store/chatSlice';
import { useCVStore } from '../../cv/store/cvSlice';
import { sendMessage } from '../services';
import { useJobsStore } from '../../jobs/store/jobsSlice';

export const useChat = () => {
  const { addMessage, setLoading, messages } = useChatStore();
  const { chunks } = useCVStore();
  const { setResults } = useJobsStore();

  const sendUserMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    addMessage({ role: 'user', content: text });
    setLoading(true);

    try {
      const response = await sendMessage(text, chunks);
      
      // If response contains job cards, update jobs store
      if (response.type === 'job_cards' && response.jobs) {
        setResults(response.jobs);
      }
      
      // Add assistant message
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
