import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartEmpty, TOOLTIP_PROPS } from './shared'

const SEGMENTS = [
  { key: 'overdue', name: 'Overdue', fill: '#E65B65' },
  { key: 'upcoming', name: 'Due soon', fill: '#F2A93B' },
  { key: 'ok', name: 'On schedule', fill: '#20A66B' },
  { key: 'none', name: 'Not scheduled', fill: '#98A2B3' },
]

export default function StatusDonut({ counts }) {
  const data = SEGMENTS.map((s) => ({ ...s, value: counts[s.key] || 0 }))
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (!total) return <ChartEmpty text="Add devices to see PPM status" />

  return (
    <div>
      <div className="relative mx-auto h-52 max-w-[13rem]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.filter((d) => d.value > 0)}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            />
            <Tooltip {...TOOLTIP_PROPS} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold">{total}</span>
          <span className="text-xs text-muted">devices</span>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.fill }} />
            <span className="text-muted">{d.name}</span>
            <span className="ml-auto font-medium">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
