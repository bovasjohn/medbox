import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

// Version comes from package.json; the build code is the build date and time (UTC),
// stamped automatically on every build, e.g. 20261110.0715
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const now = new Date()
const p = (n) => String(n).padStart(2, '0')
const buildCode = `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}.${p(now.getUTCHours())}${p(now.getUTCMinutes())}`

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_CODE__: JSON.stringify(buildCode),
    __VERSION_CODE__: JSON.stringify(String(pkg.versionCode ?? 0).padStart(5, '0')),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'MedMaintain',
        short_name: 'MedMaintain',
        description: 'Track planned preventive maintenance of medical equipment.',
        theme_color: '#356AE6',
        background_color: '#F5F7FA',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})
