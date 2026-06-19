const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const TOKEN_KEY = 'habit-tracker-token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function apiFetch(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

export const authApi = {
  register: (username, password) =>
    apiFetch('/api/auth/register', { method: 'POST', body: { username, password } }),
  login: (username, password) =>
    apiFetch('/api/auth/login', { method: 'POST', body: { username, password } }),
  me: () => apiFetch('/api/auth/me'),
}

export const habitsApi = {
  list: () => apiFetch('/api/habits'),
  create: (name) => apiFetch('/api/habits', { method: 'POST', body: { name } }),
  remove: (id) => apiFetch(`/api/habits/${id}`, { method: 'DELETE' }),
  toggle: (id, date) =>
    apiFetch(`/api/habits/${id}/toggle`, { method: 'POST', body: { date } }),
}
