import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAttendanceStore = create(
  persist(
    (set) => ({
      monthSummary: { hadir: 18, sakit: 1, cuti: 2, izin: 0 },
      checkIn: { done: true, time: '07:12', photo: null, location: 'Estate Cigombong' },
      checkOut: { done: false, time: null, photo: null, location: 'Estate Cigombong' },
      capture: (mode, photo) => {
        const time = mode === 'in' ? '07:12' : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
        set((state) => ({
          checkIn: mode === 'in' ? { ...state.checkIn, done: true, time, photo } : state.checkIn,
          checkOut: mode === 'out' ? { ...state.checkOut, done: true, time, photo } : state.checkOut,
        }))
      },
      resetAttendance: () => set({ checkIn: { done: false, time: null, photo: null, location: 'Estate Cigombong' }, checkOut: { done: false, time: null, photo: null, location: 'Estate Cigombong' } }),
    }),
    { name: 'ct_attendance' },
  ),
)
