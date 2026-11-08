import { LayoutDashboard, HeartPulse, Building2, ClipboardCheck, BarChart3, Settings } from 'lucide-react'

// Single source of truth for navigation (sidebar, mobile bar and routes).
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/devices', label: 'Devices', icon: HeartPulse },
  { to: '/organizations', label: 'Organizations', icon: Building2 },
  { to: '/ppm-reports', label: 'PPM Reports', icon: ClipboardCheck },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]
