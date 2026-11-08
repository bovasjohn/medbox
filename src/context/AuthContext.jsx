import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Keep the rest of the app independent of Supabase's user shape.
function normalize(session) {
  const u = session?.user
  if (!u) return null
  const meta = u.user_metadata || {}
  return {
    id: u.id,
    email: u.email,
    displayName: meta.full_name || meta.name || '',
    photoURL: meta.avatar_url || meta.picture || '',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(normalize(data.session))
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(normalize(session))
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  // Redirects to Google, then back to this site.
  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
