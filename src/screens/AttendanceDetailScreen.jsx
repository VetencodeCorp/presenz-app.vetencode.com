import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Clock, LogIn, LogOut, MapPin, AlertTriangle, ExternalLink, Hourglass, FileImage } from 'lucide-react'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { useAttendanceStore } from '../store/useAttendanceStore'

function fmtTanggal(s) {
  if (!s) return '-'
  const d = new Date(s + 'T00:00:00')
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const mons = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${days[d.getDay()]}, ${d.getDate()} ${mons[d.getMonth()]} ${d.getFullYear()}`
}

function statusBadge(row) {
  const kat = (row.kategori || '').toLowerCase()
  if (kat === 'sakit') return { label: 'Sakit', color: COLORS.rust, bg: COLORS.rustBg }
  if (kat === 'izin') return { label: 'Izin', color: COLORS.ochre, bg: COLORS.ochreBg }
  if (kat === 'cuti') return { label: 'Cuti', color: COLORS.sage, bg: COLORS.sageBg }
  if (kat === 'alpha') return { label: 'Alpha', color: COLORS.ink, bg: COLORS.paperDark }
  if (row.status === 'disetujui') return { label: 'Hadir', color: COLORS.sage, bg: COLORS.sageBg }
  if (row.status === 'pending') return { label: 'Menunggu Verifikasi', color: COLORS.ochre, bg: COLORS.ochreBg }
  if (row.status === 'ditolak') return { label: 'Ditolak', color: COLORS.rust, bg: COLORS.rustBg }
  return { label: row.status || '-', color: COLORS.inkSoft, bg: COLORS.paperDark }
}

function durasi(masuk, keluar) {
  if (!masuk || !keluar) return null
  const [hm, mm] = masuk.split(':').map(Number)
  const [hk, mk] = keluar.split(':').map(Number)
  const mins = (hk * 60 + mk) - (hm * 60 + mm)
  if (mins <= 0) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}j ${m}m`
}

