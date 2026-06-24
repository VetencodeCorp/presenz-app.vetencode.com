import { CalendarDays, ChevronRight, FileText, Heart, Paperclip, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { compressImage } from '../lib/compressImage'
import { useRequestStore } from '../store/useRequestStore'

const TIPE_OPTIONS = [
  { id: 'sakit', label: 'Sakit', icon: Heart, color: COLORS.rust, bg: COLORS.rustBg },
  { id: 'izin', label: 'Izin', icon: FileText, color: COLORS.ochre, bg: COLORS.ochreBg },
  { id: 'cuti', label: 'Cuti', icon: CalendarDays, color: COLORS.sage, bg: COLORS.sageBg },
]

function statusBadge(status) {
  if (status === 'pending') return { label: 'Menunggu', color: COLORS.ochre, bg: COLORS.ochreBg }
  if (status === 'disetujui') return { label: 'Disetujui', color: COLORS.sage, bg: COLORS.sageBg }
  if (status === 'ditolak') return { label: 'Ditolak', color: COLORS.rust, bg: COLORS.rustBg }
  return { label: status, color: COLORS.inkSoft, bg: COLORS.paperDark }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function HistoryCard({ item, onCancel }) {
  const badge = statusBadge(item.status)
  const sameDay = item.tanggal_mulai === item.tanggal_selesai
  const tanggalText = sameDay
    ? formatDate(item.tanggal_mulai)
    : `${formatDate(item.tanggal_mulai)} – ${formatDate(item.tanggal_selesai)}`

  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.border }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="fraunces text-[15px] font-bold leading-tight" style={{ color: COLORS.ink }}>
              {item.kategori || 'Pengajuan'}
            </h3>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ color: badge.color, background: badge.bg }}>
              {badge.label}
            </span>
          </div>
          <p className="mt-1 text-[12.5px]" style={{ color: COLORS.inkSoft }}>
            {tanggalText} · {item.durasi_hari || 1} hari
          </p>
          {item.keterangan && (
            <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: COLORS.ink }}>
              {item.keterangan}
            </p>
          )}
          {item.status === 'ditolak' && item.alasan_ditolak && (
            <p className="mt-2 rounded-lg px-3 py-2 text-[12px] leading-relaxed"
              style={{ color: COLORS.rust, background: COLORS.rustBg }}>
              <b>Ditolak:</b> {item.alasan_ditolak}
            </p>
          )}
        </div>

        {item.status === 'pending' && (
          <button
            onClick={() => onCancel(item)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: COLORS.rustBg, color: COLORS.rust }}
            aria-label="Batalkan"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function RequestScreen() {
  const navigate = useNavigate()
  const { list, loading, submitting, error, loadList, submit, cancel, clearError } = useRequestStore()

  const today = new Date().toISOString().slice(0, 10)
  const [tipe, setTipe] = useState('izin')
  const [tanggalMulai, setTanggalMulai] = useState(today)
  const [tanggalSelesai, setTanggalSelesai] = useState(today)
  const [keterangan, setKeterangan] = useState('')
  const [file, setFile] = useState(null)
  const [localError, setLocalError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    loadList()
  }, [loadList])

  // Auto-sync tanggal_selesai kalau lebih kecil dari tanggal_mulai
  useEffect(() => {
    if (tanggalSelesai < tanggalMulai) setTanggalSelesai(tanggalMulai)
  }, [tanggalMulai, tanggalSelesai])

  // Estimasi durasi (sederhana, hari kalender)
  const durasi = useMemo(() => {
    if (!tanggalMulai || !tanggalSelesai) return 0
    const s = new Date(tanggalMulai + 'T00:00:00')
    const e = new Date(tanggalSelesai + 'T00:00:00')
    return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1)
  }, [tanggalMulai, tanggalSelesai])

  const onSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')
    setSuccessMsg('')
    clearError()

    if (!keterangan.trim()) {
      setLocalError('Alasan/keterangan wajib diisi.')
      return
    }

    const result = await submit({
      tipe,
      tanggalMulai,
      tanggalSelesai,
      keterangan: keterangan.trim(),
      file,
    })

    if (result.success) {
      setSuccessMsg(result.message || 'Pengajuan berhasil dikirim.')
      setKeterangan('')
      setFile(null)
      setTanggalMulai(today)
      setTanggalSelesai(today)
      setTipe('izin')
    }
  }

  const onCancel = async (item) => {
    if (!confirm(`Batalkan pengajuan ${item.kategori} tanggal ${formatDate(item.tanggal_mulai)}?`)) return
    const result = await cancel(item.id)
    if (!result.success) {
      setLocalError(result.message)
    } else {
      setSuccessMsg(result.message || 'Pengajuan dibatalkan.')
    }
  }

  const errorMsg = localError || error

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Pengajuan" subtitle="Sakit, izin, atau cuti" />

      {/* Feedback */}
      {errorMsg && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]"
          style={{ borderColor: COLORS.rust, background: COLORS.rustBg, color: COLORS.rust }}>
          <X size={18} className="mt-0.5 shrink-0" />
          <p className="font-semibold leading-snug">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded-xl border px-4 py-3 text-[13px] font-semibold"
          style={{ borderColor: COLORS.sage, background: COLORS.sageBg, color: COLORS.sage }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={onSubmit}>
        {/* TIPE */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          {TIPE_OPTIONS.map(({ id, label, icon: Icon, color, bg }) => {
            const active = tipe === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTipe(id)}
                className="flex h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 text-[13px] font-bold transition"
                style={{
                  borderColor: active ? color : COLORS.border,
                  background: active ? bg : COLORS.white,
                  color: active ? color : COLORS.inkSoft,
                }}
              >
                <Icon size={22} />
                {label}
              </button>
            )
          })}
        </div>

        {/* TANGGAL RANGE */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
              Mulai
            </span>
            <input
              type="date"
              value={tanggalMulai}
              min={today}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="h-12 w-full rounded-xl border bg-white px-3 text-[14px]"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
              Selesai
            </span>
            <input
              type="date"
              value={tanggalSelesai}
              min={tanggalMulai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="h-12 w-full rounded-xl border bg-white px-3 text-[14px]"
              style={{ borderColor: COLORS.border, color: COLORS.ink }}
            />
          </label>
        </div>

        {/* DURASI ESTIMASI */}
        <div className="mb-5 flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: COLORS.paperDark, color: COLORS.inkSoft }}>
          <span className="text-[12px] font-bold uppercase tracking-wide">Estimasi durasi</span>
          <span className="fraunces text-[16px] font-bold" style={{ color: COLORS.ink }}>
            {durasi} hari
          </span>
        </div>

        {/* KETERANGAN */}
        <label className="mb-5 block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Alasan
          </span>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Jelaskan alasan secara singkat..."
            maxLength={500}
            className="h-28 w-full resize-none rounded-2xl border bg-white p-4 text-[14px]"
            style={{ borderColor: COLORS.border, color: COLORS.ink }}
          />
          <span className="mt-1 block text-right text-[10px]" style={{ color: COLORS.inkSoft }}>
            {keterangan.length}/500
          </span>
        </label>

        {/* LAMPIRAN */}
        <label className="mb-6 block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Lampiran (Opsional)
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) { setFile(null); return }
              try {
                const compressed = await compressImage(f, { maxWidth: 1280, maxHeight: 1280, quality: 0.75 })
                setFile(compressed)
              } catch {
                setFile(f)
              }
            }}
            className="hidden"
            id="proof"
          />
          <label
            htmlFor="proof"
            className="flex h-14 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed bg-white px-4 text-[13px]"
            style={{ borderColor: COLORS.border, color: file ? COLORS.ink : COLORS.inkSoft }}
          >
            <Paperclip size={16} color={COLORS.terracotta} />
            <span className="truncate">{file?.name || 'Unggah surat dokter / dokumen'}</span>
            {file && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setFile(null) }}
                className="ml-1 rounded-full p-1"
                style={{ color: COLORS.inkSoft }}
              >
                <X size={14} />
              </button>
            )}
          </label>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="h-14 w-full rounded-xl text-[14px] font-bold text-white disabled:opacity-60"
          style={{ background: COLORS.terracotta, boxShadow: '0 4px 14px rgba(201,99,66,0.3)' }}
        >
          {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
        </button>

        <p className="mt-3 text-center text-[12px]" style={{ color: COLORS.inkSoft }}>
          Pengajuan akan diverifikasi admin sebelum disetujui.
        </p>
      </form>

      {/* RIWAYAT */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[12px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Riwayat Terbaru
          </h2>
          {list.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/requests')}
              className="flex items-center gap-1 text-[12px] font-bold"
              style={{ color: COLORS.terracotta }}
            >
              Lihat Semua <ChevronRight size={14} />
            </button>
          )}
        </div>
        {loading ? (
          <p className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
            style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
            Memuat riwayat...
          </p>
        ) : list.length === 0 ? (
          <p className="rounded-xl border bg-white px-4 py-6 text-center text-[13px]"
            style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
            Belum ada pengajuan.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {list.slice(0, 5).map((item) => (
              <HistoryCard key={item.id} item={item} onCancel={onCancel} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
