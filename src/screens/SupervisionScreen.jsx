import { Camera, CheckCircle2, ChevronDown, ChevronUp, ClipboardCheck, ImagePlus, MapPin, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { COLORS } from '../constants/colors'
import { useSupervisionStore } from '../store/useSupervisionStore'

const statusOptions = [
  { value: 'sesuai', label: 'Sesuai', color: COLORS.sage, bg: COLORS.sageBg },
  { value: 'tidak_sesuai', label: 'Tidak Sesuai', color: COLORS.rust, bg: COLORS.rustBg },
  { value: 'perlu_tindak_lanjut', label: 'Perlu Tindak Lanjut', color: COLORS.ochre, bg: COLORS.ochreBg },
]

export default function SupervisionScreen() {
  const { periods, loading, error, load } = useSupervisionStore()
  const [active, setActive] = useState(null)

  useEffect(() => { load() }, [load])

  return <main className="screen safe-bottom">
    <header className="mb-7">
      <p className="text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: COLORS.primary }}>Monitoring Wilayah</p>
      <h1 className="fraunces mt-2 text-[36px] font-bold leading-none" style={{ color: COLORS.ink }}>Pengawasan Wilayah</h1>
      <p className="mt-3 text-[15px] leading-relaxed" style={{ color: COLORS.inkSoft }}>Periksa setiap todo, isi keterangan, lalu unggah foto bukti.</p>
    </header>

    {loading ? <Message>Memuat wilayah...</Message> : error ? <Message error>{error}</Message> : periods.length === 0 ? <Message>Belum ada wilayah yang ditugaskan.</Message> : <div className="flex flex-col gap-5">
      {periods.map((period) => <PeriodCard key={period.id} period={period} onOpen={setActive} />)}
    </div>}

    {active && <SubmitSheet item={active} close={() => setActive(null)} />}
  </main>
}

function PeriodCard({ period, onOpen }) {
  const [open, setOpen] = useState(true)
  const complete = period.progress.total > 0 && period.progress.selesai === period.progress.total
  const pct = period.progress.total ? Math.round((period.progress.selesai / period.progress.total) * 100) : 0

  return <section className="overflow-hidden rounded-[24px] border bg-white" style={{ borderColor: COLORS.border }}>
    <button onClick={() => setOpen(!open)} className="flex w-full items-start gap-4 p-5 text-left">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: complete ? COLORS.sageBg : COLORS.primaryLight }}><MapPin size={23} color={complete ? COLORS.sage : COLORS.primary} /></span>
      <div className="min-w-0 flex-1"><h2 className="fraunces text-[20px] font-bold" style={{ color: COLORS.ink }}>{period.wilayah.nama}</h2><p className="mt-1 text-[12px]" style={{ color: COLORS.inkSoft }}>{formatRange(period.minggu_mulai, period.minggu_selesai)}</p></div>
      {open ? <ChevronUp color={COLORS.inkSoft} /> : <ChevronDown color={COLORS.inkSoft} />}
    </button>
    <div className="px-5 pb-4"><div className="h-2 overflow-hidden rounded-full" style={{ background: COLORS.paperDark }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: complete ? COLORS.sage : COLORS.primary }} /></div><p className="mt-2 text-[11px] font-bold" style={{ color: COLORS.inkSoft }}>{period.progress.selesai} dari {period.progress.total} selesai</p></div>
    {open && <div className="border-t" style={{ borderColor: COLORS.border }}>{period.todo.length === 0 ? <p className="p-5 text-[13px]" style={{ color: COLORS.inkSoft }}>Admin belum membuat todo untuk wilayah ini.</p> : period.todo.map((item, index) => <TodoRow key={item.id} item={item} index={index} onOpen={onOpen} />)}</div>}
  </section>
}

function TodoRow({ item, index, onOpen }) {
  const done = item.status_hasil !== 'belum_diperiksa'
  const style = statusOptions.find((row) => row.value === item.status_hasil)
  return <button onClick={() => onOpen(item)} className="flex w-full items-center gap-3 border-b p-4 text-left last:border-b-0" style={{ borderColor: COLORS.border }}>
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold" style={{ background: done ? style?.bg : COLORS.paperDark, color: done ? style?.color : COLORS.inkSoft }}>{done ? <CheckCircle2 size={19} /> : index + 1}</span>
    <div className="min-w-0 flex-1"><p className="text-[14px] font-bold" style={{ color: COLORS.ink }}>{item.judul}</p><p className="mt-1 line-clamp-1 text-[11px]" style={{ color: COLORS.inkSoft }}>{done ? style?.label : item.deskripsi || 'Belum diperiksa'}</p></div>
    <ClipboardCheck size={20} color={done ? style?.color : COLORS.inkFaint} />
  </button>
}

