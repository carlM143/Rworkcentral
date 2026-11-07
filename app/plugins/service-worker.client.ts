export default defineNuxtPlugin(() => {
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch((error) => {
        console.warn('Unable to register the application service worker.', error)
      })
    }, { once: true })
  }
})
