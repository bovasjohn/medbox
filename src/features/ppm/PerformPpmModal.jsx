import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../../components/ui/Modal'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import FormFooter from '../../components/ui/FormFooter'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../lib/useForm'
import { addMonths, todayStr } from '../../lib/dates'
import ReportModal from './ReportModal'

const RESULTS = [
  { value: 'Pass', active: 'bg-green text-white' },
  { value: 'Fail', active: 'bg-coral text-white' },
]

// Default gap between inspections, editable in the form.
const DEFAULT_INTERVAL_MONTHS = 6

// Records one inspection as a new report. Pass deviceId to lock the device, or omit it to pick one.
export default function PerformPpmModal({ deviceId, onClose }) {
  const { devices, orgById, savePpmReport } = useData()
  const { user } = useAuth()
  const today = todayStr()

  const { values, setValues, bind } = useForm({
    device_id: deviceId ?? '',
    inspection_date: today,
    technician: user.displayName || '',
    result: 'Pass',
    work_performed: '',
    findings: '',
    recommendations: '',
    next_ppm_date: addMonths(today, DEFAULT_INTERVAL_MONTHS),
    comments: '',
  })
  const [nextEdited, setNextEdited] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [partial, setPartial] = useState(false)
  const [saved, setSaved] = useState(null)

  if (saved) return <ReportModal report={saved} onClose={onClose} />

  if (devices.length === 0) {
    return (
      <Modal title="Perform PPM" onClose={onClose}>
        <p className="text-sm text-muted">There are no devices yet. Add a device before performing a PPM.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Close
          </button>
          <Link to="/devices" onClick={onClose} className="btn-primary">
            Go to Devices
          </Link>
        </div>
      </Modal>
    )
  }

  const sortedDevices = [...devices].sort((a, b) =>
    `${orgById.get(a.organization_id)?.name ?? ''} ${a.device}`.localeCompare(
      `${orgById.get(b.organization_id)?.name ?? ''} ${b.device}`,
    ),
  )

  function changeInspectionDate(e) {
    const date = e.target.value
    setValues((v) => ({
      ...v,
      inspection_date: date,
      // Suggest the next date until the person sets it themselves.
      ...(date && !nextEdited ? { next_ppm_date: addMonths(date, DEFAULT_INTERVAL_MONTHS) } : {}),
    }))
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      setSaved(await savePpmReport(values))
    } catch (err) {
      setError(err.message)
      if (err.partial) setPartial(true)
      setSaving(false)
    }
  }

  return (
    <Modal title="Perform PPM" onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        {!deviceId && (
          <Field label="Device" required>
            <Select required {...bind('device_id')}>
              <option value="">Select device</option>
              {sortedDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {orgById.get(d.organization_id)?.name ?? '—'} — {d.device}
                  {d.model ? ` (${d.model})` : ''}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Inspection date" required>
            <Input type="date" required value={values.inspection_date} onChange={changeInspectionDate} />
          </Field>
          <Field label="Technician" required>
            <Input required {...bind('technician')} />
          </Field>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">
            Result <span className="text-coral">*</span>
          </span>
          <div className="inline-flex rounded-lg border border-line p-1" role="radiogroup" aria-label="Result">
            {RESULTS.map(({ value, active }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={values.result === value}
                onClick={() => setValues((v) => ({ ...v, result: value }))}
                className={`rounded-md px-6 py-1.5 text-sm font-medium transition-colors ${
                  values.result === value ? active : 'text-muted hover:text-ink'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <Field label="Work performed">
          <Textarea {...bind('work_performed')} />
        </Field>
        <Field label="Findings">
          <Textarea {...bind('findings')} />
        </Field>
        <Field label="Recommendations">
          <Textarea {...bind('recommendations')} />
        </Field>

        <Field
          label="Next PPM date"
          required
          hint="Suggested from the inspection date. This becomes the device's next PPM."
        >
          <Input
            type="date"
            required
            value={values.next_ppm_date}
            onChange={(e) => {
              setNextEdited(true)
              setValues((v) => ({ ...v, next_ppm_date: e.target.value }))
            }}
          />
        </Field>
        <Field label="Comments">
          <Textarea rows={2} {...bind('comments')} />
        </Field>

        <FormFooter
          error={error}
          saving={saving}
          onCancel={onClose}
          submitLabel="Save report"
          cancelLabel={partial ? 'Close' : 'Cancel'}
          hideSubmit={partial}
        />
      </form>
    </Modal>
  )
}
