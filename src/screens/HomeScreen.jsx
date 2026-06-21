import { Bell, CalendarDays, Check, ChevronRight, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { todayLabel } from '../lib/date'
import { useAttendanceStore } from '../store/useAttendanceStore'
import { useAuthStore } from '../store/useAuthStore'
import { useReportStore } from '../store/useReportStore'

function SummaryPill({ value, label, color, bg }) {
  return <div className="flex-1 text-center">
    <div className="rounded-2xl py-4 fraunces text-[18px] font-bold" style={{ color, background: bg }}>{value}</div>
    <div className="mt-3 text-[13px] font-bold" style={{ color: COLORS.inkSoft }}>{label}</div>
  </div>
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const employee = useAuthStore((s) => s.employee)
  const { monthSummary, checkIn, checkOut } = useAttendanceStore()
  const submitted = useReportStore((state) => state.todayReport.submitted)

  if (!employee) return <main className="screen safe-bottom" />

  return (
    <main className="screen safe-bottom">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium capitalize" style={{ color: COLORS.inkSoft }}>{todayLabel()}</p>
          <h1 className="fraunces mt-1 text-[18px] font-bold tracking-[-0.03em]" style={{ color: COLORS.ink }}>Halo, {employee.firstName} 👋</h1>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border fraunces text-[18px] font-bold"
          style={{ color: COLORS.rust, borderColor: '#D8B464', background: COLORS.ochreBg }}>
          {employee?.name?.[0] || '?'}
        </div>
      </div>

      <section className="rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.border }}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[13px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Ringkasan Juni</h2>
          <CalendarDays size={22} color={COLORS.inkSoft} />
        </div>
        <div className="flex gap-3">
          <SummaryPill value={monthSummary.hadir} label="Hadir" color={COLORS.sage} bg={COLORS.sageBg} />
          <SummaryPill value={monthSummary.sakit} label="Sakit" color={COLORS.ochre} bg={COLORS.ochreBg} />
          <SummaryPill value={monthSummary.cuti} label="Cuti" color={COLORS.rust} bg={COLORS.rustBg} />
          <SummaryPill value={monthSummary.izin} label="Izin" color={COLORS.inkSoft} bg={COLORS.paperDark} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.border }}>
        <h2 className="mb-5 text-[13px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Absensi Hari Ini</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: COLORS.sageBg }}>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white"><Check color={COLORS.sage} size={26} /></span>
            <div>
              <b className="block uppercase" style={{ color: COLORS.inkSoft }}>Masuk</b>
              <span className="text-[18px] font-bold" style={{ color: COLORS.ink }}>{checkIn.time || '\u2014'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: checkOut.done ? COLORS.sageBg : COLORS.paperDark }}>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white"><Clock color={COLORS.inkSoft} size={25} /></span>
            <div>
              <b className="block uppercase" style={{ color: COLORS.inkSoft }}>Pulang</b>
              <span className="text-[13px]" style={{ color: COLORS.inkSoft }}>{checkOut.done ? checkOut.time : 'Belum absen'}</span>
            </div>
          </div>
        </div>
      </section>

      <button onClick={() => navigate('/report')}
        className="mt-6 w-full rounded-2xl p-6 text-left text-white"
        style={{ background: submitted ? COLORS.sage : COLORS.terracotta, boxShadow: '0 8px 20px rgba(201,99,66,0.28)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-4 text-[13px] font-bold uppercase tracking-wide">{submitted ? 'Sudah Dilaporkan' : 'Belum Dilaporkan'}</p>
            <h2 className="fraunces text-[22px] font-bold leading-tight">
              {submitted ? 'Laporan kegiatan hari ini sudah dikirim' : 'Laporan kegiatan hari ini belum dikirim'}
            </h2>
            <p className="mt-3 text-[13px] opacity-90">Tap untuk {submitted ? 'melihat dan mengubah laporan' : 'menulis laporan & unggah foto'}</p>
          </div>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20"><ChevronRight size={34} /></span>
        </div>
      </button>

      <div className="mt-6 flex gap-4 rounded-2xl px-5 py-4" style={{ background: COLORS.ochreBg, color: COLORS.inkSoft }}>
        <Bell className="mt-1 shrink-0" color={COLORS.ochre} size={22} />
        <p className="text-[14px] leading-relaxed">Laporan masih bisa diubah sampai tengah malam. Setelah itu otomatis terkunci.</p>
      </div>
    </main>
  )
}