import { useData } from '../../context/DataContext'
import { formatDate } from '../../lib/dates'
import { deviceTitle } from '../../lib/devices'
import { ResultBadge } from '../../components/ui/StatusBadge'

// One clickable line in a list of PPM reports.
export default function ReportRow({ report, showDevice = true, onClick }) {
  const { deviceById, orgById } = useData()
  const device = deviceById.get(report.device_id)
  const organization = device && orgById.get(device.organization_id)

  const title = showDevice ? deviceTitle(device) : formatDate(report.inspection_date)
  const subtitle = showDevice
    ? [organization?.name, formatDate(report.inspection_date), report.technician].filter(Boolean).join(' · ')
    : report.technician

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-brand/5"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted">{subtitle}</p>
      </div>
      <span className="hidden text-xs text-muted sm:block">Next {formatDate(report.next_ppm_date)}</span>
      <ResultBadge result={report.result} />
    </button>
  )
}
