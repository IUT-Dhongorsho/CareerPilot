import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TrendingUp, Building2, FileCheck, Mic2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import type { Job } from '../../jobs/store/jobsSlice';
import Modal from '../../../components/ui/Modal';

// Mock data for radar chart
const getRadarData = (jobTitle: string) => [
  { skill: 'Python', value: 85, fullMark: 100 },
  { skill: 'SQL', value: 70, fullMark: 100 },
  { skill: 'Machine Learning', value: 60, fullMark: 100 },
  { skill: 'Docker', value: 30, fullMark: 100 },
  { skill: 'Communication', value: 80, fullMark: 100 },
];

function RadarDemo({ job }: { job: Job }) {
  const data = getRadarData(job.title);
  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600">Skill gap radar for <strong>{job.title}</strong> at {job.company}</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar name="Your Skills" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-indigo-50 p-3 rounded-lg">
        <p className="text-sm font-semibold text-indigo-900">Recommendations:</p>
        <ul className="text-sm list-disc ml-4 text-indigo-800">
          <li>Improve Docker skills (currently 30%)</li>
          <li>Take a course on Machine Learning (60% → target 80%)</li>
        </ul>
      </div>
    </div>
  );
}

function CultureDemo({ job }: { job: Job }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-700">Culture summary for <strong>{job.company}</strong> (based on employee reviews):</p>
      <div className="bg-indigo-50 p-4 rounded-lg space-y-2">
        <p className="text-sm text-indigo-900">✨ <strong>Innovative:</strong> Encourages cutting-edge projects and R&D.</p>
        <p className="text-sm text-indigo-900">👥 <strong>Collaborative:</strong> Cross-functional teams, open communication.</p>
        <p className="text-sm text-indigo-900">⚡ <strong>Fast-paced:</strong> Agile environment, quick decision making.</p>
        <p className="text-sm text-indigo-900">📈 <strong>Growth:</strong> Strong learning budget and internal mobility.</p>
      </div>
    </div>
  );
}

function ATSFeedback({ job }: { job: Job }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-700">ATS analysis for <strong>{job.title}</strong> role:</p>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="font-semibold text-lg text-purple-900">Score: 72/100</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '72%' }}></div>
        </div>
        <ul className="list-disc ml-5 mt-3 text-sm space-y-1 text-purple-800">
          <li>✅ Strong experience in Python and SQL</li>
          <li>⚠️ Missing keywords: <strong>Docker, CI/CD, TensorFlow</strong></li>
          <li>📝 Suggestion: Add quantifiable achievements (e.g., "Improved performance by 30%")</li>
        </ul>
      </div>
    </div>
  );
}

function MockInterviewModal({ job, onClose }: { job: Job; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-700">Mock interview for <strong>{job.title}</strong> at {job.company}</p>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-900">This will start an AI-led interview session. You'll receive questions and feedback in real time.</p>
        <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition">Start Interview</button>
        <p className="text-xs text-green-700 mt-2">(Demo: full integration coming soon)</p>
      </div>
    </div>
  );
}

interface KanbanCardProps {
  job: Job;
}

function KanbanCard({ job }: KanbanCardProps) {
  const [modal, setModal] = useState<null | 'radar' | 'culture' | 'ats' | 'mock'>(null);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleButtonClick = (modalType: 'radar' | 'culture' | 'ats' | 'mock', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag event from interfering
    setModal(modalType);
  };

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-4 cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing group">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">{job.title}</h4>
            <p className="text-sm text-gray-500 font-medium">{job.company}</p>
          </div>
          <GripVertical size={20} className="text-gray-300 group-hover:text-gray-400 transition-colors mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={(e) => handleButtonClick('radar', e)} className="text-[12px] flex items-center justify-center gap-1.5 px-2 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-semibold transition-colors">
            <TrendingUp size={14} /> Radar
          </button>
          <button onClick={(e) => handleButtonClick('culture', e)} className="text-[12px] flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold transition-colors">
            <Building2 size={14} /> Culture
          </button>
          <button onClick={(e) => handleButtonClick('ats', e)} className="text-[12px] flex items-center justify-center gap-1.5 px-2 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-semibold transition-colors">
            <FileCheck size={14} /> ATS
          </button>
          <button onClick={(e) => handleButtonClick('mock', e)} className="text-[12px] flex items-center justify-center gap-1.5 px-2 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-semibold transition-colors">
            <Mic2 size={14} /> Mock
          </button>
        </div>
      </div>
      <Modal isOpen={modal === 'radar'} onClose={() => setModal(null)} title="Skill Gap Radar">
        <RadarDemo job={job} />
      </Modal>
      <Modal isOpen={modal === 'culture'} onClose={() => setModal(null)} title="Company Culture">
        <CultureDemo job={job} />
      </Modal>
      <Modal isOpen={modal === 'ats'} onClose={() => setModal(null)} title="ATS Feedback">
        <ATSFeedback job={job} />
      </Modal>
      <Modal isOpen={modal === 'mock'} onClose={() => setModal(null)} title="Mock Interview">
        <MockInterviewModal job={job} onClose={() => setModal(null)} />
      </Modal>
    </>
  );
}

interface KanbanColumnProps {
  id: string;
  title: string;
  jobs?: Job[];
  color?: string;
}

export default function KanbanColumn({ id, title, jobs = [], color = 'bg-gray-100' }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="w-80 flex-shrink-0 bg-gray-100/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50">
      <h3 className={`font-bold text-lg mb-5 pb-3 border-b-2 ${color} text-gray-800 flex justify-between items-center`}>
        {title} 
        <span className="bg-white/50 px-2.5 py-0.5 rounded-full text-sm font-bold text-gray-500 shadow-sm border border-gray-200/50">{jobs.length}</span>
      </h3>
      <div ref={setNodeRef} className="min-h-[400px]">
        {jobs.map((job) => (
          <KanbanCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
