import { create } from 'zustand'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

interface AppState {
  notifications: Notification[]
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  unreadCount: () => number
}

export const useAppStore = create<AppState>((set, get) => ({
  notifications: [],
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Date.now().toString(),
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),
  markNotificationRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}))
