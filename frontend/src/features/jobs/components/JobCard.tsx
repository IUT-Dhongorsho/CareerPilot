import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Calendar, MoreVertical, TrendingUp, Building2, FileCheck, Mic2 } from 'lucide-react';
import { useTrackerStore } from '../../tracker/store/trackerSlice';
import type { Job } from '../store/jobsSlice';

interface JobCardProps {
  job: Job;
  compact?: boolean;
}

const getFitColor = (score: number) => {
  if (score >= 70) return 'border-green-500 bg-green-50';
  if (score >= 50) return 'border-yellow-500 bg-yellow-50';
  return 'border-red-500 bg-red-50';
};

export default function JobCard({ job, compact = false }: JobCardProps) {
  const { addToKanban } = useTrackerStore();
  const [showActions, setShowActions] = useState(false);

  if (compact) {
    return (
      <div className="text-sm p-3 border-b border-gray-200 flex justify-between items-center">
        <span className="font-medium">{job.title}</span>
        <span className="text-gray-500">{job.company}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`relative rounded-xl border-l-4 ${getFitColor(job.fitScore)} bg-white shadow-sm hover:shadow-md transition p-5`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1"><Briefcase size={14} /> {job.company}</span>
            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
            <span className="flex items-center gap-1"><DollarSign size={14} /> {job.salary}</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> Deadline: {job.deadline}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold">Fit Score:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              job.fitScore >= 70 ? 'bg-green-100 text-green-700' : job.fitScore >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>{job.fitScore}%</span>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <MoreVertical size={20} className="text-gray-500" />
          </button>
          {showActions && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
              <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-50">
                <TrendingUp size={16} /> View Fit Score (Radar)
              </button>
              <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-50">
                <Building2 size={16} /> Company Culture
              </button>
              <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-50">
                <FileCheck size={16} /> ATS Feedback
              </button>
              <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-50">
                <Mic2 size={16} /> Start Mock Interview
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => addToKanban(job, 'applied')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
        >
          + Add to Kanban
        </button>
      </div>
    </motion.div>
  );
}
