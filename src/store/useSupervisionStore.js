import { create } from 'zustand'
import api from '../lib/axios'

export const useSupervisionStore = create((set, get) => ({
  periods: [],
  loading: false,
  submitting: false,
  error: '',

  load: async () => {
    set({ loading: true, error: '' })
    try {
      const response = await api.get('/pengawasan')
      set({ periods: response.data.data || [], loading: false })
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || 'Gagal memuat monitoring wilayah.' })
    }
  },

  submit: async (id, payload) => {
    set({ submitting: true, error: '' })
    const form = new FormData()
    form.append('status_hasil', payload.status)
    form.append('keterangan', payload.keterangan)
    if (payload.latitude != null) form.append('latitude', payload.latitude)
    if (payload.longitude != null) form.append('longitude', payload.longitude)
    payload.photos.forEach((photo) => form.append('foto[]', photo))

    try {
      const response = await api.post(`/pengawasan/hasil/${id}`, form)
      await get().load()
      set({ submitting: false })
      return { success: true, message: response.data.message }
    } catch (error) {
      const errors = error.response?.data?.errors
      const message = errors ? Object.values(errors).flat()[0] : error.response?.data?.message
      set({ submitting: false, error: message || 'Gagal menyimpan hasil monitoring.' })
      return { success: false, message: message || 'Gagal menyimpan hasil monitoring.' }
    }
  },

  reset: () => set({ periods: [], loading: false, submitting: false, error: '' }),
}))
