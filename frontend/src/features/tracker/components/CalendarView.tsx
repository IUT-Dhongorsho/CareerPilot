import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTrackerStore } from '../store/trackerSlice';

export default function CalendarView() {
  const { calendarEvents, todos } = useTrackerStore();

  const events = [
    ...calendarEvents.map((e) => ({ title: e.title, date: e.date, color: '#6366f1' })),
    ...todos.map((t) => ({ title: t.text, date: t.dueDate, color: '#f59e0b' })),
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Calendar</h2>
      <div className="bg-surface rounded-lg p-4">
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
    </div>
  );
}
