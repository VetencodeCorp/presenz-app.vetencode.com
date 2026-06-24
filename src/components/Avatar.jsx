import { useEffect, useState } from 'react'
import { COLORS } from '../constants/colors'

// Helper: normalize URL foto dari backend (path mentah → /storage/...)
function resolveFotoUrl(src) {
  if (!src) return null
  if (src.startsWith('data:') || src.startsWith('http') || src.startsWith('/storage/')) return src
  return '/storage/' + src.replace(/^\/+/, '')
}

export default function Avatar({
  name = '',
  src,
  size = 56,
  rounded = '2xl',
  borderColor,
  bg,
  textColor,
  fontSize,
  shadow,
}) {
  const initial = (name?.trim()?.[0] || '?').toUpperCase()
  const url = resolveFotoUrl(src)
  const [failed, setFailed] = useState(false)

  useEffect(() => { setFailed(false) }, [url])

  const roundedClass = {
    'full': 'rounded-full',
    '2xl': 'rounded-2xl',
    'xl': 'rounded-xl',
  }[rounded] || 'rounded-2xl'

  const baseStyle = {
    width: size,
    height: size,
  }

  if (url && !failed) {
    return (
      <div
        className={`overflow-hidden border ${roundedClass}`}
        style={{ ...baseStyle, borderColor: borderColor || COLORS.border, boxShadow: shadow }}
      >
        <img
          src={url}
          alt={name}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  // Fallback initial
  return (
    <div
      className={`flex items-center justify-center border fraunces font-bold ${roundedClass}`}
      style={{
        ...baseStyle,
        background: bg || COLORS.ochreBg,
        borderColor: borderColor || '#D8B464',
        color: textColor || COLORS.rust,
        fontSize: fontSize || Math.round(size * 0.36),
        boxShadow: shadow,
      }}
    >
      {initial}
    </div>
  )
}
