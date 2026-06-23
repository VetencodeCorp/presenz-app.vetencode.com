import { Camera, Check, Info, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusStamp from '../components/StatusStamp'
import { COLORS } from '../constants/colors'
import { todayLabel } from '../lib/date'
import { useAttendanceStore } from '../store/useAttendanceStore'

function statusLabel(status) {
  if (status === 'pending') return 'menunggu approval admin'
  if (status === 'ditolak') return 'ditolak admin'
  if (status === 'hadir') return 'sudah disetujui'
  return 'terkirim'
}

function locationText(item) {
  if (!item?.detail) return item?.location || 'Lokasi belum tersedia'
  return `${item.detail.label} (${item.detail.latitude.toFixed(6)}, ${item.detail.longitude.toFixed(6)})`
}

export default function AttendanceScreen() {
  const navigate = useNavigate()
  const { checkIn, checkOut, loading, error, loadToday, loadMonthSummary } = useAttendanceStore()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    loadToday()
    loadMonthSummary()
  }, [loadToday, loadMonthSummary])

  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id) }, [])

  const currentTime = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
  const checkInLabel = checkIn.done ? `Tercatat pukul ${checkIn.time} — ${statusLabel(checkIn.status)}` : 'Buka kamera untuk absen'
  const checkOutLabel = checkOut.done ? `Tercatat pukul ${checkOut.time} — ${statusLabel(checkOut.status)}` : checkIn.done ? 'Buka kamera untuk absen' : 'Absen masuk dulu sebelum pulang'

  return (
    <main className="screen safe-bottom">
      <header><h1 className="fraunces text-[22px] font-bold tracking-[-0.03em]" style={{ color: COLORS.ink }}>Absensi</h1><p className="mt-2 text-[14px] capitalize" style={{ color: COLORS.inkSoft }}>{todayLabel()}</p></header>
      <section className="my-8 text-center"><div className="fraunces text-[40px] font-bold" style={{ color: COLORS.ink }}>{currentTime}</div><p className="mt-4 flex items-center justify-center gap-2 text-[15px]" style={{ color: COLORS.inkSoft }}><MapPin size={20} /> Lokasi GPS tercatat otomatis</p></section>
      {loading && <p className="mb-4 rounded-xl border bg-white px-4 py-3 text-sm font-semibold" style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>Memuat status absensi...</p>}
      {error && <p className="mb-4 rounded-xl border px-4 py-3 text-sm font-semibold" style={{ borderColor: COLORS.terracotta, color: COLORS.terracotta }}>{error}</p>}
      <button onClick={() => !checkIn.done && navigate('/camera/in')} className="mb-5 flex w-full items-center gap-5 rounded-2xl border p-5 text-left" style={{ borderColor: checkIn.done ? COLORS.sage : COLORS.border, background: checkIn.done ? COLORS.sageBg : COLORS.white }}>
        <span className="flex h-[64px] w-[72px] items-center justify-center rounded-2xl" style={{ background: checkIn.done ? COLORS.sage : COLORS.terracotta, boxShadow: checkIn.done ? 'none' : '0 6px 16px rgba(201,99,66,0.3)' }}>{checkIn.done ? <Check size={38} color={COLORS.white} /> : <Camera size={34} color={COLORS.white} />}</span>
        <div className="flex-1"><h2 className="fraunces text-[22px] font-bold" style={{ color: COLORS.ink }}>Absen Masuk</h2><p className="mt-2 text-[15px] leading-relaxed" style={{ color: COLORS.inkSoft }}>{checkInLabel}</p>{checkIn.done && <p className="mt-2 text-[12px] leading-relaxed" style={{ color: COLORS.inkSoft }}>{locationText(checkIn)}</p>}</div>{checkIn.done && <StatusStamp label={checkIn.status === 'pending' ? 'pending' : 'masuk'} color={COLORS.sage} bg={COLORS.white} />}
      </button>
      <button onClick={() => checkIn.done && !checkOut.done && navigate('/camera/out')} className="mb-5 flex w-full items-center gap-5 rounded-2xl border bg-white p-5 text-left disabled:opacity-60" disabled={!checkIn.done || checkOut.done} style={{ borderColor: checkOut.done ? COLORS.sage : COLORS.border }}>
        <span className="flex h-[64px] w-[72px] items-center justify-center rounded-2xl" style={{ background: checkOut.done ? COLORS.sage : COLORS.terracotta, boxShadow: checkOut.done ? 'none' : '0 6px 16px rgba(201,99,66,0.3)' }}>{checkOut.done ? <Check size={38} color={COLORS.white} /> : <Camera size={34} color={COLORS.white} />}</span>
        <div className="flex-1"><h2 className="fraunces text-[22px] font-bold" style={{ color: COLORS.ink }}>Absen Pulang</h2><p className="mt-2 text-[15px]" style={{ color: COLORS.inkSoft }}>{checkOutLabel}</p>{checkOut.done && <p className="mt-2 text-[12px] leading-relaxed" style={{ color: COLORS.inkSoft }}>{locationText(checkOut)}</p>}</div>{checkOut.done && <StatusStamp label={checkOut.status === 'pending' ? 'pending' : 'pulang'} color={COLORS.sage} bg={COLORS.white} />}
      </button>
      <div className="flex gap-4 rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}><Info className="mt-1 shrink-0" size={22} /><p className="text-[14px] leading-relaxed">Semua absensi masuk ke daftar pending dan baru valid setelah di-approve admin.</p></div>
    </main>
  )
}
