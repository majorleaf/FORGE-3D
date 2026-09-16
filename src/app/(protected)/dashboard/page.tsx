'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [email, setEmail] = useState('')
  const supabase = createClient()
  const router   = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#080808' }}>
      <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
        <h1 style={{ color: '#ff6b00', fontSize: 32, marginBottom: 8 }}>⬡ FORGE3D</h1>
        <p style={{ color: '#555', marginBottom: 8 }}>Logged in as</p>
        <p style={{ color: '#e8e8e8', marginBottom: 32 }}>{email}</p>
        <button
          onClick={handleSignOut}
          style={{ background: 'transparent', border: '1px solid #ff6b00', color: '#ff6b00', padding: '10px 24px', borderRadius: 4, cursor: 'pointer', fontFamily: 'monospace', fontSize: 12, letterSpacing: 1 }}
        >
          SIGN OUT
        </button>
      </div>
    </div>
  )
}