import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AXIS_TICK, ChartEmpty, GRID_STROKE, TOOLTIP_PROPS } from './shared'

// One bar per row of { name, value }. Used for devices per organization and technician activity.
export default function HorizontalBars({ data, color = '#356AE6', label = 'Count' }) {
  if (!data.length) return <ChartEmpty />
  const height = Math.max(160, data.length * 38 + 30)

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke={GRID_STROKE} />
          <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
          />
          <Tooltip {...TOOLTIP_PROPS} />
          <Bar dataKey="value" name={label} fill={color} radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
