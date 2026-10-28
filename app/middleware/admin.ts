export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.client) return

  const auth = useAuth()
  auth.hydrate()

  if (!auth.isAuthenticated.value) {
    return navigateTo('/auth/login')
  }

  if (auth.portal.value !== 'admin') {
    return navigateTo(auth.homePath.value ?? '/auth/login')
  }
})
