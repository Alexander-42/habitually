import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { getUserByUsername, getUserById, createUser } from '../store.js'
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
} from '../auth.js'
import { asyncHandler } from '../async-handler.js'

const router = Router()

const publicUser = (u) => ({ id: u.id, username: u.username })

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const username = (req.body?.username || '').trim()
    const password = req.body?.password || ''
    if (username.length < 3 || password.length < 4) {
      return res.status(400).json({
        error: 'Username must be 3+ chars and password 4+ chars',
      })
    }
    if (await getUserByUsername(username)) {
      return res.status(409).json({ error: 'Username already taken' })
    }

    const user = {
      id: randomUUID(),
      username,
      passwordHash: hashPassword(password),
    }
    await createUser(user)
    res.status(201).json({ token: signToken(user), user: publicUser(user) })
  })
)

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const username = (req.body?.username || '').trim()
    const password = req.body?.password || ''
    const user = await getUserByUsername(username)
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }
    res.json({ token: signToken(user), user: publicUser(user) })
  })
)

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: publicUser(user) })
  })
)

export default router