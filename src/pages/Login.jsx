import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FullScreenSpinner, Spinner } from '../components/ui/Spinner'
import Logo from '../components/layout/Logo'
import { VERSION_LABEL } from '../lib/version'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

function friendlyError(error) {
  const msg = (error?.message || '').toLowerCase()
  if (msg.includes('provider') && msg.includes('enabled')) {
    return 'Google sign-in is not enabled in Supabase yet. Enable it under Authentication > Providers.'
  }
  if (msg.includes('fetch') || msg.includes('network')) {
    return 'Network error. Check your connection and try again.'
  }
  return 'Sign-in failed. Please try again.'
}

export default function Login() {
  const { user, loading, login } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (loading) return <FullScreenSpinner />
  if (user) return <Navigate to="/" replace />

  async function handleLogin() {
    setBusy(true)
    setError('')
    try {
      await login() // on success the browser leaves for Google
    } catch (e) {
      setError(friendlyError(e))
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-app px-4">
      <div className="card w-full max-w-sm p-8 text-center">
        <Logo className="mx-auto h-14 w-14" />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">MedMaintain</h1>
        <p className="mt-1 text-sm text-muted">Planned preventive maintenance for medical equipment</p>

        <button type="button" onClick={handleLogin} disabled={busy} className="btn-secondary mt-8 w-full py-2.5">
          {busy ? <Spinner className="h-5 w-5" /> : <GoogleIcon />}
          Continue with Google
        </button>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">
            {error}
          </p>
        )}

        <p className="mt-8 text-xs text-muted">{VERSION_LABEL}</p>
      </div>
    </div>
  )
}
