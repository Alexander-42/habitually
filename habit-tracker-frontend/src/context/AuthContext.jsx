import { useEffect, useState } from 'react'
import { authApi, setToken, getToken } from '../api/client'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Only show a loading state while we have a token to validate.
  const [loading, setLoading] = useState(() => !!getToken())

  // Restore session from a persisted token on mount.
  useEffect(() => {
    if (!getToken()) return
    let active = true
    authApi
      .me()
      .then(({ user }) => {
        if (active) setUser(user)
      })
      .catch(() => {
        setToken(null)
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function login(username, password) {
    const { token, user } = await authApi.login(username, password)
    setToken(token)
    setUser(user)
  }

  async function register(username, password) {
    const { token, user } = await authApi.register(username, password)
    setToken(token)
    setUser(user)
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
