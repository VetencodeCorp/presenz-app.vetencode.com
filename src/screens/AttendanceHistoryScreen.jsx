import { ChevronRight, History, LogIn, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { useAttendanceStore } from '../store/useAttendanceStore'

function fmt(s) {
  if (!s) return '-'
  const d = new Date(s + 'T00:00:00')
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${days[d.getDay()]}, ${d.getDate()} ${mons[d.getMonth()]} ${d.getFullYear()}`
}

function statusBadge(row) {
  const kat = (row.kategori || '').toLowerCase()
  if (kat === 'sakit') return { label: 'Sakit', color: COLORS.rust, bg: COLORS.rustBg }
  if (kat === 'izin') return { label: 'Izin', color: COLORS.ochre, bg: COLORS.ochreBg }
  if (kat === 'cuti') return { label: 'Cuti', color: COLORS.sage, bg: COLORS.sageBg }
  if (kat === 'alpha') return { label: 'Alpha', color: COLORS.ink, bg: COLORS.paperDark }
  if (row.status === 'disetujui') return { label: 'Hadir', color: COLORS.sage, bg: COLORS.sageBg }
  if (row.status === 'pending') return { label: 'Menunggu', color: COLORS.ochre, bg: COLORS.ochreBg }
  if (row.status === 'ditolak') return { label: 'Ditolak', color: COLORS.rust, bg: COLORS.rustBg }
  return { label: row.status || '-', color: COLORS.inkSoft, bg: COLORS.paperDark }
}

function groupByMonth(items) {
  const map = new Map()
  for (const r of items) {
    if (!r.tanggal) continue
    const d = new Date(r.tanggal + 'T00:00:00')
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    if (!map.has(key)) map.set(key, { label, items: [] })
    map.get(key).items.push(r)
  }
  return [...map.values()]
}

export default function AttendanceHistoryScreen() {
  const navigate = useNavigate()
  const { riwayat, loadRiwayat } = useAttendanceStore()

  useEffect(() => {
    loadRiwayat()
  }, [loadRiwayat])

  const groups = groupByMonth(riwayat)

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Riwayat Absensi" subtitle={`${riwayat.length} catatan tersimpan`} backTo="/" />

      {riwayat.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-12 text-center"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          <History size={36} className="mx-auto mb-3 opacity-50" />
          <p className="text-[14px]">Belum ada catatan absensi.</p>
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
                  const badge = statusBadge(r)
                  const noPhysical = !r.jam_masuk
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => navigate(`/attendance-history/${r.id}`)}
                      className="w-full rounded-2xl border bg-white p-3 text-left transition-colors hover:bg-paper"
                      style={{ borderColor: COLORS.border }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-[13px] font-bold" style={{ color: COLORS.ink }}>{fmt(r.tanggal)}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                            style={{ color: badge.color, background: badge.bg }}>
                            {badge.label}
                          </span>
                          <ChevronRight size={14} color={COLORS.inkSoft} />
                        </div>
                      </div>
                      {noPhysical ? (
                        <p className="text-[12px] italic" style={{ color: COLORS.inkSoft }}>
                          Tidak hadir fisik
                        </p>
                      ) : (
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: COLORS.inkSoft }}>
                            <LogIn size={13} color={COLORS.sage} />
                            <span className="font-semibold" style={{ color: COLORS.ink }}>{r.jam_masuk || '-'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: COLORS.inkSoft }}>
                            <LogOut size={13} color={COLORS.inkSoft} />
                            <span className="font-semibold" style={{ color: COLORS.ink }}>{r.jam_keluar || '-'}</span>
                          </div>
                          {r.lokasi && (
                            <span className="ml-auto truncate text-[11px]" style={{ color: COLORS.inkSoft }}>
                              {r.lokasi}
                            </span>
                          )}
                        </div>
                      )}
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
