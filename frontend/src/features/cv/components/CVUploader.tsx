import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useCVStore } from '../store/cvSlice';
import axiosClient from '../../../lib/api/axiosClient';

export default function CVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { setChunks, setIsUploaded } = useCVStore();
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected && (selected.type === 'application/pdf' || 
        selected.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        selected.type === 'text/plain')) {
      setFile(selected);
      setError(null);
    } else {
      setError('Only PDF, DOCX, or TXT files are allowed');
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
        setSuccess(true);
        setIsUploaded(true);
        // In a real scenario, you might get chunks back; here we just set a flag
        setChunks([]); // or store chunks if returned
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload CV. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Upload Your CV</h1>
          <p className="text-center text-gray-500 mb-6">We'll analyze it to power your job search</p>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
              ${error ? 'border-red-400 bg-red-50' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            {isDragActive ? (
              <p className="text-blue-600">Drop your CV here...</p>
            ) : (
              <p className="text-gray-600">Drag & drop your CV, or click to select</p>
            )}
            <p className="text-xs text-gray-400 mt-2">PDF, DOCX, or TXT (max 10MB)</p>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">CV uploaded successfully! Redirecting...</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading || success}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload CV'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
