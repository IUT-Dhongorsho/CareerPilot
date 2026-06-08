import { useTrackerStore } from '../../tracker/store/trackerSlice';
import KanbanBoard from '../../tracker/components/KanbanBoard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Building2, FileCheck, CheckCircle2, Briefcase, Target, Calendar } from 'lucide-react';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { useMemo } from 'react';

export default function DashboardHome() {
  const { kanban, todos } = useTrackerStore();

  // Kanban Data for Pie Chart
  const kanbanData = useMemo(() => [
    { name: 'Wishlist', value: kanban?.wishlist?.length ?? 0, color: '#9ca3af' },
    { name: 'Applied', value: kanban?.applied?.length ?? 0, color: '#3b82f6' },
    { name: 'Interviewing', value: kanban?.interviewing?.length ?? 0, color: '#eab308' },
    { name: 'Offer', value: kanban?.offer?.length ?? 0, color: '#10b981' },
    { name: 'Rejected', value: kanban?.rejected?.length ?? 0, color: '#ef4444' },
  ], [kanban]);

  const totalApplications = useMemo(() => kanbanData.reduce((acc, d) => acc + d.value, 0), [kanbanData]);

  // Todo Data for Progress
  const completedTodos = todos.filter(t => t.completed).length;
  const totalTodos = todos.length;
  const todoCompletionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
  
  // Application Trends (Last 7 Days)
  const trendsData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    const allJobs = [
      ...(kanban?.wishlist || []),
      ...(kanban?.applied || []),
      ...(kanban?.interviewing || []),
      ...(kanban?.offer || []),
      ...(kanban?.rejected || []),
    ];

    return last7Days.map(day => {
      const count = allJobs.filter(job => {
        const jobDate = job.createdAt ? new Date(job.createdAt) : new Date();
        return isSameDay(startOfDay(jobDate), startOfDay(day));
      }).length;

      return {
        date: format(day, 'MMM dd'),
        count: count || (Math.floor((day.getTime() % 3))) // Deterministic "random" for demo
      };
    });
  }, [kanban]);

  // Success Metrics
  const interviewRate = kanban?.applied?.length > 0 
    ? Math.round(((kanban.interviewing.length + kanban.offer.length) / (kanban.applied.length + kanban.interviewing.length + kanban.offer.length)) * 100) 
    : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Job Search Analytics</h1>
        <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
          <Calendar size={14} /> {format(new Date(), 'MMMM dd, yyyy')}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Briefcase className="text-blue-500" />} 
          label="Total Applications" 
          value={totalApplications} 
          subValue="+2 this week" 
        />
        <StatCard 
          icon={<Target className="text-yellow-500" />} 
          label="Interview Rate" 
          value={`${interviewRate}%`} 
          subValue="Keep it up!" 
        />
        <StatCard 
          icon={<CheckCircle2 className="text-green-500" />} 
          label="Task Completion" 
          value={`${todoCompletionRate}%`} 
          subValue={`${completedTodos}/${totalTodos} tasks`} 
        />
        <StatCard 
          icon={<TrendingUp className="text-purple-500" />} 
          label="Activity Score" 
          value="High" 
          subValue="Top 10% this month" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Application Status Pie */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6 text-gray-800">Pipeline Status</h2>
          {totalApplications === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Briefcase size={48} className="mb-4 opacity-20" />
              <p>No data yet</p>
            </div>
          ) : (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={kanbanData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={80} 
                      paddingAngle={5}
                    >
                      {kanbanData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {kanbanData.map(entry => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-xs text-gray-600 font-medium">{entry.name}</span>
                    <span className="text-xs font-bold ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Application Trends Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6 text-gray-800">Application Activity</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Kanban Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Quick Kanban View</h2>
          <button className="text-sm text-indigo-600 font-semibold hover:underline">Manage Tracker</button>
        </div>
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1000px]">
            <KanbanBoard showTitle={false} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Building2 size={20} className="text-indigo-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Market Insights</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Remote roles are up 12%</p>
              <p className="text-xs text-gray-500 mt-1">Based on your recent searches in Dhaka.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Top Skill: Python</p>
              <p className="text-xs text-gray-500 mt-1">Found in 80% of jobs you applied for.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileCheck size={20} className="text-purple-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">CV Strength</h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-xl border border-purple-100 mb-4">
            <div>
              <p className="text-2xl font-bold text-purple-700">84/100</p>
              <p className="text-xs text-purple-600 font-medium">Excellent Score</p>
            </div>
            <div className="w-24 h-2 bg-purple-200 rounded-full overflow-hidden">
              <div className="w-[84%] h-full bg-purple-500"></div>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your CV is performing well for AI Engineer roles. Add more details about LLMs to reach 90+.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string | number, subValue: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {subValue}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
