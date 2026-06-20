import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import {
  getHabits,
  getHabit,
  createHabit,
  deleteHabit,
  setCompletions,
} from '../store.js'
import { requireAuth } from '../auth.js'
import { asyncHandler } from '../async-handler.js'

const router = Router()

router.use(requireAuth)

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await getHabits(req.userId))
  })
)

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const name = (req.body?.name || '').trim()
    if (!name) return res.status(400).json({ error: 'Habit name is required' })
    const habit = {
      id: randomUUID(),
      userId: req.userId,
      name,
      createdAt: new Date().toISOString(),
      completions: {},
    }
    res.status(201).json(await createHabit(habit))
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const removed = await deleteHabit(req.params.id, req.userId)
    if (!removed) return res.status(404).json({ error: 'Habit not found' })
    res.status(204).end()
  })
)

router.post(
  '/:id/toggle',
  asyncHandler(async (req, res) => {
    const date = req.body?.date
    if (!DATE_RE.test(date || '')) {
      return res.status(400).json({ error: 'Valid date (YYYY-MM-DD) required' })
    }
    const habit = await getHabit(req.params.id, req.userId)
    if (!habit) return res.status(404).json({ error: 'Habit not found' })

    const completions = { ...habit.completions }
    if (completions[date]) {
      delete completions[date]
    } else {
      completions[date] = true
    }
    res.json(await setCompletions(req.params.id, req.userId, completions))
  })
)

export default router