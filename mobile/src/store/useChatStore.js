import { create } from 'zustand'
import api from '../api/axios'

const normalizeChat = (chat) => ({
  ...chat,
  id: chat.id ?? chat._id,
  members: (chat.members || chat.users || chat.participants || []).map((m) =>
    typeof m === 'string' ? { id: m, username: m } : m,
  ),
  isGroup: chat.isGroup || chat.type === 'group' || chat.group || false,
  name: chat.name ?? '',
  lastMessage: chat.lastMessage || null,
})

const normalizeMessage = (message) => ({
  ...message,
  id: message.id ?? message._id,
  chatId: message.chatId ?? message.chat_id,
  sender: {
    id: message.sender?.id ?? message.senderId ?? message.sender_id,
    username: message.sender?.username ?? message.senderName,
  },
  text: message.text ?? message.content ?? '',
  type: message.type ?? message.message_type ?? 'text',
  mediaUrl: message.mediaUrl ?? message.image ?? message.fileUrl ?? null,
  fileName: message.fileName ?? message.filename ?? null,
  fileSize: message.fileSize ?? message.size ?? null,
  mimeType: message.mimeType ?? message.type ?? null,
})

let typingTimers = {}

export const useChatStore = create((set, get) => ({
  chats: [],
  messages: {},
  typingUsers: {},
  unreadCounts: {},
  onlineUsers: {},
  activeChatId: null,
  isLoadingChats: false,
  isLoadingMessages: false,
  isCreatingChat: false,
  searchResults: [],
  isSearchingUsers: false,
  error: null,

  fetchChats: async () => {
    set({ isLoadingChats: true, error: null })
    try {
      const { data } = await api.get('/chats')
      const chats = (data.chats || data || []).map(normalizeChat)
      set({ chats, isLoadingChats: false })
    } catch (error) {
      set({
        isLoadingChats: false,
        error: error.response?.data?.message || 'Chatlar yuklanmadi',
      })
    }
  },

  selectChat: (chatId) => {
    set({ activeChatId: chatId })
  },

  markChatRead: (chatId) => {
    set((state) => {
      if (!state.unreadCounts[chatId]) return state
      return {
        unreadCounts: { ...state.unreadCounts, [chatId]: 0 },
      }
    })
  },

  setOnline: (userId, isOnline) => {
    if (!userId) return
    set((state) => {
      if (state.onlineUsers[userId] === isOnline) return state
      return { onlineUsers: { ...state.onlineUsers, [userId]: isOnline } }
    })
  },

  fetchMessages: async (chatId) => {
    set({ isLoadingMessages: true, error: null })
    try {
      const { data } = await api.get(`/chats/${chatId}/messages`)
      const list = (data.messages || (Array.isArray(data) ? data : [])).map(
        normalizeMessage,
      )
      set((state) => ({
        messages: { ...state.messages, [chatId]: list },
        isLoadingMessages: false,
      }))
    } catch (error) {
      set({
        isLoadingMessages: false,
        error: error.response?.data?.message || 'Xabarlar yuklanmadi',
      })
    }
  },

  sendMessage: async (chatId, text) => {
    const trimmed = text.trim()
    if (!trimmed) return { ok: false }

    try {
      const { data } = await api.post(`/chats/${chatId}/messages`, { text: trimmed })
      const message = normalizeMessage(data.message || data)
      get().addMessage(chatId, message)
      return { ok: true }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Xabar yuborilmadi' })
      return { ok: false }
    }
  },

  sendMedia: async (chatId, payload) => {
    if (!payload && (payload?.uri == null || payload?.uri === undefined)) return { ok: false }

    try {
      const formData = new FormData()
      if (payload.text) formData.append('text', payload.text)
      if (payload.uri) {
        const fileName =
          payload.fileName ||
          payload.uri.split('/').pop() ||
          `file_${Date.now()}`
        const mimeType = payload.mimeType || 'image/jpeg'
        formData.append('file', {
          uri: payload.uri,
          name: fileName,
          type: mimeType,
        })
      }

      const { data } = await api.post(`/chats/${chatId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const message = normalizeMessage(data.message || data)
      get().addMessage(chatId, message)
      return { ok: true }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Fayl yuborilmadi' })
      return { ok: false }
    }
  },

  createChat: async ({ username }) => {
    set({ isCreatingChat: true, error: null })
    try {
      const { data } = await api.post('/chats', { username })
      const chat = normalizeChat(data.chat || data)
      const chatId = chat.id
      await get().fetchChats()
      set({ isCreatingChat: false })
      return { ok: true, chatId }
    } catch (error) {
      set({
        isCreatingChat: false,
        error: error.response?.data?.message || 'Chat yaratilmadi',
      })
      return { ok: false }
    }
  },

  createGroupChat: async ({ name, members }) => {
    set({ isCreatingChat: true, error: null })
    try {
      const { data } = await api.post('/chats/group', { name, members })
      const chat = normalizeChat(data.chat || data)
      await get().fetchChats()
      set({ isCreatingChat: false })
      return { ok: true, chatId: chat.id }
    } catch (error) {
      set({
        isCreatingChat: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Guruh yaratilmadi. Server guruhlarni qo'llab-quvvatlamaydi",
      })
      return { ok: false }
    }
  },

  searchUsers: async (query) => {
    const trimmed = query.trim()
    if (!trimmed) {
      set({ searchResults: [] })
      return
    }
    set({ isSearchingUsers: true })
    try {
      const { data } = await api.get(`/users/search?q=${encodeURIComponent(trimmed)}`)
      const users = data.users || data || []
      set({ searchResults: users, isSearchingUsers: false })
    } catch {
      set({ searchResults: [], isSearchingUsers: false })
    }
  },

  clearSearch: () => {
    set({ searchResults: [], isSearchingUsers: false })
  },

  goodbye: (chatId) => {
    set((state) => ({
      messages: Object.fromEntries(
        Object.entries(state.messages).filter(([key]) => key !== chatId),
      ),
    }))
  },

  addMessage: (chatId, message) => {
    const normalized = normalizeMessage(message)
    const chatKey = normalized.chatId || chatId

    set((state) => {
      const list = state.messages[chatKey] || []
      if (list.some((m) => m.id && m.id === normalized.id)) return state

      return {
        messages: { ...state.messages, [chatKey]: [...list, normalized] },
        chats: state.chats.map((chat) =>
          chat.id === chatKey ? { ...chat, lastMessage: normalized } : chat,
        ),
      }
    })
  },

  handleIncomingMessage: (message, currentUserId) => {
    const chatId = message.chatId || message.chat_id
    if (!chatId) return

    get().addMessage(chatId, message)

    const isOwn = message.sender?.id === currentUserId
    if (isOwn) return
    const activeId = get().activeChatId
    if (activeId !== chatId) {
      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [chatId]: (state.unreadCounts[chatId] || 0) + 1,
        },
      }))
    }
  },

  setTyping: (chatId, username, isTyping) => {
    if (!chatId || !username) return

    if (!isTyping) {
      set((state) => {
        const current = state.typingUsers[chatId] || []
        const next = current.filter((u) => u !== username)
        return {
          typingUsers: {
            ...state.typingUsers,
            ...(next.length === 0 ? { [chatId]: [] } : { [chatId]: next }),
          },
        }
      })
      return
    }

    set((state) => {
      const current = state.typingUsers[chatId] || []
      if (current.includes(username)) return state
      return {
        typingUsers: { ...state.typingUsers, [chatId]: [...current, username] },
      }
    })

    if (typingTimers[`${chatId}-${username}`]) {
      clearTimeout(typingTimers[`${chatId}-${username}`])
    }
    typingTimers[`${chatId}-${username}`] = setTimeout(() => {
      get().setTyping(chatId, username, false)
      delete typingTimers[`${chatId}-${username}`]
    }, 4000)
  },

  reset: () => {
    typingTimers = {}
    set({
      chats: [],
      messages: {},
      typingUsers: {},
      unreadCounts: {},
      onlineUsers: {},
      activeChatId: null,
      isLoadingChats: false,
      isLoadingMessages: false,
      isCreatingChat: false,
      searchResults: [],
      isSearchingUsers: false,
      error: null,
    })
  },
}))