import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/axios'

export const useReportStore = create(
  persist(
    (set, get) => ({
      todayReport: { submitted: false, photos: [], description: '' },
      reports: [],
      requests: [],
      loading: false,
      submitting: false,
      error: '',

      // Load all reports dari API
      loadReports: async () => {
        set({ loading: true, error: '' })
        try {
          const res = await api.get('/laporan-kegiatan')
          set({ reports: res.data.data || [], loading: false })
        } catch (err) {
          const message = err.response?.data?.message || 'Gagal memuat laporan.'
          set({ loading: false, error: message, reports: [] })
        }
      },

      // Load requests (pengajuan absensi) dari API
      loadRequests: async () => {
        try {
          const res = await api.get('/pengajuan-absensi')
          set({ requests: res.data.data || [] })
        } catch (err) {
          set({ requests: [] })
        }
      },

      // Submit report dengan photos dan description
      saveReport: async ({ photos, description }) => {
        set({ submitting: true, error: '' })
        try {
          const form = new FormData()
          form.append('tanggal', new Date().toISOString().slice(0, 10))
          form.append('deskripsi', description)
          
          // Handle files dari foto array
          if (photos && photos.length > 0) {
            for (let i = 0; i < photos.length; i++) {
              const photo = photos[i]
              if (photo instanceof File) {
                form.append('foto[]', photo)
              } else if (typeof photo === 'string' && photo.startsWith('blob:')) {
                // Convert blob URL to file jika diperlukan
                const blob = await fetch(photo).then(r => r.blob())
                form.append('foto[]', blob, "photo-" + i + ".jpg")
              }
            }
          }

          const res = await api.post('/laporan-kegiatan', form, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })

          set((state) => ({
            todayReport: { submitted: true, photos, description },
            reports: [res.data.data, ...state.reports],
            submitting: false,
            error: '',
          }))
          return { success: true, message: res.data.message }
        } catch (err) {
          const message = err.response?.data?.message || 'Gagal mengirim laporan.'
          set({ submitting: false, error: message })
          return { success: false, message }
        }
      },

      // Submit pengajuan absensi
      submitRequest: async (request) => {
        set({ submitting: true, error: '' })
        try {
          const form = new FormData()
          form.append('kategori_absensi_id', request.kategoriId)
          form.append('tanggal_mulai', request.tanggalMulai)
          form.append('tanggal_selesai', request.tanggalSelesai)
          form.append('keterangan', request.keterangan)
          
          if (request.file) {
            form.append('foto', request.file)
          }

          const res = await api.post('/pengajuan-absensi', form, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })

          set((state) => ({
            requests: [res.data.data, ...state.requests],
            submitting: false,
            error: '',
          }))
          return { success: true, message: res.data.message }
        } catch (err) {
          const message = err.response?.data?.message || 'Gagal mengirim pengajuan.'
          set({ submitting: false, error: message })
          return { success: false, message }
        }
      },

      resetReport: () => set({
        todayReport: { submitted: false, photos: [], description: '' },
        reports: [],
        requests: [],
        loading: false,
        submitting: false,
        error: '',
      }),
    }),
    { name: 'ct_report' },
  ),
)


