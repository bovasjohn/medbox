const control =
  'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60'

export function Field({ label, required = false, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-coral"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export function Input(props) {
  return <input className={control} {...props} />
}

export function Select({ children, ...props }) {
  return (
    <select className={control} {...props}>
      {children}
    </select>
  )
}

export function Textarea(props) {
  return <textarea rows={3} className={control} {...props} />
}
