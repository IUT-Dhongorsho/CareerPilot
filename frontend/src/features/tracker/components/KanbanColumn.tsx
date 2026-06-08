import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TrendingUp, Building2, FileCheck, Mic2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../../jobs/store/jobsSlice';
import Modal from '../../../components/ui/Modal';

// Placeholder components for modals
function RadarDemo({ job }: { job: Job }) {
  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600">Skill gap radar for <strong>{job.title}</strong> at {job.company}</p>
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <p className="text-sm">[Radar chart would show: Python (85%), SQL (70%), Docker (30%)]</p>
      </div>
      <p className="text-sm text-gray-500">Suggestions: Improve Docker, learn Kubernetes.</p>
    </div>
  );
}

function CultureDemo({ job }: { job: Job }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-700">Culture summary for <strong>{job.company}</strong>:</p>
      <div className="bg-indigo-50 p-4 rounded-lg">
        <p className="text-sm">✨ Innovative, fast-paced, collaborative environment. Known for cutting-edge projects and employee development.</p>
      </div>
    </div>
  );
}

function ATSFeedback({ job }: { job: Job }) {
  return (
    <div className="space-y-4">
      <p className="text-gray-700">ATS analysis for <strong>{job.title}</strong> role:</p>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="font-semibold">Score: 72/100</p>
        <ul className="list-disc ml-5 mt-2 text-sm">
          <li>Missing keywords: Docker, CI/CD</li>
          <li>Suggested improvement: Add quantifiable achievements</li>
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
        <p className="text-sm">This feature will start an AI-led interview session. Coming soon.</p>
      </div>
      <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
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

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-3 cursor-grab">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 text-base">{job.title}</h4>
            <p className="text-sm text-gray-500">{job.company}</p>
          </div>
          <GripVertical size={20} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button onClick={() => setModal('radar')} className="text-sm flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
            <TrendingUp size={16} /> Radar
          </button>
          <button onClick={() => setModal('culture')} className="text-sm flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100">
            <Building2 size={16} /> Culture
          </button>
          <button onClick={() => setModal('ats')} className="text-sm flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100">
            <FileCheck size={16} /> ATS
          </button>
          <button onClick={() => setModal('mock')} className="text-sm flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100">
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
