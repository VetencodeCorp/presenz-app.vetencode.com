import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'

export default function ScreenHeader({ title, subtitle, backTo }) {
  const navigate = useNavigate()
  return (
    <header className="mb-7">
      {backTo !== undefined && (
        <button onClick={() => (backTo ? navigate(backTo) : navigate(-1))} className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border" style={{ background: COLORS.white, borderColor: COLORS.border }} aria-label="Kembali">
          <ChevronLeft size={25} color={COLORS.ink} />
        </button>
      )}
      <h1 className="fraunces text-[42px] font-bold leading-none tracking-[-0.03em]" style={{ color: COLORS.ink }}>{title}</h1>
      {subtitle && <p className="mt-2 text-[18px] font-medium" style={{ color: COLORS.inkSoft }}>{subtitle}</p>}
    </header>
  )
}
