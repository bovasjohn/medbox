import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import SuggestInput from '../../components/ui/SuggestInput'
import FormFooter from '../../components/ui/FormFooter'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../lib/useForm'
import { addMonths, todayStr } from '../../lib/dates'
import { readCompany } from '../../lib/company'
import { suggest } from '../../lib/suggest'
import { defaultItems } from '../../lib/ppmItems'
import { defaultChecklist } from '../../lib/checklist'
import ReportModal from './ReportModal'

const RESULTS = [
  { value: 'Pass', active: 'bg-green text-white' },
  { value: 'Fail', active: 'bg-coral text-white' },
]

// Default gap between inspections, editable in the form.
const DEFAULT_INTERVAL_MONTHS = 6

let rowCounter = 0
const withKeys = (rows) => rows.map((row) => ({ ...row, key: ++rowCounter }))
const blankRow = () => ({ key: ++rowCounter, kind: '', description: '', part_no: '', status: '', comments: '', replacement: '' })
const trimAll = (object) => Object.fromEntries(Object.entries(object).map(([k, v]) => [k, String(v ?? '').trim()]))

function applyBattery(rows, percent) {
  return rows.map((row) =>
    row.kind === 'battery' ? { ...row, status: percent === '' ? '' : `${percent}% remaining` } : row,
  )
}

