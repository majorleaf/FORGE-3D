'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const supabase = createClient()
  const router   = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#080808' }}>
      <div style={{ width: 360, padding: 32, border: '1px solid #1e1e1e', borderRadius: 8, background: '#0b0b0b' }}>
        <h1 style={{ color: '#ff6b00', fontFamily: 'monospace', fontSize: 24, marginBottom: 8 }}>⬡ FORGE3D</h1>
        <p style={{ color: '#555', fontFamily: 'monospace', fontSize: 12, marginBottom: 32 }}>Create your account</p>

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#555', fontFamily: 'monospace', fontSize: 11, display: 'block', marginBottom: 6 }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', background: '#0f0f0f', border: '1px solid #1e1e1e', color: '#e8e8e8', padding: '10px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ color: '#555', fontFamily: 'monospace', fontSize: 11, display: 'block', marginBottom: 6 }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', background: '#0f0f0f', border: '1px solid #1e1e1e', color: '#e8e8e8', padding: '10px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <p style={{ color: '#ff4444', fontFamily: 'monospace', fontSize: 11, marginBottom: 16 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#ff6b00', color: '#000', border: 'none', padding: '12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 1 }}
          >
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>

          <p style={{ color: '#333', fontFamily: 'monospace', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
            Have an account?{' '}
            <a href="/login" style={{ color: '#ff6b00' }}>Sign in</a>
          </p>
        </form>
      </div>
    </div>
  )
}