import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import os from 'os'

// Detectar si existen certificados SSL
const httpsConfig = (() => {
  const certPath = path.resolve(__dirname, '.certs/cert.pem')
  const keyPath = path.resolve(__dirname, '.certs/key.pem')
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    }
  }
  return false
})()

// Obtener IP local para acceso desde móvil
function getLocalIP(): string {
  try {
    const interfaces = os.networkInterfaces()
    if (!interfaces) return 'localhost'
    
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address
        }
      }
    }
  } catch {
    // Si no se puede obtener, usar localhost
  }
  return 'localhost'
}

const LOCAL_IP = getLocalIP()

// Detectar si estamos en GitHub Pages
// Si el repositorio no es username.github.io, necesitamos el base path
const getBase = () => {
  // En desarrollo, no usar base
  if (process.env.NODE_ENV === 'development' || !process.env.GITHUB_REPOSITORY) {
    return '/'
  }
  // En producción, usar el nombre del repositorio como base si existe
  const repoName = process.env.VITE_BASE_URL || process.env.GITHUB_REPOSITORY?.split('/')[1]
  // Si el repo es username.github.io, usar /, sino usar /repo-name/
  if (repoName && !repoName.includes('.github.io')) {
    return `/${repoName}/`
  }
  return '/'
}

// https://vite.dev/config/
export default defineConfig({
  base: getBase(),
  server: {
    host: '0.0.0.0', // Permitir acceso desde la red local
    port: 5173,
    // Deshabilitar HTTPS para desarrollo (comentar si necesitas HTTPS)
    // https: httpsConfig || undefined,
    strictPort: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      base: getBase(),
      scope: getBase(),
      filename: 'manifest.webmanifest',
      manifest: {
        name: 'Aura Wallet',
        short_name: 'Aura Wallet',
        description: 'Wallet criptográfica segura y privada para redes Substrate/Polkadot con WebAuthn, multi-cadena y gestión de identidad',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        start_url: getBase(),
        categories: ['finance', 'utilities', 'productivity'],
        lang: 'es',
        dir: 'ltr',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [],
        shortcuts: [
          {
            name: 'Inicio',
            short_name: 'Inicio',
            description: 'Ver resumen de cuentas y balances',
            url: getBase(),
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Enviar',
            short_name: 'Enviar',
            description: 'Enviar tokens a otra dirección',
            url: getBase() + 'send',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Cuentas',
            short_name: 'Cuentas',
            description: 'Gestionar cuentas del wallet',
            url: getBase() + 'accounts',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Identidad',
            short_name: 'Identidad',
            description: 'Gestionar identidad y privacidad',
            url: getBase() + 'identity',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: getBase() === '/' ? '/index.html' : getBase() + 'index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'external-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {},
    'global': 'globalThis',
    'process.browser': true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})

