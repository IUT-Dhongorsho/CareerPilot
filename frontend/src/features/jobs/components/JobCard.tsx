import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Calendar, Star } from 'lucide-react';
import { useTrackerStore } from '../../tracker/store/trackerSlice';
import type { Job } from '../store/jobsSlice';

interface JobCardProps {
  job: Job;
}

const getFitColor = (score: number) => {
  if (score >= 70) return 'bg-green-100 text-green-700';
  if (score >= 50) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

export default function JobCard({ job }: JobCardProps) {
  const { addToKanban } = useTrackerStore();

  const handleWishlist = () => {
    addToKanban(job, 'wishlist');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100"
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getFitColor(job.fitScore)}`}>
            Fit {job.fitScore}%
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1"><Briefcase size={14} /> {job.company}</span>
          <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
          <span className="flex items-center gap-1"><DollarSign size={14} /> {job.salary}</span>
          <span className="flex items-center gap-1"><Calendar size={14} /> {job.deadline}</span>
        </div>
      </div>
      <button
        onClick={handleWishlist}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
      >
        <Star size={16} /> Wishlist
      </button>
    </motion.div>
  );
}
