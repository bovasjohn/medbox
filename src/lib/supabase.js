import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anonKey)

// Shown in Settings > About so you can confirm which project the app talks to.
export const supabaseHost = (() => {
  try {
    return new URL(url).host
  } catch {
    return 'unknown'
  }
})()

// The session is stored in localStorage and refreshed automatically,
// so login persists across restarts. Data access is protected by the
// row-level security policies in supabase/schema.sql, not by this key.
export const supabase = supabaseConfigured ? createClient(url, anonKey) : null
