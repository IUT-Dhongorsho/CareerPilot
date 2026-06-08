import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, Briefcase, GraduationCap, Loader2, Sparkles, Upload } from 'lucide-react';
import axiosClient from '../../../lib/api/axiosClient';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [enhancement, setEnhancement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    axiosClient.get('/profile')
      .then((res: any) => setProfile(res.data.profile))
      .catch((err: any) => {
        console.error(err);
        toast.error('Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEnhance = async () => {
    setEnhancing(true);
    try {
      const res: any = await axiosClient.post('/cv/enhance');
      setEnhancement(res.data.feedback);
      toast.success('CV analysis complete!');
    } catch (err) {
      toast.error('Failed to enhance CV');
    } finally {
      setEnhancing(false);
    }
  };

  const handleReupload = () => {
    window.location.href = '/upload-cv';
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold">
            {profile?.name?.[0] || profile?.email?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile?.name || 'User'}</h1>
            <p className="flex items-center gap-1"><Mail size={16} /> {profile?.email}</p>
          </div>
        </div>
        <button onClick={handleReupload} className="px-4 py-2 bg-white/20 rounded-lg flex items-center gap-2 hover:bg-white/30 transition">
          <Upload size={18} /> Re-upload CV
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4"><Award className="text-blue-500" /> Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile?.skills?.map((s: string) => <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{s}</span>)}
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4"><Briefcase className="text-blue-500" /> Experience</h2>
          {profile?.experience?.map((exp: any, i: number) => (
            <div key={i} className="mb-3"><p className="font-medium">{exp.title} at {exp.company}</p><p className="text-sm text-gray-500">{exp.duration}</p></div>
          ))}
        </div>
        <div className="md:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4"><GraduationCap className="text-blue-500" /> Education</h2>
          {profile?.education?.map((edu: any, i: number) => (
            <div key={i}><p className="font-medium">{edu.degree}</p><p className="text-sm text-gray-500">{edu.institution} • {edu.year}</p></div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <button onClick={handleEnhance} disabled={enhancing} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50">
          {enhancing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
          {enhancing ? 'Analyzing...' : 'CV Enhancer'}
        </button>
        {enhancement && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm prose prose-blue max-w-none">
            <div className="whitespace-pre-wrap">{enhancement}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
