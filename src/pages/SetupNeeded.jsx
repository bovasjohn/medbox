import { KeyRound } from 'lucide-react'

const code = 'rounded bg-brand/10 px-1.5 py-0.5 text-brand'

export default function SetupNeeded() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-app px-4">
      <div className="card w-full max-w-lg p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber/15 text-amber">
          <KeyRound className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">Supabase is not configured</h1>
        <p className="mt-2 text-sm text-muted">
          Copy <code className={code}>.env.example</code> to <code className={code}>.env.local</code>, fill in{' '}
          <code className={code}>VITE_SUPABASE_URL</code> and <code className={code}>VITE_SUPABASE_ANON_KEY</code>,
          then restart the dev server (or rebuild before uploading to Cloudflare).
        </p>
      </div>
    </div>
  )
}
