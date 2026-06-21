import { Camera, RotateCcw, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { useAttendanceStore } from '../store/useAttendanceStore'

export default function CameraScreen() {
  const navigate = useNavigate()
  const { mode } = useParams()
  const capture = useAttendanceStore((state) => state.capture)
  const [photo, setPhoto] = useState(null)
  const inputRef = useRef(null)
  const title = mode === 'out' ? 'Absen Pulang' : 'Absen Masuk'
  const pickPhoto = (event) => { const file = event.target.files?.[0]; if (file) setPhoto(URL.createObjectURL(file)) }
  const submit = () => { capture(mode, photo || 'camera-dummy'); navigate('/attendance', { replace: true }) }
  return (
    <main className="screen-no-nav flex flex-col" style={{ background: COLORS.ink }}>
      <div className="mb-5 flex items-center justify-between text-white"><button onClick={() => navigate('/attendance')} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><X /></button><div className="text-center"><h1 className="text-lg font-bold">{title}</h1><p className="text-sm text-white/70">Ambil foto langsung dari kamera</p></div><button onClick={() => setPhoto(null)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><RotateCcw /></button></div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[28px]" style={{ background: COLORS.paperDark }}>
        {photo ? <img src={photo} alt="Pratinjau absen" className="h-full w-full object-cover" /> : <div className="px-8 text-center"><div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full" style={{ background: COLORS.terracotta }}><Camera size={44} color={COLORS.white} /></div><p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Kamera siap digunakan</p><p className="mt-2" style={{ color: COLORS.inkSoft }}>Di perangkat asli, tombol ini membuka kamera. Untuk demo, pilih foto dari kamera/galeri.</p></div>}
      </div>
      <input ref={inputRef} onChange={pickPhoto} type="file" accept="image/*" capture="environment" className="hidden" />
      <div className="mt-6 grid grid-cols-2 gap-4"><button onClick={() => inputRef.current?.click()} className="h-14 rounded-xl border text-[16px] font-bold text-white" style={{ borderColor: 'rgba(255,255,255,0.28)' }}>Buka Kamera</button><button onClick={submit} className="h-14 rounded-xl text-[16px] font-bold text-white" style={{ background: COLORS.terracotta, boxShadow: '0 4px 14px rgba(201,99,66,0.3)' }}>Gunakan Foto</button></div>
    </main>
  )
}
