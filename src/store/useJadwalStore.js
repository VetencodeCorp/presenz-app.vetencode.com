import { create } from 'zustand'
import api from '../lib/axios'

const empty = { start: null, end: null, hari: [] }

export const useJadwalStore = create((set) => ({
  jadwal: empty,
  loading: false,
  error: '',

  loadJadwal: async (params = {}) => {
    set({ loading: true, error: '' })
    try {
      const res = await api.get('/presensi/jadwal-saya', { params })
      set({ jadwal: res.data.data || empty, loading: false, error: '' })
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memuat jadwal.'
      set({ loading: false, error: msg, jadwal: empty })
      return null
    }
  },

  reset: () => set({ jadwal: empty, loading: false, error: '' }),
}))
