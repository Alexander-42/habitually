import { lastNDays, todayKey, computeStreak } from '../lib/dates'

const WEEK = lastNDays(7)

export default function HabitRow({ habit, onToggle, onDelete }) {
  const today = todayKey()
  const streak = computeStreak(habit.completions)

  return (
    <div className="habit-row">
      <div className="habit-info">
        <span className="habit-name">{habit.name}</span>
        <span className="habit-streak" title="Current streak">
          {streak > 0 ? `${streak}🔥` : '—'}
        </span>
      </div>

      <div className="week-grid" role="group" aria-label={`${habit.name} last 7 days`}>
        {WEEK.map((day) => {
          const done = !!habit.completions?.[day.key]
          const isToday = day.key === today
          return (
            <button
              key={day.key}
              type="button"
              className={`day-cell${done ? ' done' : ''}${isToday ? ' today' : ''}`}
              onClick={() => onToggle(habit.id, day.key)}
              title={`${day.weekday} ${day.key}${done ? ' — done' : ''}`}
              aria-pressed={done}
            >
              <span className="day-label">{day.label}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="btn btn-ghost delete-btn"
        onClick={() => onDelete(habit.id)}
        aria-label={`Delete ${habit.name}`}
        title="Delete habit"
      >
        ✕
      </button>
    </div>
  )
}
