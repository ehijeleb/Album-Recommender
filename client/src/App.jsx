import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import { authFetch } from './api'

function App() {
  const [token, setToken] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')

    if (urlToken) {
      localStorage.setItem('spotify_token', urlToken)
      window.history.replaceState({}, '', '/')
    }

    const candidate = urlToken || localStorage.getItem('spotify_token')

    if (!candidate) {
      setLoading(false)
      return
    }

    authFetch('/api/profile')
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json()
          setProfile(data)
          setToken(candidate)
        } else {
          localStorage.removeItem('spotify_token')
        }
      })
      .catch(() => {
        localStorage.removeItem('spotify_token')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('spotify_token')
    setToken(null)
    setProfile(null)
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return token
    ? <Dashboard token={token} profile={profile} onLogout={handleLogout} />
    : <LoginPage />
}

export default App
