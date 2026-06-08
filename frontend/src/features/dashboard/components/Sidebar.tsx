import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, LayoutDashboard, Calendar, CheckSquare, Mic2, MapPin, ChevronLeft, ChevronRight, 
  Columns, MessageSquare, BarChart2
} from 'lucide-react';
import { useUIStore } from '../store/uiSlice';

const navItems = [
  { path: '/dashboard/home', name: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/dashboard/apply', name: 'Apply with AI', icon: MessageSquare },
  { path: '/dashboard/jobs', name: 'Job Search', icon: Search },
  { path: '/dashboard/kanban', name: 'Applications', icon: Columns },
  { path: '/dashboard/calendar', name: 'Calendar', icon: Calendar },
  { path: '/dashboard/todo', name: 'To-Do', icon: CheckSquare },
  { path: '/dashboard/progress', name: 'Analytics', icon: BarChart2 },
  { path: '/dashboard/interview', name: 'Mock Interview', icon: Mic2 },
  { path: '/dashboard/roadmap', name: 'Roadmap', icon: MapPin },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      initial={{ width: sidebarCollapsed ? 80 : 280 }}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col h-full shadow-sm z-40"
    >
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        {!sidebarCollapsed && <span className="font-bold text-indigo-600 text-2xl">CareerPilot</span>}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 transition"
        >
          {sidebarCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>
      <nav className="flex-1 py-6 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 mx-2 rounded-xl transition ${
                isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={sidebarCollapsed ? 28 : 22} />
            {!sidebarCollapsed && <span className="text-base font-medium">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}
