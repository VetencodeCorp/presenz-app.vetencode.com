import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const employee = {
  id: 'TK-014',
  password: '123456',
  name: 'Dedi Kurniawan',
  firstName: 'Dedi',
  role: 'Perawat Kuda',
  phone: '0812-3456-7890',
  joinedAt: '3 Maret 2023',
  schedule: '07:00 – 16:30',
}

export const useAuthStore = create(
  persist(
    (set) => ({
      employee,
      isAuthenticated: false,
      login: (id, password) => {
        if (id.trim().toUpperCase() === employee.id && password === employee.password) {
          localStorage.setItem('ct_token', 'dummy-token')
          set({ isAuthenticated: true })
          return true
        }
        return false
      },
      logout: () => {
        localStorage.removeItem('ct_token')
        set({ isAuthenticated: false })
      },
    }),
    { name: 'ct_auth', partialize: (state) => ({ isAuthenticated: state.isAuthenticated }) },
  ),
)
