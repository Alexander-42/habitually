import { describe, it, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Point the store at a throwaway file BEFORE importing it, so we exercise the
// DATA_FILE override and the "file does not exist yet" load path.
const dir = mkdtempSync(join(tmpdir(), 'store-test-'))
const dataFile = join(dir, 'data.json')
process.env.DATA_FILE = dataFile

const { default: db, save } = await import('../store.js')

describe('store', () => {
  after(() => rmSync(dir, { recursive: true, force: true }))

  it('starts empty when the data file does not exist', () => {
    assert.deepEqual(db.users, [])
    assert.deepEqual(db.habits, [])
    assert.equal(existsSync(dataFile), false)
  })

  it('persists the in-memory db to DATA_FILE on save()', () => {
    db.users.push({ id: 'u1', username: 'alice', passwordHash: 'x' })
    db.habits.push({ id: 'h1', userId: 'u1', name: 'Read', completions: {} })
    save()

    assert.equal(existsSync(dataFile), true)
    const onDisk = JSON.parse(readFileSync(dataFile, 'utf-8'))
    assert.equal(onDisk.users.length, 1)
    assert.equal(onDisk.users[0].username, 'alice')
    assert.equal(onDisk.habits[0].name, 'Read')
  })

  it('reflects later mutations on subsequent save()', () => {
    db.habits[0].completions['2026-06-19'] = true
    save()

    const onDisk = JSON.parse(readFileSync(dataFile, 'utf-8'))
    assert.equal(onDisk.habits[0].completions['2026-06-19'], true)
  })
})
