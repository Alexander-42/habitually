import { useEffect, useState } from 'react'
import { useAuth } from '../context/auth-context'
import { habitsApi } from '../api/client'
import Dashboard from './Dashboard'

// Container: owns data fetching, context and mutation logic, then renders the
// pure <Dashboard /> presentational component.
export default function DashboardContainer() {
  const { user, logout } = useAuth()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    habitsApi
      .list()
      .then(setHabits)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Pull the authoritative list from the server, e.g. after another client
  // changed our habits out from under us.
  async function resync() {
    try {
      setHabits(await habitsApi.list())
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleAdd(name) {
    const habit = await habitsApi.create(name)
    setHabits((prev) => [...prev, habit])
  }

  async function handleDelete(id) {
    const prev = habits
    setError('')
    setHabits((cur) => cur.filter((h) => h.id !== id))
    try {
      await habitsApi.remove(id)
    } catch (err) {
      // Already gone elsewhere — our optimistic removal is the correct end state.
      if (err.status === 404) return
      setError(err.message)
      setHabits(prev) // rollback
    }
  }

  async function handleToggle(id, date) {
    setError('')
    try {
      const updated = await habitsApi.toggle(id, date)
      setHabits((cur) => cur.map((h) => (h.id === id ? updated : h)))
    } catch (err) {
      // The habit was removed by another session — drop our stale copy.
      if (err.status === 404) {
        setError('That habit was changed in another tab — refreshed.')
        await resync()
        return
      }
      setError(err.message)
    }
  }

  return (
    <Dashboard
      user={user}
      habits={habits}
      loading={loading}
      error={error}
      onAdd={handleAdd}
      onToggle={handleToggle}
      onDelete={handleDelete}
      onLogout={logout}
    />
  )
}
