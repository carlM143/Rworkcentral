export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return

  if (to.path === '/employee/login') {
    return
  }

  const auth = useAuth()
  auth.hydrate()

  if (!auth.isAuthenticated.value) {
    return navigateTo('/auth/login')
  }

  if (auth.portal.value !== 'employee') {
    return navigateTo(auth.homePath.value ?? '/auth/login')
  }
})
