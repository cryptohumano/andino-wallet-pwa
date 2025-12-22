// Polyfills para Node.js modules en el navegador
import { Buffer } from 'buffer'
window.Buffer = Buffer
globalThis.Buffer = Buffer

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'
import { KeyringProvider } from './contexts/KeyringContext'
import { NetworkProvider } from './contexts/NetworkContext'
import { Toaster } from '@/components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KeyringProvider>
      <NetworkProvider>
        <RouterProvider router={router} />
        <Toaster />
      </NetworkProvider>
    </KeyringProvider>
  </StrictMode>,
)

