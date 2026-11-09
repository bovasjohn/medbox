import { useMemo, useState } from 'react'
import { ClipboardCheck, ClipboardList, Search } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { PageSpinner } from '../components/ui/Spinner'
import { Input, Select } from '../components/ui/Field'
import PerformPpmModal from '../features/ppm/PerformPpmModal'
import ReportModal from '../features/ppm/ReportModal'
import ReportRow from '../features/ppm/ReportRow'

export default function PpmReports() {
  const { reports, deviceById, orgById, organizations, loading } = useData()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [performing, setPerforming] = useState(false)
  const [viewing, setViewing] = useState(null)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reports.filter((r) => {
      const device = deviceById.get(r.device_id)
      if (result && r.result !== result) return false
      if (organizationId && device?.organization_id !== organizationId) return false
      if (!q) return true
      const org = device && orgById.get(device.organization_id)
      return [device?.device, device?.model, device?.brand, org?.name, r.technician].some((v) =>
        v?.toLowerCase().includes(q),
      )
    })
  }, [reports, deviceById, orgById, query, result, organizationId])

  const performButton = (
    <button type="button" onClick={() => setPerforming(true)} className="btn-primary">
      <ClipboardCheck className="h-4 w-4" />
      Perform PPM
    </button>
  )

  return (
    <>
      <PageHeader title="PPM Reports" subtitle="Inspection history across all devices" actions={performButton} />

      {loading && reports.length === 0 ? (
        <PageSpinner />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No PPM reports yet"
          text="Perform a PPM on a device and the report is saved here permanently."
          action={performButton}
        />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                type="search"
                placeholder="Search reports"
                aria-label="Search reports"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
            <Select aria-label="Filter by organization" value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
              <option value="">All organizations</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
            <Select aria-label="Filter by result" value={result} onChange={(e) => setResult(e.target.value)}>
              <option value="">Pass and Fail</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </Select>
          </div>

          {shown.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No reports match your filters.</p>
          ) : (
            <div className="card divide-y divide-line p-1">
              {shown.map((r) => (
                <ReportRow key={r.id} report={r} onClick={() => setViewing(r)} />
              ))}
            </div>
          )}
        </>
      )}

      {performing && <PerformPpmModal onClose={() => setPerforming(false)} />}
      {viewing && <ReportModal report={viewing} onClose={() => setViewing(null)} />}
    </>
  )
}
