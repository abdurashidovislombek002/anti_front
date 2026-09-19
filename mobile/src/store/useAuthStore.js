import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../api/axios'
import { connectSocket, disconnectSocket } from '../socket/socket'
import { useChatStore } from './useChatStore'

const normalizeUser = (user) => ({
  ...user,
  id: user.id ?? user._id,
  username: user.username ?? user.name ?? '',
  phone: user.phone ?? '',
})

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isHydrating: true,
  isLoading: false,
  isUpdatingProfile: false,
  error: null,
  success: null,

  hydrate: async () => {
    const token = await AsyncStorage.getItem('token')
    if (!token) {
      set({ isHydrating: false })
      return
    }

    set({ token })
    connectSocket(token)

    try {
      const { data } = await api.get('/auth/me')
      set({ user: normalizeUser(data.user || data), isHydrating: false })
    } catch {
      await AsyncStorage.removeItem('token')
      disconnectSocket()
      set({ token: null, user: null, isHydrating: false })
    }
  },

  login: async (identifier, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { username: identifier, password })
      const token = data.token || data.accessToken
      const user = data.user || data

      if (!token) throw new Error('Server token qaytarmadi')

      await AsyncStorage.setItem('token', token)
      connectSocket(token)
      set({ user: normalizeUser(user), token, isLoading: false, error: null })
      return { ok: true }
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Kirish amalga oshmadi',
      })
      return { ok: false }
    }
  },

  register: async ({ username, phone, password }) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', { username, phone, password })
      const token = data.token || data.accessToken
      const user = data.user || data

      if (!token) throw new Error('Server token qaytarmadi')

      await AsyncStorage.setItem('token', token)
      connectSocket(token)
      set({ user: normalizeUser(user), token, isLoading: false, error: null })
      return { ok: true }
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Ro'yxatdan o'tish amalga oshmadi",
      })
      return { ok: false }
    }
  },

  updateProfile: async (updates) => {
    set({ isUpdatingProfile: true, error: null, success: null })
    try {
      const { data } = await api.put('/auth/profile', updates)
      const updated = data.user || data
      set({ user: normalizeUser(updated), isUpdatingProfile: false, success: 'Profil yangilandi' })
      return { ok: true }
    } catch (error) {
      set({
        isUpdatingProfile: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Profil yangilanmadi",
      })
      return { ok: false }
    }
  },

  updateAvatar: async (formData) => {
    set({ isUpdatingProfile: true, error: null, success: null })
    try {
      const { data } = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const updated = data.user || data
      set({ user: normalizeUser(updated), isUpdatingProfile: false, success: 'Rasm yangilandi' })
      return { ok: true }
    } catch (error) {
      set({
        isUpdatingProfile: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Rasm yuklanmadi",
      })
      return { ok: false }
    }
  },

  clearMessages: () => {
    set({ error: null, success: null })
  },

  logout: async () => {
    await AsyncStorage.removeItem('token')
    disconnectSocket()
    useChatStore.getState().reset()
    set({ user: null, token: null, error: null, success: null, isLoading: false, isUpdatingProfile: false })
  },
}))