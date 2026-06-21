import { Camera, Check, Info, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusStamp from '../components/StatusStamp'
import { COLORS } from '../constants/colors'
import { todayLabel } from '../lib/date'
import { useAttendanceStore } from '../store/useAttendanceStore'

export default function AttendanceScreen() {
  const navigate = useNavigate()
  const { checkIn, checkOut } = useAttendanceStore()
  const [time, setTime] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id) }, [])
  const currentTime = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
  return (
    <main className="screen safe-bottom">
      <header><h1 className="fraunces text-[22px] font-bold tracking-[-0.03em]" style={{ color: COLORS.ink }}>Absensi</h1><p className="mt-2 text-[14px] capitalize" style={{ color: COLORS.inkSoft }}>{todayLabel()}</p></header>
      <section className="my-8 text-center"><div className="fraunces text-[40px] font-bold" style={{ color: COLORS.ink }}>{currentTime}</div><p className="mt-4 flex items-center justify-center gap-2 text-[15px]" style={{ color: COLORS.inkSoft }}><MapPin size={20} /> Estate Cigombong — terdeteksi otomatis</p></section>
      <button onClick={() => !checkIn.done && navigate('/camera/in')} className="mb-5 flex w-full items-center gap-5 rounded-2xl border p-5 text-left" style={{ borderColor: checkIn.done ? COLORS.sage : COLORS.border, background: checkIn.done ? COLORS.sageBg : COLORS.white }}>
        <span className="flex h-[64px] w-[72px] items-center justify-center rounded-2xl" style={{ background: checkIn.done ? COLORS.sage : COLORS.terracotta, boxShadow: checkIn.done ? 'none' : '0 6px 16px rgba(201,99,66,0.3)' }}>{checkIn.done ? <Check size={38} color={COLORS.white} /> : <Camera size={34} color={COLORS.white} />}</span>
        <div className="flex-1"><h2 className="fraunces text-[22px] font-bold" style={{ color: COLORS.ink }}>Absen Masuk</h2><p className="mt-2 text-[15px] leading-relaxed" style={{ color: COLORS.inkSoft }}>{checkIn.done ? `Tercatat pukul ${checkIn.time} — disetujui sistem` : 'Buka kamera untuk absen'}</p></div>{checkIn.done && <StatusStamp label="masuk" color={COLORS.sage} bg={COLORS.white} />}
      </button>
      <button onClick={() => navigate('/camera/out')} className="mb-5 flex w-full items-center gap-5 rounded-2xl border bg-white p-5 text-left" style={{ borderColor: checkOut.done ? COLORS.sage : COLORS.border }}>
        <span className="flex h-[64px] w-[72px] items-center justify-center rounded-2xl" style={{ background: checkOut.done ? COLORS.sage : COLORS.terracotta, boxShadow: '0 6px 16px rgba(201,99,66,0.3)' }}>{checkOut.done ? <Check size={38} color={COLORS.white} /> : <Camera size={34} color={COLORS.white} />}</span>
        <div className="flex-1"><h2 className="fraunces text-[22px] font-bold" style={{ color: COLORS.ink }}>Absen Pulang</h2><p className="mt-2 text-[15px]" style={{ color: COLORS.inkSoft }}>{checkOut.done ? `Tercatat pukul ${checkOut.time}` : 'Buka kamera untuk absen'}</p></div>{checkOut.done && <StatusStamp label="pulang" color={COLORS.sage} bg={COLORS.white} />}
      </button>
      <div className="flex gap-4 rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}><Info className="mt-1 shrink-0" size={22} /><p className="text-[14px] leading-relaxed">Kamera akan terbuka langsung — foto dari galeri tidak diterima untuk absensi. Lokasi & waktu tercatat otomatis.</p></div>
    </main>
  )
}
