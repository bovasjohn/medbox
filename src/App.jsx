import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabaseConfigured } from './lib/supabase'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import SetupNeeded from './pages/SetupNeeded'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Devices from './pages/Devices'
import DeviceDetail from './pages/DeviceDetail'
import Organizations from './pages/Organizations'
import OrganizationDetail from './pages/OrganizationDetail'
import PpmReports from './pages/PpmReports'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'

export default function App() {
  // Without Supabase keys the app cannot sign anyone in, so explain what to do.
  if (!supabaseConfigured) return <SetupNeeded />

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="devices" element={<Devices />} />
              <Route path="devices/:id" element={<DeviceDetail />} />
              <Route path="organizations" element={<Organizations />} />
              <Route path="organizations/:id" element={<OrganizationDetail />} />
              <Route path="ppm-reports" element={<PpmReports />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
