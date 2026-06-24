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

      login: async (username, password) => {
        set({ loading: true, error: '', networkError: false })
        try {
          const res = await api.post('/login', { username, password })
          const { token, user, karyawan } = res.data
          localStorage.setItem('ct_token', token)
          set({
            employee: {
              id: karyawan.id,
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
            const msg = err.response?.data?.errors?.username?.[0] || err.response?.data?.message || 'Username atau kata sandi tidak sesuai.'
            set({ loading: false, error: msg, networkError: false })
          }
          return false
        }
      },

      refreshMe: async () => {
        try {
          const res = await api.get('/me')
          const { user, karyawan } = res.data
          if (!user) return false
          set((state) => ({
            employee: {
              ...(state.employee || {}),
              id: karyawan?.id ?? state.employee?.id,
              name: user.nama,
              firstName: user.nama?.split(' ')[0] || '',
              nip: karyawan?.nip ?? state.employee?.nip,
              no_hp: karyawan?.no_hp ?? state.employee?.no_hp,
              gender: karyawan?.gender ?? state.employee?.gender,
              alamat: karyawan?.alamat ?? state.employee?.alamat,
              photo: user.foto,
              email: user.email,
              role: state.employee?.role || 'Karyawan',
            },
          }))
          return true
        } catch (_) {
          return false
        }
      },

      logout: () => {
        api.post('/logout').catch(() => {})
        localStorage.removeItem('ct_token')
        set({ employee: null, token: null, isAuthenticated: false, error: '', networkError: false })
      },

      clearError: () => set({ error: '', networkError: false }),

      changePassword: async ({ passwordLama, passwordBaru, konfirmasi }) => {
        try {
          const res = await api.post('/me/change-password', {
            password_lama: passwordLama,
            password_baru: passwordBaru,
            konfirmasi_password: konfirmasi,
          })
          return { success: true, message: res.data.message }
        } catch (err) {
          const msg = err.response?.data?.errors?.password_lama?.[0]
            || err.response?.data?.errors?.password_baru?.[0]
            || err.response?.data?.errors?.konfirmasi_password?.[0]
            || err.response?.data?.message
            || 'Gagal mengubah password.'
          return { success: false, message: msg }
        }
      },
    }),
    {
      name: 'ct_auth',
      partialize: (state) => ({ employee: state.employee, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
)