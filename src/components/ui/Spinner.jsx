export function Spinner({ className = 'h-6 w-6' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-brand/25 border-t-brand ${className}`}
    />
  )
}

export function FullScreenSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-app">
      <Spinner className="h-8 w-8" />
    </div>
  )
}
