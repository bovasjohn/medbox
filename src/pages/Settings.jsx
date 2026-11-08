import { LogOut, Moon, Sun } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

export default function Settings() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <>
      <PageHeader title="Settings" subtitle="Appearance and account" />

      <div className="grid max-w-2xl gap-4">
        <section className="card p-5">
          <h2 className="font-medium">Appearance</h2>
          <p className="mt-1 text-sm text-muted">Your choice is remembered on this device.</p>
          <div className="mt-4 inline-flex rounded-lg border border-line p-1" role="radiogroup" aria-label="Theme">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={theme === value}
                onClick={() => setTheme(value)}
                className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  theme === value ? 'bg-brand text-white' : 'text-muted hover:text-ink'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-medium">Account</h2>
          <p className="mt-1 text-sm text-muted">
            Signed in as <span className="font-medium text-ink">{user.displayName || 'User'}</span>
            {user.email && ` (${user.email})`}
          </p>
          <button type="button" onClick={logout} className="btn-secondary mt-4">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </section>
      </div>
    </>
  )
}
