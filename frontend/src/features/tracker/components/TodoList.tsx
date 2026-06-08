import { useState } from 'react';
import { useTrackerStore } from '../store/trackerSlice';
import { CheckCircle, Circle, Plus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">To-Do List</h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="New task..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg"
          />
          <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={18} />
          </button>
        </div>
        <div className="space-y-2">
          {todos.length === 0 && <p className="text-gray-400 text-center py-4">No tasks yet. Add one above.</p>}
          {todos.map((todo) => (
            <motion.div key={todo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-2 border-b border-gray-100">
              <button onClick={() => toggleTodo(todo.id)} className="text-gray-500 hover:text-blue-600">
                {todo.completed ? <CheckCircle size={20} className="text-green-500" /> : <Circle size={20} />}
              </button>
              <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{todo.text}</span>
              {todo.dueDate && <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} /> {todo.dueDate}</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
