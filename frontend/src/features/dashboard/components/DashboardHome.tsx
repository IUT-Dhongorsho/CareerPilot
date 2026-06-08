import { useEffect } from 'react';
import { useTrackerStore } from '../../tracker/store/trackerSlice';
import KanbanBoard from '../../tracker/components/KanbanBoard';
import { motion } from 'framer-motion';
import { Sparkles, FileCheck, TrendingUp, MapPin } from 'lucide-react';

export default function DashboardHome() {
  const { fetchKanban } = useTrackerStore();

  useEffect(() => {
    fetchKanban();
  }, [fetchKanban]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Full width Kanban */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Application Tracker</h2>
        <KanbanBoard />
      </div>

      {/* Summary & ATS row */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="text-blue-500" size={24} />
            <h2 className="text-xl font-semibold">Summary</h2>
          </div>
          <p className="text-gray-600">AI-generated summary of your job search progress (coming soon).</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <FileCheck className="text-purple-500" size={24} />
            <h2 className="text-xl font-semibold">ATS Feedback</h2>
          </div>
          <p className="text-gray-600">Review your CV against job requirements (coming soon).</p>
        </div>
      </div>

      {/* Skill Gap & Roadmap row */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="text-green-500" size={24} />
            <h2 className="text-xl font-semibold">Skill Gap</h2>
          </div>
          <p className="text-gray-600">Identify missing skills for your target roles (coming soon).</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="text-red-500" size={24} />
            <h2 className="text-xl font-semibold">Roadmap</h2>
          </div>
          <p className="text-gray-600">Personalized learning path to reach your career goals (coming soon).</p>
        </div>
      </div>
    </motion.div>
  );
}
