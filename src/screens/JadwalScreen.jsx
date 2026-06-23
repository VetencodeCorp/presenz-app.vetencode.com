import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { useJadwalStore } from '../store/useJadwalStore'

// helper: pindah minggu (n hari, support negatif)
const shiftWeek = (dateStr, days) => {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// helper: cek start/end minggu dari hari ini
const thisWeekRange = () => {
  const d = new Date()
  const day = d.getDay() // 0=Min, 1=Sen, ..., 6=Sab
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: monday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10) }
}

const formatRange = (start, end) => {
  if (!start || !end) return ''
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const opts = { day: 'numeric', month: 'short' }
  return `${s.toLocaleDateString('id-ID', opts)} – ${e.toLocaleDateString('id-ID', opts)}`
}

function JadwalCard({ item }) {
  const { hari, tanggal_label, is_today, libur, shift } = item

  const accent = is_today ? COLORS.terracotta : COLORS.border
  const bg = is_today ? COLORS.rustBg : COLORS.white

  return (
    <div
      className="flex items-stretch gap-4 rounded-2xl border p-4"
      style={{ borderColor: accent, background: bg }}
    >
      {/* TANGGAL */}
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl"
        style={{ background: is_today ? COLORS.terracotta : COLORS.paperDark, color: is_today ? COLORS.white : COLORS.ink }}>
        <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
          {hari.slice(0, 3)}
        </span>
        <span className="fraunces mt-0.5 text-[20px] font-bold leading-none">
          {tanggal_label.split(' ')[0]}
        </span>
      </div>

      {/* INFO */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="fraunces text-[15px] font-bold leading-tight" style={{ color: COLORS.ink }}>
            {hari}
            {is_today && (
              <span className="ml-2 rounded-full px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide"
                style={{ color: COLORS.terracotta, background: COLORS.white, border: `1px solid ${COLORS.terracotta}` }}>
                Hari Ini
              </span>
            )}
          </h3>
        </div>

        {libur ? (
          <p className="mt-1 text-[12.5px] font-semibold" style={{ color: COLORS.rust }}>
            Libur · {libur}
          </p>
        ) : shift ? (
          <>
            <p className="mt-1 text-[13px] font-semibold" style={{ color: COLORS.ink }}>
              {shift.nama}
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: COLORS.inkSoft }}>
              {shift.mulai} – {shift.selesai}
            </p>
          </>
        ) : (
          <p className="mt-1 text-[12.5px] italic" style={{ color: COLORS.inkSoft }}>
            Tidak ada jadwal
          </p>
        )}
      </div>
    </div>
  )
}

export default function JadwalScreen() {
  const { jadwal, loading, error, loadJadwal } = useJadwalStore()
  const [range, setRange] = useState(thisWeekRange())

  useEffect(() => {
    loadJadwal({ start: range.start, end: range.end })
  }, [range.start, range.end, loadJadwal])

  const goPrevWeek = () => {
    setRange((r) => ({
      start: shiftWeek(r.start, -7),
      end: shiftWeek(r.end, -7),
    }))
  }
  const goNextWeek = () => {
    setRange((r) => ({
      start: shiftWeek(r.start, 7),
      end: shiftWeek(r.end, 7),
    }))
  }
  const goThisWeek = () => setRange(thisWeekRange())

  const isThisWeek = range.start === thisWeekRange().start

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Jadwal Saya" subtitle="Lihat shift kerja minggu Anda" backTo="/" />

      {/* Navigasi minggu */}
      <div className="mt-2 mb-4 flex items-center justify-between gap-3 rounded-2xl border bg-white p-2"
        style={{ borderColor: COLORS.border }}>
        <button
          onClick={goPrevWeek}
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: COLORS.paperDark, color: COLORS.ink }}
          aria-label="Minggu sebelumnya"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            {isThisWeek ? 'Minggu Ini' : 'Minggu'}
          </p>
          <p className="fraunces text-[15px] font-bold" style={{ color: COLORS.ink }}>
            {formatRange(range.start, range.end)}
          </p>
        </div>

        <button
          onClick={goNextWeek}
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: COLORS.paperDark, color: COLORS.ink }}
          aria-label="Minggu berikutnya"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {!isThisWeek && (
        <button
          onClick={goThisWeek}
          className="mb-4 w-full rounded-xl py-2 text-[13px] font-bold"
          style={{ color: COLORS.terracotta, background: COLORS.rustBg }}
        >
          Kembali ke minggu ini
        </button>
      )}

      {/* Konten */}
      {loading && (
        <p className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          Memuat jadwal...
        </p>
      )}

      {error && (
        <p className="rounded-xl border px-4 py-3 text-sm font-semibold"
          style={{ borderColor: COLORS.rust, color: COLORS.rust, background: COLORS.rustBg }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {jadwal.hari.length === 0 ? (
            <p className="rounded-xl border bg-white px-4 py-6 text-center text-[14px]"
              style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
              Belum ada jadwal pada minggu ini.
            </p>
          ) : (
            jadwal.hari.map((item) => <JadwalCard key={item.tanggal} item={item} />)
          )}
        </div>
      )}
    </main>
  )
}
