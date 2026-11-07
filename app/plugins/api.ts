export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  let baseURL = config.public.apiBase

  // In local development, localhost on a phone refers to the phone itself.
  // Keep explicitly configured remote API hosts unchanged.
  if (import.meta.dev && import.meta.client) {
    const url = new URL(baseURL, window.location.origin)
    if (['localhost', '127.0.0.1'].includes(url.hostname) && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      url.hostname = window.location.hostname
      baseURL = url.toString()
    }
  }

  const api = $fetch.create({
    baseURL,

    headers: {
      Accept: 'application/json',
    },

    onRequest({ options }) {
      if (!import.meta.client) return

      const token =
        sessionStorage.getItem('rworkcentral-token')
        ?? localStorage.getItem('rworkcentral-token')

      if (token) {
        options.headers.set(
          'Authorization',
          `Bearer ${token}`,
        )
      }
    },
  })

  return {
    provide: {
      api,
    },
  }
})
