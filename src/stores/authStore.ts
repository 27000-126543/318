import { create } from 'zustand'

interface User {
  id: string
  name: string
  phone: string
  idCard?: string
  avatar?: string
  realNameVerified: boolean
}

interface StoredUser {
  phone: string
  password: string
  name: string
  realNameVerified: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  error: string | null
  login: (phone: string, password: string) => Promise<void>
  logout: () => void
  register: (phone: string, password: string, name: string) => Promise<void>
  setRealNameVerified: (verified: boolean) => void
  clearError: () => void
}

function getUsers(): Record<string, StoredUser> {
  try {
    const data = localStorage.getItem('gov_users')
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

function saveUsers(users: Record<string, StoredUser>) {
  localStorage.setItem('gov_users', JSON.stringify(users))
}

function loadSession(): { user: User | null; token: string | null } {
  try {
    const data = localStorage.getItem('gov_session')
    if (data) {
      const session = JSON.parse(data)
      const users = getUsers()
      const stored = users[session.phone]
      if (stored) {
        return {
          user: {
            id: session.phone,
            name: stored.name,
            phone: stored.phone,
            realNameVerified: stored.realNameVerified,
          },
          token: session.token,
        }
      }
    }
  } catch { /* ignore */ }
  return { user: null, token: null }
}

function saveSession(phone: string, token: string) {
  localStorage.setItem('gov_session', JSON.stringify({ phone, token }))
}

function clearSession() {
  localStorage.removeItem('gov_session')
}

export { type User }
export { getUsers }

export const useAuthStore = create<AuthState>((set) => {
  const session = loadSession()
  return {
    user: session.user,
    token: session.token,
    isAuthenticated: !!session.user,
    error: null,

    login: async (phone: string, password: string) => {
      const users = getUsers()
      const stored = users[phone]

      if (!stored) {
        set({ error: '该手机号未注册，请先注册账号', user: null, token: null, isAuthenticated: false })
        throw new Error('该手机号未注册')
      }

      if (stored.password !== password) {
        set({ error: '密码错误，请重新输入', user: null, token: null, isAuthenticated: false })
        throw new Error('密码错误')
      }

      const token = `token-${Date.now()}`
      const user: User = {
        id: phone,
        name: stored.name,
        phone: stored.phone,
        realNameVerified: stored.realNameVerified,
      }

      saveSession(phone, token)
      set({ user, token, isAuthenticated: true, error: null })
    },

    logout: () => {
      clearSession()
      set({ user: null, token: null, isAuthenticated: false, error: null })
    },

    register: async (phone: string, password: string, name: string) => {
      const users = getUsers()

      if (users[phone]) {
        set({ error: '该手机号已注册' })
        throw new Error('该手机号已注册')
      }

      users[phone] = { phone, password, name, realNameVerified: false }
      saveUsers(users)

      const token = `token-${Date.now()}`
      const user: User = {
        id: phone,
        name,
        phone,
        realNameVerified: false,
      }

      saveSession(phone, token)
      set({ user, token, isAuthenticated: true, error: null })
    },

    setRealNameVerified: (verified: boolean) => {
      set((state) => {
        const updatedUser = state.user ? { ...state.user, realNameVerified: verified } : null
        if (updatedUser) {
          const users = getUsers()
          if (users[updatedUser.phone]) {
            users[updatedUser.phone].realNameVerified = verified
            saveUsers(users)
          }
        }
        return { user: updatedUser }
      })
    },

    clearError: () => set({ error: null }),
  }
})
