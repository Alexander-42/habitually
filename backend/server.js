import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import habitRoutes from './routes/habits.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/habits', habitRoutes)

app.listen(PORT, () => {
  console.log(`Habit tracker API listening on http://localhost:${PORT}`)
})
