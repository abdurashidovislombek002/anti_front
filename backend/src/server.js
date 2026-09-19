import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import authRoutes from './routes/auth.js'
import chatRoutes from './routes/chats.js'
import userRoutes from './routes/users.js'
import { setupSocket } from './socket.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 5000
const UPLOAD_DIR = join(__dirname, '..', 'uploads')

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true })
}

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const origins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: origins.length ? origins : '*',
    credentials: true,
  }),
)

/* Yuklangan media fayllar */
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }))

/* Salomatlik tekshiruvi */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

/* API marshrutlari */
app.use('/api/auth', authRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/users', userRoutes)

/* 404 */
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint topilmadi' })
})

/* Xatolik ushlagich */
app.use((err, _req, res, _next) => {
  console.error('Server xatosi:', err)
  res.status(500).json({ error: 'Serverda xatolik yuz berdi' })
})

const httpServer = createServer(app)

/* Socket.io o'rnatish */
const io = setupSocket(httpServer, { corsOrigins: origins })
app.set('io', io)

httpServer.listen(PORT, () => {
  console.log(`Antigram backend http://localhost:${PORT} da ishlamoqda`)
  console.log(`API:   http://localhost:${PORT}/api`)
  console.log(`Socket: ws://localhost:${PORT}`)
})

export default app