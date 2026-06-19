import { lastNDays } from '../lib/dates'
import HabitRow from './HabitRow'

const WEEK = lastNDays(7)

export default function HabitList({ habits, onToggle, onDelete }) {
  if (habits.length === 0) {
    return (
      <div className="card empty-state">
        <p>No habits yet.</p>
        <p className="muted">Add your first habit above to get started. 🌱</p>
      </div>
    )
  }

  return (
    <div className="card habit-list">
      <div className="habit-row habit-head">
        <div className="habit-info">
          <span className="habit-name muted">Habit</span>
        </div>
        <div className="week-grid">
          {WEEK.map((day) => (
            <span key={day.key} className="day-head muted">
              {day.label}
            </span>
          ))}
        </div>
        <span className="delete-spacer" />
      </div>

      {habits.map((habit) => (
        <HabitRow
          key={habit.id}
          habit={habit}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
