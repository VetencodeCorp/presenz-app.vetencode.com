import { CheckCircle2, Lock, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { useEvaluationStore } from '../store/useEvaluationStore'

const labels = ['Sangat Kurang', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik']

export default function EvaluationDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loadDetail, submit, submitting, error } = useEvaluationStore()
  const [item, setItem] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadDetail(id, true).then((data) => {
      if (!cancelled) {
        setItem(data)
        setAnswers(Object.fromEntries((data?.pertanyaan ?? []).filter((q) => q.nilai).map((q) => [q.id, q.nilai])))
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id, loadDetail])

  if (loading) return <main className="screen safe-bottom"><ScreenHeader title="Evaluasi Rekan" backTo="/evaluations" /><Message>Memuat pertanyaan...</Message></main>
  if (!item) return <main className="screen safe-bottom"><ScreenHeader title="Evaluasi Rekan" backTo="/evaluations" /><Message error>Tugas evaluasi tidak ditemukan.</Message></main>

  const locked = item.status === 'selesai' || item.periode.status !== 'dibuka'
  const complete = item.pertanyaan.every((question) => answers[question.id])

  const handleSubmit = async () => {
    if (!complete) return
    if (!confirm('Submit evaluasi? Jawaban tidak bisa diubah setelah dikirim.')) return
    const result = await submit(item.id, answers)
    if (result.success) navigate('/evaluations', { replace: true })
  }

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Evaluasi Rekan" subtitle={item.periode.nama} backTo="/evaluations" />

      <section className="mb-6 rounded-3xl border bg-white p-5" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: COLORS.inkSoft }}>Rekan yang dinilai</p><p className="fraunces mt-1 text-[25px] font-bold" style={{ color: COLORS.ink }}>{item.rekan.nama}</p><p className="mt-1 text-[12px]" style={{ color: COLORS.inkSoft }}>{item.rekan.pekerjaan || 'Karyawan'}</p></div><div className="flex h-13 w-13 items-center justify-center rounded-2xl" style={{ background: locked ? COLORS.sageBg : COLORS.primaryLight }}>{locked ? <Lock size={23} color={COLORS.sage} /> : <Star size={25} color={COLORS.primary} />}</div></div>
        <div className="mt-4 rounded-xl px-3 py-2 text-[11px] leading-relaxed" style={{ background: COLORS.paper, color: COLORS.inkSoft }}>Nilai berdasarkan pengalaman kerja nyata. Hindari penilaian karena hubungan pribadi.</div>
      </section>

      <div className="flex flex-col gap-4">
        {item.pertanyaan.map((question, index) => {
          const value = answers[question.id] || 0
          return <article key={question.id} className="rounded-3xl border bg-white p-5" style={{ borderColor: value ? COLORS.accent : COLORS.border }}>
            <div className="flex items-center justify-between"><span className="rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider" style={{ background: COLORS.primaryLight, color: COLORS.primary }}>{question.kategori}</span><span className="text-[11px] font-bold" style={{ color: COLORS.inkFaint }}>{index + 1}/{item.pertanyaan.length}</span></div>
            <p className="mt-4 text-[15px] font-semibold leading-relaxed" style={{ color: COLORS.ink }}>{question.pertanyaan}</p>
            <div className="mt-5 flex justify-between gap-1">
              {[1, 2, 3, 4, 5].map((score) => <button key={score} type="button" disabled={locked} onClick={() => setAnswers((current) => ({ ...current, [question.id]: score }))} className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform active:scale-90 disabled:cursor-default" style={{ background: score <= value ? COLORS.primaryLight : COLORS.paper, border: `1.5px solid ${score <= value ? COLORS.primary : COLORS.border}` }}><Star size={25} color={score <= value ? COLORS.primaryDark : COLORS.inkFaint} fill={score <= value ? COLORS.primary : 'transparent'} /></button>)}
            </div>
            <p className="mt-3 min-h-5 text-center text-[12px] font-bold" style={{ color: value ? COLORS.accentDark : COLORS.inkFaint }}>{value ? `${value} · ${labels[value - 1]}` : 'Pilih nilai 1–5'}</p>
          </article>
        })}
      </div>

      {error && <div className="mt-4"><Message error>{error}</Message></div>}
      {locked ? <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-[13px] font-bold" style={{ background: COLORS.sageBg, color: COLORS.sage }}><CheckCircle2 size={19} /> Evaluasi sudah dikirim dan dikunci</div> : <button type="button" disabled={!complete || submitting} onClick={handleSubmit} className="mt-6 w-full rounded-2xl py-4 text-[15px] font-bold text-white disabled:opacity-40" style={{ background: COLORS.primary }}>{submitting ? 'Mengirim...' : complete ? 'Submit Evaluasi' : `Jawab ${item.pertanyaan.length - Object.keys(answers).length} pertanyaan lagi`}</button>}
    </main>
  )
}

function Message({ children, error }) { return <p className="rounded-2xl border bg-white px-4 py-4 text-[13px] font-semibold" style={{ borderColor: error ? COLORS.rust : COLORS.border, color: error ? COLORS.rust : COLORS.inkSoft }}>{children}</p> }
