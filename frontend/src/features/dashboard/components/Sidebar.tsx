import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, LayoutDashboard, Calendar, CheckSquare, Mic2, MapPin, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useUIStore } from '../store/uiSlice';

const navItems = [
  { path: '/dashboard/jobs', name: 'Job Search', icon: Search },
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/dashboard/calendar', name: 'Calendar', icon: Calendar },
  { path: '/dashboard/todo', name: 'To-Do', icon: CheckSquare },
  { path: '/dashboard/interview', name: 'Mock Interview', icon: Mic2 },
  { path: '/dashboard/roadmap', name: 'Roadmap', icon: MapPin },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.aside
      initial={{ width: sidebarCollapsed ? 64 : 256 }}
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col h-full shadow-sm"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!sidebarCollapsed && <span className="font-bold text-blue-600 text-2xl">CareerPilot</span>}
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100 transition">
          {sidebarCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>
      <nav className="flex-1 py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 mx-2 rounded-lg transition ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={22} />
            {!sidebarCollapsed && <span className="text-base font-medium">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}
