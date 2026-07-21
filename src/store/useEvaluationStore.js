import { create } from 'zustand'
import api from '../lib/axios'

export const useEvaluationStore = create((set, get) => ({
  list: [],
  details: {},
  loading: false,
  submitting: false,
  error: '',

  loadList: async () => {
    set({ loading: true, error: '' })
    try {
      const res = await api.get('/evaluasi')
      set({ list: res.data.data || [], loading: false })
      return res.data.data
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal memuat tugas evaluasi.'
      set({ loading: false, error: message })
      return null
    }
  },

  loadDetail: async (id, refresh = false) => {
    if (!refresh && get().details[id]) return get().details[id]
    try {
      const res = await api.get(`/evaluasi/${id}`)
      const detail = res.data.data
      set((state) => ({ details: { ...state.details, [id]: detail } }))
      return detail
    } catch (_) {
      return null
    }
  },

  submit: async (id, answers) => {
    set({ submitting: true, error: '' })
    try {
      const res = await api.post(`/evaluasi/${id}/submit`, {
        jawaban: Object.entries(answers).map(([questionId, value]) => ({
          pertanyaan_id: Number(questionId),
          nilai: Number(value),
        })),
      })
      set((state) => {
        const details = { ...state.details }
        delete details[id]
        return { submitting: false, details }
      })
      await get().loadList()
      return { success: true, message: res.data.message }
    } catch (err) {
      const message = err.response?.data?.message
        || err.response?.data?.errors?.jawaban?.[0]
        || 'Gagal mengirim evaluasi.'
      set({ submitting: false, error: message })
      return { success: false, message }
    }
  },

  resetEvaluation: () => set({ list: [], details: {}, loading: false, submitting: false, error: '' }),
}))
