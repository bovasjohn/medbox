import { BarChart3 } from 'lucide-react'
import PlaceholderPage from '../components/ui/PlaceholderPage'

export default function Statistics() {
  return (
    <PlaceholderPage
      title="Statistics"
      subtitle="Maintenance performance at a glance"
      icon={BarChart3}
      phase="Phase 5"
      items={[
        'Devices by organization and PPM completion rate',
        'Overdue, upcoming and accessory expiry counts',
        'Monthly completion and technician activity',
      ]}
    />
  )
}
