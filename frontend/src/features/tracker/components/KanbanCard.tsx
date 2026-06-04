import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../../jobs/store/jobsSlice';

interface KanbanCardProps {
  job: Job;
}

export default function KanbanCard({ job }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-surface p-3 rounded-lg shadow-sm border border-border cursor-grab active:cursor-grabbing mb-2"
    >
      <div className="font-medium">{job.title}</div>
      <div className="text-xs text-text-muted">{job.company}</div>
      <div className="text-xs text-text-muted mt-1">📅 {job.deadline}</div>
    </div>
  );
}
