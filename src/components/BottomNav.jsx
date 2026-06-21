import { Camera, ClipboardList, FileText, Home, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { COLORS } from '../constants/colors'

const items = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/attendance', label: 'Absen', icon: Camera },
  { to: '/report', label: 'Laporan', icon: ClipboardList },
  { to: '/request', label: 'Pengajuan', icon: FileText },
  { to: '/profile', label: 'Profil', icon: User },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 flex h-[72px] w-full max-w-[430px] -translate-x-1/2 items-stretch border-t pb-2" style={{ background: COLORS.white, borderColor: COLORS.border }}>
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === '/'} className="relative flex flex-1 flex-col items-center justify-center gap-1 no-underline">
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute top-0 h-1 w-8 rounded-full" style={{ background: COLORS.terracotta }} />}
              <Icon size={27} strokeWidth={2.35} color={isActive ? COLORS.terracotta : COLORS.inkSoft} />
              <span className="text-[13px] font-bold" style={{ color: isActive ? COLORS.terracotta : COLORS.inkSoft }}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
