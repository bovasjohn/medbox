import { HeartPulse } from 'lucide-react'
import PlaceholderPage from '../components/ui/PlaceholderPage'

export default function Devices() {
  return (
    <PlaceholderPage
      title="Devices"
      subtitle="Medical devices, accessories and PPM schedules"
      icon={HeartPulse}
      phase="Phase 3"
      items={[
        'Add, edit, view and search devices',
        'Sorting and filters by organization and PPM status',
        'Accessories with independent expiry tracking',
      ]}
    />
  )
}
