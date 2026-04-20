import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'

function App() {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')

    if (urlToken) {
      localStorage.setItem('spotify_token', urlToken)
      window.history.replaceState({}, '', '/')
      setToken(urlToken)
      setLoading(false)
      return
    }

    const stored = localStorage.getItem('spotify_token')
    if (stored) setToken(stored)
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('spotify_token')
    setToken(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return token
    ? <Dashboard token={token} onLogout={handleLogout} />
    : <LoginPage />
}

export default App
