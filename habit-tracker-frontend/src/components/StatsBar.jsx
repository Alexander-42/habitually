import { todayKey, computeStreak } from '../lib/dates'

export default function StatsBar({ habits }) {
  const today = todayKey()
  const completedToday = habits.filter((h) => h.completions?.[today]).length
  const bestStreak = habits.reduce(
    (max, h) => Math.max(max, computeStreak(h.completions)),
    0
  )

  const stats = [
    { label: 'Habits', value: habits.length },
    { label: 'Done today', value: `${completedToday}/${habits.length}` },
    { label: 'Best streak', value: `${bestStreak}🔥` },
  ]

  return (
    <div className="stats-bar">
      {stats.map((s) => (
        <div key={s.label} className="stat-chip">
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
