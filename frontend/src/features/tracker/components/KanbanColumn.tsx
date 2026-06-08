import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { TrendingUp, Building2, FileCheck, Mic2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../../jobs/store/jobsSlice';

interface KanbanCardProps {
  job: Job;
}

function KanbanCard({ job }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 mb-2 cursor-grab">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{job.title}</h4>
          <p className="text-xs text-gray-500">{job.company}</p>
        </div>
        <GripVertical size={16} className="text-gray-400" />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button className="text-xs flex items-center justify-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
          <TrendingUp size={12} /> Radar
        </button>
        <button className="text-xs flex items-center justify-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100">
          <Building2 size={12} /> Culture
        </button>
        <button className="text-xs flex items-center justify-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100">
          <FileCheck size={12} /> ATS
        </button>
        <button className="text-xs flex items-center justify-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100">
          <Mic2 size={12} /> Mock
        </button>
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  id: string;
  title: string;
  jobs?: Job[]; // allow undefined
  color?: string;
}

export default function KanbanColumn({ id, title, jobs = [], color = 'bg-gray-100' }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="w-72 flex-shrink-0 bg-gray-50 rounded-xl p-3">
      <h3 className={`font-semibold mb-3 pb-2 border-b ${color}`}>{title} ({jobs.length})</h3>
      <div ref={setNodeRef} className="min-h-[200px]">
        {jobs.map((job) => (
          <KanbanCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && <div className="text-center text-gray-400 text-sm py-4">Drop here</div>}
      </div>
    </div>
  );
}
