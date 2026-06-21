import { CalendarDays, Plus } from 'lucide-react'
import { useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS } from '../constants/colors'
import { useReportStore } from '../store/useReportStore'

export default function RequestScreen() {
  const [type, setType] = useState('Sakit')
  const [date, setDate] = useState('2026-06-19')
  const [reason, setReason] = useState('')
  const [fileName, setFileName] = useState('')
  const { requests, addRequest } = useReportStore()
  const submit = (event) => { event.preventDefault(); addRequest({ type, date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), reason, fileName }); setReason(''); setFileName('') }
  return (
    <main className="screen safe-bottom">
      <ScreenHeader title="Pengajuan" subtitle="Sakit, izin, atau cuti" />
      <form onSubmit={submit}>
        <div className="mb-7 grid grid-cols-3 gap-3">{['Sakit', 'Izin', 'Cuti'].map((item) => <button type="button" key={item} onClick={() => setType(item)} className="h-14 rounded-xl border text-[13px] font-bold" style={{ background: type === item ? COLORS.terracotta : COLORS.white, borderColor: COLORS.border, color: type === item ? COLORS.white : COLORS.ink }}>{item}</button>)}</div>
        <label className="block"><span className="mb-4 block text-[14px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Tanggal</span><div className="relative"><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-14 w-full rounded-xl border bg-white px-5 text-[14px]" style={{ borderColor: COLORS.border, color: COLORS.ink }} /><CalendarDays className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2" color={COLORS.inkSoft} /></div></label>
        <label className="mt-7 block"><span className="mb-4 block text-[14px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Alasan</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Jelaskan alasan secara singkat" className="h-32 w-full resize-none rounded-2xl border bg-white p-5 text-[14px]" style={{ borderColor: COLORS.border, color: COLORS.ink }} /></label>
        <label className="mt-7 block"><span className="mb-4 block text-[14px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Lampiran Bukti (Opsional)</span><input type="file" onChange={(event) => setFileName(event.target.files?.[0]?.name || '')} className="hidden" id="proof" /><label htmlFor="proof" className="flex h-16 items-center justify-center gap-4 rounded-xl border border-dashed bg-white text-[13px]" style={{ borderColor: COLORS.border, color: COLORS.inkSoft }}><Plus color={COLORS.terracotta} />{fileName || 'Unggah surat dokter / dokumen'}</label></label>
        <button className="mt-8 h-14 w-full rounded-xl text-[14px] font-bold text-white" style={{ background: COLORS.terracotta, boxShadow: '0 4px 14px rgba(201,99,66,0.3)' }}>Kirim Pengajuan</button><p className="mt-4 text-center text-[13px]" style={{ color: COLORS.inkSoft }}>Pengajuan otomatis tercatat tanpa perlu persetujuan.</p>
      </form>
      <section className="mt-10"><h2 className="mb-4 text-[14px] font-bold uppercase tracking-wide" style={{ color: COLORS.inkSoft }}>Riwayat Terbaru</h2><div className="space-y-3">{requests.map((request, index) => <div key={`${request.type}-${index}`} className="flex items-center justify-between rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.border }}><div><b className="text-[13px]" style={{ color: COLORS.ink }}>{request.type}</b><p className="mt-1" style={{ color: COLORS.inkSoft }}>{request.date}</p></div><span className="rounded-xl px-4 py-2 text-sm font-bold" style={{ background: COLORS.sageBg, color: COLORS.sage }}>{request.status}</span></div>)}</div></section>
    </main>
  )
}
