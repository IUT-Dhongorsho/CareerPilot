import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2 } from 'lucide-react';
import axiosClient from '../../../lib/api/axiosClient';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.post('/cv/profile')
      .then((res: any) => setProfile(res.profile))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm space-y-6">
        {/* Render profile data similarly as before */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
            {profile?.name?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile?.name || 'User'}</h2>
            <p className="text-gray-500 flex items-center gap-1"><Mail size={14} /> {profile?.email}</p>
          </div>
        </div>
        {/* Skills, Experience, Education as before, use profile data */}
      </div>
    </motion.div>
  );
}
