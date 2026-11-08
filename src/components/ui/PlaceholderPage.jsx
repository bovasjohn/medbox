import PageHeader from './PageHeader'

// Temporary page body used until each module is built in its own phase.
export default function PlaceholderPage({ title, subtitle, icon: Icon, phase, items }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="card flex flex-col items-center px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <Icon className="h-7 w-7" />
        </span>
        <p className="mt-4 text-base font-medium">Coming in {phase}</p>
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </>
  )
}
