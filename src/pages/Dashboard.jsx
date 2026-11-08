import { LayoutDashboard } from 'lucide-react'
import PlaceholderPage from '../components/ui/PlaceholderPage'

export default function Dashboard() {
  return (
    <PlaceholderPage
      title="Dashboard"
      subtitle="Overview of your equipment maintenance"
      icon={LayoutDashboard}
      phase="Phase 5"
      items={[
        'Device, overdue, upcoming and expiring statistic cards',
        'PPM status donut and monthly completion chart',
        'Expiring accessories and recent maintenance',
        'Quick actions',
      ]}
    />
  )
}
