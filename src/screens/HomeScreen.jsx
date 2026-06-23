import { Bell, CalendarDays, ChevronRight, Clock, LogIn, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { todayLabel } from '../lib/date'
import { useAttendanceStore } from '../store/useAttendanceStore'
import { useAuthStore } from '../store/useAuthStore'
import { useJadwalStore } from '../store/useJadwalStore'
import { useReportStore } from '../store/useReportStore'

function SummaryPill({ value, label, color, bg }) {
  return <div className="flex-1 text-center">
    <div className="rounded-2xl py-4 fraunces text-[18px] font-bold" style={{ color, background: bg }}>{value}</div>
    <div className="mt-3 text-[13px] font-bold" style={{ color: COLORS.inkSoft }}>{label}</div>
  </div>
}

function statusBadge(status) {
  if (status === 'pending') return { label: 'Menunggu', color: COLORS.ochre, bg: COLORS.ochreBg }
  if (status === 'ditolak') return { label: 'Ditolak', color: COLORS.rust, bg: COLORS.rustBg }
  if (status === 'hadir') return { label: 'Disetujui', color: COLORS.sage, bg: COLORS.sageBg }
  return null
}

function durasi(masuk, keluar) {
  if (!masuk || !keluar) return null
  const [hM, mM] = masuk.split(':').map(Number)
  const [hK, mK] = keluar.split(':').map(Number)
  const menit = (hK * 60 + mK) - (hM * 60 + mM)
  if (menit <= 0) return null
  const jam = Math.floor(menit / 60)
  const sisa = menit % 60
  return sisa === 0 ? `${jam} jam` : `${jam} jam ${sisa} menit`
}

function AbsensiRow({ icon: Icon, label, time, status, isLast }) {
  const badge = statusBadge(status)
  return (
    <div className={`flex items-center gap-4 py-4 ${isLast ? '' : 'border-b'}`} style={{ borderColor: COLORS.border }}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: time ? COLORS.sageBg : COLORS.paperDark }}>
        <Icon size={20} color={time ? COLORS.sage : COLORS.inkSoft} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>{label}</div>
        <div className="fraunces mt-0.5 text-[22px] font-bold leading-none" style={{ color: time ? COLORS.ink : COLORS.inkSoft }}>
          {time || '—'}
        </div>
      </div>
      {badge && (
        <span className="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold"
          style={{ color: badge.color, background: badge.bg }}>
          {badge.label}
        </span>
      )}
    </div>
  )
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const employee = useAuthStore((s) => s.employee)
  const { monthSummary, checkIn, checkOut, loadToday, loadMonthSummary } = useAttendanceStore()
  const submitted = useReportStore((state) => state.todayReport.submitted)
  const { jadwal, loadJadwal } = useJadwalStore()
  const durasiKerja = durasi(checkIn.time, checkOut.time)
  const todayJadwal = jadwal.hari.find((h) => h.is_today)

  useEffect(() => {
    if (employee) {
      loadToday()
      loadMonthSummary()
      loadJadwal()
    }
  }, [employee, loadToday, loadMonthSummary, loadJadwal])

  if (!employee) return <main className="screen safe-bottom" />

  return (
    <main className="screen safe-bottom">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium capitalize" style={{ color: COLORS.inkSoft }}>{todayLabel()}</p>
          <h1 className="fraunces mt-1 text-[18px] font-bold tracking-[-0.03em]" style={{ color: COLORS.ink }}>Halo, {employee.firstName}</h1>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border fraunces text-[18px] font-bold"
          style={{ color: COLORS.rust, borderColor: '#D8B464', background: COLORS.ochreBg }}>
          {employee?.name?.[0] || '?'}
        </div>
      </div>

      <section className="rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.border }}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[13px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Ringkasan Bulan Ini</h2>
          <CalendarDays size={22} color={COLORS.inkSoft} />
        </div>
        <div className="flex gap-3">
          <SummaryPill value={monthSummary.hadir} label="Hadir" color={COLORS.sage} bg={COLORS.sageBg} />
          <SummaryPill value={monthSummary.sakit} label="Sakit" color={COLORS.ochre} bg={COLORS.ochreBg} />
          <SummaryPill value={monthSummary.cuti} label="Cuti" color={COLORS.rust} bg={COLORS.rustBg} />
          <SummaryPill value={monthSummary.izin} label="Izin" color={COLORS.inkSoft} bg={COLORS.paperDark} />
        </div>
      </section>

      <button
        onClick={() => navigate('/jadwal')}
        className="mt-6 flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left"
        style={{ borderColor: COLORS.border }}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: COLORS.ochreBg }}>
          <Clock size={22} color={COLORS.ochre} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Shift Hari Ini</p>
          {todayJadwal?.libur ? (
            <p className="mt-0.5 text-[14px] font-semibold" style={{ color: COLORS.rust }}>
              Libur · {todayJadwal.libur}
            </p>
          ) : todayJadwal?.shift ? (
            <>
              <p className="mt-0.5 fraunces text-[16px] font-bold" style={{ color: COLORS.ink }}>
                {todayJadwal.shift.nama}
              </p>
              <p className="text-[12px]" style={{ color: COLORS.inkSoft }}>
                {todayJadwal.shift.mulai} – {todayJadwal.shift.selesai}
              </p>
            </>
          ) : (
            <p className="mt-0.5 text-[14px] italic" style={{ color: COLORS.inkSoft }}>
              Tidak ada jadwal hari ini
            </p>
          )}
        </div>
        <ChevronRight size={22} color={COLORS.inkSoft} />
      </button>

      <section className="mt-4 rounded-2xl border bg-white px-5 py-2" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center justify-between pt-3 pb-1">
          <h2 className="text-[13px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Absensi Hari Ini</h2>
          {durasiKerja && (
            <span className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ color: COLORS.sage, background: COLORS.sageBg }}>
              {durasiKerja}
            </span>
          )}
        </div>
        <AbsensiRow icon={LogIn} label="Masuk" time={checkIn.time} status={checkIn.status} />
        <AbsensiRow icon={LogOut} label="Pulang" time={checkOut.time} status={checkOut.status} isLast />
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


