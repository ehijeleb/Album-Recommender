import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import BASE from './api'

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('auth') === 'success') {
      window.history.replaceState({}, '', '/')
    }

    fetch(`${BASE}/auth/status`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setAuthenticated(data.authenticated)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return authenticated
    ? <Dashboard onLogout={() => setAuthenticated(false)} />
    : <LoginPage />
}

export default App
