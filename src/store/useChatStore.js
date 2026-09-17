import { create } from 'zustand'
import api from '../api/axios'

const normalizeChat = (chat) => ({
  ...chat,
  id: chat.id ?? chat._id,
  members: chat.members || chat.users || chat.participants || [],
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
})

let typingTimers = {}

const initialTypingUsers = {}

export const useChatStore = create((set, get) => ({
  chats: [],
  messages: {},
  typingUsers: initialTypingUsers,
  activeChatId: null,
  isLoadingChats: false,
  isLoadingMessages: false,
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
      const { data } = await api.post(`/chats/${chatId}/messages`, { content: trimmed })
      const message = normalizeMessage(data.message || data)
      get().addMessage(chatId, message)
      return { ok: true }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Xabar yuborilmadi' })
      return { ok: false }
    }
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

  handleIncomingMessage: (message) => {
    const chatId = message.chatId || message.chat_id
    if (!chatId) return
    get().addMessage(chatId, message)
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
      activeChatId: null,
      isLoadingChats: false,
      isLoadingMessages: false,
      error: null,
    })
  },
}))