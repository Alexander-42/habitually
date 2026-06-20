import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'

// Point the store at a throwaway Postgres database BEFORE importing it. CI sets
// DATABASE_URL to a service container; locally it defaults to a `habits_test`
// database on localhost (create it with `createdb habits_test`).
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost:5432/habits_test'
process.env.DATABASE_SSL = process.env.DATABASE_SSL || 'false'

const {
  pool,
  init,
  createUser,
  getUserByUsername,
  getUserById,
  createHabit,
  getHabits,
  getHabit,
  setCompletions,
  deleteHabit,
} = await import('../store.js')

describe('store (postgres)', () => {
  before(async () => {
    await init()
    // Start from a clean slate; CASCADE clears habits via the FK too.
    await pool.query('TRUNCATE users, habits CASCADE')
  })

  after(async () => {
    await pool.query('TRUNCATE users, habits CASCADE')
    await pool.end()
  })

  it('persists a created user and reads it back', async () => {
    await createUser({ id: 'u1', username: 'Alice', passwordHash: 'x' })
    const byId = await getUserById('u1')
    assert.equal(byId.username, 'Alice')
    assert.equal(byId.passwordHash, 'x')
  })

  it('looks users up case-insensitively', async () => {
    const u = await getUserByUsername('alice')
    assert.equal(u.id, 'u1')
  })

  it('returns undefined for unknown users', async () => {
    assert.equal(await getUserByUsername('ghost'), undefined)
    assert.equal(await getUserById('nope'), undefined)
  })

  it('creates habits scoped to a user with default completions', async () => {
    const habit = await createHabit({
      id: 'h1',
      userId: 'u1',
      name: 'Read',
      createdAt: '2026-06-20T00:00:00.000Z',
      completions: {},
    })
    assert.equal(habit.name, 'Read')
    assert.deepEqual(habit.completions, {})
    assert.deepEqual(await getHabits('u1'), [habit])
    assert.deepEqual(await getHabits('someone-else'), [])
  })

  it('persists completion updates', async () => {
    const updated = await setCompletions('h1', 'u1', { '2026-06-19': true })
    assert.equal(updated.completions['2026-06-19'], true)
    const reread = await getHabit('h1', 'u1')
    assert.equal(reread.completions['2026-06-19'], true)
  })

  it('deletes habits only for their owner', async () => {
    assert.equal(await deleteHabit('h1', 'someone-else'), false)
    assert.equal(await deleteHabit('h1', 'u1'), true)
    assert.deepEqual(await getHabits('u1'), [])
  })
})