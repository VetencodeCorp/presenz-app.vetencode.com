import { CalendarDays, CircleMinus, ReceiptText, ShieldCheck, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { usePayrollStore } from '../store/usePayrollStore'

const money = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(Number(value || 0))

function formatDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function valueLabel(item) {
  if (item.tipe === 'persentase_gaji') return `${Number(item.nilai)}%${item.qty > 1 ? ` x ${item.qty}` : ''}`
  if (item.tipe === 'per_hari_kerja') return `${Number(item.nilai)} hari`
  return `${money(item.nilai)}${item.qty > 1 ? ` x ${item.qty}` : ''}`
}

function SummaryRow({ label, value, minus = false, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className={`text-[13px] ${strong ? 'font-bold' : 'font-medium'}`} style={{ color: strong ? COLORS.ink : COLORS.inkSoft }}>{label}</span>
      <span className={`text-[14px] ${strong ? 'font-bold' : 'font-semibold'}`} style={{ color: minus ? COLORS.rust : COLORS.ink }}>
        {minus && Number(value) > 0 ? '- ' : ''}{money(value)}
      </span>
    </div>
  )
}

export default function PayrollDetailScreen() {
  const { id } = useParams()
  const loadDetail = usePayrollStore((state) => state.loadDetail)
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <main className="screen safe-bottom">
        <ScreenHeader title="Detail Gaji" backTo="/payroll" />
        <p className="rounded-2xl border bg-white px-4 py-4 text-[14px] font-semibold"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>Memuat detail gaji...</p>
      </main>
    )
  }

  if (!item) {
    return (
      <main className="screen safe-bottom">
        <ScreenHeader title="Detail Gaji" backTo="/payroll" />
        <div className="rounded-3xl border border-dashed py-14 text-center" style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          <ReceiptText size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-[14px]">Slip gaji tidak ditemukan.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Detail Gaji" subtitle={item.periode_label} backTo="/payroll" />

      <section className="relative overflow-hidden rounded-[28px] p-6 text-white" style={{ background: COLORS.primary }}>
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <WalletCards size={24} />
          </div>
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck size={13} /> Final
          </span>
        </div>
        <p className="relative mt-7 text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">Gaji bersih</p>
        <p className="fraunces relative mt-1 text-[35px] font-bold leading-none">{money(item.gaji_bersih)}</p>
        {item.finalized_at && <p className="relative mt-4 text-[11px] text-white/55">Difinalisasi {formatDate(item.finalized_at)}</p>}
      </section>

      <section className="mt-6 rounded-3xl border bg-white px-5 py-2" style={{ borderColor: COLORS.border }}>
        <SummaryRow label="Gaji pokok" value={item.gaji_pokok} />
        <div className="h-px" style={{ background: COLORS.border }} />
        <SummaryRow label="Potongan manual" value={item.total_potongan_manual} minus />
        <SummaryRow label="Potongan absensi" value={item.total_potongan_absensi} minus />
        <div className="h-px" style={{ background: COLORS.border }} />
        <SummaryRow label="Total potongan" value={item.total_potongan} minus strong />
        <div className="h-px" style={{ background: COLORS.border }} />
        <SummaryRow label="Gaji bersih" value={item.gaji_bersih} strong />
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: COLORS.inkSoft }}>Rincian potongan</p>
            <p className="fraunces mt-1 text-[22px] font-bold" style={{ color: COLORS.ink }}>{item.potongan.length} komponen</p>
          </div>
          <CircleMinus size={25} color={COLORS.rust} />
        </div>

        {item.potongan.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-5 py-8 text-center" style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
            <p className="text-[13px]">Tidak ada potongan pada periode ini.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {item.potongan.map((detail) => (
              <article key={detail.id} className="rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.border }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider"
                      style={{ background: detail.sumber === 'absensi' ? COLORS.rustBg : COLORS.accentLight, color: detail.sumber === 'absensi' ? COLORS.rust : COLORS.accentDark }}>
                      {detail.sumber === 'absensi' ? 'Absensi' : 'Manual'}
                    </span>
                    <p className="mt-2 text-[14px] font-bold leading-snug" style={{ color: COLORS.ink }}>{detail.nama}</p>
                  </div>
                  <p className="shrink-0 text-[14px] font-bold" style={{ color: COLORS.rust }}>- {money(detail.subtotal)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3 text-[11px]" style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
                  <span>{valueLabel(detail)}</span>
                  {detail.tanggal_absensi && <span className="flex items-center gap-1"><CalendarDays size={12} /> {formatDate(detail.tanggal_absensi)}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
