import { useEffect, useRef } from 'react'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'
import { useNetworkStore } from '../store/useNetworkStore'
import { COLORS } from '../constants/colors'

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
}

const BG_COLORS = {
  success: '#7A8B6F',
  error: '#B5544A',
  warning: '#D4A24C',
}

export default function Toast() {
  const { toast, hideToast } = useNetworkStore()
  const timerRef = useRef(null)

  useEffect(() => {
    if (toast) {
      // Clear previous timer
      if (timerRef.current) clearTimeout(timerRef.current)
      // Auto-hide after 4 seconds
      timerRef.current = setTimeout(() => {
        hideToast()
        timerRef.current = null
      }, 4000)
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [toast, hideToast])

  if (!toast) return null

  const Icon = ICONS[toast.type] || ICONS.error

  return (
    <div
      className='fixed left-1/2 z-[9999] flex max-w-[90vw] animate-slide-down items-center gap-3 rounded-2xl px-5 py-4 shadow-xl'
      style={{
        background: BG_COLORS[toast.type] || BG_COLORS.error,
        color: '#FFFFFF',
        transform: 'translateX(-50%)',
        maxWidth: '400px',
        top: '24px',
      }}
    >
      <Icon size={22} color='#FFFFFF' />
      <p className='flex-1 text-[14px] font-semibold leading-snug'>{toast.message}</p>
      <button
        onClick={(e) => {
          e.stopPropagation()
          hideToast()
        }}
        className='flex h-8 w-8 items-center justify-center rounded-full bg-white/20'
      >
        <X size={18} color='#FFFFFF' />
      </button>
    </div>
  )
}
