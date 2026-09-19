import jwt from 'jsonwebtoken'
import { JWT_SECRET } from './routes/auth.js'
import { findUserById } from './store.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = findUserById(payload.id)
    if (!user) {
      return res.status(401).json({ error: 'Foydalanuvchi topilmadi' })
    }
    req.user = user
    req.userId = user.id
    next()
  } catch {
    return res.status(401).json({ error: 'Token yaroqsiz yoki muddati o\'tgan' })
  }
}

/* Socket io autentifikatsiyasi uchun: token -> user id */
export function verifySocketToken(token) {
  if (!token) return null
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    return findUserById(payload.id) || null
  } catch {
    return null
  }
}

export function isChatMember(chat, userId) {
  return chat?.members?.some((m) => m.id === userId)
}