import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Briefcase, Upload, FileText, X, CheckCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useCVStore } from '../store/cvSlice';
import { useAuthStore } from '../../auth/store/authSlice';
import axiosClient from '../../../lib/api/axiosClient';

export default function CVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUploaded, setChunks } = useCVStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected && (selected.type === 'application/pdf' || selected.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || selected.type === 'text/plain')) {
      setFile(selected);
      setError(null);
    } else {
      setError('Please upload a PDF, DOCX, or TXT file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('cv', file);
    try {
      const response = await axiosClient.post('/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setUploaded(true);
        if (response.data.chunks) setChunks(response.data.chunks);
        navigate('/dashboard');
      } else {
        setError(response.data.error || 'Upload failed');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Upload failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-blue-100"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Briefcase className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Your CV</h1>
          <p className="text-gray-500">Let AI analyze your profile and match you with dream jobs</p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
            isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          {isDragActive ? (
            <p className="text-blue-600">Drop your CV here...</p>
          ) : (
            <p className="text-gray-600">Drag & drop your CV here, or click to select</p>
          )}
          <p className="text-xs text-gray-400 mt-2">Supports PDF, DOCX, TXT</p>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
            </div>
            <button onClick={removeFile} className="text-red-400 hover:text-red-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              Upload & Continue
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
