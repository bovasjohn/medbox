import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardCheck, ClipboardList, Pencil } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { PageSpinner } from '../components/ui/Spinner'
import { PpmBadge } from '../components/ui/StatusBadge'
import { formatDate } from '../lib/dates'
import { ppmStatus } from '../lib/status'
import DeviceForm from '../features/devices/DeviceForm'
import AccessorySection from '../features/devices/AccessorySection'
import PerformPpmModal from '../features/ppm/PerformPpmModal'
import ReportModal from '../features/ppm/ReportModal'
import ReportRow from '../features/ppm/ReportRow'

function Item({ label, children }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm">{children || '—'}</dd>
    </div>
  )
}

export default function DeviceDetail() {
  const { id } = useParams()
  const { deviceById, orgById, reportsByDevice, loading } = useData()
  const [editing, setEditing] = useState(false)
  const [performing, setPerforming] = useState(false)
  const [viewing, setViewing] = useState(null)

  const device = deviceById.get(id)

  if (!device) {
    if (loading) return <PageSpinner />
    return (
      <EmptyState
        title="Device not found"
        text="It may have been removed, or the data has not loaded yet."
        action={
          <Link to="/devices" className="btn-primary">
            Back to Devices
          </Link>
        }
      />
    )
  }

  const organization = orgById.get(device.organization_id)
  const reports = reportsByDevice.get(id) ?? []

  return (
    <>
      <Link to="/devices" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Devices
      </Link>

      <PageHeader
        title={device.device}
        subtitle={[device.brand, device.model].filter(Boolean).join(' · ')}
        actions={
          <>
            <button type="button" onClick={() => setEditing(true)} className="btn-secondary">
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button type="button" onClick={() => setPerforming(true)} className="btn-primary">
              <ClipboardCheck className="h-4 w-4" />
              Perform PPM
            </button>
          </>
        }
      />

      <div className="card mb-8 p-5">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Item label="Organization">
            {organization && (
              <Link to={`/organizations/${organization.id}`} className="text-brand hover:underline">
                {organization.name}
              </Link>
            )}
          </Item>
          <Item label="Installation date">{formatDate(device.installation_date)}</Item>
          <Item label="Installed by">{device.installed_by}</Item>
          <Item label="Serial number">{device.serial_number}</Item>
          <Item label="Warranty">{device.warranty}</Item>
          <Item label="Last PPM done">{formatDate(device.last_ppm_date)}</Item>
          <Item label="Next PPM">
            <span className="flex flex-wrap items-center gap-2">
              {formatDate(device.next_ppm_date)}
              <PpmBadge status={ppmStatus(device)} />
            </span>
          </Item>
        </dl>
        {device.comments && (
          <p className="mt-4 whitespace-pre-wrap border-t border-line pt-4 text-sm text-muted">{device.comments}</p>
        )}
      </div>

      <div className="mb-8">
        <AccessorySection deviceId={id} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">PPM history ({reports.length})</h2>
        {reports.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No PPM reports yet"
            text="Each completed PPM is saved here as a permanent record."
          />
        ) : (
          <div className="card divide-y divide-line p-1">
            {reports.map((r) => (
              <ReportRow key={r.id} report={r} showDevice={false} onClick={() => setViewing(r)} />
            ))}
          </div>
        )}
      </section>

      {editing && <DeviceForm device={device} onClose={() => setEditing(false)} />}
      {performing && <PerformPpmModal deviceId={id} onClose={() => setPerforming(false)} />}
      {viewing && <ReportModal report={viewing} onClose={() => setViewing(null)} />}
    </>
  )
}
