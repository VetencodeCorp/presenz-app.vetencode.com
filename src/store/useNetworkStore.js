import { create } from 'zustand'

export const useNetworkStore = create((set, get) => ({
  isOnline: navigator.onLine,
  serverError: false,
  toast: null,

  setServerError: (value) => set({ serverError: value }),

  showToast: (message, type = 'error') => {
    // Clear any existing timer first
    if (get()._toastTimer) clearTimeout(get()._toastTimer)
    // Set the toast
    set({ toast: { message, type }, _toastTimer: null })
  },

  hideToast: () => {
    if (get()._toastTimer) clearTimeout(get()._toastTimer)
    set({ toast: null, _toastTimer: null })
  },

  setOnline: (value) => set({ isOnline: value }),

  cleanup: () => {
    if (get()._toastTimer) clearTimeout(get()._toastTimer)
  },
}))
