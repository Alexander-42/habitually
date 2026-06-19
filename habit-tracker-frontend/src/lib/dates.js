// Local-time date key, e.g. "2026-06-19"
export function dateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return dateKey(new Date())
}

// Array of the last `n` days (oldest first), each { key, label, weekday }.
export function lastNDays(n = 7) {
  const days = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push({
      key: dateKey(d),
      label: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
      weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
    })
  }
  return days
}

// Consecutive completed days ending today (or yesterday if today not yet done).
export function computeStreak(completions = {}) {
  let streak = 0
  const cursor = new Date()
  // Allow the streak to count even if today isn't completed yet.
  if (!completions[dateKey(cursor)]) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (completions[dateKey(cursor)]) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
