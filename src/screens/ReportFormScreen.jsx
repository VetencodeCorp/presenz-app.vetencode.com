import { Plus, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { todayLabel } from '../lib/date'
import { useReportStore } from '../store/useReportStore'

export default function ReportFormScreen() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const { todayReport, saveReport } = useReportStore()
  const [photos, setPhotos] = useState(todayReport.photos)
  const [description, setDescription] = useState(todayReport.description)
  const addPhotos = (event) => { const files = Array.from(event.target.files || []).slice(0, 3 - photos.length); setPhotos((old) => [...old, ...files.map((file) => URL.createObjectURL(file))]) }
  const submit = (event) => { event.preventDefault(); saveReport({ photos, description }); navigate('/', { replace: true }) }
  return (
    <main className="screen-no-nav flex flex-col">
      <ScreenHeader title="Laporan Kegiatan" subtitle={todayLabel()} backTo="/" />
      <form onSubmit={submit} className="flex flex-1 flex-col">
        <section><h2 className="mb-4 text-[16px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Foto Kegiatan ({photos.length}/3)</h2><div className="mb-4 flex gap-3 overflow-x-auto">{photos.map((photo, index) => <div key={photo} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border" style={{ borderColor: COLORS.border }}><img src={photo} alt={`Kegiatan ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => setPhotos(photos.filter((item) => item !== photo))} className="absolute right-1 top-1 rounded-full bg-white p-1"><X size={16} color={COLORS.rust} /></button></div>)}{photos.length < 3 && <button type="button" onClick={() => inputRef.current?.click()} className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed" style={{ borderColor: COLORS.border, color: COLORS.terracotta }}><Plus size={28} /><span className="mt-2 text-sm" style={{ color: COLORS.inkSoft }}>Tambah</span></button>}</div><input ref={inputRef} onChange={addPhotos} type="file" accept="image/*" multiple className="hidden" /><p className="text-[16px]" style={{ color: COLORS.inkSoft }}>Ambil dari kamera atau pilih dari galeri.</p></section>
        <label className="mt-8 block"><span className="mb-4 block text-[16px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Deskripsi Kegiatan</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Apa saja yang dikerjakan hari ini?" className="h-40 w-full resize-none rounded-2xl border bg-white p-5 text-[18px]" style={{ borderColor: COLORS.border, color: COLORS.ink }} /></label>
        <div className="mt-auto pt-8"><button className="h-16 w-full rounded-xl text-[18px] font-bold text-white" style={{ background: COLORS.terracotta, boxShadow: '0 4px 14px rgba(201,99,66,0.3)' }}>Kirim Laporan</button><p className="mt-4 text-center text-[15px]" style={{ color: COLORS.inkSoft }}>Bisa diubah sampai tengah malam hari ini.</p></div>
      </form>
    </main>
  )
}
