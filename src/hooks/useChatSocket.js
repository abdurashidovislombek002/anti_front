import { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'
import { connectSocket, getSocket, SOCKET_EVENTS } from '../socket/socket'

export function useChatSocket() {
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (!token) return undefined

    const socket = connectSocket(token)

    const handleMessage = (message) => {
      useChatStore.getState().handleIncomingMessage(message)
    }

    const handleTyping = ({ chatId, username, isTyping }) => {
      useChatStore.getState().setTyping(chatId, username, isTyping)
    }

    socket.on(SOCKET_EVENTS.NEW_MESSAGE, handleMessage)
    socket.on(SOCKET_EVENTS.TYPING, handleTyping)

    return () => {
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleMessage)
      socket.off(SOCKET_EVENTS.TYPING, handleTyping)
    }
  }, [token])
}

export function getSocketForChat(chatId) {
  const socket = getSocket()
  if (socket) {
    socket.emit(SOCKET_EVENTS.JOIN_CHAT, chatId)
  }
}