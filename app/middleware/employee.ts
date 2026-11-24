import { EMPLOYEE_MODULE, employeeFeatureForPath, firstEmployeePath } from '~/utils/employeeAccess'

export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return

  if (to.path === '/employee/login') {
    return
  }

  const auth = useAuth()
  auth.hydrate()

  if (!auth.isAuthenticated.value) {
    return navigateTo('/')
  }

  if (auth.portal.value !== 'employee') {
    return navigateTo(auth.homePath.value ?? '/')
  }

  const feature = employeeFeatureForPath(to.path)

  if (feature && !auth.can(EMPLOYEE_MODULE, `${feature}.view`)) {
    // Without the Dashboard, land on the first page the role allows.
    if (to.path === '/employee' || to.path === '/employee/') {
      const landing = firstEmployeePath(auth.can)
      if (landing && landing !== '/employee') return navigateTo(landing)
    }

    return navigateTo({ path: '/employee/no-access', query: { from: to.fullPath } })
  }
})
