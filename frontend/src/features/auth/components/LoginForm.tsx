import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authSlice';
import { useCVStore } from '../../cv/store/cvSlice';
import LottieCharacter from '../../../components/ui/LottieCharacter';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [catData, setCatData] = useState(null);
  const { login, isLoading } = useAuthStore();
  const { isUploaded } = useCVStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/animations/cat.json')
      .then(res => res.json())
      .then(setCatData)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.hasUploadedCv || isUploaded) {
        navigate('/dashboard');
      } else {
        navigate('/upload-cv');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Briefcase className="w-8 h-8 text-indigo-600 animate-pulse" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
              <p className="text-gray-500">Sign in to continue your career journey</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login'}
                <LogIn className="w-5 h-5" />
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Google</button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">GitHub</button>
            </div>

            <p className="text-center mt-6 text-gray-500">
              Don't have an account? <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Sign up</Link>
            </p>
          </div>

          <div className="hidden md:flex bg-gradient-to-br from-indigo-50/50 to-white/30 items-center justify-center p-8">
            {catData ? <LottieCharacter animationData={catData} className="w-full max-w-md h-auto" /> : <div>Loading...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
