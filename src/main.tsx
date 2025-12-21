// Polyfills para Node.js modules en el navegador
import { Buffer } from 'buffer'
window.Buffer = Buffer
globalThis.Buffer = Buffer

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { KeyringProvider } from './contexts/KeyringContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KeyringProvider>
      <App />
    </KeyringProvider>
  </StrictMode>,
)

