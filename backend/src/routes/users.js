import { Router } from 'express'
import { requireAuth } from '../middleware.js'
import { searchUsers } from '../store.js'

const router = Router()

router.get('/search', requireAuth, (req, res) => {
  const q = (req.query.q || '').toString()
  if (q.length < 2) {
    return res.json({ users: [] })
  }
  const users = searchUsers(q, req.userId)
  res.json({ users })
})

export default router