import { Bell, Briefcase, Calendar, ChevronRight, Clock, HelpCircle, Lock, LogOut, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { useAuthStore } from '../store/useAuthStore'
import { useAttendanceStore } from '../store/useAttendanceStore'
import { useReportStore } from '../store/useReportStore'

function InfoRow({ icon: Icon, label, value }) { return <div className="flex min-h-[64px] items-center border-b px-5 last:border-b-0" style={{ borderColor: COLORS.border }}><Icon size={24} color={COLORS.terracotta} /><span className="ml-4 flex-1 text-[13px]" style={{ color: COLORS.inkSoft }}>{label}</span><b className="text-[13px]" style={{ color: COLORS.ink }}>{value}</b></div> }
function MenuRow({ icon: Icon, label, danger, onClick }) { return <button onClick={onClick} className="flex min-h-[64px] w-full items-center border-b px-5 text-left last:border-b-0" style={{ borderColor: COLORS.border }}><Icon size={24} color={danger ? COLORS.rust : COLORS.inkSoft} /><span className="ml-4 flex-1 text-[14px] font-semibold" style={{ color: danger ? COLORS.rust : COLORS.ink }}>{label}</span>{!danger && <ChevronRight color={COLORS.inkSoft} />}</button> }

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { employee, logout } = useAuthStore()
  const resetAttendance = useAttendanceStore((state) => state.resetAttendance)
  const resetReport = useReportStore((state) => state.resetReport)
  const signOut = () => { resetAttendance(); resetReport(); logout(); navigate('/login', { replace: true }) }
  return (
    <main className="screen safe-bottom pt-14">
      <section className="mb-8 text-center"><div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full fraunces text-[36px] font-bold text-white" style={{ background: COLORS.terracotta, boxShadow: '0 8px 20px rgba(201,99,66,0.3)' }}>D</div><h1 className="fraunces mt-5 text-[26px] font-bold" style={{ color: COLORS.ink }}>{employee.name}</h1><span className="mt-4 inline-flex rounded-full px-5 py-2 text-[14px] font-bold" style={{ background: COLORS.sageBg, color: COLORS.sage }}>{employee.role}</span></section>
      <section className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: COLORS.border }}><InfoRow icon={Briefcase} label="ID Karyawan" value={employee.id} /><InfoRow icon={Phone} label="Telepon" value={employee.phone} /><InfoRow icon={Calendar} label="Bergabung" value={employee.joinedAt} /><InfoRow icon={Clock} label="Jadwal Kerja" value={employee.schedule} /></section>
      <section className="mt-8 overflow-hidden rounded-2xl border bg-white" style={{ borderColor: COLORS.border }}><MenuRow icon={Lock} label="Ubah Kata Sandi" /><MenuRow icon={Bell} label="Pengaturan Notifikasi" /><MenuRow icon={HelpCircle} label="Bantuan" /><MenuRow icon={LogOut} label="Keluar" danger onClick={signOut} /></section>
    </main>
  )
}
