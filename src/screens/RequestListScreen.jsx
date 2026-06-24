import { CalendarDays, ChevronRight, FileText } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { useRequestStore } from '../store/useRequestStore'

function fmt(s) {
  if (!s) return '-'
  const d = new Date(s + 'T00:00:00')
  const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${d.getDate()} ${mons[d.getMonth()]} ${d.getFullYear()}`
}

function statusBadge(status) {
  if (status === 'pending') return { label: 'Menunggu', color: COLORS.ochre, bg: COLORS.ochreBg }
  if (status === 'disetujui') return { label: 'Disetujui', color: COLORS.sage, bg: COLORS.sageBg }
  if (status === 'ditolak') return { label: 'Ditolak', color: COLORS.rust, bg: COLORS.rustBg }
  return { label: status, color: COLORS.inkSoft, bg: COLORS.paperDark }
}

function groupByMonth(items) {
  const map = new Map()
  for (const r of items) {
    if (!r.tanggal_mulai) continue
    const d = new Date(r.tanggal_mulai + 'T00:00:00')
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    if (!map.has(key)) map.set(key, { label, items: [] })
    map.get(key).items.push(r)
  }
  return [...map.values()]
}

export default function RequestListScreen() {
  const navigate = useNavigate()
  const { list, loading, loadList } = useRequestStore()

  useEffect(() => { loadList() }, [loadList])

  const groups = groupByMonth(list)

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Semua Pengajuan" subtitle={`${list.length} pengajuan tersimpan`} backTo="/request" />

      {loading ? (
        <p className="rounded-xl border bg-white px-4 py-3 text-sm font-semibold"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          Memuat pengajuan...
        </p>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-12 text-center"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          <FileText size={36} className="mx-auto mb-3 opacity-50" />
          <p className="text-[14px]">Belum ada pengajuan tersimpan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((g, idx) => (
            <section key={idx}>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
                {g.label}
              </h2>
              <div className="flex flex-col gap-2.5">
                {g.items.map((r) => {
                  const badge = statusBadge(r.status)
                  const sameDay = r.tanggal_mulai === r.tanggal_selesai
                  const periode = sameDay ? fmt(r.tanggal_mulai) : `${fmt(r.tanggal_mulai)} – ${fmt(r.tanggal_selesai)}`
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => navigate(`/requests/${r.id}`)}
                      className="flex items-center gap-3 rounded-2xl border bg-white p-3 text-left"
                      style={{ borderColor: COLORS.border }}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: COLORS.paperDark }}>
                        <CalendarDays size={20} color={COLORS.inkSoft} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-bold" style={{ color: COLORS.ink }}>{r.kategori}</p>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                            style={{ color: badge.color, background: badge.bg }}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[12px]" style={{ color: COLORS.inkSoft }}>
                          {periode} · {r.durasi_hari || 1} hari
                        </p>
                      </div>
                      <ChevronRight size={18} color={COLORS.inkSoft} className="shrink-0" />
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
