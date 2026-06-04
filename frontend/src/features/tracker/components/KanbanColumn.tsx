import { useDroppable } from '@dnd-kit/core';
import type { Job } from '../../jobs/store/jobsSlice';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  jobs: Job[];
  color?: string;
}

export default function KanbanColumn({ id, title, jobs, color = 'bg-gray-100' }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-[200px] bg-surface-muted rounded-lg p-3">
      <h3 className={`font-semibold mb-3 pb-2 border-b ${color}`}>{title} ({jobs.length})</h3>
      <div ref={setNodeRef} className="min-h-[200px]">
        {jobs.map((job) => (
          <KanbanCard key={job.id} job={job} />
        ))}
        {jobs.length === 0 && <div className="text-center text-text-muted text-sm py-4">Drop here</div>}
      </div>
    </div>
  );
}
