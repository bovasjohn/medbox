const STYLES = {
  coral: 'bg-coral/10 text-[#C23A45] dark:text-coral',
  amber: 'bg-amber/15 text-[#9A6410] dark:text-amber',
  green: 'bg-green/10 text-[#15804F] dark:text-green',
  violet: 'bg-violet/10 text-[#6A52C4] dark:text-violet',
  brand: 'bg-brand/10 text-brand',
  slate: 'bg-muted/10 text-muted',
}

export function StatusBadge({ color = 'slate', children }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[color]}`}
    >
      {children}
    </span>
  )
}

const PPM = {
  overdue: ['coral', 'Overdue'],
  upcoming: ['amber', 'Due soon'],
  ok: ['green', 'On schedule'],
  none: ['slate', 'Not scheduled'],
}

export function PpmBadge({ status }) {
  const [color, label] = PPM[status]
  return <StatusBadge color={color}>{label}</StatusBadge>
}

const EXPIRY = {
  expired: ['coral', 'Expired'],
  expiring: ['amber', 'Expiring soon'],
  ok: ['green', 'OK'],
  none: ['slate', 'No expiry'],
}

export function ExpiryBadge({ status }) {
  const [color, label] = EXPIRY[status]
  return <StatusBadge color={color}>{label}</StatusBadge>
}

export function ResultBadge({ result }) {
  return <StatusBadge color={result === 'Pass' ? 'green' : 'coral'}>{result}</StatusBadge>
}
