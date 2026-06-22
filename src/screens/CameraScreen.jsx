import { Camera, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { useAttendanceStore } from '../store/useAttendanceStore'

const getCurrentPosition = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('Browser tidak mendukung geolocation.'))
    return
  }

  navigator.geolocation.getCurrentPosition(resolve, reject, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  })
})

const stopStream = (stream) => {
  stream?.getTracks().forEach((track) => track.stop())
}

export default function CameraScreen() {
  const navigate = useNavigate()
  const { mode } = useParams()
  const capture = useAttendanceStore((state) => state.capture)
  const submitting = useAttendanceStore((state) => state.submitting)
  const storeError = useAttendanceStore((state) => state.error)
  const [photo, setPhoto] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [error, setError] = useState('')
  const [cameraReady, setCameraReady] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const title = mode === 'out' ? 'Absen Pulang' : 'Absen Masuk'

  useEffect(() => {
    let cancelled = false

    const startCamera = async () => {
      setError('')
      try {
        stopStream(streamRef.current)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })

        if (cancelled) {
          stopStream(stream)
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch (_) {
        setError('Gagal membuka kamera depan. Izinkan akses kamera lalu coba lagi.')
      }
    }

    startCamera()

    return () => {
      cancelled = true
      stopStream(streamRef.current)
    }
  }, [])

  const takePhoto = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !cameraReady) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    context.translate(canvas.width, 0)
    context.scale(-1, 1)
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    if (!blob) {
      setError('Gagal mengambil foto. Coba ulangi.')
      return
    }

    if (photo) URL.revokeObjectURL(photo)
    const file = new File([blob], `absensi-${mode}-${Date.now()}.jpg`, { type: 'image/jpeg' })
    setPhotoFile(file)
    setPhoto(URL.createObjectURL(blob))
    setError('')
  }

  const retakePhoto = () => {
    if (photo) URL.revokeObjectURL(photo)
    setPhoto(null)
    setPhotoFile(null)
    setError('')
  }

  const submit = async () => {
    setError('')
    try {
      const position = await getCurrentPosition()
      const result = await capture(mode, {
        file: photoFile,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })

      if (result.success) {
        navigate('/attendance', { replace: true })
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err.message || 'Gagal mengambil lokasi. Izinkan akses lokasi lalu coba lagi.')
    }
  }

  return (
    <main className="screen-no-nav flex flex-col" style={{ background: COLORS.ink }}>
      <div className="mb-5 flex items-center justify-between text-white"><button onClick={() => navigate('/attendance')} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><X /></button><div className="text-center"><h1 className="text-lg font-bold">{title}</h1><p className="text-sm text-white/70">Gunakan kamera depan untuk absensi</p></div><button onClick={retakePhoto} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><RotateCcw /></button></div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[28px]" style={{ background: COLORS.paperDark }}>
        {photo ? <img src={photo} alt="Pratinjau absen" className="h-full w-full scale-x-[-1] object-cover" /> : <><video ref={videoRef} playsInline muted className="h-full w-full scale-x-[-1] object-cover" />{!cameraReady && <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"><div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full" style={{ background: COLORS.terracotta }}><Camera size={44} color={COLORS.white} /></div><p className="text-[16px] font-semibold" style={{ color: COLORS.ink }}>Membuka kamera depan...</p><p className="mt-2" style={{ color: COLORS.inkSoft }}>Izinkan akses kamera saat diminta browser.</p></div>}</>}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {(error || storeError) && <p className="mt-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-white">{error || storeError}</p>}
      <div className="mt-6 grid grid-cols-2 gap-4"><button onClick={photo ? retakePhoto : takePhoto} disabled={submitting || !cameraReady} className="h-14 rounded-xl border text-[16px] font-bold text-white disabled:opacity-60" style={{ borderColor: 'rgba(255,255,255,0.28)' }}>{photo ? 'Foto Ulang' : 'Ambil Foto'}</button><button onClick={submit} disabled={submitting || !photoFile} className="h-14 rounded-xl text-[16px] font-bold text-white disabled:opacity-60" style={{ background: COLORS.terracotta, boxShadow: '0 4px 14px rgba(201,99,66,0.3)' }}>{submitting ? 'Mengirim...' : 'Kirim Absen'}</button></div>
    </main>
  )
}
