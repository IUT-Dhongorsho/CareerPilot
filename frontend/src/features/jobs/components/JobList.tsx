import { useJobsStore } from '../store/jobsSlice';
import JobCard from './JobCard';
import { AnimatePresence } from 'framer-motion';

export default function JobList() {
  const { results, isLoading } = useJobsStore();

  if (isLoading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  if (results.length === 0) {
    return <div className="text-center py-8 text-text-muted">No jobs yet. Try a search like "Find me ML jobs in Dhaka"</div>;
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {results.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </AnimatePresence>
    </div>
  );
}
