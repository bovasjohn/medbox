import { useState } from 'react'
import Modal from '../../components/ui/Modal'
import { Field, Input, Textarea } from '../../components/ui/Field'
import FormFooter from '../../components/ui/FormFooter'
import { useData } from '../../context/DataContext'
import { useForm } from '../../lib/useForm'

export default function OrganizationForm({ organization, onClose, onSaved }) {
  const { saveOrganization } = useData()
  const { values, bind } = useForm({
    name: organization?.name ?? '',
    contact_person: organization?.contact_person ?? '',
    phone: organization?.phone ?? '',
    email: organization?.email ?? '',
    address: organization?.address ?? '',
    notes: organization?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const row = await saveOrganization(values, organization?.id)
      onSaved?.(row)
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title={organization ? 'Edit organization' : 'Add organization'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name" required>
          <Input required autoFocus {...bind('name')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact person">
            <Input {...bind('contact_person')} />
          </Field>
          <Field label="Phone">
            <Input type="tel" {...bind('phone')} />
          </Field>
        </div>
        <Field label="Email">
          <Input type="email" {...bind('email')} />
        </Field>
        <Field label="Address">
          <Textarea rows={2} {...bind('address')} />
        </Field>
        <Field label="Notes">
          <Textarea {...bind('notes')} />
        </Field>
        <FormFooter error={error} saving={saving} onCancel={onClose} />
      </form>
    </Modal>
  )
}
