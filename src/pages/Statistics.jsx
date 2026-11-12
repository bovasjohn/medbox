import { useMemo } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, PackageX } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/ui/StatCard'
import ChartCard from '../components/ui/ChartCard'
import { PageSpinner } from '../components/ui/Spinner'
import { computeStats, devicesByOrganization, monthlyReports, technicianActivity } from '../lib/stats'
import StatusDonut from '../features/charts/StatusDonut'
import MonthlyBars from '../features/charts/MonthlyBars'
import HorizontalBars from '../features/charts/HorizontalBars'

export default function Statistics() {
  const { devices, accessories, reports, organizations, loading } = useData()

  const stats = useMemo(() => computeStats({ devices, accessories }), [devices, accessories])
  const months = useMemo(() => monthlyReports(reports, 12), [reports])
  const byOrganization = useMemo(() => devicesByOrganization(devices, organizations), [devices, organizations])
  const technicians = useMemo(() => technicianActivity(reports), [reports])

  if (loading && devices.length === 0) return <PageSpinner />

  return (
    <>
      <PageHeader title="Statistics" subtitle="Maintenance performance at a glance" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="PPM up to date"
          value={`${stats.completion}%`}
          hint="Devices not overdue"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard label="Overdue PPM" value={stats.ppm.overdue} icon={AlertTriangle} tone="coral" to="/devices?status=overdue" />
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
        <ChartCard title="Monthly PPM completion" subtitle="Last 12 months" className="lg:col-span-2">
          <MonthlyBars data={months} />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Devices by organization">
          <HorizontalBars data={byOrganization} color="#16A6A1" label="Devices" />
        </ChartCard>
        <ChartCard title="Technician activity" subtitle="Completed inspections per technician">
          <HorizontalBars data={technicians} color="#8066D9" label="Inspections" />
        </ChartCard>
      </div>
    </>
  )
}
