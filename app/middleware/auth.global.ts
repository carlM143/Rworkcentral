export default defineNuxtRouteMiddleware((to) => {

  if (!import.meta.client) {
    return
  }

  const isAuthenticated =
    sessionStorage.getItem(
      'rworkcentral-auth',
    ) === '1'

  const publicRoutes = [
    '/admin/login',
  ]

  const isPublicRoute =
    publicRoutes.includes(
      to.path,
    )

  if (
    !isAuthenticated &&
    !isPublicRoute
  ) {
    return navigateTo(
      '/admin/login',
    )
  }

  if (
    isAuthenticated &&
    to.path === '/admin/login'
  ) {
    return navigateTo('/')
  }
})