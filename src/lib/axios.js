import axios from 'axios'
import { useNetworkStore } from '../store/useNetworkStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  headers: {
    // Wajib supaya ngrok free tier tidak return warning HTML page
    'ngrok-skip-browser-warning': 'true',
  },
})

// Clear server error flag on any successful request (backend is back)
api.interceptors.response.use(
  (response) => {
    useNetworkStore.getState().setServerError(false)
    return response
  },
  (error) => {
    if (!error.response) {
      useNetworkStore.getState().setServerError(true)
      useNetworkStore.getState().showToast(
        'Gagal terhubung ke server. Periksa koneksi Anda.',
        'error'
      )
    } else {
      useNetworkStore.getState().setServerError(false)
      if (error.response?.status === 401) {
        localStorage.removeItem('ct_token')
        localStorage.removeItem('ct_auth')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ct_token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  // Ensure ngrok header tetap ada (supaya bypass warning page tiap request)
  config.headers['ngrok-skip-browser-warning'] = 'true'
  return config
})

export default api
