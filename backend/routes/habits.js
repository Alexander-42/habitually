import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import db, { save } from '../store.js'
import { requireAuth } from '../auth.js'

const router = Router()

router.use(requireAuth)

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

router.get('/', (req, res) => {
  res.json(db.habits.filter((h) => h.userId === req.userId))
})

router.post('/', (req, res) => {
  const name = (req.body?.name || '').trim()
  if (!name) return res.status(400).json({ error: 'Habit name is required' })
  const habit = {
    id: randomUUID(),
    userId: req.userId,
    name,
    createdAt: new Date().toISOString(),
    completions: {},
  }
  db.habits.push(habit)
  save()
  res.status(201).json(habit)
})

router.delete('/:id', (req, res) => {
  const idx = db.habits.findIndex(
    (h) => h.id === req.params.id && h.userId === req.userId
  )
  if (idx === -1) return res.status(404).json({ error: 'Habit not found' })
  db.habits.splice(idx, 1)
  save()
  res.status(204).end()
})

router.post('/:id/toggle', (req, res) => {
  const date = req.body?.date
  if (!DATE_RE.test(date || '')) {
    return res.status(400).json({ error: 'Valid date (YYYY-MM-DD) required' })
  }
  const habit = db.habits.find(
    (h) => h.id === req.params.id && h.userId === req.userId
  )
  if (!habit) return res.status(404).json({ error: 'Habit not found' })
  if (habit.completions[date]) {
    delete habit.completions[date]
  } else {
    habit.completions[date] = true
  }
  save()
  res.json(habit)
})

export default router
