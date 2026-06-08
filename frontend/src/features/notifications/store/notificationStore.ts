import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppNotification {
  id: string
  type: 'wishlist' | 'kanban' | 'skill_gap' | 'roadmap' | 'ats' | 'culture' | 'info'
  title: string
  message: string
  timestamp: number
  read: boolean
}

interface NotificationStore {
  notifications: AppNotification[]
  unread: number
  add: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unread: 0,
      add: (n) => {
        const notif: AppNotification = {
          ...n,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          read: false,
        }
        set(s => ({ notifications: [notif, ...s.notifications].slice(0, 50), unread: s.unread + 1 }))
      },
      markRead: (id) => {
        set(s => ({
          notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
          unread: Math.max(0, s.unread - 1),
        }))
      },
      markAllRead: () => set(s => ({
        notifications: s.notifications.map(n => ({ ...n, read: true })),
        unread: 0,
      })),
    }),
    { name: 'cp-notifications' }
  )
)
