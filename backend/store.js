import pg from 'pg'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is required — set it to a Postgres connection string ' +
      '(see backend/README.md for local/CI setup).'
  )
}

// Render's managed Postgres uses TLS; set DATABASE_SSL=false for a plaintext
// local/CI database (e.g. the GitHub Actions service container).
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
})

// Creates the schema if it doesn't exist. Idempotent, so it's safe to call on
// every boot — that's what makes the data survive redeploys (the tables, and
// their rows, already live in Postgres).
export async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      username_lower TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      completions JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `)
  await pool.query('CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id)')
}

// Row -> API shape mappers (DB is snake_case, the app/JSON is camelCase).
const toUser = (r) =>
  r && { id: r.id, username: r.username, passwordHash: r.password_hash }

const toHabit = (r) =>
  r && {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    createdAt:
      r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    completions: r.completions ?? {},
  }

export async function getUserByUsername(username) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE username_lower = $1',
    [username.toLowerCase()]
  )
  return toUser(rows[0])
}

export async function getUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
  return toUser(rows[0])
}

export async function createUser(user) {
  await pool.query(
    `INSERT INTO users (id, username, username_lower, password_hash)
     VALUES ($1, $2, $3, $4)`,
    [user.id, user.username, user.username.toLowerCase(), user.passwordHash]
  )
  return user
}

export async function getHabits(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at',
    [userId]
  )
  return rows.map(toHabit)
}

export async function getHabit(id, userId) {
  const { rows } = await pool.query(
    'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
    [id, userId]
  )
  return toHabit(rows[0])
}

export async function createHabit(habit) {
  const { rows } = await pool.query(
    `INSERT INTO habits (id, user_id, name, created_at, completions)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      habit.id,
      habit.userId,
      habit.name,
      habit.createdAt,
      JSON.stringify(habit.completions ?? {}),
    ]
  )
  return toHabit(rows[0])
}

export async function deleteHabit(id, userId) {
  const { rowCount } = await pool.query(
    'DELETE FROM habits WHERE id = $1 AND user_id = $2',
    [id, userId]
  )
  return rowCount > 0
}

export async function setCompletions(id, userId, completions) {
  const { rows } = await pool.query(
    `UPDATE habits SET completions = $3
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId, JSON.stringify(completions)]
  )
  return toHabit(rows[0])
}