import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { expiryStatus, ppmStatus } from '../../lib/status'
import { nextAccessoryExpiry } from '../../lib/devices'
import { formatDate } from '../../lib/dates'
import { ExpiryBadge, PpmBadge } from '../../components/ui/StatusBadge'

// Small label shown only on narrow screens (wide screens use the header row).
function Cell({ label, className = '', children }) {
  return (
    <div className={className}>
      <p className="mb-0.5 text-xs text-muted lg:hidden">{label}</p>
      {children}
    </div>
  )
}

export default function DeviceList({ devices, showOrganization = true }) {
  const { orgById, accessoriesByDevice } = useData()

  // Full class names so Tailwind can see them.
  const span = showOrganization
    ? { device: 'lg:col-span-3', org: 'lg:col-span-2', installed: 'lg:col-span-2', ppm: 'lg:col-span-2', acc: 'lg:col-span-3' }
    : { device: 'lg:col-span-4', org: '', installed: 'lg:col-span-2', ppm: 'lg:col-span-3', acc: 'lg:col-span-3' }

  return (
    <div className="space-y-2">
      <div className="hidden grid-cols-12 gap-4 px-4 text-xs font-medium uppercase tracking-wide text-muted lg:grid">
        <span className={span.device}>Device</span>
        {showOrganization && <span className={span.org}>Organization</span>}
        <span className={span.installed}>Installed</span>
        <span className={span.ppm}>Next PPM</span>
        <span className={span.acc}>Accessory expiry</span>
      </div>

      {devices.map((d) => {
        const org = orgById.get(d.organization_id)
        const accessoryExpiry = nextAccessoryExpiry(accessoriesByDevice.get(d.id))
        return (
          <Link
            key={d.id}
            to={`/devices/${d.id}`}
            className="card block p-4 transition-colors hover:border-brand/40"
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-12 lg:items-center">
              <div className={`col-span-2 ${span.device}`}>
                <p className="font-medium">{d.device}</p>
                <p className="text-sm text-muted">{[d.brand, d.model].filter(Boolean).join(' · ') || '—'}</p>
              </div>
              {showOrganization && (
                <Cell label="Organization" className={span.org}>
                  <p className="text-sm">{org?.name ?? '—'}</p>
                </Cell>
              )}
              <Cell label="Installed" className={span.installed}>
                <p className="text-sm">{formatDate(d.installation_date)}</p>
              </Cell>
              <Cell label="Next PPM" className={span.ppm}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm">{formatDate(d.next_ppm_date)}</span>
                  <PpmBadge status={ppmStatus(d)} />
                </div>
              </Cell>
              <Cell label="Accessory expiry" className={`col-span-2 ${span.acc}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm">{formatDate(accessoryExpiry)}</span>
                  {accessoryExpiry && <ExpiryBadge status={expiryStatus(accessoryExpiry)} />}
                </div>
              </Cell>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
