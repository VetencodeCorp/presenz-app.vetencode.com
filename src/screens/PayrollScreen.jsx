import { ChevronRight, ReceiptText, WalletCards } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { usePayrollStore } from '../store/usePayrollStore'

const money = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(Number(value || 0))

export default function PayrollScreen() {
  const navigate = useNavigate()
  const { list, loading, error, loadList } = usePayrollStore()

  useEffect(() => { loadList() }, [loadList])

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Slip Gaji" subtitle="Rincian penghasilan yang sudah difinalisasi" backTo="/profile" />

      {loading ? (
        <p className="rounded-2xl border bg-white px-4 py-4 text-[14px] font-semibold"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          Memuat slip gaji...
        </p>
      ) : error ? (
        <div className="rounded-2xl border p-4" style={{ borderColor: COLORS.rust, background: COLORS.rustBg }}>
          <p className="text-[14px] font-semibold" style={{ color: COLORS.rust }}>{error}</p>
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-3xl border border-dashed px-6 py-14 text-center"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          <ReceiptText size={42} className="mx-auto mb-4 opacity-40" />
          <p className="fraunces text-[20px] font-bold" style={{ color: COLORS.ink }}>Belum ada slip gaji</p>
          <p className="mt-2 text-[13px] leading-relaxed">Slip muncul setelah payroll difinalisasi admin.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/payroll/${item.id}`)}
              className="relative overflow-hidden rounded-3xl border p-5 text-left"
              style={{
                borderColor: index === 0 ? COLORS.primary : COLORS.border,
                background: index === 0 ? COLORS.primary : COLORS.white,
                color: index === 0 ? COLORS.white : COLORS.ink,
              }}
            >
              {index === 0 && <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />}
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ background: index === 0 ? 'rgba(255,255,255,0.14)' : COLORS.primaryLight }}>
                  <WalletCards size={22} color={index === 0 ? COLORS.white : COLORS.primary} />
                </div>
                <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ background: index === 0 ? 'rgba(255,255,255,0.14)' : COLORS.sageBg, color: index === 0 ? COLORS.white : COLORS.sage }}>
                  Final
                </span>
              </div>

              <p className="relative mt-5 text-[12px] font-bold uppercase tracking-[0.14em] opacity-70">{item.periode_label}</p>
              <p className="fraunces relative mt-1 text-[28px] font-bold leading-none">{money(item.gaji_bersih)}</p>
              <p className="relative mt-2 text-[12px] opacity-70">Gaji bersih diterima</p>

              <div className="relative mt-5 flex items-end justify-between border-t pt-4"
                style={{ borderColor: index === 0 ? 'rgba(255,255,255,0.16)' : COLORS.border }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">Total potongan</p>
                  <p className="mt-1 text-[14px] font-bold">{money(item.total_potongan)}</p>
                </div>
                <ChevronRight size={22} className="opacity-70" />
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  )
}
