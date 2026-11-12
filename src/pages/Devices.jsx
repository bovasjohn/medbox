import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeartPulse, Plus, Search, SearchX } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { PageSpinner } from '../components/ui/Spinner'
import { Input, Select } from '../components/ui/Field'
import { ppmStatus } from '../lib/status'
import { nextAccessoryExpiry } from '../lib/devices'
import DeviceForm from '../features/devices/DeviceForm'
import DeviceList from '../features/devices/DeviceList'

const PPM_FILTERS = [
  ['', 'All PPM statuses'],
  ['overdue', 'Overdue'],
  ['upcoming', 'Due soon'],
  ['ok', 'On schedule'],
  ['none', 'Not scheduled'],
]

const SORTS = [
  ['next_ppm', 'Next PPM'],
  ['organization', 'Organization'],
  ['installation', 'Installation date'],
  ['accessory', 'Accessory expiry'],
]

// Empty dates always go last, whichever way the list is sorted.
function compareDates(a, b) {
  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1
  return a.localeCompare(b)
}

export default function Devices() {
  const { devices, organizations, orgById, accessoriesByDevice, loading } = useData()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)

  // Filters live in the URL so dashboard cards can link straight to a filtered list.
  const status = params.get('status') ?? ''
  const organizationId = params.get('org') ?? ''
  const sort = params.get('sort') ?? 'next_ppm'

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = devices.filter((d) => {
      if (organizationId && d.organization_id !== organizationId) return false
      if (status && ppmStatus(d) !== status) return false
      if (!q) return true
      const org = orgById.get(d.organization_id)
      return [d.device, d.brand, d.model, d.serial_number, d.installed_by, d.comments, org?.name].some((v) =>
        v?.toLowerCase().includes(q),
      )
    })

    const orgName = (d) => orgById.get(d.organization_id)?.name ?? ''
    const expiry = (d) => nextAccessoryExpiry(accessoriesByDevice.get(d.id))
    return rows.sort((a, b) => {
      if (sort === 'organization') return orgName(a).localeCompare(orgName(b)) || a.device.localeCompare(b.device)
      if (sort === 'installation') return compareDates(a.installation_date, b.installation_date)
      if (sort === 'accessory') return compareDates(expiry(a), expiry(b))
      return compareDates(a.next_ppm_date, b.next_ppm_date)
    })
  }, [devices, orgById, accessoriesByDevice, query, organizationId, status, sort])

  const addButton = (
    <button type="button" onClick={() => setAdding(true)} className="btn-primary">
      <Plus className="h-4 w-4" />
      Add device
    </button>
  )
  const filtered = Boolean(query || status || organizationId)

  return (
    <>
      <PageHeader title="Devices" subtitle="Medical devices, accessories and PPM schedules" actions={addButton} />

      {loading && devices.length === 0 ? (
        <PageSpinner />
      ) : devices.length === 0 ? (
        <EmptyState
          icon={HeartPulse}
          title="No devices yet"
          text={
            organizations.length === 0
              ? 'Add an organization first, then add its devices.'
              : 'Add your first device to start tracking PPM.'
          }
          action={addButton}
        />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type="search"
                placeholder="Search devices"
                aria-label="Search devices"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
            <Select
              aria-label="Filter by organization"
              value={organizationId}
              onChange={(e) => setParam('org', e.target.value)}
            >
              <option value="">All organizations</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
            <Select aria-label="Filter by PPM status" value={status} onChange={(e) => setParam('status', e.target.value)}>
              {PPM_FILTERS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Select aria-label="Sort by" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
              {SORTS.map(([value, label]) => (
                <option key={value} value={value}>
                  Sort: {label}
                </option>
              ))}
            </Select>
          </div>

          {shown.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No devices match"
              text="Try a different search or clear the filters."
              action={
                filtered && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setQuery('')
                      setParams({}, { replace: true })
                    }}
                  >
                    Clear filters
                  </button>
                )
              }
            />
          ) : (
            <>
              <p className="mb-2 text-sm text-muted">
                {shown.length} {shown.length === 1 ? 'device' : 'devices'}
              </p>
              <DeviceList devices={shown} />
            </>
          )}
        </>
      )}

      {adding && <DeviceForm defaultOrganizationId={organizationId} onClose={() => setAdding(false)} />}
    </>
  )
}
