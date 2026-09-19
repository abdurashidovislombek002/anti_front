import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  findUserByUsername,
  findUserByPhone,
  createUser,
  updateUser,
  getPublicUser,
} from '../store.js'
import { requireAuth } from '../middleware.js'

const JWT_SECRET = process.env.JWT_SECRET || 'antigram-dev-secret'

function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '30d',
  })
}

const router = Router()

/* ---------- Register ---------- */
router.post('/register', async (req, res) => {
  try {
    const { username, phone, password } = req.body || {}

    if (!username || !password) {
      return res.status(400).json({ error: 'Username va parol kiritilishi shart' })
    }

    if (String(username).trim().length < 3) {
      return res.status(400).json({ error: 'Username kamida 3 ta belgidan iborat bo\'lishi kerak' })
    }

    if (String(password).length < 4) {
      return res.status(400).json({ error: 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak' })
    }

    if (findUserByUsername(username)) {
      return res.status(409).json({ error: 'Bu username band, boshqa tanlang' })
    }

    if (phone && findUserByPhone(phone)) {
      return res.status(409).json({ error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' })
    }

    const passwordHash = await bcrypt.hash(String(password), 10)
    const user = createUser({ username, phone, passwordHash })
    const token = signToken(user)

    res.status(201).json({ token, user: getPublicUser(user) })
  } catch (error) {
    console.error('register:', error)
    res.status(500).json({ error: 'Serverda xatolik yuz berdi' })
  }
})

/* ---------- Login (username yoki telefon) ---------- */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    if (!username || !password) {
      return res.status(400).json({ error: 'Ma\'lumotlarni kiriting' })
    }

    const user = findUserByUsername(username) || findUserByPhone(username)
    if (!user) {
      return res.status(401).json({ error: 'Bunday foydalanuvchi topilmadi' })
    }

    const match = await bcrypt.compare(String(password), user.passwordHash)
    if (!match) {
      return res.status(401).json({ error: 'Parol noto\'g\'ri' })
    }

    const token = signToken(user)
    res.json({ token, user: getPublicUser(user) })
  } catch (error) {
    console.error('login:', error)
    res.status(500).json({ error: 'Serverda xatolik yuz berdi' })
  }
})

/* ---------- Joriy foydalanuvchi ---------- */
router.get('/me', requireAuth, (req, res) => {
  res.json(getPublicUser(req.user))
})

/* ---------- Profilni yangilash ---------- */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { username, phone } = req.body || {}

    if (username !== undefined) {
      const trimmed = String(username).trim()
      if (trimmed.length < 3) {
        return res.status(400).json({ error: 'Username kamida 3 ta belgidan iborat bo\'lishi kerak' })
      }
      const existing = findUserByUsername(trimmed)
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({ error: 'Bu username band' })
      }
    }

    if (phone !== undefined) {
      const trimmed = String(phone || '').trim()
      const existing = trimmed ? findUserByPhone(trimmed) : null
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({ error: 'Bu telefon raqam band' })
      }
    }

    const updated = updateUser(req.user.id, { username, phone })
    res.json({ user: getPublicUser(updated) })
  } catch (error) {
    console.error('update profile:', error)
    res.status(500).json({ error: 'Profil yangilanmadi' })
  }
})

/* ---------- Avatar yuklash ---------- */
router.post('/avatar', requireAuth, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Rasm tanlanmadi' })
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    const updated = updateUser(req.user.id, { avatar: url })
    res.json({ user: getPublicUser(updated) })
  } catch (error) {
    console.error('avatar:', error)
    res.status(500).json({ error: 'Avatar yuklanmadi' })
  }
})

export { JWT_SECRET, signToken }
export default router