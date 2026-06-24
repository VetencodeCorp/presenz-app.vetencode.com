import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/axios'

const emptyCheckIn = { done: false, time: null, photo: null, location: null, detail: null, status: null }
const emptyCheckOut = { done: false, time: null, photo: null, location: null, detail: null, status: null }
const emptySummary = { hadir: 0, sakit: 0, cuti: 0, izin: 0 }

const mapAbsensi = (absensi) => ({
  checkIn: absensi?.jam_masuk
    ? {
        done: true,
        time: absensi.jam_masuk,
        photo: absensi.foto_masuk,
        location: absensi.lokasi || absensi.lokasi_detail?.label || 'Lokasi GPS tercatat',
        detail: absensi.lokasi_detail,
        status: absensi.status,
      }
    : emptyCheckIn,
  checkOut: absensi?.jam_keluar
    ? {
        done: true,
        time: absensi.jam_keluar,
        photo: absensi.foto_keluar,
        location: absensi.lokasi || absensi.lokasi_detail?.label || 'Lokasi GPS tercatat',
        detail: absensi.lokasi_detail,
        status: absensi.status,
      }
    : emptyCheckOut,
})

export const useAttendanceStore = create(
  persist(
    (set, get) => ({
      monthSummary: emptySummary,
      checkIn: emptyCheckIn,
      checkOut: emptyCheckOut,
      pengajuanAktif: null,
      loading: false,
      submitting: false,
      error: '',

      loadToday: async () => {
        set({ loading: true, error: '' })
        try {
          const res = await api.get('/presensi/hari-ini')
          set({
            ...mapAbsensi(res.data.data),
            pengajuanAktif: res.data.pengajuan_aktif || null,
            loading: false,
            error: '',
          })
          return res.data.data
        } catch (err) {
          const message = err.response?.data?.message || 'Gagal memuat absensi hari ini.'
          set({ loading: false, error: message })
          return null
        }
      },

      loadMonthSummary: async () => {
        try {
          const res = await api.get('/presensi/rekap-bulan')
          set({ monthSummary: res.data.data?.summary || emptySummary })
        } catch (_) {
          set({ monthSummary: emptySummary })
        }
      },

      riwayat: [],

      loadRiwayat: async ({ limit, month, year } = {}) => {
        try {
          const params = {}
          if (limit) params.limit = limit
          if (month) params.month = month
          if (year) params.year = year
          const res = await api.get('/presensi/riwayat', { params })
          set({ riwayat: res.data.data || [] })
          return res.data.data
        } catch (_) {
          set({ riwayat: [] })
          return []
        }
      },

      capture: async (mode, { file, latitude, longitude }) => {
        set({ submitting: true, error: '' })
        try {
          const form = new FormData()
          form.append('latitude', latitude)
          form.append('longitude', longitude)
          if (file) form.append('foto', file)

          const endpoint = mode === 'out' ? '/presensi/checkout' : '/presensi/checkin'
          const res = await api.post(endpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } })
          set({ ...mapAbsensi(res.data.data), submitting: false, error: '' })
          await get().loadMonthSummary()
          return { success: true, message: res.data.message }
        } catch (err) {
          const message = err.response?.data?.message || 'Gagal mengirim absensi.'
          if (err.response?.data?.data) set(mapAbsensi(err.response.data.data))
          set({ submitting: false, error: message })
          return { success: false, message }
        }
      },

      resetAttendance: () => set({
        checkIn: emptyCheckIn,
        checkOut: emptyCheckOut,
        monthSummary: emptySummary,
        pengajuanAktif: null,
        loading: false,
        submitting: false,
        error: '',
      }),
    }),
    {
      name: 'ct_attendance',
      partialize: (state) => ({ monthSummary: state.monthSummary, checkIn: state.checkIn, checkOut: state.checkOut, pengajuanAktif: state.pengajuanAktif }),
    },
  ),
)
