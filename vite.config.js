import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    host: true,
    // Allow all hosts (untuk dev mode supaya ngrok / tunnel apapun bisa akses)
    allowedHosts: true,
    proxy: {
      // Forward semua request /api/* ke Laravel backend lokal
      // Jadi dari HP cukup akses URL ngrok app, backend tetap di laptop
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Forward juga akses storage (gambar) ke Laravel
      '/storage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['logo.png'],
      manifest: {
        name: 'PresenZ',
        short_name: 'PresenZ',
        description: 'Absensi dan laporan kerja harian karyawan.',
        theme_color: '#3B3E94',
        background_color: '#FAF6F0',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico}'] }
    })
  ]
})
