import { useState, useEffect } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const token = useAuthStore((state) => state.token)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!error) return undefined
    const timer = setTimeout(() => useAuthStore.setState({ error: null }), 6000)
    return () => clearTimeout(timer)
  }, [error])

  if (token) {
    return <Navigate to="/chats" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!identifier.trim() || !password) return

    const { ok } = await login(identifier, password)
    if (ok) {
      navigate('/chats')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">A</div>
          <h1 className="auth-title">Antigram</h1>
          <p className="auth-subtitle">Messenger'ga xush kelibsiz</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">Username yoki telefon</span>
            <input
              className="form-input"
              type="text"
              placeholder="username yoki +9989..."
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoFocus
              required
            />
          </label>

          <label className="form-field">
            <span className="form-label">Parol</span>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-primary btn-block" type="submit" disabled={isLoading}>
            {isLoading ? 'Kirmoqda...' : 'Kirish'}
          </button>
        </form>

        <p className="auth-switch">
          Hisobingiz yo'qmi? <Link to="/register">Ro'yxatdan o'tish</Link>
        </p>
      </div>
    </div>
  )
}