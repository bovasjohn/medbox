import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AXIS_TICK, ChartEmpty, GRID_STROKE, TOOLTIP_PROPS } from './shared'

// Completed PPM inspections per month, split into Pass and Fail.
export default function MonthlyBars({ data }) {
  if (!data.some((m) => m.pass || m.fail)) return <ChartEmpty text="No completed PPM yet" />

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -12, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip {...TOOLTIP_PROPS} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="pass" name="Pass" stackId="ppm" fill="#20A66B" maxBarSize={32} />
          <Bar dataKey="fail" name="Fail" stackId="ppm" fill="#E65B65" maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