export default function AttendanceDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { riwayat, loadRiwayat } = useAttendanceStore()
  const [loading, setLoading] = useState(false)
  const [lightbox, setLightbox] = useState(null) // url foto yang di-zoom

  const record = useMemo(() => riwayat.find((r) => String(r.id) === String(id)), [riwayat, id])

  useEffect(() => {
    // Kalau record tidak ketemu (mis. user direct-link / reload), reload riwayat
    if (!record) {
      setLoading(true)
      loadRiwayat().finally(() => setLoading(false))
    }
  }, [record, loadRiwayat])

  if (loading) {
    return (
      <main className="screen safe-bottom">
        <ScreenHeader title="Detail Absensi" backTo="/attendance-history" />
        <p className="text-center text-[13px]" style={{ color: COLORS.inkSoft }}>Memuat...</p>
      </main>
    )
  }

  if (!record) {
    return (
      <main className="screen safe-bottom">
        <ScreenHeader title="Detail Absensi" backTo="/attendance-history" />
        <div className="rounded-2xl border border-dashed py-10 text-center"
          style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}>
          <AlertTriangle size={32} className="mx-auto mb-2 opacity-60" />
          <p className="text-[13px]">Data absensi tidak ditemukan.</p>
          <button type="button" onClick={() => navigate('/attendance-history')}
            className="mt-3 text-[12px] font-bold underline" style={{ color: COLORS.terracotta }}>
            Kembali ke Riwayat
          </button>
        </div>
      </main>
    )
  }

  const badge = statusBadge(record)
  const dur = durasi(record.jam_masuk, record.jam_keluar)
  const noPhysical = !record.jam_masuk

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Detail Absensi" subtitle={fmtTanggal(record.tanggal)} backTo="/attendance-history" />

      {/* Status & Info Header */}
      <section className="rounded-2xl p-4 mb-4" style={{ background: COLORS.paperDark }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-[14px] font-bold" style={{ color: COLORS.ink }}>
            {record.kategori || 'Hadir'}
          </p>
          <span className="rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide"
            style={{ color: badge.color, background: badge.bg }}>
            {badge.label}
          </span>
        </div>

        {!noPhysical && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: COLORS.inkSoft }}>Masuk</p>
              <p className="fraunces text-[18px] font-bold" style={{ color: COLORS.sage }}>{record.jam_masuk || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: COLORS.inkSoft }}>Keluar</p>
              <p className="fraunces text-[18px] font-bold" style={{ color: record.jam_keluar ? COLORS.terracotta : COLORS.inkFaint }}>
                {record.jam_keluar || '-'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: COLORS.inkSoft }}>Durasi</p>
              <p className="fraunces text-[18px] font-bold" style={{ color: dur ? COLORS.ink : COLORS.inkFaint }}>
                {dur || '-'}
              </p>
            </div>
          </div>
        )}

        {noPhysical && (
          <p className="text-[12.5px] italic" style={{ color: COLORS.inkSoft }}>
            Tidak ada absensi fisik (mungkin sedang sakit, izin, atau cuti).
          </p>
        )}
      </section>

      {/* Alasan ditolak */}
      {record.status === 'ditolak' && record.alasan_ditolak && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border px-4 py-3"
          style={{ borderColor: COLORS.rust, background: COLORS.rustBg }}>
          <AlertTriangle size={18} className="mt-0.5 shrink-0" color={COLORS.rust} />
          <div>
            <p className="text-[12px] font-bold mb-0.5" style={{ color: COLORS.rust }}>Alasan Ditolak</p>
            <p className="text-[12.5px] leading-snug" style={{ color: COLORS.rust }}>{record.alasan_ditolak}</p>
          </div>
        </div>
      )}

      {/* Lokasi */}
      {record.lokasi_detail && (
        <section className="mb-4 rounded-2xl border bg-white p-3.5" style={{ borderColor: COLORS.border }}>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ background: COLORS.sageBg }}>
              <MapPin size={16} color={COLORS.sage} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: COLORS.inkSoft }}>Lokasi</p>
              <p className="text-[13px] font-bold truncate" style={{ color: COLORS.ink }}>
                {record.lokasi_detail.label || record.lokasi || 'Lokasi GPS'}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: COLORS.inkSoft }}>
                {record.lokasi_detail.latitude?.toFixed(6)}, {record.lokasi_detail.longitude?.toFixed(6)}
              </p>
            </div>
            {record.lokasi_detail.maps_url && (
              <a href={record.lokasi_detail.maps_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-[11.5px] font-bold"
                style={{ color: COLORS.terracotta }}>
                Maps <ExternalLink size={12} />
              </a>
            )}
          </div>
        </section>
      )}

      {/* Foto Masuk & Keluar */}
      {(record.foto_masuk || record.foto_keluar) && (
        <section className="mb-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>
            Foto Bukti
          </p>
          <div className="grid grid-cols-2 gap-3">
            <PhotoBox label="Masuk" time={record.jam_masuk} src={record.foto_masuk} icon={LogIn}
              iconColor={COLORS.sage} onClick={(u) => setLightbox(u)} />
            <PhotoBox label="Keluar" time={record.jam_keluar} src={record.foto_keluar} icon={LogOut}
              iconColor={COLORS.terracotta} onClick={(u) => setLightbox(u)} />
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 p-4">
          <img src={lightbox} alt="zoom" className="max-h-full max-w-full rounded-xl object-contain" />
        </div>
      )}
    </main>
  )
}

function PhotoBox({ label, time, src, icon: Icon, iconColor, onClick }) {
  return (
    <div className="rounded-2xl border bg-white p-2.5" style={{ borderColor: COLORS.border }}>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon size={13} color={iconColor} />
        <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>{label}</p>
        {time && <span className="ml-auto text-[11px] font-bold" style={{ color: COLORS.ink }}>{time}</span>}
      </div>
      {src ? (
        <button type="button" onClick={() => onClick(src)}
          className="block aspect-square w-full overflow-hidden rounded-xl border" style={{ borderColor: COLORS.border }}>
          <img src={src} alt={label} className="h-full w-full object-cover" />
        </button>
      ) : (
        <div className="flex aspect-square w-full flex-col items-center justify-center rounded-xl border border-dashed"
          style={{ borderColor: COLORS.border, color: COLORS.inkFaint }}>
          <FileImage size={22} className="opacity-60" />
          <span className="mt-1 text-[10.5px]">Belum ada foto</span>
        </div>
      )}
    </div>
  )
}
