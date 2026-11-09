import { RefreshCw, WifiOff } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { formatDateTime } from '../../lib/dates'

export default function OfflineBanner() {
  const { online, error, syncedAt, refresh } = useData()

  if (!online) {
    return (
      <div role="status" className="flex items-start gap-2 border-b border-amber/30 bg-amber/15 px-4 py-2 text-sm sm:px-6">
        <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          You are offline. Showing data saved on this device
          {syncedAt ? ` (updated ${formatDateTime(syncedAt)})` : ''}. Changes cannot be saved until you reconnect.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="flex items-center gap-3 border-b border-coral/30 bg-coral/10 px-4 py-2 text-sm sm:px-6">
        <p className="flex-1">{error} Showing the last saved data.</p>
        <button type="button" onClick={refresh} className="btn-secondary px-3 py-1">
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    )
  }

  return null
}
