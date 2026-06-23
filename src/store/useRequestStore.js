import { create } from 'zustand'
import api from '../lib/axios'

export const useRequestStore = create((set, get) => ({
  list: [],
  loading: false,
  submitting: false,
  error: '',

  loadList: async () => {
    set({ loading: true, error: '' })
    try {
      const res = await api.get('/pengajuan-absensi')
      set({ list: res.data.data || [], loading: false })
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memuat riwayat pengajuan.'
      set({ loading: false, error: msg })
      return null
    }
  },

  submit: async ({ tipe, tanggalMulai, tanggalSelesai, keterangan, file }) => {
    set({ submitting: true, error: '' })
    try {
      const form = new FormData()
      form.append('tipe', tipe)
      form.append('tanggal_mulai', tanggalMulai)
      form.append('tanggal_selesai', tanggalSelesai)
      form.append('keterangan', keterangan)
      if (file) form.append('foto', file)

      const res = await api.post('/pengajuan-absensi', form)
      set({ submitting: false })
      await get().loadList()
      return { success: true, message: res.data.message }
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.errors?.tipe?.[0]
        || err.response?.data?.errors?.tanggal_mulai?.[0]
        || err.response?.data?.errors?.tanggal_selesai?.[0]
        || err.response?.data?.errors?.keterangan?.[0]
        || err.response?.data?.errors?.foto?.[0]
        || 'Gagal mengirim pengajuan.'
      set({ submitting: false, error: msg })
      return { success: false, message: msg }
    }
  },

  cancel: async (id) => {
    try {
      const res = await api.delete(`/pengajuan-absensi/${id}`)
      await get().loadList()
      return { success: true, message: res.data.message }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal membatalkan pengajuan.'
      return { success: false, message: msg }
    }
  },

  clearError: () => set({ error: '' }),
}))
