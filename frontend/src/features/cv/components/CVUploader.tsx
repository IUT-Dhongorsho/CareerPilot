import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCVStore } from '../store/cvSlice';
import { useAuthStore } from '../../auth/store/authSlice';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function CVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const { uploadCV, isProcessing, isUploaded } = useCVStore();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (isUploaded) {
    navigate('/dashboard');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && (selected.type === 'application/pdf' || selected.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(selected);
      setError('');
    } else {
      setError('Please upload a PDF or DOCX file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    try {
      await uploadCV(file);
      navigate('/dashboard');
    } catch (err) {
      setError('Upload failed. Please try again.');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (isProcessing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-surface p-8 rounded-lg shadow-md w-96 text-center"
      >
        <h1 className="text-2xl font-bold mb-4">Upload Your CV</h1>
        <p className="text-text-muted mb-6">We'll use it to power your AI co-pilot</p>
        <div className="border-2 border-dashed border-border rounded-lg p-6 mb-4">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="block w-full text-sm text-text-muted file:mr-2 file:py-1 file:px-3 file:rounded-md file:bg-primary file:text-white file:border-0 hover:file:bg-primary-dark"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpload}
          disabled={!file}
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          Upload & Continue
        </motion.button>
      </motion.div>
    </div>
  );
}
