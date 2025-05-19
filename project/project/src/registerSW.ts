import { registerSW } from 'virtual:pwa-register'

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    registerSW({
      immediate: false,
      onNeedRefresh() {
        // Silent update without prompting
        const updateSW = registerSW()
        updateSW(true)
      },
      onOfflineReady() {
        console.log('App ready to work offline')
      },
      onRegisteredSW(swUrl, r) {
        console.log('SW registered:', r)
      }
    })
  }
}