import { useMemo, useState } from 'react'
import Modal from '../../components/ui/Modal'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import FormFooter from '../../components/ui/FormFooter'
import SuggestInput from '../../components/ui/SuggestInput'
import { suggest } from '../../lib/suggest'
import { useData } from '../../context/DataContext'
import { useForm } from '../../lib/useForm'

const DEFAULT_TYPES = ['Pads', 'Battery', 'Other']
const NEW_TYPE = '__new__'

export default function AccessoryForm({ deviceId, accessory, onClose }) {
  const { accessories, saveAccessory } = useData()
  const { values, bind } = useForm({
    category: accessory?.category ?? 'Pads',
    name: accessory?.name ?? '',
    model: accessory?.model ?? '',
    expiry_date: accessory?.expiry_date ?? '',
    quantity: accessory?.quantity ?? '',
    comments: accessory?.comments ?? '',
  })
  const [newType, setNewType] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Custom types are simply the other categories already used on any accessory.
  const customTypes = useMemo(
    () => [...new Set(accessories.map((a) => a.category).filter((c) => c && !DEFAULT_TYPES.includes(c)))].sort(),
    [accessories],
  )

  // Suggest names and models already used, starting with accessories of the same type.
  const options = useMemo(() => {
    const sameType = accessories.filter((a) => a.category === values.category)
    const source = sameType.length ? sameType : accessories
    return { name: suggest(source.map((a) => a.name)), model: suggest(source.map((a) => a.model)) }
  }, [accessories, values.category])

  async function submit(e) {
    e.preventDefault()
    let category = values.category
    if (category === NEW_TYPE) {
      const typed = newType.trim()
      if (!typed) {
        setError('Enter a name for the new accessory type.')
        return
      }
      // Reuse an existing type if it only differs by letter case.
      category = [...DEFAULT_TYPES, ...customTypes].find((t) => t.toLowerCase() === typed.toLowerCase()) ?? typed
    }

    setSaving(true)
    setError('')
    try {
      await saveAccessory(
        {
          device_id: deviceId,
          category,
          name: values.name,
          model: values.model,
          expiry_date: values.expiry_date,
          quantity: values.quantity === '' ? null : Number(values.quantity),
          comments: values.comments,
        },
        accessory?.id,
      )
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title={accessory ? 'Edit accessory' : 'Add accessory'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Type" required>
          <Select {...bind('category')}>
            {DEFAULT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            {customTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value={NEW_TYPE}>+ Add new type…</option>
          </Select>
        </Field>
        {values.category === NEW_TYPE && (
          <Field label="New type name" required>
            <Input value={newType} onChange={(e) => setNewType(e.target.value)} autoFocus />
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Accessory name" required>
            <SuggestInput required options={options.name} {...bind('name')} />
          </Field>
          <Field label="Model / part no.">
            <SuggestInput options={options.model} {...bind('model')} />
          </Field>
          <Field label="Expiry date">
            <Input type="date" {...bind('expiry_date')} />
          </Field>
          <Field label="Quantity">
            <Input type="number" min="0" step="1" {...bind('quantity')} />
          </Field>
        </div>
        <Field label="Comments">
          <Textarea rows={2} {...bind('comments')} />
        </Field>
        <FormFooter error={error} saving={saving} onCancel={onClose} />
      </form>
    </Modal>
  )
}
