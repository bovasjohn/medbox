import { ClipboardCheck } from 'lucide-react'
import PlaceholderPage from '../components/ui/PlaceholderPage'

export default function PpmReports() {
  return (
    <PlaceholderPage
      title="PPM Reports"
      subtitle="Inspection history across all devices"
      icon={ClipboardCheck}
      phase="Phase 4"
      items={['Perform PPM workflow', 'Permanent report history', 'PDF download and print']}
    />
  )
}
