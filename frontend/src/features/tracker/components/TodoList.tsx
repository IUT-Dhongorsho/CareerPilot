import { useState } from 'react';
import { useTrackerStore } from '../store/trackerSlice';

export default function TodoList() {
  const { todos, toggleTodo, addTodo } = useTrackerStore();
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDate, setNewTodoDate] = useState('');

  const handleAdd = () => {
    if (!newTodoText.trim()) return;
    addTodo({ text: newTodoText, dueDate: newTodoDate || new Date().toISOString().split('T')[0] });
    setNewTodoText('');
    setNewTodoDate('');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">To-Do List</h2>
      <div className="bg-surface rounded-lg p-4">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="New task..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            className="flex-1 p-2 border border-border rounded-md"
          />
          <input
            type="date"
            value={newTodoDate}
            onChange={(e) => setNewTodoDate(e.target.value)}
            className="p-2 border border-border rounded-md"
          />
          <button
            onClick={handleAdd}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {todos.length === 0 && <p className="text-text-muted">No tasks yet. Add one above.</p>}
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center gap-3 p-2 border-b border-border">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-4 h-4"
              />
              <span className={`flex-1 ${todo.completed ? 'line-through text-text-muted' : ''}`}>
                {todo.text}
              </span>
              <span className="text-xs text-text-muted">Due: {todo.dueDate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
