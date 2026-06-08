import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCVStore } from '../store/cvSlice';
import { useAuthStore } from '../../auth/store/authSlice';
import apiClient from '../../../lib/api/axiosClient';

export default function CVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const { uploadCV, isProcessing, setProcessing } = useCVStore();
  const { user, session, setAuth } = useAuthStore();
  const navigate = useNavigate();

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
      setProcessing(true);
      const formData = new FormData();
      formData.append('cv', file);

      // 1. Upload to backend (RAG + update flag in DB)
      await apiClient.post('/cv/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 2. Update local state
      if (session) {
        const enrichedSession: any = {
          ...session,
          user: {
            ...session.user,
            hasUploadedCv: true,
            user_metadata: {
              ...session.user.user_metadata,
              hasUploadedCv: true
            }
          },
        };
        setAuth(enrichedSession);
      }

      await uploadCV(); 
      window.location.href = '/dashboard'; // Force a full reload to ensure AuthProvider fetches fresh DB state
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (isProcessing) {
    return <div className="flex items-center justify-center h-screen">Processing your CV...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="bg-surface p-8 rounded-lg shadow-md w-96 text-center">
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
        <button
          onClick={handleUpload}
          disabled={!file}
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          Upload & Continue
        </button>
      </div>
    </div>
  );
}
