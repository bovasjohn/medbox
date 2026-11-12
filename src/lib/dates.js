// All dates in the database are plain 'YYYY-MM-DD' strings (no time zone issues).
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (n) => String(n).padStart(2, '0')

function toUtc(str) {
  const [y, m, d] = str.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Days from today until the date (negative = in the past). null if no date.
export function daysUntil(str) {
  if (!str) return null
  return Math.round((toUtc(str) - toUtc(todayStr())) / 86400000)
}

export function addMonths(str, count) {
  const [y, m, d] = str.split('-').map(Number)
  const first = new Date(Date.UTC(y, m - 1 + count, 1))
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
  return `${first.getUTCFullYear()}-${pad(first.getUTCMonth() + 1)}-${pad(Math.min(d, lastDay))}`
}

export function formatDate(str) {
  if (!str) return '—'
  const [y, m, d] = str.split('-').map(Number)
  return `${pad(d)} ${MONTHS[m - 1]} ${y}`
}

// 05-11-2026 style, as used on the company report.
export function formatDash(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${d}-${m}-${y}`
}

// Oct 2028
export function monthYear(str) {
  if (!str) return ''
  const [y, m] = str.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

export function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

export const monthKey = (str) => str.slice(0, 7)

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`
}

// ['2026-06', ..., '2026-11'] oldest first, ending with the current month.
export function lastMonths(count) {
  const [y, m] = todayStr().split('-').map(Number)
  const keys = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1))
    keys.push(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`)
  }
  return keys
}
