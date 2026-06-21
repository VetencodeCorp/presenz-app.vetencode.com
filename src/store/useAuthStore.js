import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/axios'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      employee: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: '',
      networkError: false,

      login: async (nip, password) => {
        set({ loading: true, error: '', networkError: false })
        try {
          const res = await api.post('/login', { nip, password })
          const { token, user, karyawan } = res.data
          localStorage.setItem('ct_token', token)
          set({
            employee: {
              id: karyawan.nip,
              name: user.nama,
              firstName: user.nama.split(' ')[0],
              nip: karyawan.nip,
              no_hp: karyawan.no_hp,
              gender: karyawan.gender,
              alamat: karyawan.alamat,
              photo: user.foto,
              email: user.email,
              role: 'Karyawan',
            },
            token, isAuthenticated: true, loading: false, error: '', networkError: false,
          })
          return true
        } catch (err) {
          if (!err.response) {
            set({ loading: false, error: 'Gagal terhubung ke server. Periksa koneksi Anda.', networkError: true })
          } else {
            const msg = err.response?.data?.errors?.nip?.[0] || err.response?.data?.message || 'NIP atau kata sandi tidak sesuai.'
            set({ loading: false, error: msg, networkError: false })
          }
          return false
        }
      },

      logout: () => {
        api.post('/logout').catch(() => {})
        localStorage.removeItem('ct_token')
        set({ employee: null, token: null, isAuthenticated: false, error: '', networkError: false })
      },

      clearError: () => set({ error: '', networkError: false }),
    }),
    {
      name: 'ct_auth',
      partialize: (state) => ({ employee: state.employee, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
)