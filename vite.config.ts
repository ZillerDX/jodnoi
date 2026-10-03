import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'mascot.svg', 'avatar.svg', 'icon-any.svg', 'icon-180.png'],
      manifest: {
        name: 'Jodnoi',
        short_name: 'Jodnoi',
        description: 'จดหน่อย - บันทึกรายรับรายจ่ายส่วนตัว ใช้ง่าย ใช้ได้ออฟไลน์',
        lang: 'th',
        display: 'standalone',
        orientation: 'portrait',
        id: '/',
        start_url: '/',
        background_color: '#f4f1ff',
        theme_color: '#f6f6f4',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 31536000 } },
          },
        ],
      },
    }),
  ],
  test: { environment: 'node' },
})
