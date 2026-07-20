import { create } from 'zustand'
import api from '../lib/axios'

export const usePayrollStore = create((set, get) => ({
  list: [],
  details: {},
  loading: false,
  error: '',

  loadList: async () => {
    set({ loading: true, error: '' })
    try {
      const res = await api.get('/payroll')
      set({ list: res.data.data || [], loading: false })
      return res.data.data
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memuat slip gaji.'
      set({ loading: false, error: message })
      return null
    }
  },

  loadDetail: async (id) => {
    if (get().details[id]) return get().details[id]

    try {
      const res = await api.get(`/payroll/${id}`)
      const detail = res.data.data
      set((state) => ({ details: { ...state.details, [id]: detail } }))
      return detail
    } catch (_) {
      return null
    }
  },

  resetPayroll: () => set({ list: [], details: {}, loading: false, error: '' }),
}))
