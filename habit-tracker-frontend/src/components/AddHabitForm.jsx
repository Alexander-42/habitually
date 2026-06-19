import { useState } from 'react'

const PRESETS = [
  { emoji: '💧', name: 'Drink water' },
  { emoji: '🏃', name: 'Exercise' },
  { emoji: '📖', name: 'Read' },
  { emoji: '🧘', name: 'Meditate' },
  { emoji: '😴', name: 'Sleep 8 hours' },
  { emoji: '✍️', name: 'Journal' },
]

export default function AddHabitForm({ onAdd, existingNames = [] }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const taken = new Set(existingNames.map((n) => n.toLowerCase()))
  const availablePresets = PRESETS.filter((p) => !taken.has(p.name.toLowerCase()))

  async function add(value) {
    const trimmed = value.trim()
    if (!trimmed || busy) return
    setBusy(true)
    setError('')
    try {
      await onAdd(trimmed)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (await add(name)) setName('')
  }

  return (
    <div className="card add-habit-card">
      <h2 className="add-habit-title">Add a habit</h2>

      {availablePresets.length > 0 && (
        <div className="preset-row">
          {availablePresets.map((p) => (
            <button
              key={p.name}
              type="button"
              className="preset-chip"
              onClick={() => add(p.name)}
              disabled={busy}
            >
              <span aria-hidden="true">{p.emoji}</span> {p.name}
            </button>
          ))}
        </div>
      )}

      <form className="add-habit" onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Or write your own…"
          aria-label="New habit name"
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Adding…' : 'Add habit'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  )
}
