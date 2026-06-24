import { ChevronRight, FileText } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { useReportStore } from '../store/useReportStore'

function fmt(s) {
  if (!s) return '-'
  const d = new Date(s + 'T00:00:00')
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${days[d.getDay()]}, ${d.getDate()} ${mons[d.getMonth()]} ${d.getFullYear()}`
}

// Group laporan by bulan
function groupByMonth(reports) {
  const map = new Map()
  for (const r of reports) {
    if (!r.tanggal) continue
    const d = new Date(r.tanggal + 'T00:00:00')
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    if (!map.has(key)) map.set(key, { label, items: [] })
    map.get(key).items.push(r)
  }
  return [...map.entries()].map(([key, val]) => ({ key, ...val }))
}

export default function ReportListScreen() {
  const navigate = useNavigate()
  const { reports, loading, loadReports } = useReportStore()

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const groups = groupByMonth(reports)

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Semua Laporan" subtitle={`${reports.length} laporan tersimpan`} backTo="/report" />

      {loading ? (
        <p className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          Memuat laporan...
        </p>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-12 text-center"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          <FileText size={36} className="mx-auto mb-3 opacity-50" />
          <p className="text-[14px]">Belum ada laporan tersimpan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <section key={g.key}>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
                {g.label}
              </h2>
              <div className="flex flex-col gap-2.5">
                {g.items.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => navigate(`/reports/${r.id}`)}
                    className="flex items-center gap-3 rounded-2xl border bg-white p-3 text-left"
                    style={{ borderColor: COLORS.border }}
                  >
                    {r.foto?.[0] ? (
                      <img src={r.foto[0]} alt="thumb" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: COLORS.paperDark }}>
                        <FileText size={20} color={COLORS.inkSoft} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold" style={{ color: COLORS.ink }}>{fmt(r.tanggal)}</p>
                      <p className="mt-0.5 text-[12px] leading-snug line-clamp-2" style={{ color: COLORS.inkSoft }}>
                        {r.deskripsi}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold" style={{ color: COLORS.inkSoft }}>
                        {r.foto_count || r.foto?.length || 0} foto
                      </p>
                    </div>
                    <ChevronRight size={18} color={COLORS.inkSoft} className="shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
