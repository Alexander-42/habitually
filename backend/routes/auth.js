import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import db, { save } from '../store.js'
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
} from '../auth.js'

const router = Router()

const publicUser = (u) => ({ id: u.id, username: u.username })

router.post('/register', (req, res) => {
  const username = (req.body?.username || '').trim()
  const password = req.body?.password || ''
  if (username.length < 3 || password.length < 4) {
    return res.status(400).json({
      error: 'Username must be 3+ chars and password 4+ chars',
    })
  }
  const exists = db.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  )
  if (exists) return res.status(409).json({ error: 'Username already taken' })

  const user = { id: randomUUID(), username, passwordHash: hashPassword(password) }
  db.users.push(user)
  save()
  res.status(201).json({ token: signToken(user), user: publicUser(user) })
})

router.post('/login', (req, res) => {
  const username = (req.body?.username || '').trim()
  const password = req.body?.password || ''
  const user = db.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  )
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }
  res.json({ token: signToken(user), user: publicUser(user) })
})

router.get('/me', requireAuth, (req, res) => {
  const user = db.users.find((u) => u.id === req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: publicUser(user) })
})

export default router
