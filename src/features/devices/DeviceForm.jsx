import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../components/ui/Modal'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import FormFooter from '../../components/ui/FormFooter'
import { useData } from '../../context/DataContext'
import { useForm } from '../../lib/useForm'

export default function DeviceForm({ device, defaultOrganizationId = '', onClose, onSaved }) {
  const { organizations, saveDevice } = useData()
  const { values, bind } = useForm({
    organization_id: device?.organization_id ?? defaultOrganizationId,
    brand: device?.brand ?? '',
    device: device?.device ?? '',
    model: device?.model ?? '',
    installation_date: device?.installation_date ?? '',
    installed_by: device?.installed_by ?? '',
    last_ppm_date: device?.last_ppm_date ?? '',
    next_ppm_date: device?.next_ppm_date ?? '',
    comments: device?.comments ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const title = device ? 'Edit device' : 'Add device'

  if (organizations.length === 0) {
    return (
      <Modal title={title} onClose={onClose}>
        <p className="text-sm text-muted">Every device belongs to an organization. Add an organization first.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Close
          </button>
          <Link to="/organizations" onClick={onClose} className="btn-primary">
            Go to Organizations
          </Link>
        </div>
      </Modal>
    )
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const row = await saveDevice(values, device?.id)
      onSaved?.(row)
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Organization" required>
          <Select required {...bind('organization_id')}>
            <option value="">Select organization</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Brand">
            <Input {...bind('brand')} />
          </Field>
          <Field label="Device" required>
            <Input required {...bind('device')} />
          </Field>
          <Field label="Model">
            <Input {...bind('model')} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Installation date">
            <Input type="date" {...bind('installation_date')} />
          </Field>
          <Field label="Installed by">
            <Input {...bind('installed_by')} />
          </Field>
          <Field label="Last PPM done">
            <Input type="date" {...bind('last_ppm_date')} />
          </Field>
          <Field label="Next PPM">
            <Input type="date" {...bind('next_ppm_date')} />
          </Field>
        </div>
        <Field label="Comments">
          <Textarea {...bind('comments')} />
        </Field>
        <FormFooter error={error} saving={saving} onCancel={onClose} />
      </form>
    </Modal>
  )
}
