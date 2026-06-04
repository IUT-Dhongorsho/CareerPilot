import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authSlice';
import { login } from '../services';
import { fadeInUp } from '../../../lib/animations';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: loginAction, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginAction(email, password);
      navigate('/upload-cv');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-surface p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-bold text-center mb-6">Login to CareerPilot</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-border rounded-md"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>
        <p className="text-center mt-4 text-sm">
          Don't have an account? <Link to="/signup" className="text-primary">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
