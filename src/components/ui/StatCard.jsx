import { Link } from 'react-router-dom'

const TONES = {
  brand: { tile: 'bg-brand/10 text-brand', bar: 'bg-brand' },
  teal: { tile: 'bg-teal/10 text-teal', bar: 'bg-teal' },
  green: { tile: 'bg-green/10 text-green', bar: 'bg-green' },
  amber: { tile: 'bg-amber/15 text-amber', bar: 'bg-amber' },
  coral: { tile: 'bg-coral/10 text-coral', bar: 'bg-coral' },
  violet: { tile: 'bg-violet/10 text-violet', bar: 'bg-violet' },
}

export default function StatCard({ label, value, hint, icon: Icon, tone = 'brand', to }) {
  const t = TONES[tone]
  const card = (
    <div className="card relative h-full overflow-hidden p-5 transition-shadow hover:shadow-md">
      <span className={`absolute inset-x-0 top-0 h-1 ${t.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.tile}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  )
  return to ? (
    <Link to={to} className="block h-full rounded-xl">
      {card}
    </Link>
  ) : (
    card
  )
}
