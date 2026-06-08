import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion } from 'framer-motion';

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call – replace with real later
    setTimeout(() => {
      setEvents([
        { id: '1', title: 'Google ML Intern deadline', date: '2026-06-30', color: '#3b82f6' },
        { id: '2', title: 'Review Docker', date: '2026-06-15', color: '#f59e0b' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div className="flex justify-center p-8"><div className="spinner"></div></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
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
    </motion.div>
  );
}
