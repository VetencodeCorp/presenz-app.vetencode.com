import { Camera, MapPin, RotateCcw, X } from 'lucide-react'
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

  const isOut = mode === 'out'
  const title = isOut ? 'Absen Pulang' : 'Absen Masuk'
  const subtitle = isOut ? 'Pastikan wajah terlihat jelas' : 'Pastikan wajah terlihat jelas'

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
        setError('Tidak bisa membuka kamera. Izinkan akses kamera lalu coba lagi.')
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

    // Resize ke max 1280px (lebar/tinggi) sambil jaga aspect ratio supaya file kecil
    const MAX_DIM = 1280
    let w = video.videoWidth
    let h = video.videoHeight
    if (w > MAX_DIM || h > MAX_DIM) {
      const ratio = Math.min(MAX_DIM / w, MAX_DIM / h)
      w = Math.round(w * ratio)
      h = Math.round(h * ratio)
    }

    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Quality 0.75 — balance antara size dan kejelasan untuk verifikasi wajah
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.75))
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
    <main className="screen-no-nav flex h-full flex-col" style={{ background: COLORS.ink }}>
      {/* HEADER */}
      <div className="flex items-center justify-between px-1 py-3">
        <button
          onClick={() => navigate('/attendance')}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white"
          style={{ background: 'rgba(255,255,255,0.12)' }}
          aria-label="Tutup"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <h1 className="fraunces text-[18px] font-bold text-white">{title}</h1>
          <p className="text-[12px] text-white/60">{subtitle}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* PREVIEW AREA — landscape 4:3, tidak ngezoom */}
      <div className="flex flex-1 items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[20px]"
          style={{ aspectRatio: '4 / 3', background: '#000' }}>
          {photo ? (
            // Preview hasil — TIDAK di-flip lagi, supaya yang tampil = persis yang disimpan (mirror selfie)
            <img src={photo} alt="Pratinjau" className="h-full w-full object-contain" />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full scale-x-[-1] object-contain"
              />
              {!cameraReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                    <Camera size={26} />
                  </div>
                  <p className="text-[14px] font-semibold">Membuka kamera...</p>
                  <p className="mt-1 text-[11px] text-white/60">Izinkan akses kamera</p>
                </div>
              )}

              {/* Frame guide oval (proporsional landscape) */}
              {cameraReady && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div
                    className="rounded-full border-2 border-dashed"
                    style={{
                      height: '78%',
                      aspectRatio: '3 / 4',
                      borderColor: 'rgba(255,255,255,0.4)',
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* Floating chip GPS hint */}
          {cameraReady && !photo && (
            <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-white"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
              <MapPin size={11} /> GPS aktif
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* ERROR */}
      {(error || storeError) && (
        <p className="mb-3 rounded-xl px-4 py-3 text-[13px] font-semibold text-white"
          style={{ background: 'rgba(181,84,74,0.25)', border: '1px solid rgba(181,84,74,0.4)' }}>
          {error || storeError}
        </p>
      )}

      {/* ACTIONS */}
      {!photo ? (
        <div className="flex items-center justify-center pb-2">
          <button
            onClick={takePhoto}
            disabled={!cameraReady || submitting}
            className="flex h-20 w-20 items-center justify-center rounded-full transition disabled:opacity-50"
            style={{
              background: COLORS.white,
              boxShadow: '0 0 0 4px rgba(255,255,255,0.25)',
            }}
            aria-label="Ambil Foto"
          >
            <span className="h-16 w-16 rounded-full" style={{ background: COLORS.terracotta }} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-2">
          <button
            onClick={retakePhoto}
            disabled={submitting}
            className="flex h-14 items-center justify-center gap-2 rounded-xl text-[15px] font-bold text-white disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <RotateCcw size={18} /> Ulangi
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex h-14 items-center justify-center rounded-xl text-[15px] font-bold text-white disabled:opacity-50"
            style={{ background: COLORS.terracotta, boxShadow: '0 4px 14px rgba(59,62,148,0.4)' }}
          >
            {submitting ? 'Mengirim...' : 'Kirim Absen'}
          </button>
        </div>
      )}
    </main>
  )
}
