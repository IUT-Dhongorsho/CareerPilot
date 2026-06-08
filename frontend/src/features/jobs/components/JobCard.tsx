import { motion } from 'framer-motion';
import type { Job } from '../store/jobsSlice';
import { useTrackerStore } from '../../tracker/store/trackerSlice';

interface JobCardProps {
  job: Job;
  compact?: boolean;
}

const getFitColor = (score: number) => {
  if (score >= 70) return 'border-green-500';
  if (score >= 50) return 'border-yellow-500';
  return 'border-red-500';
};

export default function JobCard({ job, compact = false }: JobCardProps) {
  const { addToKanban } = useTrackerStore();

  if (compact) {
    return (
      <div className="text-sm p-2 border-b border-border">
        <span className="font-medium">{job.title}</span> at {job.company}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`glass-card rounded-xl p-4 mb-3 border-l-4 ${getFitColor(job.fitScore)} transition-all`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{job.title}</h3>
          <p className="text-text-muted">{job.company} • {job.location}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold text-primary">{job.fitScore}%</span>
          <p className="text-xs text-text-muted">fit score</p>
        </div>
      </div>
      <div className="mt-2 text-sm">
        <span>💰 {job.salary}</span>
        <span className="mx-2">•</span>
        <span>📅 Deadline: {job.deadline}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => addToKanban(job, 'applied')}
          className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary/20 transition"
        >
          + Add to Kanban
        </button>
        {job.link && (
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-accent/10 text-accent px-3 py-1 rounded-md hover:bg-accent/20 transition flex items-center gap-1"
          >
            Go to Link ↗
          </a>
        )}
      </div>
    </motion.div>
  );
}
