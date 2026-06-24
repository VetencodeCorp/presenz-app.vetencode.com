import { Edit3, FileText, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { useReportStore } from '../store/useReportStore'

function fmt(s) {
  if (!s) return '-'
  const d = new Date(s + 'T00:00:00')
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const mons = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${days[d.getDay()]}, ${d.getDate()} ${mons[d.getMonth()]} ${d.getFullYear()}`
}

export default function ReportDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loadReportDetail } = useReportStore()

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewIdx, setPreviewIdx] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadReportDetail(id).then((data) => {
      if (!cancelled) {
        setReport(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id, loadReportDetail])

  if (loading) {
    return (
      <main className="screen safe-bottom">
        <ScreenHeader title="Detail Laporan" backTo="/reports" />
        <p className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          Memuat detail...
        </p>
      </main>
    )
  }

  if (!report) {
    return (
      <main className="screen safe-bottom">
        <ScreenHeader title="Detail Laporan" backTo="/reports" />
        <div className="rounded-2xl border border-dashed py-12 text-center"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          <FileText size={36} className="mx-auto mb-3 opacity-50" />
          <p className="text-[14px]">Laporan tidak ditemukan.</p>
        </div>
      </main>
    )
  }

  const fotoCount = report.foto?.length || 0

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Detail Laporan" backTo="/reports" />

      <div className="mb-5 rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.border }}>
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Tanggal</p>
        <p className="mt-1 fraunces text-[18px] font-bold" style={{ color: COLORS.ink }}>{fmt(report.tanggal)}</p>
      </div>

      {/* DESKRIPSI */}
      <section className="mb-5">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
          Deskripsi Kegiatan
        </h2>
        <div className="rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.border }}>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed" style={{ color: COLORS.ink }}>
            {report.deskripsi || '-'}
          </p>
        </div>
      </section>

      {/* FOTO */}
      <section className="mb-5">
        <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
          Foto Kegiatan ({fotoCount})
        </h2>
        {fotoCount === 0 ? (
          <div className="rounded-2xl border border-dashed py-6 text-center"
            style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
            <p className="text-[12px]">Tidak ada foto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {report.foto.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPreviewIdx(i)}
                className="aspect-square overflow-hidden rounded-xl border"
                style={{ borderColor: COLORS.border }}
              >
                <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* EDIT BUTTON (hanya kalau editable) */}
      {report.editable && (
        <button
          type="button"
          onClick={() => navigate('/report')}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-bold text-white"
          style={{ background: COLORS.terracotta, boxShadow: '0 4px 14px rgba(201,99,66,0.3)' }}
        >
          <Edit3 size={16} /> Edit Laporan
        </button>
      )}
      {!report.editable && (
        <p className="text-center text-[12px] italic" style={{ color: COLORS.inkSoft }}>
          Laporan ini hanya bisa diedit pada hari yang sama dibuatnya.
        </p>
      )}

      {/* LIGHTBOX */}
      {previewIdx !== null && report.foto?.[previewIdx] && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setPreviewIdx(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewIdx(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
          <img
            src={report.foto[previewIdx]}
            alt="preview"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white">
            {previewIdx + 1} / {report.foto.length}
          </span>
        </div>
      )}
    </main>
  )
}
