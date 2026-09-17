import { create } from 'zustand'
import api from '../api/axios'
import { connectSocket, disconnectSocket } from '../socket/socket'

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { username, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      connectSocket(data.token)
      return data.user
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Kirishda xatolik yuz berdi'
      set({ error: msg, loading: false })
      throw new Error(msg)
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', payload)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      connectSocket(data.token)
      return data.user
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik'
      set({ error: msg, loading: false })
      throw new Error(msg)
    }
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me')
      localStorage.setItem('user', JSON.stringify(data))
      set({ user: data })
      return data
    } catch (err) {
      get().logout()
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    disconnectSocket()
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))