import { expiryStatus, ppmStatus } from './status'
import { lastMonths, monthKey, monthLabel } from './dates'

export function computeStats({ devices, accessories }) {
  const ppm = { overdue: 0, upcoming: 0, ok: 0, none: 0 }
  for (const d of devices) ppm[ppmStatus(d)]++

  let expired = 0
  const expiringAccessories = []
  for (const a of accessories) {
    const status = expiryStatus(a.expiry_date)
    if (status === 'expired') expired++
    if (status === 'expired' || status === 'expiring') expiringAccessories.push(a)
  }
  expiringAccessories.sort((a, b) => a.expiry_date.localeCompare(b.expiry_date))

  // Share of devices whose PPM is up to date (not overdue and scheduled).
  const completion = devices.length ? Math.round(((ppm.ok + ppm.upcoming) / devices.length) * 100) : 0

  return { total: devices.length, ppm, completion, expiringAccessories, expiredCount: expired }
}

export function monthlyReports(reports, months = 12) {
  const keys = lastMonths(months)
  const rows = new Map(keys.map((k) => [k, { month: monthLabel(k), pass: 0, fail: 0 }]))
  for (const r of reports) {
    const row = rows.get(monthKey(r.inspection_date))
    if (!row) continue
    if (r.result === 'Pass') row.pass++
    else row.fail++
  }
  return keys.map((k) => rows.get(k))
}

export function devicesByOrganization(devices, organizations) {
  const counts = new Map(organizations.map((o) => [o.id, { name: o.name, value: 0 }]))
  for (const d of devices) {
    const row = counts.get(d.organization_id)
    if (row) row.value++
  }
  return [...counts.values()].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
}

export function technicianActivity(reports, limit = 8) {
  const counts = new Map()
  for (const r of reports) {
    const name = (r.technician || '').trim()
    if (!name) continue
    const key = name.toLowerCase()
    const row = counts.get(key) || { name, value: 0 }
    row.value++
    counts.set(key, row)
  }
  return [...counts.values()].sort((a, b) => b.value - a.value).slice(0, limit)
}
