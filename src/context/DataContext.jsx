import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { describe, OFFLINE_MESSAGE } from '../lib/errors'

const DataContext = createContext(null)

const PAGE_SIZE = 1000 // Supabase returns at most 1000 rows per request
const EMPTY = { organizations: [], devices: [], accessories: [], reports: [] }

function readCache(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable: the app still works online */
  }
}

async function fetchAll(table, orderBy, ascending = true) {
  let rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending })
      .order('id')
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows = rows.concat(data)
    if (data.length < PAGE_SIZE) break
  }
  return rows
}

// Trim text and turn empty strings into null so optional columns stay empty.
function clean(values) {
  const out = {}
  for (const [key, value] of Object.entries(values)) {
    out[key] = typeof value === 'string' ? value.trim() || null : value
  }
  return out
}

// Run a Supabase query, refusing early when offline and turning errors into messages.
async function run(query) {
  if (!navigator.onLine) throw new Error(OFFLINE_MESSAGE)
  const { data, error } = await query
  if (error) throw new Error(describe(error))
  return data
}

const byDateDesc = (a, b) =>
  b.inspection_date.localeCompare(a.inspection_date) || (b.created_at || '').localeCompare(a.created_at || '')

export function DataProvider({ children }) {
  const { user } = useAuth()
  const cacheKey = `mm-cache-${user.id}`

  const [cached] = useState(() => readCache(cacheKey))
  const [data, setData] = useState(cached?.data ?? EMPTY)
  const [syncedAt, setSyncedAt] = useState(cached?.syncedAt ?? null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [online, setOnline] = useState(() => navigator.onLine)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [organizations, devices, accessories, reports] = await Promise.all([
        fetchAll('organizations', 'name'),
        fetchAll('devices', 'created_at', false),
        fetchAll('accessories', 'created_at'),
        fetchAll('ppm_reports', 'inspection_date', false),
      ])
      setData({ organizations, devices, accessories, reports })
      setSyncedAt(new Date().toISOString())
    } catch (e) {
      // Offline is shown by its own banner; keep whatever is saved on this device.
      if (navigator.onLine) setError(describe(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const goOnline = () => {
      setOnline(true)
      refresh()
    }
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [refresh])

  // Keep an offline copy of the last loaded or saved data.
  useEffect(() => {
    if (syncedAt) writeCache(cacheKey, { data, syncedAt })
  }, [data, syncedAt, cacheKey])

  const putRow = (key, row) =>
    setData((d) => ({
      ...d,
      [key]: d[key].some((r) => r.id === row.id) ? d[key].map((r) => (r.id === row.id ? row : r)) : [row, ...d[key]],
    }))

  // Insert (no id) or update (with id) one row and mirror it in local state.
  const save = (table, key) => async (values, id) => {
    const payload = clean(values)
    const query = id
      ? supabase.from(table).update(payload).eq('id', id).select().single()
      : supabase.from(table).insert(payload).select().single()
    const row = await run(query)
    putRow(key, row)
    return row
  }

  const saveOrganization = save('organizations', 'organizations')
  const saveDevice = save('devices', 'devices')
  const saveAccessory = save('accessories', 'accessories')

  async function deleteAccessory(id) {
    await run(supabase.from('accessories').delete().eq('id', id))
    setData((d) => ({ ...d, accessories: d.accessories.filter((a) => a.id !== id) }))
  }

  // Saves a new report (never overwrites one), then refreshes the device's PPM dates
  // when this is its most recent inspection.
  async function savePpmReport(values) {
    const row = await run(supabase.from('ppm_reports').insert(clean(values)).select().single())
    putRow('reports', row)

    const device = data.devices.find((d) => d.id === row.device_id)
    const isLatest = !device?.last_ppm_date || row.inspection_date >= device.last_ppm_date
    if (device && isLatest) {
      try {
        const updated = await run(
          supabase
            .from('devices')
            .update({ last_ppm_date: row.inspection_date, next_ppm_date: row.next_ppm_date })
            .eq('id', device.id)
            .select()
            .single(),
        )
        putRow('devices', updated)
      } catch {
        const err = new Error(
          'The report was saved, but the device dates could not be updated. Edit the device to set them. Do not submit the report again.',
        )
        err.partial = true
        throw err
      }
    }
    return row
  }

  const derived = useMemo(() => {
    const reports = [...data.reports].sort(byDateDesc)
    const orgById = new Map(data.organizations.map((o) => [o.id, o]))
    const deviceById = new Map(data.devices.map((d) => [d.id, d]))
    const accessoriesByDevice = new Map()
    for (const a of data.accessories) {
      if (!accessoriesByDevice.has(a.device_id)) accessoriesByDevice.set(a.device_id, [])
      accessoriesByDevice.get(a.device_id).push(a)
    }
    const reportsByDevice = new Map()
    for (const r of reports) {
      if (!reportsByDevice.has(r.device_id)) reportsByDevice.set(r.device_id, [])
      reportsByDevice.get(r.device_id).push(r)
    }
    return { reports, orgById, deviceById, accessoriesByDevice, reportsByDevice }
  }, [data])

  const value = {
    organizations: data.organizations,
    devices: data.devices,
    accessories: data.accessories,
    ...derived,
    loading,
    error,
    online,
    syncedAt,
    refresh,
    saveOrganization,
    saveDevice,
    saveAccessory,
    deleteAccessory,
    savePpmReport,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
