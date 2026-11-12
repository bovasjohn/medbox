import { useData } from '../../context/DataContext'
import { Spinner } from './Spinner'

// Error message plus Cancel / Save buttons. Saving is blocked while offline.
export default function FormFooter({
  error,
  saving,
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  hideSubmit = false,
}) {
  const { online } = useData()

  return (
    <div className="mt-6 space-y-3">
      {!online && (
        <p role="status" className="rounded-lg bg-amber/15 px-3 py-2 text-sm">
          You are offline. Reconnect to save; what you typed stays in this form.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-[#C23A45] dark:text-coral">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {cancelLabel}
        </button>
        {!hideSubmit && (
          <button type="submit" disabled={saving || !online} className="btn-primary">
            {saving && <Spinner className="h-4 w-4" tone="white" />}
            {submitLabel}
          </button>
        )}
      </div>
    </div>
  )
}
