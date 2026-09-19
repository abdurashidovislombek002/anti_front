import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const DATA_FILE = join(DATA_DIR, 'db.json')

const defaultData = {
  users: [],
  chats: [],
  messages: [],
}

let db = load()

function load() {
  try {
    if (existsSync(DATA_FILE)) {
      return JSON.parse(readFileSync(DATA_FILE, 'utf8'))
    }
  } catch {
    console.warn('Ma\'lumotlar bazasi o\'qilmadi, yangi yaratiladi')
  }
  return structuredClone(defaultData)
}

function persist() {
  try {
    mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(
      DATA_FILE,
      JSON.stringify({ users: db.users, chats: db.chats, messages: db.messages }, null, 2),
    )
  } catch (error) {
    console.error('Bazaga yozilmadi:', error.message)
  }
}

export function genId() {
  return randomUUID()
}

export function now() {
  return new Date().toISOString()
}

/* ---------- Foydalanuvchilar ---------- */

export function findUserByUsername(username) {
  return db.users.find(
    (u) => u.username?.toLowerCase() === String(username || '').toLowerCase(),
  )
}

export function findUserByPhone(phone) {
  return db.users.find((u) => u.phone === String(phone).trim())
}

export function findUserByEmail(email) {
  return db.users.find(
    (u) => u.email?.toLowerCase() === String(email || '').toLowerCase(),
  )
}

export function findUserById(id) {
  return db.users.find((u) => u.id === id)
}

export function getPublicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    username: user.username,
    phone: user.phone,
    email: user.email || null,
    avatar: user.avatar || null,
    createdAt: user.createdAt,
  }
}

export function createUser({ username, phone, passwordHash }) {
  const user = {
    id: genId(),
    username: String(username).trim(),
    phone: String(phone || '').trim(),
    email: null,
    avatar: null,
    passwordHash,
    createdAt: now(),
  }
  db.users.push(user)
  persist()
  return user
}

export function updateUser(id, updates) {
  const user = findUserById(id)
  if (!user) return null
  if (updates.username !== undefined) user.username = String(updates.username).trim()
  if (updates.phone !== undefined) user.phone = String(updates.phone).trim()
  if (updates.avatar !== undefined) user.avatar = updates.avatar
  persist()
  return user
}

export function searchUsers(query, excludeUserId) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []
  return db.users
    .filter((u) => u.id !== excludeUserId)
    .filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    )
    .slice(0, 20)
    .map(getPublicUser)
}

/* ---------- Chatlar ---------- */

export function findChatById(id) {
  return db.chats.find((c) => c.id === id)
}

export function getUserChats(userId) {
  return db.chats
    .filter((c) => c.members.some((m) => m.id === userId))
    .map((c) => decorateChat(c, userId))
    .sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt || b.createdAt) -
        new Date(a.lastMessage?.createdAt || a.createdAt),
    )
}

export function findDirectChat(userId, otherUserId) {
  return db.chats.find(
    (c) =>
      !c.isGroup &&
      c.members.length === 2 &&
      c.members.some((m) => m.id === userId) &&
      c.members.some((m) => m.id === otherUserId),
  )
}

export function createDirectChat(userId, otherUser) {
  const chat = {
    id: genId(),
    isGroup: false,
    name: null,
    members: [
      { id: userId, username: findUserById(userId)?.username },
      { id: otherUser.id, username: otherUser.username },
    ],
    createdBy: userId,
    lastMessage: null,
    createdAt: now(),
  }
  db.chats.push(chat)
  persist()
  return chat
}

export function createGroupChat(userId, name, memberUsers) {
  const chat = {
    id: genId(),
    isGroup: true,
    name: String(name).trim(),
    members: [
      { id: userId, username: findUserById(userId)?.username },
      ...memberUsers.map((u) => ({ id: u.id, username: u.username })),
    ],
    createdBy: userId,
    lastMessage: null,
    createdAt: now(),
  }
  db.chats.push(chat)
  persist()
  return chat
}

export function addChatMember(chatId, user) {
  const chat = findChatById(chatId)
  if (!chat) return null
  if (chat.members.some((m) => m.id === user.id)) return chat
  chat.members.push({ id: user.id, username: user.username })
  chat.isGroup = true
  persist()
  return chat
}

function decorateChat(chat, currentUserId) {
  const messages = db.messages.filter((m) => m.chatId === chat.id)
  const lastMessage = messages.length
    ? decorateMessage(messages[messages.length - 1])
    : chat.lastMessage
  return {
    id: chat.id,
    isGroup: chat.isGroup,
    name: chat.name,
    members: chat.members,
    createdBy: chat.createdBy,
    lastMessage,
    createdAt: chat.createdAt,
  }
}

/* ---------- Xabarlar ---------- */

export function getChatMessages(chatId) {
  return db.messages
    .filter((m) => m.chatId === chatId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(decorateMessage)
}

export function createMessage({ chatId, senderId, text, type, mediaUrl, fileName, fileSize, mimeType }) {
  const message = {
    id: genId(),
    chatId,
    senderId,
    text: text || '',
    type: type || 'text',
    mediaUrl: mediaUrl || null,
    fileName: fileName || null,
    fileSize: fileSize || null,
    mimeType: mimeType || null,
    createdAt: now(),
  }
  db.messages.push(message)
  const chat = findChatById(chatId)
  if (chat) {
    chat.lastMessage = {
      id: message.id,
      sender: { id: senderId, username: findUserById(senderId)?.username },
      text: message.text,
      type: message.type,
      createdAt: message.createdAt,
    }
  }
  persist()
  return message
}

function decorateMessage(message) {
  const sender = findUserById(message.senderId)
  return {
    id: message.id,
    chatId: message.chatId,
    sender: {
      id: message.senderId,
      username: sender?.username || 'Noma\'lum',
    },
    text: message.text,
    type: message.type,
    mediaUrl: message.mediaUrl,
    fileName: message.fileName,
    fileSize: message.fileSize,
    mimeType: message.mimeType,
    createdAt: message.createdAt,
  }
}

/* ---------- Xizmat (id bilan ko'rinish) ---------- */

export function allData() {
  return db
}

export function resetDb() {
  db = structuredClone(defaultData)
  persist()
}