function SubmitSheet({ item, close }) {
  const submit = useSupervisionStore((state) => state.submit)
  const submitting = useSupervisionStore((state) => state.submitting)
  const [status, setStatus] = useState(item.status_hasil === 'belum_diperiksa' ? '' : item.status_hasil)
  const [keterangan, setKeterangan] = useState(item.keterangan || '')
  const [photos, setPhotos] = useState([])
  const [location, setLocation] = useState(null)
  const [locating, setLocating] = useState(true)
  const [locationError, setLocationError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    if (!navigator.geolocation) {
      setLocating(false)
      setLocationError('Perangkat tidak mendukung GPS.')
      return undefined
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        setLocating(false)
        setLocationError('')
      },
      () => {
        if (!active) return
        setLocating(false)
        setLocationError('Lokasi tidak dapat dibaca. Aktifkan izin lokasi lalu buka form kembali.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )

    return () => { active = false }
  }, [item.id])

  const handlePhotos = (event) => setPhotos(Array.from(event.target.files || []).slice(0, 6))
  const save = async () => {
    if (!status || !keterangan.trim() || (item.wajib_foto && photos.length === 0)) { setMessage('Status, keterangan, dan foto bukti wajib diisi.'); return }
    if (!location) { setMessage(locationError || 'Tunggu sampai lokasi GPS berhasil dibaca.'); return }
    const result = await submit(item.id, { status, keterangan, photos, ...(location || {}) })
    if (result.success) close(); else setMessage(result.message)
  }

  return <div onClick={close} className="fixed inset-0 z-50 flex items-end justify-center bg-black/45"><section onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-[430px] overflow-y-auto rounded-t-[30px] bg-white p-6 pb-10">
    <div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.primary }}>Todo Pengawasan</p><h2 className="fraunces mt-1 text-[24px] font-bold" style={{ color: COLORS.ink }}>{item.judul}</h2>{item.deskripsi && <p className="mt-2 text-[13px] leading-relaxed" style={{ color: COLORS.inkSoft }}>{item.deskripsi}</p>}</div><button onClick={close} className="rounded-xl p-2" style={{ background: COLORS.paperDark }}><X size={19} /></button></div>
    <label className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Hasil Pemeriksaan</label><div className="mt-2 grid gap-2">{statusOptions.map((option) => <button key={option.value} onClick={() => setStatus(option.value)} className="rounded-xl border p-3 text-left text-[13px] font-bold" style={{ borderColor: status === option.value ? option.color : COLORS.border, background: status === option.value ? option.bg : COLORS.white, color: status === option.value ? option.color : COLORS.ink }}>{option.label}</button>)}</div>
    <label className="mt-5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Keterangan</label><textarea rows={4} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="mt-2 w-full resize-none rounded-2xl border p-4 text-[14px] outline-none" style={{ borderColor: COLORS.border }} placeholder="Jelaskan kondisi yang ditemukan..." />
    <label className="mt-5 block text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Foto Bukti {item.wajib_foto ? '(Wajib)' : '(Opsional)'}</label><label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed py-5 text-[13px] font-bold" style={{ borderColor: COLORS.primary, color: COLORS.primary, background: COLORS.primaryLight }}><ImagePlus size={21} />{photos.length ? `${photos.length} foto dipilih` : 'Pilih Foto'}<input type="file" accept="image/*" capture="environment" multiple onChange={handlePhotos} className="hidden" /></label>
    {locationError && <p className="mt-3 text-center text-[11px] font-semibold" style={{ color: COLORS.rust }}>{locationError}</p>}
    {message && <p className="mt-3 text-center text-[12px] font-semibold" style={{ color: COLORS.rust }}>{message}</p>}
    <button disabled={submitting || locating} onClick={save} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold text-white disabled:opacity-50" style={{ background: COLORS.primary }}><Camera size={20} />{submitting ? 'Menyimpan...' : locating ? 'Menyiapkan form...' : 'Simpan Pemeriksaan'}</button>
  </section></div>
}

function Message({ children, error }) { return <div className="rounded-2xl border border-dashed p-8 text-center text-[13px]" style={{ borderColor: error ? COLORS.rust : COLORS.border, color: error ? COLORS.rust : COLORS.inkSoft }}>{children}</div> }
function formatRange(start, end) { const fmt = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); return `${fmt(start)} – ${fmt(end)}` }
