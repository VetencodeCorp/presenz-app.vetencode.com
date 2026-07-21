import { CheckCircle2, ChevronRight, Star, Users } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { useEvaluationStore } from '../store/useEvaluationStore'

function formatDeadline(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function EvaluationScreen() {
  const navigate = useNavigate()
  const { list, loading, error, loadList } = useEvaluationStore()

  useEffect(() => { loadList() }, [loadList])

  const pending = list.filter((item) => item.status === 'belum_diisi' && item.periode.status === 'dibuka')
  const completed = list.filter((item) => item.status === 'selesai')

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Evaluasi Rekan" subtitle="Nilai rekan kerja secara jujur dan objektif" backTo="/profile" />

      <section className="relative mb-7 overflow-hidden rounded-[28px] p-5 text-white" style={{ background: COLORS.primary }}>
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white/15"><Users size={25} /></div>
          <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">Tugas belum selesai</p><p className="fraunces mt-1 text-[30px] font-bold">{pending.length}</p></div>
        </div>
        <p className="relative mt-4 text-[12px] leading-relaxed text-white/65">Jawaban bersifat rahasia. Rekan yang dinilai tidak melihat identitas penilai.</p>
      </section>

      {loading ? <Message>Memuat tugas evaluasi...</Message> : error ? <Message error>{error}</Message> : list.length === 0 ? (
        <div className="rounded-3xl border border-dashed py-14 text-center" style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          <Star size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-[14px] font-semibold">Belum ada tugas evaluasi.</p>
        </div>
      ) : <>
        <TaskSection title="Perlu Diisi" items={pending} navigate={navigate} />
        <TaskSection title="Sudah Selesai" items={completed} navigate={navigate} completed />
      </>}
    </main>
  )
}

function TaskSection({ title, items, navigate, completed = false }) {
  if (items.length === 0) return null
  return <section className="mb-7"><h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: COLORS.inkSoft }}>{title}</h2><div className="flex flex-col gap-3">{items.map((item) => <button key={item.id} type="button" onClick={() => navigate(`/evaluations/${item.id}`)} className="flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left" style={{ borderColor: COLORS.border }}><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: completed ? COLORS.sageBg : COLORS.accentLight }}>
    {completed ? <CheckCircle2 size={22} color={COLORS.sage} /> : <Star size={22} color={COLORS.primary} />}
  </div><div className="min-w-0 flex-1"><p className="truncate text-[14px] font-bold" style={{ color: COLORS.ink }}>{item.rekan.nama}</p><p className="mt-1 truncate text-[11px]" style={{ color: COLORS.inkSoft }}>{item.rekan.pekerjaan || 'Karyawan'} · {item.periode.nama}</p>{!completed && <p className="mt-1 text-[10px] font-semibold" style={{ color: COLORS.rust }}>Batas {formatDeadline(item.periode.tanggal_selesai)}</p>}</div><ChevronRight size={19} color={COLORS.inkSoft} /></button>)}</div></section>
}

function Message({ children, error }) { return <p className="rounded-2xl border bg-white px-4 py-4 text-[13px] font-semibold" style={{ borderColor: error ? COLORS.rust : COLORS.border, color: error ? COLORS.rust : COLORS.inkSoft }}>{children}</p> }
