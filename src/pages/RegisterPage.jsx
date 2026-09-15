import { useState, useEffect } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const token = useAuthStore((state) => state.token)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)

  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
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
    if (!username.trim() || !phone.trim() || !password) return

    const { ok } = await register({ username, phone, password })
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
          <p className="auth-subtitle">Yangi hisob yarating</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">Username</span>
            <input
              className="form-input"
              type="text"
              placeholder="foydalanuvchi_nomi"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoFocus
              required
            />
          </label>

          <label className="form-field">
            <span className="form-label">Telefon</span>
            <input
              className="form-input"
              type="tel"
              placeholder="+998901234567"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
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
            {isLoading ? 'Yaratilmoqda...' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>

        <p className="auth-switch">
          Hisobingiz bormi? <Link to="/login">Kirish</Link>
        </p>
      </div>
    </div>
  )
}