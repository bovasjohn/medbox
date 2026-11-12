import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DataProvider } from '../../context/DataContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import OfflineBanner from './OfflineBanner'

const KEY = 'mm-sidebar-collapsed'

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })

  const toggle = () => {
    const next = !collapsed
    try {
      localStorage.setItem(KEY, next ? '1' : '0')
    } catch {
      /* ignore */
    }
    setCollapsed(next)
  }

  return (
    <DataProvider>
      <div className="min-h-dvh">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
        <div className={`transition-[padding] duration-200 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-64'}`}>
          <Topbar />
          <OfflineBanner />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:pb-10">
            <Outlet />
          </main>
        </div>
        <MobileNav />
      </div>
    </DataProvider>
  )
}
