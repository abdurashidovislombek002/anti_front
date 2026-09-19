import { Server } from 'socket.io'
import { verifySocketToken } from './middleware.js'
import { createMessage, getChatMessages } from './store.js'

const onlineUsers = new Map() // userId -> Set(socketId)

export function setupSocket(httpServer, options = {}) {
  const io = new Server(httpServer, {
    cors: { origin: options.corsOrigins || '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  })

  io.use((socket, next) => {
    const user = verifySocketToken(socket.handshake.auth?.token)
    if (!user) {
      return next(new Error('Token yaroqsiz'))
    }
    socket.data.user = user
    next()
  })

  io.on('connection', (socket) => {
    const user = socket.data.user
    const userId = user.id

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set())
    }
    onlineUsers.get(userId).add(socket.id)

    io.emit('online', userId)

    /* Chat xonasiga qo'shilish (join_chat) */
    socket.on('join_chat', (chatId) => {
      if (chatId) {
        socket.join(`chat:${chatId}`)
      }
    })

    /* Yodlab xabar (send_message) */
    socket.on('send_message', (payload = {}) => {
      const chatId = payload.chatId || payload.chat_id
      const text = payload.text || payload.content || ''
      if (!chatId) return

      const message = createMessage({
        chatId,
        senderId: userId,
        text,
        type: 'text',
      })
      const decorated = getChatMessages(chatId).find((m) => m.id === message.id)
      io.to(`chat:${chatId}`).emit('new_message', decorated || message)
    })

    /* Yazuv holati (typing) */
    socket.on('typing', ({ chatId, username, isTyping } = {}) => {
      if (!chatId) return
      const room = `chat:${chatId}`
      socket.to(room).emit('typing', {
        chatId,
        username: username || user.username,
        isTyping: Boolean(isTyping),
      })
    })

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId)
      if (sockets) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          onlineUsers.delete(userId)
          io.emit('offline', userId)
        }
      }
    })
  })

  return io
}