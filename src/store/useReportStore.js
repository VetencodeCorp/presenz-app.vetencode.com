import { create } from 'zustand'
import api from '../lib/axios'

export const useReportStore = create((set, get) => ({
  reports: [],
  todayReport: { submitted: false, photos: [], description: '' },
  loading: false,
  submitting: false,
  error: '',

  loadReports: async () => {
    set({ loading: true, error: '' })
    try {
      const res = await api.get('/laporan-kegiatan')
      const list = res.data.data || []
      const today = new Date().toISOString().slice(0, 10)
      const todayItem = list.find((r) => r.tanggal === today)
      set({
        reports: list,
        todayReport: todayItem
          ? { submitted: true, id: todayItem.id, photos: todayItem.foto || [], description: todayItem.deskripsi || '' }
          : { submitted: false, photos: [], description: '' },
        loading: false,
      })
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memuat laporan.'
      set({ loading: false, error: msg, reports: [] })
    }
  },

  loadReportDetail: async (id) => {
    try {
      const res = await api.get(`/laporan-kegiatan/${id}`)
      return res.data.data
    } catch (err) {
      return null
    }
  },

  saveReport: async ({ photos, description }) => {
    set({ submitting: true, error: '' })
    try {
      const form = new FormData()
      form.append('deskripsi', description)

      for (let i = 0; i < photos.length; i++) {
        const p = photos[i]
        if (p instanceof File) {
          form.append('foto[]', p)
        } else if (typeof p === 'string' && p.startsWith('blob:')) {
          const blob = await fetch(p).then((r) => r.blob())
          form.append('foto[]', blob, `photo-${i}.jpg`)
        }
      }

      const res = await api.post('/laporan-kegiatan', form)
      const newReport = res.data.data
      set((state) => ({
        todayReport: {
          submitted: true,
          id: newReport.id,
          photos: newReport.foto || [],
          description: newReport.deskripsi || '',
        },
        reports: [newReport, ...state.reports],
        submitting: false,
      }))
      return { success: true, message: res.data.message }
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.foto?.[0]
        || err.response?.data?.errors?.deskripsi?.[0]
        || 'Gagal mengirim laporan.'
      set({ submitting: false, error: msg })
      return { success: false, message: msg }
    }
  },

  updateReport: async (id, { photos, description }) => {
    set({ submitting: true, error: '' })
    try {
      const form = new FormData()
      form.append('_method', 'PUT')
      form.append('deskripsi', description)

      for (let i = 0; i < photos.length; i++) {
        const p = photos[i]
        if (p instanceof File) {
          form.append('foto[]', p)
        } else if (typeof p === 'string' && p.startsWith('blob:')) {
          const blob = await fetch(p).then((r) => r.blob())
          form.append('foto[]', blob, `photo-${i}.jpg`)
        } else if (typeof p === 'string' && (p.startsWith('http') || p.startsWith('/storage'))) {
          // Untuk foto yang sudah ada di server, fetch lalu re-upload sebagai file
          // (karena backend replace semua foto)
          const blob = await fetch(p).then((r) => r.blob())
          form.append('foto[]', blob, `existing-${i}.jpg`)
        }
      }

      // Pakai POST + _method spoofing untuk upload file di "PUT"
      const res = await api.post(`/laporan-kegiatan/${id}`, form)
      const updated = res.data.data
      set((state) => ({
        todayReport: {
          submitted: true,
          id: updated.id,
          photos: updated.foto || [],
          description: updated.deskripsi || '',
        },
        reports: state.reports.map((r) => (r.id === updated.id ? updated : r)),
        submitting: false,
      }))
      return { success: true, message: res.data.message }
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.foto?.[0]
        || err.response?.data?.errors?.deskripsi?.[0]
        || 'Gagal memperbarui laporan.'
      set({ submitting: false, error: msg })
      return { success: false, message: msg }
    }
  },

  clearError: () => set({ error: '' }),

  resetReport: () => set({
    reports: [],
    todayReport: { submitted: false, photos: [], description: '' },
    loading: false,
    submitting: false,
    error: '',
  }),
}))
