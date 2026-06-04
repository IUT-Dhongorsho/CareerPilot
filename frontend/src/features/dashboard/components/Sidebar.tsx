import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Apply', path: '/dashboard/apply' },
  { name: 'Kanban', path: '/dashboard/kanban' },
  { name: 'Calendar', path: '/dashboard/calendar' },
  { name: 'To-Do', path: '/dashboard/todo' },
  { name: 'Progress', path: '/dashboard/progress' },
];

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-surface border-r border-border p-4"
    >
      <h1 className="text-xl font-bold text-primary mb-8">CareerPilot</h1>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md transition ${isActive ? 'bg-primary text-white' : 'hover:bg-bg text-text-muted'}`
            }
          >
            <motion.span whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400 }} className="block">
              {item.name}
            </motion.span>
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}
