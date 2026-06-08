import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TodoItem } from '../types/global'

interface TodoStore {
  todos: TodoItem[]
  add: (todo: Omit<TodoItem, 'id' | 'done'>) => void
  toggle: (id: string) => void
  remove: (id: string) => void
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      add: (todo) => set(s => ({ todos: [...s.todos, { ...todo, id: crypto.randomUUID(), done: false }] })),
      toggle: (id) => set(s => ({ todos: s.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) })),
      remove: (id) => set(s => ({ todos: s.todos.filter(t => t.id !== id) })),
    }),
    { name: 'cp-todos' }
  )
)
