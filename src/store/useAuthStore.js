import { create } from 'zustand'
import api from '../api/axios'
import { connectSocket, disconnectSocket } from '../socket/socket'
import { useChatStore } from './useChatStore'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (identifier, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', {
        username: identifier,
        password,
      })
      const token = data.token || data.accessToken
      const user = data.user || data

      if (!token) {
        throw new Error('Server token qaytarmadi')
      }

      localStorage.setItem('token', token)
      connectSocket(token)
      set({ user, token, isLoading: false, error: null })
      return { ok: true }
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Kirish amalga oshmadi',
      })
      return { ok: false }
    }
  },

  register: async ({ username, phone, password }) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', {
        username,
        phone,
        password,
      })
      const token = data.token || data.accessToken
      const user = data.user || data

      if (!token) {
        throw new Error('Server token qaytarmadi')
      }

      localStorage.setItem('token', token)
      connectSocket(token)
      set({ user, token, isLoading: false, error: null })
      return { ok: true }
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Ro\'yxatdan o\'tish amalga oshmadi',
      })
      return { ok: false }
    }
  },

  fetchMe: async () => {
    const { token } = get()
    if (!token) return

    try {
      const { data } = await api.get('/auth/me')
      const user = data.user || data
      set({ user })
      connectSocket(token)
    } catch {
      get().logout()
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    disconnectSocket()
    useChatStore.getState().reset()
    set({ user: null, token: null, error: null, isLoading: false })
  },
}))