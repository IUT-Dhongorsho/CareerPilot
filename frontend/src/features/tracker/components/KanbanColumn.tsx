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
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm font-semibold">Recommendations:</p>
        <ul className="text-sm list-disc ml-4">
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
        <p className="text-sm">✨ <strong>Innovative:</strong> Encourages cutting-edge projects and R&D.</p>
        <p className="text-sm">👥 <strong>Collaborative:</strong> Cross-functional teams, open communication.</p>
        <p className="text-sm">⚡ <strong>Fast-paced:</strong> Agile environment, quick decision making.</p>
        <p className="text-sm">📈 <strong>Growth:</strong> Strong learning budget and internal mobility.</p>
      </div>
    </div>
  );
}

function ATSFeedback({ job }: { job: Job }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-700">ATS analysis for <strong>{job.title}</strong> role:</p>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="font-semibold text-lg">Score: 72/100</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '72%' }}></div>
        </div>
        <ul className="list-disc ml-5 mt-3 text-sm space-y-1">
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
      <p>Mock interview for <strong>{job.title}</strong> at {job.company}</p>
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm">This will start an AI-led interview session. You'll receive questions and feedback in real time.</p>
        <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Start Interview</button>
        <p className="text-xs text-gray-500 mt-2">(Demo: full integration coming soon)</p>
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
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-3 cursor-grab">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 text-center">
            <h4 className="font-semibold text-gray-800 text-base">{job.title}</h4>
            <p className="text-sm text-gray-500">{job.company}</p>
          </div>
          <GripVertical size={20} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button onClick={(e) => handleButtonClick('radar', e)} className="text-sm flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
            <TrendingUp size={16} /> Radar
          </button>
          <button onClick={(e) => handleButtonClick('culture', e)} className="text-sm flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100">
            <Building2 size={16} /> Culture
          </button>
          <button onClick={(e) => handleButtonClick('ats', e)} className="text-sm flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100">
            <FileCheck size={16} /> ATS
          </button>
          <button onClick={(e) => handleButtonClick('mock', e)} className="text-sm flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100">
            <Mic2 size={16} /> Mock
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
    <div className="w-80 flex-shrink-0 bg-gray-50 rounded-xl p-4">
      <h3 className={`font-semibold text-lg mb-4 pb-2 border-b ${color}`}>{title} ({jobs.length})</h3>
      <div ref={setNodeRef} className="min-h-[250px]">
        {jobs.map((job) => (
          <KanbanCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && <div className="text-center text-gray-400 text-sm py-6">Drop here</div>}
      </div>
    </div>
  );
}
