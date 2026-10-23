export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) {
    return
  }

  const isAuthenticated =
    sessionStorage.getItem('rworkcentral-auth') === '1'
    || localStorage.getItem('rworkcentral-auth') === '1'

  const publicRoutes = [
    '/auth/login',
  ]

  const isPublicRoute = publicRoutes.includes(to.path)

  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo('/auth/login')
  }

  if (isAuthenticated && to.path === '/auth/login') {
    return navigateTo('/')
  }
})
