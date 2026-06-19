import './App.css'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/auth-context'
import LoginView from './components/LoginView'
import DashboardContainer from './components/DashboardContainer'

function Root() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="auth-screen">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  return user ? <DashboardContainer /> : <LoginView />
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
