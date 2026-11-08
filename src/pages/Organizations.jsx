import { Building2 } from 'lucide-react'
import PlaceholderPage from '../components/ui/PlaceholderPage'

export default function Organizations() {
  return (
    <PlaceholderPage
      title="Organizations"
      subtitle="Hospitals and clinics you maintain equipment for"
      icon={Building2}
      phase="Phase 2"
      items={['Add, edit and view organizations', 'See the devices linked to each organization']}
    />
  )
}
