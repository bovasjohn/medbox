// Chart styling that follows the light/dark theme through CSS variables.
export const AXIS_TICK = { fill: 'var(--muted)', fontSize: 12 }
export const GRID_STROKE = 'var(--line)'

export const TOOLTIP_PROPS = {
  contentStyle: {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 8,
    color: 'var(--ink)',
    fontSize: 12,
  },
  itemStyle: { color: 'var(--ink)' },
  labelStyle: { color: 'var(--muted)' },
  cursor: { fill: 'var(--line)', opacity: 0.4 },
}

export function ChartEmpty({ text = 'No data yet' }) {
  return <div className="flex h-48 items-center justify-center text-sm text-muted">{text}</div>
}
