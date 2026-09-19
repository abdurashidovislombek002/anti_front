import { Router } from 'express'
import multer from 'multer'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { requireAuth, isChatMember } from '../middleware.js'
import {
  findUserByUsername,
  findChatById,
  getUserChats,
  findDirectChat,
  createDirectChat,
  createGroupChat,
  addChatMember,
  getChatMessages,
  createMessage,
  genId,
} from '../store.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = join(__dirname, '..', '..', 'uploads')

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop() || 'bin'
    const safeBase = file.originalname.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')
    cb(null, `${Date.now()}-${genId().slice(0, 8)}-${safeBase}.${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
})

function fileToMessageData(req, extras = {}) {
  const text = (req.body?.text || req.body?.content || '').toString()
  if (!req.file) {
    return { text }
  }
  return {
    text,
    type: req.file?.mimetype || 'application/octet-stream',
    mediaUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
    fileName: req.file.originalname || req.file.filename,
    fileSize: req.file.size,
    mimeType: req.file?.mimetype || 'application/octet-stream',
    ...extras,
  }
}

const router = Router()
router.use(requireAuth)

/* ---------- Foydalanuvchi chatlari ---------- */
router.get('/', (req, res) => {
  const chats = getUserChats(req.userId)
  res.json({ chats })
})

/* ---------- 1:1 chat yaratish ---------- */
router.post('/', (req, res) => {
  const { username } = req.body || {}
  if (!username) {
    return res.status(400).json({ error: 'Username kiritilishi shart' })
  }

  const other = findUserByUsername(username)
  if (!other) {
    return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
  }
  if (other.id === req.userId) {
    return res.status(400).json({ error: 'O\'zingiz bilan chat yarata olmaysiz' })
  }

  const existing = findDirectChat(req.userId, other.id)
  if (existing) {
    return res.json({ chat: existing })
  }

  const chat = createDirectChat(req.userId, other)
  res.status(201).json({ chat })
})

/* ---------- Guruh chat yaratish ---------- */
router.post('/group', (req, res) => {
  const { name, members } = req.body || {}
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Guruh nomi kiritilishi shart' })
  }

  const memberUsernames = Array.isArray(members) ? members : []
  const uniqueUsernames = [...new Set(memberUsernames.map((m) => String(m).trim()))]
  if (uniqueUsernames.length === 0) {
    return res.status(400).json({ error: 'Kamida bitta a\'zo qo\'shing' })
  }

  const memberUsers = []
  for (const username of uniqueUsernames) {
    const user = findUserByUsername(username)
    if (!user) {
      return res.status(404).json({ error: `${username} foydalanuvchisi topilmadi` })
    }
    if (user.id !== req.userId && !memberUsers.some((m) => m.id === user.id)) {
      memberUsers.push(user)
    }
  }

  const chat = createGroupChat(req.userId, name, memberUsers)
  res.status(201).json({ chat })
})

/* ---------- Chatga a'zo qo'shish ---------- */
router.post('/:chatId/members', (req, res) => {
  const { chatId } = req.params
  const { username } = req.body || {}
  if (!username) {
    return res.status(400).json({ error: 'Username kiritilishi shart' })
  }

  const chat = findChatById(chatId)
  if (!chat) {
    return res.status(404).json({ error: 'Chat topilmadi' })
  }
  if (!isChatMember(chat, req.userId)) {
    return res.status(403).json({ error: 'Siz bu chatning a\'zosi emassiz' })
  }

  const user = findUserByUsername(username)
  if (!user) {
    return res.status(404).json({ error: 'Foydalanuvchi topilmadi' })
  }

  const updated = addChatMember(chatId, user)
  res.json({ chat: updated })
})

/* ---------- Chat xabarlari ---------- */
router.get('/:chatId/messages', (req, res) => {
  const chat = findChatById(req.params.chatId)
  if (!chat) {
    return res.status(404).json({ error: 'Chat topilmadi' })
  }
  if (!isChatMember(chat, req.userId)) {
    return res.status(403).json({ error: 'Siz bu chatning a\'zosi emassiz' })
  }
  const messages = getChatMessages(chat.id)
  res.json({ messages })
})

/* ---------- Xabar yuborish (matn yoki fayl) ---------- */
router.post('/:chatId/messages', upload.single('file'), (req, res) => {
  const chat = findChatById(req.params.chatId)
  if (!chat) {
    return res.status(404).json({ error: 'Chat topilmadi' })
  }
  if (!isChatMember(chat, req.userId)) {
    return res.status(403).json({ error: 'Siz bu chatning a\'zosi emassiz' })
  }

  const data = fileToMessageData(req)
  if (!data.text && !req.file) {
    return res.status(400).json({ error: 'Xabar matni kiritilishi shart' })
  }

  const message = createMessage({
    chatId: chat.id,
    senderId: req.userId,
    ...data,
  })

  const decorated = getChatMessages(chat.id).find((m) => m.id === message.id) || message

  const io = req.app.get('io')
  if (io) {
    io.to(`chat:${chat.id}`).emit('new_message', decorated)
  }

  res.status(201).json({ message: decorated })
})

export default router