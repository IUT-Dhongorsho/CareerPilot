import { useTrackerStore } from '../../tracker/store/trackerSlice';
import KanbanBoard from '../../tracker/components/KanbanBoard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Building2, FileCheck } from 'lucide-react';

export default function DashboardHome() {
  const { kanban } = useTrackerStore();
  const data = [
    { name: 'Wishlist', value: kanban?.wishlist?.length ?? 0, color: '#9ca3af' },
    { name: 'Applied', value: kanban?.applied?.length ?? 0, color: '#3b82f6' },
    { name: 'Interviewing', value: kanban?.interviewing?.length ?? 0, color: '#eab308' },
    { name: 'Offer', value: kanban?.offer?.length ?? 0, color: '#10b981' },
    { name: 'Rejected', value: kanban?.rejected?.length ?? 0, color: '#ef4444' },
  ];
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 text-center">Dashboard</h1>

      {/* Kanban Board (horizontal scrollable) */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-3 text-center">Application Tracker</h2>
        <div className="overflow-x-auto">
          <KanbanBoard />
        </div>
      </div>

      {/* Second row: Stats + Radar */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Stats Pie Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">Application Stats</h2>
          {total === 0 ? (
            <div className="text-gray-400 text-center py-8">No data yet – add jobs from Job Search</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                    {data.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-1">
                {data.map(entry => (
                  <div key={entry.name} className="flex justify-between text-sm">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>{entry.name}</span>
                    <span className="font-medium">{entry.value}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{total}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Radar Chart (placeholder) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <TrendingUp size={32} className="text-blue-500 mb-2" />
          <h2 className="text-lg font-semibold mb-2">Skill Gap Radar</h2>
          <p className="text-sm text-gray-500 text-center">Select a job from Kanban to see radar chart.</p>
          <button className="mt-3 text-blue-600 text-sm underline">Coming soon</button>
        </div>
      </div>

      {/* Third row: Company Culture + ATS Feedback */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={20} className="text-indigo-500" />
            <h2 className="text-lg font-semibold">Company Culture</h2>
          </div>
          <p className="text-sm text-gray-600">Click on a job card in Kanban to view culture summary.</p>
          <button className="mt-3 text-indigo-600 text-sm underline">Select a job</button>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <FileCheck size={20} className="text-purple-500" />
            <h2 className="text-lg font-semibold">ATS Feedback</h2>
          </div>
          <p className="text-sm text-gray-600">Get actionable feedback on your CV for a specific role.</p>
          <button className="mt-3 text-purple-600 text-sm underline">Analyze CV for role</button>
        </div>
      </div>
    </motion.div>
  );
}
