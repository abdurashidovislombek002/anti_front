import { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'
import { connectSocket, getSocket, SOCKET_EVENTS } from '../socket/socket'

export function useChatSocket() {
  const token = useAuthStore((state) => state.token)
  const currentUserId = useAuthStore((state) => state.user?.id)

  useEffect(() => {
    if (!token) return undefined

    const socket = connectSocket(token)

    const handleMessage = (message) => {
      useChatStore.getState().handleIncomingMessage(message, currentUserId)
    }

    const handleTyping = ({ chatId, username, isTyping }) => {
      useChatStore.getState().setTyping(chatId, username, isTyping)
    }

    const handleOnline = (userId) => {
      useChatStore.getState().setOnline(userId, true)
    }

    const handleOffline = (userId) => {
      useChatStore.getState().setOnline(userId, false)
    }

    socket.on(SOCKET_EVENTS.NEW_MESSAGE, handleMessage)
    socket.on(SOCKET_EVENTS.TYPING, handleTyping)
    socket.on(SOCKET_EVENTS.ONLINE, handleOnline)
    socket.on(SOCKET_EVENTS.OFFLINE, handleOffline)

    return () => {
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleMessage)
      socket.off(SOCKET_EVENTS.TYPING, handleTyping)
      socket.off(SOCKET_EVENTS.ONLINE, handleOnline)
      socket.off(SOCKET_EVENTS.OFFLINE, handleOffline)
    }
  }, [token, currentUserId])
}

export function emitJoinChat(chatId) {
  const socket = getSocket()
  if (socket) {
    socket.emit(SOCKET_EVENTS.JOIN_CHAT, chatId)
  }
}