export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.client) return

  const auth = useAuth()
  auth.hydrate()

  if (!auth.isAuthenticated.value) {
    return navigateTo('/auth/login')
  }

  // Admin pages open in the admin portal, or inside the employee portal for
  // roles allowed in both (Admin Tools in the employee sidebar).
  const insideEmployeePortal = auth.portal.value === 'employee' && auth.canUsePortal('admin')

  if (auth.portal.value !== 'admin' && !insideEmployeePortal) {
    return navigateTo(auth.homePath.value ?? '/auth/login')
  }
})