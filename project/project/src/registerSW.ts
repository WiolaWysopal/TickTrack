import { registerSW } from 'virtual:pwa-register'

// Only register service worker in production
export function registerServiceWorker() {
  // Skip service worker registration in development
  if (import.meta.env.DEV) {
    console.log('Service Worker registration skipped in development');
    return;
  }

  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        if (confirm('New content available. Reload?')) {
          updateSW(true)
        }
      },
      onOfflineReady() {
        const event = new CustomEvent('pwa-ready');
        window.dispatchEvent(event);
        console.log('App ready to work offline')
      },
      onRegistered(registration) {
        if (registration) {
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000) // Check for updates every hour
        }
        console.log('SW registered:', registration)
      },
      onRegisterError(error) {
        console.error('SW registration error:', error)
      }
    })
  }
}

// Only add install prompt listener in production
if (!import.meta.env.DEV) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    // @ts-ignore - Custom property for PWA install prompt
    window.deferredPrompt = e
  })
}

// Handle successful installation
window.addEventListener('appinstalled', () => {
  // @ts-ignore - Custom property for PWA install prompt
  window.deferredPrompt = null
  console.log('PWA installed successfully')
})