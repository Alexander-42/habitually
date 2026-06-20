import express from 'express'
import cors from 'cors'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import authRoutes from './routes/auth.js'
import habitRoutes from './routes/habits.js'
import { init } from './store.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/habits', habitRoutes)

// Serve the built frontend (when present) so the whole app runs from one origin.
const distPath = join(__dirname, '../habit-tracker-frontend/dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  // SPA fallback: send index.html for any non-API GET that isn't a static file.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    res.sendFile(join(distPath, 'index.html'))
  })
} else {
  console.warn(
    `[server] No frontend build at ${distPath} — serving API only. ` +
      `Run "npm run build:client" to build the UI.`
  )
}

// Convert errors bubbled up from async route handlers into 500 responses.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Ensure the Postgres schema exists before we start accepting requests.
await init()

app.listen(PORT, () => {
  console.log(`Habit tracker running on http://localhost:${PORT}`)
})
