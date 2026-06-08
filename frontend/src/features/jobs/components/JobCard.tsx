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
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-gray-100"
    >
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-4 flex-wrap">
          <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getFitColor(job.fitScore)}`}>
            Fit {job.fitScore}%
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-base text-gray-600">
          <span className="flex items-center gap-2"><Briefcase size={18} /> {job.company}</span>
          <span className="flex items-center gap-2"><MapPin size={18} /> {job.location}</span>
          <span className="flex items-center gap-2"><DollarSign size={18} /> {job.salary}</span>
          <span className="flex items-center gap-2"><Calendar size={18} /> {job.deadline}</span>
        </div>
      </div>
      <button
        onClick={handleWishlist}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
      >
        <Star size={18} /> Wishlist
      </button>
    </motion.div>
  );
}
