import { CalendarDays, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { useRequestStore } from '../store/useRequestStore'

function fmtLong(s) {
  if (!s) return '-'
  const d = new Date(s + 'T00:00:00')
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const mons = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${days[d.getDay()]}, ${d.getDate()} ${mons[d.getMonth()]} ${d.getFullYear()}`
}

function statusBadge(status) {
  if (status === 'pending') return { label: 'Menunggu', color: COLORS.ochre, bg: COLORS.ochreBg }
  if (status === 'disetujui') return { label: 'Disetujui', color: COLORS.sage, bg: COLORS.sageBg }
  if (status === 'ditolak') return { label: 'Ditolak', color: COLORS.rust, bg: COLORS.rustBg }
  return { label: status, color: COLORS.inkSoft, bg: COLORS.paperDark }
}

export default function RequestDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loadDetail, cancel } = useRequestStore()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadDetail(id).then((data) => {
      if (!cancelled) {
        setItem(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id, loadDetail])

  const onCancel = async () => {
    if (!confirm(`Batalkan pengajuan ${item.kategori}?`)) return
    setCancelling(true)
    const result = await cancel(item.id)
    setCancelling(false)
    if (result.success) navigate('/requests', { replace: true })
    else alert(result.message)
  }

  if (loading) {
    return (
      <main className="screen safe-bottom">
        <ScreenHeader title="Detail Pengajuan" backTo="/requests" />
        <p className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          Memuat detail...
        </p>
      </main>
    )
  }

  if (!item) {
    return (
      <main className="screen safe-bottom">
        <ScreenHeader title="Detail Pengajuan" backTo="/requests" />
        <div className="rounded-2xl border border-dashed py-12 text-center"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          <CalendarDays size={36} className="mx-auto mb-3 opacity-50" />
          <p className="text-[14px]">Pengajuan tidak ditemukan.</p>
        </div>
      </main>
    )
  }

  const badge = statusBadge(item.status)
  const sameDay = item.tanggal_mulai === item.tanggal_selesai

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Detail Pengajuan" backTo="/requests" />

      <div className="mb-5 rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center justify-between gap-2">
          <p className="fraunces text-[20px] font-bold" style={{ color: COLORS.ink }}>{item.kategori}</p>
          <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
            style={{ color: badge.color, background: badge.bg }}>
            {badge.label}
          </span>
        </div>
        <p className="mt-2 text-[12px] font-semibold" style={{ color: COLORS.inkSoft }}>
          Durasi: {item.durasi_hari || 1} hari
        </p>
      </div>

      <section className="mb-5">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
          {sameDay ? 'Tanggal' : 'Periode'}
        </h2>
        <div className="rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.border }}>
          {sameDay ? (
            <p className="text-[13.5px]" style={{ color: COLORS.ink }}>{fmtLong(item.tanggal_mulai)}</p>
          ) : (
            <>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Mulai</span>
                <p className="text-[13.5px]" style={{ color: COLORS.ink }}>{fmtLong(item.tanggal_mulai)}</p>
              </div>
              <div className="mt-3 border-t pt-3" style={{ borderColor: COLORS.border }}>
                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Selesai</span>
                <p className="text-[13.5px]" style={{ color: COLORS.ink }}>{fmtLong(item.tanggal_selesai)}</p>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
          Alasan
        </h2>
        <div className="rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.border }}>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed" style={{ color: COLORS.ink }}>
            {item.keterangan || '-'}
          </p>
        </div>
      </section>

      {item.foto && (
        <section className="mb-5">
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Lampiran
          </h2>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="overflow-hidden rounded-2xl border w-full"
            style={{ borderColor: COLORS.border, background: COLORS.paperDark }}
          >
            <img src={item.foto} alt="Lampiran" className="w-full h-56 object-cover" />
          </button>
        </section>
      )}

      {item.status === 'ditolak' && item.alasan_ditolak && (
        <section className="mb-5">
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.rust }}>
            Alasan Ditolak Admin
          </h2>
          <div className="rounded-2xl border p-4"
            style={{ borderColor: COLORS.rust, background: COLORS.rustBg }}>
            <p className="text-[13.5px] leading-relaxed" style={{ color: COLORS.rust }}>
              {item.alasan_ditolak}
            </p>
          </div>
        </section>
      )}

      {item.status === 'pending' && (
        <button
          type="button"
          onClick={onCancel}
          disabled={cancelling}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-bold disabled:opacity-60"
          style={{ background: COLORS.rustBg, color: COLORS.rust, border: `1.5px solid ${COLORS.rust}` }}
        >
          <Trash2 size={16} />
          {cancelling ? 'Membatalkan...' : 'Batalkan Pengajuan'}
        </button>
      )}

      {preview && item.foto && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setPreview(false)}
        >
          <button
            type="button"
            onClick={() => setPreview(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
          >
            <X size={20} />
          </button>
          <img src={item.foto} alt="preview" className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </main>
  )
}
