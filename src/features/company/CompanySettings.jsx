import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { Field, Input } from '../../components/ui/Field'
import { imageToDataUrl, readCompany, writeCompany } from '../../lib/company'

// One image slot (logo or signature) with choose / remove buttons and a preview.
function ImagePicker({ label, hint, value, onPick, onClear, previewClass }) {
  const input = useRef(null)
  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-20 w-40 items-center justify-center rounded-lg border border-dashed border-line bg-white p-2">
          {value ? (
            <img src={value} alt={`${label} preview`} className={previewClass} />
          ) : (
            <span className="text-xs text-slate-400">None</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => input.current?.click()} className="btn-secondary">
            <ImagePlus className="h-4 w-4" />
            {value ? 'Change' : 'Add'}
          </button>
          {value && (
            <button type="button" onClick={onClear} className="btn-secondary">
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = '' // allow choosing the same file again
            if (file) onPick(file)
          }}
        />
      </div>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </div>
  )
}

export default function CompanySettings() {
  const [company, setCompany] = useState(readCompany)
  const [message, setMessage] = useState({ type: '', text: '' })

  function update(next) {
    setCompany(next)
    if (writeCompany(next)) setMessage({ type: 'ok', text: 'Saved on this device.' })
    else setMessage({ type: 'error', text: 'Could not save. Browser storage is full or blocked.' })
  }

  async function pickImage(field, file, width, height) {
    try {
      const dataUrl = await imageToDataUrl(file, width, height)
      update({ ...company, [field]: dataUrl })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <section className="card p-5">
      <h2 className="font-medium">Company and report</h2>
      <p className="mt-1 text-sm text-muted">
        Shown on the HTML report: the logo at the top and the two signatures at the bottom. Saved on this device, so set
        it once on each device you print from.
      </p>

      <div className="mt-4 space-y-5">
        <Field label="Company name">
          <Input
            value={company.name}
            onChange={(e) => setCompany({ ...company, name: e.target.value })}
            onBlur={() => update(company)}
            placeholder="Your company name"
          />
        </Field>

        <ImagePicker
          label="Company logo"
          hint="Shown in the report header. A wide PNG with a transparent background works best."
          value={company.logo}
          onPick={(file) => pickImage('logo', file, 480, 160)}
          onClear={() => update({ ...company, logo: '' })}
          previewClass="max-h-16 max-w-full object-contain"
        />

        <ImagePicker
          label="Signature 1: PPM done by (optional)"
          hint="Printed in the “PPM done by” signature box. Without it, the box is left empty to sign by hand."
          value={company.signature}
          onPick={(file) => pickImage('signature', file, 400, 140)}
          onClear={() => update({ ...company, signature: '' })}
          previewClass="max-h-16 max-w-full object-contain"
        />

        <ImagePicker
          label="Signature 2: Reviewed & approved by (optional)"
          hint="Printed in the “Reviewed & approved by” signature box."
          value={company.signature2}
          onPick={(file) => pickImage('signature2', file, 400, 140)}
          onClear={() => update({ ...company, signature2: '' })}
          previewClass="max-h-16 max-w-full object-contain"
        />
      </div>

      {message.text && (
        <p
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`mt-4 text-sm ${message.type === 'error' ? 'text-coral' : 'text-green'}`}
        >
          {message.text}
        </p>
      )}
    </section>
  )
}
