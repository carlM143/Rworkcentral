export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) {
    return
  }

  const auth = useAuth()
  auth.hydrate()

  const publicRoutes = [
    '/auth/login',
  ]

  const isPublicRoute = publicRoutes.includes(to.path)

  if (!auth.isAuthenticated.value && !isPublicRoute) {
    return navigateTo('/auth/login')
  }

  if (
    auth.isAuthenticated.value
    && to.path === '/auth/login'
    && auth.homePath.value
  ) {
    return navigateTo(auth.homePath.value)
  }
})
