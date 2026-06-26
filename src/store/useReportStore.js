import { create } from 'zustand'
import api from '../lib/axios'

/**
 * Multi-entry: 1 hari bisa lebih dari 1 laporan.
 * Tidak ada lagi konsep `todayReport singular`.
 * - reports: semua laporan karyawan (urut terbaru)
 * - todayReports: derived dari reports.filter(tanggal == hari ini)
 */
export const useReportStore = create((set, get) => ({
  reports: [],
  loading: false,
  submitting: false,
  error: '',

  todayDate: () => new Date().toISOString().slice(0, 10),
  todayReports: () => {
    const t = get().todayDate()
    return get().reports.filter((r) => r.tanggal === t)
  },

  loadReports: async () => {
    set({ loading: true, error: '' })
    try {
      const res = await api.get('/laporan-kegiatan')
      set({ reports: res.data.data || [], loading: false })
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memuat laporan.'
      set({ loading: false, error: msg, reports: [] })
    }
  },

  loadReportDetail: async (id) => {
    try {
      const res = await api.get(`/laporan-kegiatan/${id}`)
      return res.data.data
    } catch {
      return null
    }
  },

  /** Buat laporan baru. payload: { judul, waktu, description, photos } */
  saveReport: async ({ judul, waktu, description, photos }) => {
    set({ submitting: true, error: '' })
    try {
      const form = new FormData()
      if (judul) form.append('judul', judul)
      if (waktu) form.append('waktu', waktu)
      form.append('deskripsi', description)
      await appendPhotos(form, photos)

      const res = await api.post('/laporan-kegiatan', form)
      const newReport = res.data.data
      set((state) => ({
        reports: [newReport, ...state.reports],
        submitting: false,
      }))
      return { success: true, message: res.data.message, report: newReport }
    } catch (err) {
      const msg = pickErr(err, 'Gagal mengirim laporan.')
      set({ submitting: false, error: msg })
      return { success: false, message: msg }
    }
  },

  /** Update laporan (hanya kalau hari ini). */
  updateReport: async (id, { judul, waktu, description, photos }) => {
    set({ submitting: true, error: '' })
    try {
      const form = new FormData()
      form.append('_method', 'PUT')
      if (judul) form.append('judul', judul)
      if (waktu) form.append('waktu', waktu)
      form.append('deskripsi', description)
      await appendPhotos(form, photos)

      const res = await api.post(`/laporan-kegiatan/${id}`, form)
      const updated = res.data.data
      set((state) => ({
        reports: state.reports.map((r) => (r.id === updated.id ? updated : r)),
        submitting: false,
      }))
      return { success: true, message: res.data.message, report: updated }
    } catch (err) {
      const msg = pickErr(err, 'Gagal memperbarui laporan.')
      set({ submitting: false, error: msg })
      return { success: false, message: msg }
    }
  },

  /** Hapus laporan (hanya kalau hari ini). */
  deleteReport: async (id) => {
    set({ submitting: true, error: '' })
    try {
      const res = await api.delete(`/laporan-kegiatan/${id}`)
      set((state) => ({
        reports: state.reports.filter((r) => r.id !== id),
        submitting: false,
      }))
      return { success: true, message: res.data.message }
    } catch (err) {
      const msg = pickErr(err, 'Gagal menghapus laporan.')
      set({ submitting: false, error: msg })
      return { success: false, message: msg }
    }
  },

  clearError: () => set({ error: '' }),

  resetReport: () => set({
    reports: [],
    loading: false,
    submitting: false,
    error: '',
  }),
}))

// ---- helpers ----
async function appendPhotos(form, photos) {
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i]
    if (p instanceof File) {
      form.append('foto[]', p)
    } else if (typeof p === 'string' && (p.startsWith('blob:') || p.startsWith('http') || p.startsWith('/storage'))) {
      const blob = await fetch(p).then((r) => r.blob())
      form.append('foto[]', blob, `photo-${i}.jpg`)
    }
  }
}

function pickErr(err, fallback) {
  return err.response?.data?.message
    || err.response?.data?.errors?.foto?.[0]
    || err.response?.data?.errors?.deskripsi?.[0]
    || err.response?.data?.errors?.judul?.[0]
    || err.response?.data?.errors?.waktu?.[0]
    || fallback
}
