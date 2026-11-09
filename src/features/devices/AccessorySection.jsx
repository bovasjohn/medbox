import { useState } from 'react'
import { Pencil, Plus, Trash2, Package } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { expiryStatus } from '../../lib/status'
import { formatDate } from '../../lib/dates'
import { ExpiryBadge, StatusBadge } from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import AccessoryForm from './AccessoryForm'

// Accessories of one device. Their expiry is tracked separately from the device's PPM dates.
export default function AccessorySection({ deviceId }) {
  const { accessoriesByDevice, deleteAccessory } = useData()
  const [modal, setModal] = useState(null) // null | { accessory? }
  const [error, setError] = useState('')

  const list = [...(accessoriesByDevice.get(deviceId) ?? [])].sort((a, b) => {
    if (!a.expiry_date) return 1
    if (!b.expiry_date) return -1
    return a.expiry_date.localeCompare(b.expiry_date)
  })

  async function remove(accessory) {
    if (!window.confirm(`Remove "${accessory.name}" from this device?`)) return
    setError('')
    try {
      await deleteAccessory(accessory.id)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Accessories</h2>
        <button type="button" onClick={() => setModal({})} className="btn-secondary">
          <Plus className="h-4 w-4" />
          Add accessory
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-coral/10 px-3 py-2 text-sm text-[#C23A45] dark:text-coral">
          {error}
        </p>
      )}

      {list.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No accessories yet"
          text="Add pads, batteries or other parts and track when they expire."
        />
      ) : (
        <ul className="card divide-y divide-line">
          {list.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge color="violet">{a.category}</StatusBadge>
                  <span className="font-medium">{a.name}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {[a.model, a.quantity != null ? `Qty ${a.quantity}` : null, a.comments].filter(Boolean).join(' · ') ||
                    '—'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">Expires {formatDate(a.expiry_date)}</span>
                <ExpiryBadge status={expiryStatus(a.expiry_date)} />
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setModal({ accessory: a })}
                  aria-label={`Edit ${a.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-brand/5 hover:text-ink"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(a)}
                  aria-label={`Remove ${a.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-coral/10 hover:text-coral"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && <AccessoryForm deviceId={deviceId} accessory={modal.accessory} onClose={() => setModal(null)} />}
    </section>
  )
}
