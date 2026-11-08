import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../nav'

// Settings is reachable from the top bar on mobile, so the bottom bar keeps five items.
const ITEMS = NAV_ITEMS.filter((item) => item.to !== '/settings')

const SHORT_LABELS = { '/organizations': 'Orgs', '/ppm-reports': 'Reports' }

export default function MobileNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-brand' : 'text-muted'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{SHORT_LABELS[to] ?? label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
