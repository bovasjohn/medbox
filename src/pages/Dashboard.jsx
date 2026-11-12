import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CalendarClock, ClipboardCheck, HeartPulse, PackageX, Plus } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import ChartCard from '../components/ui/ChartCard'
import { PageSpinner } from '../components/ui/Spinner'
import { ExpiryBadge } from '../components/ui/StatusBadge'
import { computeStats, monthlyReports } from '../lib/stats'
import { expiryStatus } from '../lib/status'
import { formatDate } from '../lib/dates'
import { deviceTitle } from '../lib/devices'
import StatusDonut from '../features/charts/StatusDonut'
import MonthlyBars from '../features/charts/MonthlyBars'
import DeviceForm from '../features/devices/DeviceForm'
import PerformPpmModal from '../features/ppm/PerformPpmModal'
import ReportModal from '../features/ppm/ReportModal'
import ReportRow from '../features/ppm/ReportRow'

export default function Dashboard() {
  const { devices, accessories, reports, deviceById, orgById, loading } = useData()
  const [addingDevice, setAddingDevice] = useState(false)
  const [performing, setPerforming] = useState(false)
  const [viewing, setViewing] = useState(null)

  const stats = useMemo(() => computeStats({ devices, accessories }), [devices, accessories])
  const months = useMemo(() => monthlyReports(reports, 6), [reports])

  if (loading && devices.length === 0) return <PageSpinner />

  const expiring = stats.expiringAccessories.slice(0, 6)

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your equipment maintenance"
        actions={
          <>
            <button type="button" onClick={() => setAddingDevice(true)} className="btn-secondary">
              <Plus className="h-4 w-4" />
              Add device
            </button>
            <button type="button" onClick={() => setPerforming(true)} className="btn-primary">
              <ClipboardCheck className="h-4 w-4" />
              Perform PPM
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total devices" value={stats.total} icon={HeartPulse} tone="brand" to="/devices" />
        <StatCard
          label="Overdue PPM"
          value={stats.ppm.overdue}
          icon={AlertTriangle}
          tone="coral"
          to="/devices?status=overdue"
        />
        <StatCard
          label="Upcoming PPM"
          value={stats.ppm.upcoming}
          hint="Next 30 days"
          icon={CalendarClock}
          tone="amber"
          to="/devices?status=upcoming"
        />
        <StatCard
          label="Accessories expiring"
          value={stats.expiringAccessories.length}
          hint={stats.expiredCount ? `${stats.expiredCount} already expired` : 'Next 30 days'}
          icon={PackageX}
          tone="violet"
          to="/devices?sort=accessory"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ChartCard title="PPM status" subtitle="All devices" className="lg:col-span-1">
          <StatusDonut counts={stats.ppm} />
        </ChartCard>
        <ChartCard title="Monthly PPM completion" subtitle="Last 6 months" className="lg:col-span-2">
          <MonthlyBars data={months} />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-medium">Expiring accessories</h2>
          <p className="text-xs text-muted">Expired or expiring within 30 days</p>
          {expiring.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Nothing is expiring soon.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {expiring.map((a) => {
                const device = deviceById.get(a.device_id)
                const org = device && orgById.get(device.organization_id)
                return (
                  <li key={a.id}>
                    <Link
                      to={`/devices/${a.device_id}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-brand/5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {a.name} <span className="font-normal text-muted">({a.category})</span>
                        </p>
                        <p className="truncate text-xs text-muted">
                          {[deviceTitle(device), org?.name].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <span className="hidden text-xs text-muted sm:block">{formatDate(a.expiry_date)}</span>
                      <ExpiryBadge status={expiryStatus(a.expiry_date)} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="font-medium">Recently completed maintenance</h2>
              <p className="text-xs text-muted">Latest inspections</p>
            </div>
            <Link to="/ppm-reports" className="text-sm text-brand hover:underline">
              View all
            </Link>
          </div>
          {reports.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No PPM completed yet.</p>
          ) : (
            <div className="-mx-2 mt-3 divide-y divide-line">
              {reports.slice(0, 6).map((r) => (
                <ReportRow key={r.id} report={r} onClick={() => setViewing(r)} />
              ))}
            </div>
          )}
        </section>
      </div>

      {addingDevice && <DeviceForm onClose={() => setAddingDevice(false)} />}
      {performing && <PerformPpmModal onClose={() => setPerforming(false)} />}
      {viewing && <ReportModal report={viewing} onClose={() => setViewing(null)} />}
    </>
  )
}
