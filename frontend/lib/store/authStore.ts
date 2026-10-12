import { create } from 'zustand'
import type { User } from '../api/types'

interface AuthState {
  user: User | null
  /** Kept in memory only. The httpOnly refresh cookie restores the session after a reload. */
  accessToken: string | null
  /** True once the first session-restore attempt has finished (success or not). */
  initialized: boolean
  setAuth: (user: User, accessToken: string) => void
  setUser: (user: User) => void
  clear: () => void
  setInitialized: () => void
}

const SESSION_HINT = 'df_session'

/** A non-secret hint that this browser had a session, so signed-out visitors skip the refresh request. */
export const sessionHint = {
  get: () => {
    try {
      return localStorage.getItem(SESSION_HINT) === '1'
    } catch {
      return true // storage unavailable: fall back to always trying
    }
  },
  set: (on: boolean) => {
    try {
      if (on) localStorage.setItem(SESSION_HINT, '1')
      else localStorage.removeItem(SESSION_HINT)
    } catch {
      /* ignore */
    }
  },
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  initialized: false,
  setAuth: (user, accessToken) => {
    sessionHint.set(true)
    set({ user, accessToken })
  },
  setUser: (user) => set({ user }),
  clear: () => {
    sessionHint.set(false)
    set({ user: null, accessToken: null })
  },
  setInitialized: () => set({ initialized: true }),
}))
