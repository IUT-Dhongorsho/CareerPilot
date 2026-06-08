import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { KanbanCard, KanbanStatus } from '../types/global'

interface KanbanStore {
  cards: KanbanCard[]
  addCard: (card: Omit<KanbanCard, 'id' | 'addedAt'>) => KanbanCard
  moveCard: (id: string, status: KanbanStatus) => void
  removeCard: (id: string) => void
  updateCard: (id: string, data: Partial<KanbanCard>) => void
}

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set) => ({
      cards: [],
      addCard: (card) => {
        const newCard: KanbanCard = { ...card, id: crypto.randomUUID(), addedAt: Date.now() }
        set(s => ({ cards: [...s.cards, newCard] }))
        return newCard
      },
      moveCard: (id, status) => set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, status } : c) })),
      removeCard: (id) => set(s => ({ cards: s.cards.filter(c => c.id !== id) })),
      updateCard: (id, data) => set(s => ({ cards: s.cards.map(c => c.id === id ? { ...c, ...data } : c) })),
    }),
    { name: 'cp-kanban' }
  )
)
