import { useState } from 'react';
import { CheckCircle, Circle, Plus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrackerStore } from '../store/trackerSlice';

export default function TodoList() {
  const { todos, toggleTodo, addTodo } = useTrackerStore();
  const [newText, setNewText] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const handleAdd = () => {
    if (!newText.trim()) return;
    addTodo(newText, newDueDate);
    setNewText('');
    setNewDueDate('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Tasks</h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
          />
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-sm"
          />
          <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm">
            <Plus size={18} />
          </button>
        </div>
        <div className="space-y-2">
          {todos.length === 0 && <p className="text-gray-400 text-center py-8">No tasks yet. Add one above to stay organized!</p>}
          {todos.map((todo) => (
            <motion.div key={todo.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 p-3 border-b border-gray-50 last:border-0">
              <button onClick={() => toggleTodo(todo.id)} className="transition-colors">
                {todo.completed ? <CheckCircle size={22} className="text-green-500" /> : <Circle size={22} className="text-gray-300 hover:text-indigo-500" />}
              </button>
              <span className={`flex-1 font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{todo.text}</span>
              {todo.dueDate && <span className="text-xs text-gray-400 flex items-center gap-1 font-medium bg-gray-50 px-2 py-1 rounded-md"><Calendar size={12} /> {todo.dueDate}</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
