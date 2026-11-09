import { daysUntil } from './dates'

// A date within this many days counts as "due soon" / "expiring soon".
export const UPCOMING_DAYS = 30

// PPM status of a device: 'overdue' | 'upcoming' | 'ok' | 'none'
export function ppmStatus(device) {
  const days = daysUntil(device.next_ppm_date)
  if (days === null) return 'none'
  if (days < 0) return 'overdue'
  if (days <= UPCOMING_DAYS) return 'upcoming'
  return 'ok'
}

// Expiry status of an accessory date: 'expired' | 'expiring' | 'ok' | 'none'
export function expiryStatus(dateStr) {
  const days = daysUntil(dateStr)
  if (days === null) return 'none'
  if (days < 0) return 'expired'
  if (days <= UPCOMING_DAYS) return 'expiring'
  return 'ok'
}
