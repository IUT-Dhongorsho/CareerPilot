import { useState } from 'react'
import KanbanBoard from '../components/KanbanBoard'
import CalendarView from '../components/CalendarView'
import TodoList from '../components/TodoList'

const tabs = ['Kanban', 'Calendar', 'Todos']

export default function TrackerPage() {
  const [tab, setTab] = useState(0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-h)' }}>Application Tracker</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>Track your applications, deadlines, and tasks</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === i ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-dim)' }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <KanbanBoard />}
      {tab === 1 && <CalendarView />}
      {tab === 2 && <TodoList />}
    </div>
  )
}
