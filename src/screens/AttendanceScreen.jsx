import { Camera, Info, LogIn, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { todayLabel } from '../lib/date'
import { useAttendanceStore } from '../store/useAttendanceStore'

function statusBadge(status) {
  if (status === 'pending') return { label: 'Menunggu', color: COLORS.ochre, bg: COLORS.ochreBg }
  if (status === 'ditolak') return { label: 'Ditolak', color: COLORS.rust, bg: COLORS.rustBg }
  if (status === 'hadir') return { label: 'Disetujui', color: COLORS.sage, bg: COLORS.sageBg }
  return null
}

function AbsenCard({ icon: Icon, label, item, disabled, onClick, hint }) {
  const done = item?.done
  const badge = done ? statusBadge(item.status) : null

  return (
    <button
      onClick={onClick}
      disabled={disabled || done}
      className="mb-4 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        borderColor: done ? COLORS.sage : disabled ? COLORS.border : COLORS.border,
        background: done ? COLORS.sageBg : COLORS.white,
      }}
    >
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
        style={{
          background: done ? COLORS.white : COLORS.terracotta,
          boxShadow: done ? 'none' : '0 4px 12px rgba(201,99,66,0.25)',
        }}
      >
        <Icon size={26} color={done ? COLORS.sage : COLORS.white} />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="fraunces text-[18px] font-bold leading-none" style={{ color: COLORS.ink }}>{label}</h2>
          {badge && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: badge.color, background: badge.bg }}>
              {badge.label}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[13px] leading-snug" style={{ color: COLORS.inkSoft }}>
          {done ? `Tercatat pukul ${item.time}` : hint}
        </p>
      </div>

      {done && (
        <span className="fraunces shrink-0 text-[20px] font-bold" style={{ color: COLORS.sage }}>{item.time}</span>
      )}
    </button>
  )
}

export default function AttendanceScreen() {
  const navigate = useNavigate()
  const { checkIn, checkOut, loading, error, loadToday, loadMonthSummary } = useAttendanceStore()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    loadToday()
    loadMonthSummary()
  }, [loadToday, loadMonthSummary])

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const currentTime = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')

  return (
    <main className="screen safe-bottom">
      <header>
        <h1 className="fraunces text-[22px] font-bold tracking-[-0.03em]" style={{ color: COLORS.ink }}>Absensi</h1>
        <p className="mt-2 text-[14px] capitalize" style={{ color: COLORS.inkSoft }}>{todayLabel()}</p>
      </header>

      <section className="my-8 text-center">
        <div className="fraunces text-[44px] font-bold leading-none" style={{ color: COLORS.ink }}>{currentTime}</div>
        <p className="mt-3 text-[13px]" style={{ color: COLORS.inkSoft }}>Waktu sekarang</p>
      </section>

      {loading && (
        <p className="mb-4 rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          Memuat status absensi...
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-xl border px-4 py-3 text-sm font-semibold"
          style={{ borderColor: COLORS.terracotta, color: COLORS.terracotta }}>
          {error}
        </p>
      )}

      <AbsenCard
        icon={checkIn.done ? LogIn : Camera}
        label="Absen Masuk"
        item={checkIn}
        onClick={() => navigate('/camera/in')}
        hint="Tap untuk buka kamera"
      />

      <AbsenCard
        icon={checkOut.done ? LogOut : Camera}
        label="Absen Pulang"
        item={checkOut}
        disabled={!checkIn.done}
        onClick={() => navigate('/camera/out')}
        hint={checkIn.done ? 'Tap untuk buka kamera' : 'Absen masuk dulu'}
      />

      <div className="mt-2 flex gap-3 rounded-2xl px-4 py-3" style={{ background: COLORS.ochreBg, color: COLORS.inkSoft }}>
        <Info className="mt-0.5 shrink-0" size={18} color={COLORS.ochre} />
        <p className="text-[12.5px] leading-relaxed">
          Semua absensi masuk daftar pending dan baru valid setelah di-approve admin.
        </p>
      </div>
    </main>
  )
}
