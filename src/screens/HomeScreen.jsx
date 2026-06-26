import { Bell, CalendarDays, ChevronRight, Clock, Coffee, LogIn, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
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
  if (status === 'disetujui') return { label: 'Disetujui', color: COLORS.sage, bg: COLORS.sageBg }
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

function tipeStyle(tipe) {
  const t = (tipe || '').toLowerCase()
  if (t === 'sakit') return { color: COLORS.rust, bg: COLORS.rustBg, label: 'Sedang Sakit' }
  if (t === 'izin') return { color: COLORS.ochre, bg: COLORS.ochreBg, label: 'Sedang Izin' }
  if (t === 'cuti') return { color: COLORS.sage, bg: COLORS.sageBg, label: 'Sedang Cuti' }
  return { color: COLORS.inkSoft, bg: COLORS.paperDark, label: 'Tidak Hadir' }
}

function formatTanggalShort(s) {
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  const mons = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  return `${d.getDate()} ${mons[d.getMonth()]}`
}

function PengajuanBanner({ pengajuan }) {
  const style = tipeStyle(pengajuan.tipe)
  const sameDay = pengajuan.tanggal_mulai === pengajuan.tanggal_selesai
  const periode = sameDay
    ? formatTanggalShort(pengajuan.tanggal_mulai)
    : `${formatTanggalShort(pengajuan.tanggal_mulai)} – ${formatTanggalShort(pengajuan.tanggal_selesai)}`

  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border p-4"
      style={{ borderColor: style.color + '40', background: style.bg }}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
        <Coffee size={18} color={style.color} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="fraunces text-[15px] font-bold leading-tight" style={{ color: style.color }}>
          {style.label}
        </p>
        <p className="mt-0.5 text-[12px] font-semibold" style={{ color: COLORS.ink }}>
          {pengajuan.kategori} · {periode}{pengajuan.durasi_hari ? ` (${pengajuan.durasi_hari} hari)` : ''}
        </p>
        <p className="mt-1 text-[11.5px] leading-snug" style={{ color: COLORS.inkSoft }}>
          Tidak perlu absen hari ini.
        </p>
      </div>
    </div>
  )
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
  const refreshMe = useAuthStore((s) => s.refreshMe)
  const { monthSummary, checkIn, checkOut, pengajuanAktif, riwayat, loadToday, loadMonthSummary, loadRiwayat } = useAttendanceStore()
  const submitted = useReportStore((state) => {
    const today = new Date().toISOString().slice(0, 10)
    return state.reports.some((r) => r.tanggal === today)
  })
  const loadReports = useReportStore((s) => s.loadReports)
  const { jadwal, loadJadwal } = useJadwalStore()
  const durasiKerja = durasi(checkIn.time, checkOut.time)
  const todayJadwal = jadwal.hari.find((h) => h.is_today)

  useEffect(() => {
    if (employee) {
      refreshMe()
      loadToday()
      loadMonthSummary()
      loadJadwal()
      loadRiwayat({ limit: 5 })
      loadReports()
    }
  }, [employee?.id, refreshMe, loadToday, loadMonthSummary, loadJadwal, loadRiwayat, loadReports])

  if (!employee) return <main className="screen safe-bottom" />

  return (
    <main className="screen safe-bottom">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium capitalize" style={{ color: COLORS.inkSoft }}>{todayLabel()}</p>
          <h1 className="fraunces mt-1 text-[18px] font-bold tracking-[-0.03em]" style={{ color: COLORS.ink }}>Halo, {employee.firstName}</h1>
        </div>
        <Avatar name={employee?.name} src={employee?.photo} size={56} rounded="2xl" />
      </div>

      {pengajuanAktif && <PengajuanBanner pengajuan={pengajuanAktif} />}

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

      {/* RIWAYAT ABSENSI */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Absensi Terbaru
          </h2>
          {riwayat.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/attendance-history')}
              className="flex items-center gap-1 text-[12px] font-bold"
              style={{ color: COLORS.terracotta }}
            >
              Lihat Semua <ChevronRight size={14} />
            </button>
          )}
        </div>
        {riwayat.length === 0 ? (
          <p className="rounded-2xl border border-dashed py-5 text-center text-[12px]"
            style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
            Belum ada catatan absensi.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {riwayat.slice(0, 5).map((r) => {
              const kat = (r.kategori || '').toLowerCase()
              let badge
              if (kat === 'sakit') badge = { label: 'Sakit', color: COLORS.rust, bg: COLORS.rustBg }
              else if (kat === 'izin') badge = { label: 'Izin', color: COLORS.ochre, bg: COLORS.ochreBg }
              else if (kat === 'cuti') badge = { label: 'Cuti', color: COLORS.sage, bg: COLORS.sageBg }
              else if (kat === 'alpha') badge = { label: 'Alpha', color: COLORS.ink, bg: COLORS.paperDark }
              else if (r.status === 'disetujui') badge = { label: 'Hadir', color: COLORS.sage, bg: COLORS.sageBg }
              else if (r.status === 'pending') badge = { label: 'Menunggu', color: COLORS.ochre, bg: COLORS.ochreBg }
              else if (r.status === 'ditolak') badge = { label: 'Ditolak', color: COLORS.rust, bg: COLORS.rustBg }
              else badge = { label: r.status || '-', color: COLORS.inkSoft, bg: COLORS.paperDark }

              const d = r.tanggal ? new Date(r.tanggal + 'T00:00:00') : null
              const mons = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
              const tanggalLabel = d ? `${d.getDate()} ${mons[d.getMonth()]}` : '-'

              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl border bg-white p-3"
                  style={{ borderColor: COLORS.border }}
                >
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl"
                    style={{ background: COLORS.paperDark }}>
                    <span className="fraunces text-[14px] font-bold leading-none" style={{ color: COLORS.ink }}>
                      {d ? d.getDate() : '-'}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
                      {d ? mons[d.getMonth()] : ''}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{ color: badge.color, background: badge.bg }}>
                        {badge.label}
                      </span>
                      <span className="text-[11px]" style={{ color: COLORS.inkSoft }}>{tanggalLabel}</span>
                    </div>
                    {r.jam_masuk ? (
                      <p className="mt-0.5 text-[12px]" style={{ color: COLORS.inkSoft }}>
                        {r.jam_masuk} – {r.jam_keluar || 'belum pulang'}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[12px] italic" style={{ color: COLORS.inkSoft }}>Tidak hadir fisik</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <button onClick={() => navigate('/report')}
        className="mt-6 w-full rounded-2xl p-6 text-left text-white"
        style={{ background: submitted ? COLORS.sage : COLORS.terracotta, boxShadow: '0 8px 20px rgba(59,62,148,0.28)' }}>
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


