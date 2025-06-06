import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { PasswordReset } from './components/PasswordReset.tsx'
import { AdSenseVerification } from './components/AdSenseVerification.tsx'
import { registerServiceWorker } from './registerSW'

// Register service worker
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/adsense-verification" element={<AdSenseVerification />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)