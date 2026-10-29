export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) {
    return
  }

  const auth = useAuth()
  auth.hydrate()

  const publicRoutes = [
    '/',
    '/auth/login',
    '/employee/login',
  ]

  const isPublicRoute = publicRoutes.includes(to.path)

  if (!auth.isAuthenticated.value && !isPublicRoute) {
    const isAdminPath = to.path.startsWith('/admin')
    return navigateTo(isAdminPath ? '/auth/login' : '/')
  }

  if (
    auth.isAuthenticated.value
    && publicRoutes.includes(to.path)
    && auth.homePath.value
  ) {
    return navigateTo(auth.homePath.value)
  }
})
