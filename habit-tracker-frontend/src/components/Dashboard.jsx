import AddHabitForm from './AddHabitForm'
import StatsBar from './StatsBar'
import HabitList from './HabitList'

// Pure presentational component: renders entirely from props and emits
// callbacks. No data fetching or context — see DashboardContainer for wiring.
export default function Dashboard({
  user,
  habits,
  loading,
  error,
  onAdd,
  onToggle,
  onDelete,
  onLogout,
}) {
  return (
    <div className="dashboard">
      <header className="app-header">
        <h1 className="brand">✓ Habitually</h1>
        <div className="user-box">
          <span className="muted">Hi, {user?.username}</span>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <AddHabitForm onAdd={onAdd} existingNames={habits.map((h) => h.name)} />
        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="muted">Loading habits…</p>
        ) : (
          <>
            <StatsBar habits={habits} />
            <HabitList habits={habits} onToggle={onToggle} onDelete={onDelete} />
          </>
        )}
      </main>
    </div>
  )
}
