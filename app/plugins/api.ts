export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,

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
