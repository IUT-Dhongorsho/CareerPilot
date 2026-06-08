import KanbanBoard from '../../tracker/components/KanbanBoard';
import TodoList from '../../tracker/components/TodoList';
import { motion } from 'framer-motion';

export default function DashboardHome() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">Application Tracker</h2>
          <KanbanBoard />
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-3">To-Do List</h2>
          <TodoList />
        </div>
      </div>
    </motion.div>
  );
}
