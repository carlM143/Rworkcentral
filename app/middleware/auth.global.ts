import { accessForPath, firstAllowedPath } from '~/utils/adminAccess'

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

  // =====================================================
  // ADMIN PAGES: role privileges (Roles & Permissions)
  // A page opens only when the user's role has its privilege, even when the
  // URL is typed directly. The API checks privileges as well.
  // =====================================================
  if (auth.isAuthenticated.value && to.path.startsWith('/admin')) {
    if (auth.portal.value !== 'admin') {
      return navigateTo(auth.homePath.value ?? '/auth/login')
    }

    const access = accessForPath(to.path)

    if (access && !auth.canAny(access.module, access.names)) {
      if (to.path === '/admin') {
        const landing = firstAllowedPath(auth.canAny)
        if (landing && landing !== '/admin') return navigateTo(landing)
      }

      return navigateTo({
        path: '/admin/no-access',
        query: { from: to.path === '/admin' ? 'dashboard' : to.fullPath },
      })
    }
  }
})
