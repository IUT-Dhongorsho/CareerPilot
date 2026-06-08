import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Award, Briefcase, GraduationCap, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock – replace with real /api/cv/profile
    setTimeout(() => {
      setProfile({
        name: 'John Doe',
        email: 'john@example.com',
        skills: ['Python', 'React', 'SQL', 'Machine Learning'],
        experience: [
          { title: 'Software Engineer', company: 'Tech Corp', duration: '2022-Present' }
        ],
        education: [
          { degree: 'BSc in CSE', institution: 'University of Tech', year: '2024' }
        ]
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
            {profile.name[0]}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <p className="text-gray-500 flex items-center gap-1"><Mail size={14} /> {profile.email}</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2"><Award size={18} /> Skills</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.skills.map(skill => <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{skill}</span>)}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2"><Briefcase size={18} /> Experience</h3>
          {profile.experience.map(exp => (
            <div key={exp.title} className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{exp.title} at {exp.company}</p>
              <p className="text-sm text-gray-500">{exp.duration}</p>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2"><GraduationCap size={18} /> Education</h3>
          {profile.education.map(edu => (
            <div key={edu.degree} className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{edu.degree}</p>
              <p className="text-sm text-gray-500">{edu.institution} • {edu.year}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
