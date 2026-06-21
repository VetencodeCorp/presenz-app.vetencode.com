import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import NetworkBanner from './components/NetworkBanner'
import Toast from './components/Toast'
import AttendanceScreen from './screens/AttendanceScreen'
import CameraScreen from './screens/CameraScreen'
import HomeScreen from './screens/HomeScreen'
import LoginScreen from './screens/LoginScreen'
import ProfileScreen from './screens/ProfileScreen'
import ReportScreen from './screens/ReportScreen'
import RequestScreen from './screens/RequestScreen'
import { useAuthStore } from './store/useAuthStore'
import { useNetworkStore } from './store/useNetworkStore'

function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const employee = useAuthStore((state) => state.employee)
  const location = useLocation()

  if (!isAuthenticated || !employee) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const hideNav = location.pathname.startsWith('/camera')
  return <><Outlet />{!hideNav && <BottomNav />}</>
}

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { cleanup } = useNetworkStore()

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  return (
    <div className="mobile-shell">
      <Toast />
      <NetworkBanner />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginScreen />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/attendance" element={<AttendanceScreen />} />
          <Route path="/camera/:mode" element={<CameraScreen />} />
          <Route path="/report" element={<ReportScreen />} />
          <Route path="/request" element={<RequestScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  )
}