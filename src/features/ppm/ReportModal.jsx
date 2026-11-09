import { Link } from 'react-router-dom'
import Modal from '../../components/ui/Modal'
import { ResultBadge } from '../../components/ui/StatusBadge'
import { useData } from '../../context/DataContext'
import { formatDate } from '../../lib/dates'

function Item({ label, children }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm">{children || '—'}</dd>
    </div>
  )
}

function Block({ label, text }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-brand">{label}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm">{text || '—'}</p>
    </div>
  )
}

// Read-only view of a saved inspection report. Reports are never edited.
export default function ReportModal({ report, onClose }) {
  const { deviceById, orgById } = useData()
  const device = deviceById.get(report.device_id)
  const organization = device && orgById.get(device.organization_id)

  return (
    <Modal title="PPM report" onClose={onClose} wide>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">Report saved. It cannot be changed, so the history stays complete.</p>
          <ResultBadge result={report.result} />
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <Item label="Organization">{organization?.name}</Item>
          <Item label="Device">
            {device ? (
              <Link to={`/devices/${device.id}`} onClick={onClose} className="text-brand hover:underline">
                {[device.brand, device.device].filter(Boolean).join(' ')}
              </Link>
            ) : null}
          </Item>
          <Item label="Model">{device?.model}</Item>
          <Item label="Inspection date">{formatDate(report.inspection_date)}</Item>
          <Item label="Technician">{report.technician}</Item>
          <Item label="Next PPM date">{formatDate(report.next_ppm_date)}</Item>
        </dl>

        <Block label="Work performed" text={report.work_performed} />
        <Block label="Findings" text={report.findings} />
        <Block label="Recommendations" text={report.recommendations} />
        {report.comments && <Block label="Comments" text={report.comments} />}

        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