// Records one inspection as a new report. Pass deviceId to lock the device, or omit it to pick one.
export default function PerformPpmModal({ deviceId, onClose }) {
  const { devices, deviceById, orgById, reports, accessoriesByDevice, savePpmReport } = useData()
  const { user } = useAuth()
  const today = todayStr()
  const company = useMemo(() => readCompany(), [])

  // Sign-off details are remembered from earlier reports so they do not need retyping.
  const lastSignoff = reports[0]?.signoff
  const doneByFor = (name) => {
    const key = (name || '').trim().toLowerCase()
    if (!key) return null
    return reports.find((r) => (r.technician || '').trim().toLowerCase() === key && r.signoff?.done_by)?.signoff.done_by ?? null
  }
  const initialTechnician = user.displayName || ''
  const initialDone = doneByFor(initialTechnician) ?? lastSignoff?.done_by ?? {}
  const initialReviewer = lastSignoff?.reviewed_by ?? {}

  // Remembered per customer: the latest report for any device of the same organization.
  const lastForCustomer = (id) => {
    const org = deviceById.get(id)?.organization_id
    return org ? reports.find((r) => deviceById.get(r.device_id)?.organization_id === org) : null
  }
  const { values, setValues, bind } = useForm({
    device_id: deviceId ?? '',
    inspection_date: today,
    report_title: (deviceId && lastForCustomer(deviceId)?.report_title) || reports[0]?.report_title || 'INSPECTION REPORT - PPM',
    technician: initialTechnician,
    result: 'Pass',
    battery_percent: '',
    comments: '',
    work_performed: '',
    findings: '',
    recommendations: '',
    next_ppm_date: addMonths(today, DEFAULT_INTERVAL_MONTHS),
    done_title: initialDone.title ?? '',
    done_mobile: initialDone.mobile ?? '',
    done_email: initialDone.email ?? '',
    done_company: initialDone.company || company.name || '',
    rev_name: initialReviewer.name ?? '',
    rev_title: initialReviewer.title ?? '',
    rev_mobile: initialReviewer.mobile ?? '',
    rev_email: initialReviewer.email ?? '',
    rev_company: initialReviewer.company || company.name || '',
  })
  const [items, setItems] = useState(() =>
    deviceId ? withKeys(defaultItems(deviceById.get(deviceId), accessoriesByDevice.get(deviceId))) : [],
  )
  // Page 2 is optional; start from what the device's last report used.
  const checklistFor = (id) => {
    const last = lastForCustomer(id)
    return { ...defaultChecklist(), enabled: last ? last.checklist?.enabled !== false : true }
  }
  const [checklist, setChecklist] = useState(() => checklistFor(deviceId))
  const [nextEdited, setNextEdited] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [partial, setPartial] = useState(false)
  const [saved, setSaved] = useState(null)

  // Suggestions from earlier reports.
  const options = useMemo(() => {
    const rows = reports.flatMap((r) => r.inspection_items ?? [])
    const field = (name) => rows.map((row) => row[name])
    const person = (side, name) => reports.map((r) => r.signoff?.[side]?.[name])
    return {
      technician: suggest(reports.map((r) => r.technician), user.displayName ? [user.displayName] : []),
      title: suggest(reports.map((r) => r.report_title), ['INSPECTION REPORT - PPM', 'PPM REPORT', 'INSPECTION REPORT', 'PREVENTIVE MAINTENANCE REPORT', 'Inspection, Preventive Maintenance & Calibration Results']),
      description: suggest(field('description')),
      part_no: suggest([...field('part_no'), ...[...accessoriesByDevice.values()].flat().map((a) => a.model)]),
      status: suggest(field('status'), ['Ok', 'Good', 'NIL']),
      comments: suggest(field('comments'), ['Pass', 'Good', 'NIL', 'Physically ok - Pass']),
      replacement: suggest(field('replacement')),
      done_title: suggest(person('done_by', 'title')),
      done_mobile: suggest(person('done_by', 'mobile')),
      done_email: suggest(person('done_by', 'email')),
      company: suggest([...person('done_by', 'company'), ...person('reviewed_by', 'company')], company.name ? [company.name] : []),
      rev_name: suggest(person('reviewed_by', 'name')),
      rev_title: suggest(person('reviewed_by', 'title')),
      rev_mobile: suggest(person('reviewed_by', 'mobile')),
      rev_email: suggest(person('reviewed_by', 'email')),
    }
  }, [reports, accessoriesByDevice, user.displayName, company.name])

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

  function changeDevice(e) {
    const id = e.target.value
    setChecklist(checklistFor(id))
    const last = lastForCustomer(id)
    if (last?.report_title) setValues((v) => ({ ...v, report_title: last.report_title }))
    setValues((v) => ({ ...v, device_id: id }))
    setItems(applyBattery(withKeys(defaultItems(deviceById.get(id), accessoriesByDevice.get(id))), values.battery_percent))
  }

  function changeInspectionDate(e) {
    const date = e.target.value
    setValues((v) => ({
      ...v,
      inspection_date: date,
      // Suggest the next date until the person sets it themselves.
      ...(date && !nextEdited ? { next_ppm_date: addMonths(date, DEFAULT_INTERVAL_MONTHS) } : {}),
    }))
  }

  function changeBattery(e) {
    const percent = e.target.value
    setValues((v) => ({ ...v, battery_percent: percent }))
    setItems((rows) => applyBattery(rows, percent))
  }

  // When a known technician is typed, bring in the title, mobile and email used before.
  function lookupTechnician() {
    const known = doneByFor(values.technician)
    if (!known) return
    setValues((v) => ({
      ...v,
      done_title: known.title ?? '',
      done_mobile: known.mobile ?? '',
      done_email: known.email ?? '',
      done_company: known.company || v.done_company,
    }))
  }

  const setTest = (index, pass) =>
    setChecklist((c) => ({ ...c, tests: c.tests.map((t, i) => (i === index ? { ...t, pass } : t)) }))
  const setCalibration = (index, patch) =>
    setChecklist((c) => ({ ...c, calibration: c.calibration.map((r, i) => (i === index ? { ...r, ...patch } : r)) }))

  const setItem = (key, field, value) =>
    setItems((rows) => rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)))

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const rows = items
        .map(({ description, part_no, status, comments, replacement }) =>
          trimAll({ description, part_no, status, comments, replacement }),
        )
        .filter((row) => Object.values(row).some(Boolean))

      setSaved(
        await savePpmReport({
          device_id: values.device_id,
          inspection_date: values.inspection_date,
          technician: values.technician,
          result: values.result,
          battery_percent: values.battery_percent === '' ? null : Number(values.battery_percent),
          report_title: values.report_title,
          inspection_items: rows,
          checklist,
          comments: values.comments,
          work_performed: values.work_performed,
          findings: values.findings,
          recommendations: values.recommendations,
          next_ppm_date: values.next_ppm_date,
          signoff: {
            done_by: trimAll({
              title: values.done_title,
              mobile: values.done_mobile,
              email: values.done_email,
              company: values.done_company,
            }),
            reviewed_by: trimAll({
              name: values.rev_name,
              title: values.rev_title,
              mobile: values.rev_mobile,
              email: values.rev_email,
              company: values.rev_company,
            }),
          },
        }),
      )
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
            <Select required value={values.device_id} onChange={changeDevice}>
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

        <Field label="Report title" hint="Printed at the top of the report. Pick one or type your own.">
          <SuggestInput options={options.title} {...bind('report_title')} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Inspection date" required>
            <Input type="date" required value={values.inspection_date} onChange={changeInspectionDate} />
          </Field>
          <Field label="Next PPM date" required hint="Suggested from the inspection date. It becomes the device's next PPM.">
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

        <div className="rounded-xl border border-line p-4">
          <h3 className="text-sm font-semibold text-brand">Inspection / PPM report items</h3>
          <p className="mb-3 mt-1 text-xs text-muted">
            These rows form the table in the report. They start from the device's accessories; edit, add or remove rows.
          </p>

          <div className="mb-4 max-w-xs">
            <Field label="Battery level (%)" hint="Fills the battery row as “56% remaining”. Leave empty if not checked.">
              <Input
                type="number"
                inputMode="numeric"
                min="0"
                max="100"
                step="1"
                placeholder="0 – 100"
                value={values.battery_percent}
                onChange={changeBattery}
              />
            </Field>
          </div>

          {!values.device_id && items.length === 0 && (
            <p className="rounded-lg bg-brand/5 px-3 py-2 text-sm text-muted">Select a device to load its items.</p>
          )}

          <div className="space-y-3">
            {items.map((row, index) => (
              <div key={row.key} className="rounded-lg border border-line bg-app/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted">Item {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => setItems((rows) => rows.filter((r) => r.key !== row.key))}
                    aria-label={`Remove item ${index + 1}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-coral/10 hover:text-coral"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                  <div className="col-span-2 md:col-span-2">
                    <Field label="Description">
                      <SuggestInput
                        options={options.description}
                        value={row.description}
                        onChange={(e) => setItem(row.key, 'description', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Part no.">
                      <SuggestInput
                        options={options.part_no}
                        value={row.part_no}
                        onChange={(e) => setItem(row.key, 'part_no', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Status / expiry">
                      <SuggestInput
                        options={options.status}
                        value={row.status}
                        onChange={(e) => setItem(row.key, 'status', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="col-span-1 md:col-span-3">
                    <Field label="Comments">
                      <SuggestInput
                        options={options.comments}
                        value={row.comments}
                        onChange={(e) => setItem(row.key, 'comments', e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="col-span-1 md:col-span-3">
                    <Field label="Replacement">
                      <SuggestInput
                        options={options.replacement}
                        value={row.replacement}
                        onChange={(e) => setItem(row.key, 'replacement', e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => setItems((rows) => [...rows, blankRow()])} className="btn-secondary mt-3">
            <Plus className="h-4 w-4" />
            Add item
          </button>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">Report format</span>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Report format">
            {[
              { full: true, title: 'Full report', text: 'Equipment table, standard tests, calibration, items, comments, signatures.' },
              { full: false, title: 'Report only', text: 'Customer header, items table, comments, signatures. One page.' },
            ].map((f) => (
              <button
                key={f.title}
                type="button"
                role="radio"
                aria-checked={checklist.enabled === f.full}
                onClick={() => setChecklist((c) => ({ ...c, enabled: f.full }))}
                className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                  checklist.enabled === f.full ? 'border-brand bg-brand/5' : 'border-line hover:border-brand/50'
                }`}
              >
                <span className="block font-medium">{f.title}</span>
                <span className="block text-xs text-muted">{f.text}</span>
              </button>
            ))}
          </div>
          <span className="mt-1 block text-xs text-muted">Remembered for each customer. The report title below works in both.</span>
        </div>

        {checklist.enabled && (
        <details className="rounded-xl border border-line px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium">
            Standard tests{' '}
            <span className="font-normal text-muted">
              — {checklist.tests.filter((t) => !t.pass).length + checklist.calibration.filter((r) => !r.pass).length} failed
            </span>
          </summary>
          <div className="mt-3 space-y-4">
            <p className="text-xs text-muted">The same tests are printed on every report. All start as Pass; untick a test that failed.</p>
            <div className="space-y-1">
              {checklist.tests.map((t, i) => (
                <label key={t.test} className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={t.pass} onChange={(e) => setTest(i, e.target.checked)} />
                  <span className={t.pass ? '' : 'text-coral'}>{t.test}</span>
                </label>
              ))}
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold">Output energy (±15%), adult pad used</h4>
              <div className="space-y-2">
                {checklist.calibration.map((r, i) => (
                  <div key={r.wave} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 sm:grid-cols-[8rem_8rem_1fr_auto]">
                    <span className="col-span-3 text-sm font-medium sm:col-span-1 sm:pb-2">{r.wave}</span>
                    <span className="text-xs text-muted sm:pb-2">Expected: {r.expected}</span>
                    <Input
                      aria-label={`${r.wave} measured value`}
                      value={r.measured}
                      onChange={(e) => setCalibration(i, { measured: e.target.value })}
                      placeholder="Measured value"
                    />
                    <label className="flex items-center gap-1 pb-2 text-sm">
                      <input type="checkbox" checked={r.pass} onChange={(e) => setCalibration(i, { pass: e.target.checked })} />
                      Pass
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>
        )}

        <Field
          label="Comments from service engineer"
          hint="One point per line. Each line is printed as a bullet in the report."
        >
          <Textarea
            rows={5}
            placeholder={'AED pads are working fine.\nAED battery in working condition\nOverall, the AED passed the inspection'}
            {...bind('comments')}
          />
        </Field>

        <details className="rounded-xl border border-line px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium">More notes (optional)</summary>
          <div className="mt-3 space-y-4">
            <p className="text-xs text-muted">If filled in, these are added as extra lines under the comments in the report.</p>
            <Field label="Work performed">
              <Textarea {...bind('work_performed')} />
            </Field>
            <Field label="Findings">
              <Textarea {...bind('findings')} />
            </Field>
            <Field label="Recommendations">
              <Textarea {...bind('recommendations')} />
            </Field>
          </div>
        </details>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-line p-4">
            <h3 className="mb-3 text-sm font-semibold text-brand">Inspection/PPM done by</h3>
            <div className="space-y-3">
              <Field label="Name" required>
                <SuggestInput
                  required
                  options={options.technician}
                  value={values.technician}
                  onChange={(e) => setValues((v) => ({ ...v, technician: e.target.value }))}
                  onBlur={lookupTechnician}
                />
              </Field>
              <Field label="Title">
                <SuggestInput options={options.done_title} {...bind('done_title')} />
              </Field>
              <Field label="Mobile">
                <SuggestInput type="tel" options={options.done_mobile} {...bind('done_mobile')} />
              </Field>
              <Field label="Email">
                <SuggestInput type="email" options={options.done_email} {...bind('done_email')} />
              </Field>
              <Field label="Company">
                <SuggestInput options={options.company} {...bind('done_company')} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-line p-4">
            <h3 className="mb-3 text-sm font-semibold text-brand">Reviewed &amp; approved by</h3>
            <div className="space-y-3">
              <Field label="Name">
                <SuggestInput options={options.rev_name} {...bind('rev_name')} />
              </Field>
              <Field label="Title">
                <SuggestInput options={options.rev_title} {...bind('rev_title')} />
              </Field>
              <Field label="Mobile">
                <SuggestInput type="tel" options={options.rev_mobile} {...bind('rev_mobile')} />
              </Field>
              <Field label="Email">
                <SuggestInput type="email" options={options.rev_email} {...bind('rev_email')} />
              </Field>
              <Field label="Company">
                <SuggestInput options={options.company} {...bind('rev_company')} />
              </Field>
            </div>
          </div>
        </div>

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
