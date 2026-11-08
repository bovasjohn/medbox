import { Link } from 'react-router-dom'
import { LogOut, Moon, Settings, Sun } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Logo from './Logo'

function Avatar({ user }) {
  if (user.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt=""
        referrerPolicy="no-referrer"
        className="h-8 w-8 rounded-full border border-line object-cover"
      />
    )
  }
  const initial = (user.displayName || user.email || '?').charAt(0).toUpperCase()
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet text-sm font-semibold text-white">
      {initial}
    </span>
  )
}

const iconButton =
  'flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-brand/5 hover:text-ink'

export default function Topbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Logo className="h-8 w-8" />
        <span className="font-semibold tracking-tight">MedMaintain</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleTheme}
          className={iconButton}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <Link to="/settings" className={`${iconButton} lg:hidden`} aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Link>

        <div className="ml-1 flex items-center gap-2 border-l border-line pl-3">
          <Avatar user={user} />
          <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:block">
            {user.displayName || user.email}
          </span>
          <button type="button" onClick={logout} className={iconButton} aria-label="Sign out" title="Sign out">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
