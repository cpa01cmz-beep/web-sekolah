import '@/lib/errorReporter'

import { enableMapSet } from 'immer'

enableMapSet()

import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import { App } from './App'

import '@/index.css'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

// Do not touch this code

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
