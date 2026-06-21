import { useEffect, useRef } from 'react'
import { WifiOff, ServerOff, X } from 'lucide-react'
import { useNetworkStore } from '../store/useNetworkStore'

export default function NetworkBanner() {
  const { isOnline, serverError, setOnline, setServerError } = useNetworkStore()
  const timerRef = useRef(null)

  // Auto-clear serverError after 15 seconds in case no API call clears it
  useEffect(() => {
    if (serverError) {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setServerError(false)
        timerRef.current = null
      }, 15000)
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [serverError, setServerError])

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [setOnline])

  if (isOnline && !serverError) return null

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setServerError(false)
  }

  return (
    <div
      className='fixed left-1/2 z-[9998] flex max-w-[90vw] items-center gap-3 rounded-2xl px-4 py-3 shadow-xl'
      style={{
        background: '#2D2A26',
        color: '#FFFFFF',
        transform: 'translateX(-50%)',
        maxWidth: '400px',
        top: '80px',
      }}
    >
      {!isOnline ? <WifiOff size={20} className='shrink-0' /> : <ServerOff size={20} className='shrink-0' />}
      <div className='flex-1 min-w-0'>
        <p className='text-[13px] font-bold'>
          {!isOnline ? 'Tidak ada koneksi internet' : 'Gagal terhubung ke server'}
        </p>
        <p className='mt-0.5 text-[12px] opacity-80'>
          {!isOnline
            ? 'Periksa Wi-Fi atau data seluler.'
            : 'Server tidak merespon. Coba lagi nanti.'}
        </p>
      </div>
      <button
        onClick={dismiss}
        className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15'
        aria-label='Tutup'
      >
        <X size={15} color='#FFFFFF' />
      </button>
    </div>
  )
}
