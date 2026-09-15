import { io } from 'socket.io-client'

export const SOCKET_EVENTS = {
  JOIN_CHAT: 'join_chat',
  SEND_MESSAGE: 'send_message',
  TYPING: 'typing',
  NEW_MESSAGE: 'new_message',
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

export function connectSocket(token) {
  if (socket) {
    if (socket.connected) {
      return socket
    }
    socket.connect()
    return socket
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    console.log('Socket.io ulandi')
  })

  socket.on('disconnect', (reason) => {
    console.log('Socket.io uzildi:', reason)
  })

  socket.on('connect_error', (err) => {
    console.warn('Socket.io ulanish xatosi:', err.message)
  })

  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}

export default socket