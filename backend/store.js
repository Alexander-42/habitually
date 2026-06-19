import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
// DATA_FILE can be overridden (e.g. by e2e tests) to isolate persisted state.
const DATA_FILE = process.env.DATA_FILE || join(__dirname, 'data.json')

const empty = { users: [], habits: [] }

function load() {
  if (!existsSync(DATA_FILE)) return structuredClone(empty)
  try {
    const parsed = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
    return { users: parsed.users ?? [], habits: parsed.habits ?? [] }
  } catch {
    return structuredClone(empty)
  }
}

const db = load()

export function save() {
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2))
}

export default db
