import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const seedReports = [
  { tanggal: '2026-06-19', description: 'Membersihkan kandang kuda bagian barat dan memberi pakan tambahan untuk 3 ekor kuda yang sedang masa pemulihan.', photos: [] },
  { tanggal: '2026-06-18', description: 'Perawatan rutin burung merak: membersihkan kandang, mengganti air minum, dan mengecek kondisi bulu.', photos: [] },
]

export const useReportStore = create(
  persist(
    (set) => ({
      todayReport: { submitted: false, photos: [], description: '' },
      reports: seedReports,
      saveReport: ({ photos, description }) => set((state) => {
        const newReport = { tanggal: new Date().toISOString().slice(0, 10), description, photos };
        return {
          todayReport: { submitted: true, photos, description },
          reports: [newReport, ...state.reports],
        };
      }),
      addRequest: (request) => set((state) => ({
        requests: [{ ...request, status: 'Tercatat' }, ...state.requests],
      })),
      resetReport: () => set({
        todayReport: { submitted: false, photos: [], description: '' },
        requests: [],
      }),
    }),
    { name: 'ct_report' },
  ),
)