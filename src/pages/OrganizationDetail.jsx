import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, HeartPulse, Mail, MapPin, Pencil, Phone, Plus, User } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { PageSpinner } from '../components/ui/Spinner'
import OrganizationForm from '../features/organizations/OrganizationForm'
import DeviceForm from '../features/devices/DeviceForm'
import DeviceList from '../features/devices/DeviceList'

function Info({ icon: Icon, children }) {
  if (!children) return null
  return (
    <li className="flex items-start gap-2 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      <span className="min-w-0 break-words">{children}</span>
    </li>
  )
}

export default function OrganizationDetail() {
  const { id } = useParams()
  const { orgById, devices, loading } = useData()
  const [editing, setEditing] = useState(false)
  const [addingDevice, setAddingDevice] = useState(false)

  const organization = orgById.get(id)

  if (!organization) {
    if (loading) return <PageSpinner />
    return (
      <EmptyState
        title="Organization not found"
        text="It may have been removed, or the data has not loaded yet."
        action={
          <Link to="/organizations" className="btn-primary">
            Back to Organizations
          </Link>
        }
      />
    )
  }

  const orgDevices = devices.filter((d) => d.organization_id === id)

  return (
    <>
      <Link to="/organizations" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Organizations
      </Link>

      <PageHeader
        title={organization.name}
        actions={
          <button type="button" onClick={() => setEditing(true)} className="btn-secondary">
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        }
      />

      <div className="card mb-8 p-5">
        <ul className="grid gap-3 sm:grid-cols-2">
          <Info icon={User}>{organization.contact_person}</Info>
          <Info icon={Phone}>{organization.phone}</Info>
          <Info icon={Mail}>{organization.email}</Info>
          <Info icon={MapPin}>{organization.address}</Info>
        </ul>
        {organization.notes && (
          <p className="mt-4 whitespace-pre-wrap border-t border-line pt-4 text-sm text-muted">{organization.notes}</p>
        )}
        {!organization.contact_person && !organization.phone && !organization.email && !organization.address && (
          <p className="text-sm text-muted">No contact details yet. Use Edit to add them.</p>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Devices ({orgDevices.length})</h2>
        <button type="button" onClick={() => setAddingDevice(true)} className="btn-secondary">
          <Plus className="h-4 w-4" />
          Add device
        </button>
      </div>

      {orgDevices.length === 0 ? (
        <EmptyState icon={HeartPulse} title="No devices yet" text="Devices you add here are linked to this organization." />
      ) : (
        <DeviceList devices={orgDevices} showOrganization={false} />
      )}

      {editing && <OrganizationForm organization={organization} onClose={() => setEditing(false)} />}
      {addingDevice && <DeviceForm defaultOrganizationId={id} onClose={() => setAddingDevice(false)} />}
    </>
  )
}
