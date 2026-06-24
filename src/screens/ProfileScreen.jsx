import { Bell, Briefcase, ChevronRight, HelpCircle, Lock, LogOut, Phone, Mail, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { COLORS } from '../constants/colors'
import { useAuthStore } from '../store/useAuthStore'
import { useAttendanceStore } from '../store/useAttendanceStore'
import api from '../lib/axios'
import { useReportStore } from '../store/useReportStore'

function InfoRow({ icon: Icon, label, value }) {
  return <div className="flex min-h-[64px] items-center border-b px-5 last:border-b-0" style={{ borderColor: COLORS.border }}>
    <Icon size={24} color={COLORS.terracotta} />
    <span className="ml-4 flex-1 text-[15px]" style={{ color: COLORS.inkSoft }}>{label}</span>
    <b className="text-[15px]" style={{ color: COLORS.ink }}>{value || '-'}</b>
  </div>
}

function MenuRow({ icon: Icon, label, danger, onClick }) {
  return <button onClick={onClick} className="flex min-h-[60px] w-full items-center border-b px-5 text-left last:border-b-0" style={{ borderColor: COLORS.border }}>
    <Icon size={24} color={danger ? COLORS.rust : COLORS.inkSoft} />
    <span className="ml-4 flex-1 text-[16px] font-semibold" style={{ color: danger ? COLORS.rust : COLORS.ink }}>{label}</span>
    {!danger && <ChevronRight color={COLORS.inkSoft} />}
  </button>
}

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { employee, logout } = useAuthStore()
  const resetAttendance = useAttendanceStore((state) => state.resetAttendance)
  const resetReport = useReportStore((state) => state.resetReport)

  const signOut = () => {
    api.post('/logout').catch(() => {})
    resetAttendance()
    resetReport()
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="screen safe-bottom pt-14">
      <section className="mb-8 text-center">
        <div className="mx-auto inline-block">
          <Avatar
            name={employee?.name}
            src={employee?.photo}
            size={96}
            rounded="full"
            bg={COLORS.terracotta}
            textColor={COLORS.white}
            borderColor="transparent"
            fontSize={36}
            shadow="0 8px 20px rgba(201,99,66,0.3)"
          />
        </div>
        <h1 className="fraunces mt-4 text-[26px] font-bold" style={{ color: COLORS.ink }}>{employee?.name}</h1>
        <span className="mt-3 inline-flex rounded-full px-5 py-2 text-[14px] font-bold" style={{ background: COLORS.sageBg, color: COLORS.sage }}>{employee?.role || 'Karyawan'}</span>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: COLORS.border }}>
        <InfoRow icon={Briefcase} label="NIP" value={employee?.nip} />
        <InfoRow icon={Phone} label="Telepon" value={employee?.no_hp} />
        <InfoRow icon={Mail} label="Email" value={employee?.email} />
        <InfoRow icon={MapPin} label="Alamat" value={employee?.alamat} />
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border bg-white" style={{ borderColor: COLORS.border }}>
        <MenuRow icon={Lock} label="Ubah Kata Sandi" onClick={() => navigate('/change-password')} />
        <MenuRow icon={Bell} label="Pengaturan Notifikasi" />
        <MenuRow icon={HelpCircle} label="Bantuan" />
        <MenuRow icon={LogOut} label="Keluar" danger onClick={signOut} />
      </section>
    </main>
  )
}