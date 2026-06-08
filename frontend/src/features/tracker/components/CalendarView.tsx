import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion } from 'framer-motion';
import { useTrackerStore } from '../store/trackerSlice';

export default function CalendarView() {
  const { calendarEvents, todos } = useTrackerStore();

  const events = [
    ...calendarEvents.map((e) => ({ title: e.title, date: e.date, color: '#6366f1' })),
    ...todos.filter(t => t.dueDate).map((t) => ({ title: t.text, date: t.dueDate, color: '#f59e0b' })),
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm"
    >
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Your Calendar</h2>
      </div>
      <div className="fc-theme-standard">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
        />
      </div>
    </motion.div>
  );
}
