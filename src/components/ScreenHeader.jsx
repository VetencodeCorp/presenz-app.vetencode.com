import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'

export default function ScreenHeader({ title, subtitle, backTo }) {
  const navigate = useNavigate()

  const heading = (
    <div className="min-w-0 flex-1">
      <h1
        className={`fraunces font-bold tracking-[-0.03em] ${backTo !== undefined ? 'text-[32px] leading-[1.05]' : 'text-[42px] leading-none'}`}
        style={{ color: COLORS.ink }}
      >
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-[18px] font-medium leading-snug" style={{ color: COLORS.inkSoft }}>{subtitle}</p>}
    </div>
  )

  return (
    <header className="mb-7">
      {backTo !== undefined ? (
        <div className="flex items-start gap-4">
          <button
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
            style={{ background: COLORS.white, borderColor: COLORS.border }}
            aria-label="Kembali"
          >
            <ChevronLeft size={25} color={COLORS.ink} />
          </button>
          {heading}
        </div>
      ) : heading}
    </header>
  )
}
