export function Spinner({ className = 'h-6 w-6', tone = 'brand' }) {
  const colors = tone === 'white' ? 'border-white/30 border-t-white' : 'border-brand/25 border-t-brand'
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 ${colors} ${className}`}
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

export function PageSpinner() {
  return (
    <div className="flex justify-center py-24">
      <Spinner className="h-8 w-8" />
    </div>
  )
}
