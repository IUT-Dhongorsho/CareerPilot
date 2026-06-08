import { useTrackerStore } from '../../tracker/store/trackerSlice';
import KanbanBoard from '../../tracker/components/KanbanBoard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function DashboardHome() {
  const { kanban } = useTrackerStore();
  // Safe fallback if kanban is undefined
  const data = [
    { name: 'Wishlist', value: kanban?.wishlist?.length ?? 0, color: '#9ca3af' },
    { name: 'Applied', value: kanban?.applied?.length ?? 0, color: '#3b82f6' },
    { name: 'Interviewed', value: kanban?.interviewed?.length ?? 0, color: '#eab308' },
    { name: 'Accepted', value: kanban?.accepted?.length ?? 0, color: '#10b981' },
    { name: 'Rejected', value: kanban?.rejected?.length ?? 0, color: '#ef4444' },
  ];
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">Application Tracker</h2>
          <KanbanBoard />
        </div>
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
      </div>
    </motion.div>
  );
}
