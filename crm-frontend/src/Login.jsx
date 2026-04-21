import { useState } from 'react'
import axios from 'axios'
import { useAuth }     from './AuthContext'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Login() {
  const { login }    = useAuth()
const navigate     = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function handleSubmit(e) {
  e.preventDefault()
  setLoading(true)
  try {
    const res = await axios.post(`${API}/auth/login`, form)
    login(res.data.token, res.data.user)
    navigate('/')
  } catch (err) {
    setError(err.response?.data?.error || 'Login failed')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f8fc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '40px',
        width: '380px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)'
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', background: '#1a1a2e',
            borderRadius: '12px', margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>R</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', color: '#1a1a2e' }}>Real Estate CRM</h1>
          <p style={{ margin: '6px 0 0', color: '#888', fontSize: '14px' }}>Sign in to your account</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fff5f5', border: '1px solid #fcc',
            borderRadius: '8px', padding: '10px 14px',
            color: '#c0392b', fontSize: '13px', marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#555', fontWeight: 500 }}>Email</label>
            <input
              name="email" type="email" value={form.email}
              onChange={handleChange} required
              placeholder="anjali@crm.com"
              style={{
                width: '100%', padding: '10px 12px', marginTop: '6px',
                border: '1px solid #ddd', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box', outline: 'none'
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', color: '#555', fontWeight: 500 }}>Password</label>
            <input
              name="password" type="password" value={form.password}
              onChange={handleChange} required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 12px', marginTop: '6px',
                border: '1px solid #ddd', borderRadius: '8px',
                fontSize: '14px', boxSizing: 'border-box', outline: 'none'
              }}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px', background: '#1a73e8',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '15px', fontWeight: 500, cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Hint */}
        <div style={{
          marginTop: '24px', padding: '12px', background: '#f7f8fc',
          borderRadius: '8px', fontSize: '12px', color: '#888'
        }}>
          <strong style={{ color: '#555' }}>Test credentials:</strong><br />
          Email: anjali@crm.com<br />
          Password: Anjali@123
        </div>
      </div>
    </div>
  )
}