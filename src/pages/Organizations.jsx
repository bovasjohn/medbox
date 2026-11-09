import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Plus, Search } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { PageSpinner } from '../components/ui/Spinner'
import { Input } from '../components/ui/Field'
import OrganizationForm from '../features/organizations/OrganizationForm'

export default function Organizations() {
  const { organizations, devices, loading } = useData()
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)

  const counts = new Map()
  for (const d of devices) counts.set(d.organization_id, (counts.get(d.organization_id) ?? 0) + 1)

  const q = query.trim().toLowerCase()
  const shown = organizations.filter(
    (o) => !q || [o.name, o.contact_person, o.address].some((v) => v?.toLowerCase().includes(q)),
  )

  const addButton = (
    <button type="button" onClick={() => setAdding(true)} className="btn-primary">
      <Plus className="h-4 w-4" />
      Add organization
    </button>
  )

  return (
    <>
      <PageHeader title="Organizations" subtitle="Hospitals and clinics you maintain equipment for" actions={addButton} />

      {loading && organizations.length === 0 ? (
        <PageSpinner />
      ) : organizations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations yet"
          text="Add your first organization, then link devices to it."
          action={addButton}
        />
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="search"
              placeholder="Search organizations"
              aria-label="Search organizations"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          {shown.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No organizations match your search.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((o) => (
                <Link
                  key={o.id}
                  to={`/organizations/${o.id}`}
                  className="card flex items-start gap-3 p-4 transition-colors hover:border-brand/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{o.name}</p>
                    <p className="truncate text-sm text-muted">{o.contact_person || 'No contact person'}</p>
                    <p className="mt-1 text-xs font-medium text-brand">
                      {counts.get(o.id) ?? 0} {(counts.get(o.id) ?? 0) === 1 ? 'device' : 'devices'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {adding && <OrganizationForm onClose={() => setAdding(false)} />}
    </>
  )
}
