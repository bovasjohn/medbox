import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NAV_ITEMS } from '../../nav'
import Logo from './Logo'

export default function Sidebar({ collapsed, onToggle }) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-surface transition-[width] duration-200 lg:flex ${
        collapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      <div className={`flex h-16 items-center gap-3 border-b border-line ${collapsed ? 'justify-center' : 'px-5'}`}>
        <Logo className="h-9 w-9 shrink-0" />
        {!collapsed && <span className="text-lg font-semibold tracking-tight">MedMaintain</span>}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${isActive ? 'bg-brand/10 text-brand' : 'text-muted hover:bg-brand/5 hover:text-ink'}`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-brand/5 hover:text-ink ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <ToggleIcon className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
