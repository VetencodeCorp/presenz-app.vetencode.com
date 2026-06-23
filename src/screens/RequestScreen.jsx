import { CalendarDays, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { useReportStore } from '../store/useReportStore'
import api from '../lib/axios'

export default function RequestScreen() {
  const [type, setType] = useState('2') // Default ke kategori ID (needs to be adjusted)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { requests, loadRequests } = useReportStore()

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const form = new FormData()
      form.append('kategori_absensi_id', type)
      form.append('tanggal_mulai', date)
      form.append('tanggal_selesai', date)
      form.append('keterangan', reason)
      if (file) form.append('foto', file)

      const res = await api.post('/pengajuan-absensi', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setReason('')
      setFile(null)
      setType('2')
      await loadRequests()
      setSubmitting(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim pengajuan')
      setSubmitting(false)
    }
  }

  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Pengajuan" subtitle="Sakit, izin, atau cuti" />
      {error && <div className="mx-5 mb-4 rounded-xl border px-4 py-3 text-sm font-semibold" style={{ borderColor: COLORS.terracotta, color: COLORS.terracotta }}>{error}</div>}
      <form onSubmit={submit} className="px-5">
        <div className="mb-7 grid grid-cols-3 gap-3">
          {[{id: '1', label: 'Sakit'}, {id: '2', label: 'Izin'}, {id: '3', label: 'Cuti'}].map((item) => (
            <button key={item.id} type="button" onClick={() => setType(item.id)} className="h-14 rounded-xl border text-[13px] font-bold" style={{ background: type === item.id ? COLORS.terracotta : COLORS.white, borderColor: COLORS.border, color: type === item.id ? COLORS.white : COLORS.ink }}>
              {item.label}
            </button>
          ))}
        </div>
        <label className="block"><span className="mb-4 block text-[14px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Tanggal</span><div className="relative"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-14 w-full rounded-xl border bg-white px-5 text-[14px]" style={{ borderColor: COLORS.border, color: COLORS.ink }} /><CalendarDays className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2" color={COLORS.inkSoft} /></div></label>
        <label className="mt-7 block"><span className="mb-4 block text-[14px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Alasan</span><textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Jelaskan alasan secara singkat" className="h-32 w-full resize-none rounded-2xl border bg-white p-5 text-[14px]" style={{ borderColor: COLORS.border, color: COLORS.ink }} /></label>
        <label className="mt-7 block"><span className="mb-4 block text-[14px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Lampiran Bukti (Opsional)</span><input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" id="proof" /><label htmlFor="proof" className="flex h-16 items-center justify-center gap-4 rounded-xl border border-dashed bg-white text-[13px]" style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}><Plus color={COLORS.terracotta} />{file?.name || 'Unggah surat dokter / dokumen'}</label></label>
        <button disabled={submitting} className="mt-8 h-14 w-full rounded-xl text-[14px] font-bold text-white disabled:opacity-60" style={{ background: COLORS.terracotta, boxShadow: '0 4px 14px rgba(201,99,66,0.3)' }}>{submitting ? 'Mengirim...' : 'Kirim Pengajuan'}</button>
        <p className="mt-4 text-center text-[13px]" style={{ color: COLORS.inkSoft }}>Pengajuan otomatis tercatat tanpa perlu persetujuan.</p>
      </form>
      <section className="mt-10 px-5"><h2 className="mb-4 text-[14px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Riwayat Terbaru</h2><div className="space-y-3">{requests.map((request) => <div key={request.id} className="flex items-center justify-between rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.border }}><div><b className="text-[13px]" style={{ color: COLORS.ink }}>{request.kategori}</b><p className="mt-1" style={{ color: COLORS.inkSoft }}>{request.tanggal_mulai}</p></div><span className="rounded-xl px-4 py-2 text-sm font-bold" style={{ background: COLORS.sageBg, color: COLORS.sage }}>{request.status}</span></div>)}</div></section>
    </main>
  )
}
