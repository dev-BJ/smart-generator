'use client'

import { FormEvent, useState } from 'react'
import { LockKeyhole, Mail, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if ((event.nativeEvent as KeyboardEvent).isComposing || (event.nativeEvent as KeyboardEvent).keyCode === 229) return
    setLoading(true)
    setError('')
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (response.ok) router.replace('/')
    else setError((await response.json()).error ?? 'Unable to sign in.')
    setLoading(false)
  }

  return <main className="login-shell"><section className="login-card"><div className="login-brand"><span className="brand-mark"><Zap size={18} fill="currentColor" /></span><span>volt<span>watch</span></span></div><div className="login-heading"><p>Operations workspace</p><h1>Welcome back</h1><span>Sign in to monitor your generator fleet.</span></div><form onSubmit={submit} className="login-form"><label>Email address<div className="login-input"><Mail size={16} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required /></div></label><label>Password<div className="login-input"><LockKeyhole size={16} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required /></div></label>{error && <p className="login-error" role="alert">{error}</p>}<button className="login-button" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button></form><p className="login-note">Access is managed by your workspace administrator.</p></section></main>
}
