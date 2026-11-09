export const OFFLINE_MESSAGE =
  'You are offline. Nothing was saved. Reconnect, then press Save again; what you typed is still here.'

// Turn a Supabase or network error into a message a person can act on.
export function describe(error) {
  const msg = String(error?.message || '')
  const low = msg.toLowerCase()
  if (low.includes('failed to fetch') || low.includes('network') || low.includes('load failed')) {
    return 'Could not reach the server. Your changes were not saved. Check your connection and try again.'
  }
  if (error?.code === '42501' || low.includes('row-level security')) {
    return 'You do not have permission to do that.'
  }
  return msg || 'Something went wrong. Please try again.'
}
