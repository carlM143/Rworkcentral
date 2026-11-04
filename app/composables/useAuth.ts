
export interface AuthRole {
  id?: number
  name?: string
}

export interface AuthPrivilege {
  id?: number
  module: string
  name: string
  description?: string | null
}

export interface AuthUser {
  id?: number
  employee_id?: number | null
  name?: string
  email?: string
  role?: string | AuthRole | null
  roles?: Array<string | AuthRole>
  privileges?: AuthPrivilege[]
  user_type?: string
  type?: string
  [key: string]: unknown
}

type Portal = 'admin' | 'employee'

const ADMIN_ROLES = new Set([
  'admin',
  'administrator',
  'human resources',
  'hr administrator',
])

const EMPLOYEE_ROLES = new Set([
  'employee',
  'manager',
  'supervisor',
])

const normalizeRole = (user: AuthUser | null): string => {
  if (!user) return ''

  const candidate =
    user.role ??
    user.roles?.[0] ??
    user.user_type ??
    user.type

  const value = typeof candidate === 'string'
    ? candidate
    : (
      typeof candidate === 'object' &&
      candidate !== null &&
      'name' in candidate
        ? String(candidate.name ?? '')
        : ''
    )

  return value.trim().toLowerCase()
}

export const useAuth = () => {
  const user = useState<AuthUser | null>(
    'auth-user',
    () => null,
  )

  const token = useState<string | null>(
    'auth-token',
    () => null,
  )

  const authenticated = useState(
    'auth-authenticated',
    () => false,
  )

  const hydrated = useState(
    'auth-hydrated',
    () => false,
  )

  const hydrate = () => {
    if (!import.meta.client) return

    const authStorage =
      sessionStorage.getItem('rworkcentral-auth') === '1'
        ? sessionStorage
        : localStorage.getItem('rworkcentral-auth') === '1'
          ? localStorage
          : null

    if (!authStorage) {
      user.value = null
      token.value = null
      authenticated.value = false
      hydrated.value = true
      return
    }

    token.value = authStorage.getItem('rworkcentral-token')

    try {
      const storedUser = authStorage.getItem('rworkcentral-user')

      user.value = storedUser
        ? JSON.parse(storedUser) as AuthUser
        : null
    } catch {
      user.value = null
    }

    authenticated.value = Boolean(
      token.value && user.value,
    )

    hydrated.value = true
  }

  const roleName = computed(() =>
    normalizeRole(user.value),
  )

  const portal = computed<Portal | null>(() => {
    if (ADMIN_ROLES.has(roleName.value)) {
      return 'admin'
    }

    if (EMPLOYEE_ROLES.has(roleName.value)) {
      return 'employee'
    }

    return null
  })

  const homePath = computed(() => {
    if (portal.value === 'admin') return '/admin'
    if (portal.value === 'employee') return '/employee'
    return null
  })

  const privileges = computed<AuthPrivilege[]>(() => {
    return Array.isArray(user.value?.privileges)
      ? user.value.privileges
      : []
  })

  const can = (
    module: string,
    privilege: string,
  ): boolean => {
    if (!authenticated.value) return false

    return privileges.value.some(item =>
      item.module === module &&
      item.name === privilege,
    )
  }

  const canAccessAdminTimekeeping = computed(() => {
    return portal.value === 'admin' &&
      can('timekeeping', 'view')
  })

  const setSession = (options: {
    token: string
    user: AuthUser
    remember: boolean
  }) => {
    if (!import.meta.client) return

    const storage = options.remember
      ? localStorage
      : sessionStorage

    const otherStorage = options.remember
      ? sessionStorage
      : localStorage

    for (const key of [
      'rworkcentral-auth',
      'rworkcentral-token',
      'rworkcentral-user',
    ]) {
      otherStorage.removeItem(key)
    }

    storage.setItem('rworkcentral-auth', '1')
    storage.setItem('rworkcentral-token', options.token)
    storage.setItem(
      'rworkcentral-user',
      JSON.stringify(options.user),
    )

    token.value = options.token
    user.value = options.user
    authenticated.value = true
    hydrated.value = true
  }

  const updateUser = (newUser: AuthUser) => {
    user.value = newUser

    if (!import.meta.client) return

    const storage =
      sessionStorage.getItem('rworkcentral-auth') === '1'
        ? sessionStorage
        : localStorage.getItem('rworkcentral-auth') === '1'
          ? localStorage
          : null

    storage?.setItem(
      'rworkcentral-user',
      JSON.stringify(newUser),
    )
  }

  
  const refreshUser = async (): Promise<boolean> => {
    if (!import.meta.client) return false

    if (!token.value) {
      hydrate()
    }

    if (!token.value) return false

    const { $api } = useNuxtApp()

    try {
      const response = await $api<{
        user?: AuthUser
        data?: {
          user?: AuthUser
        }
      }>('/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      })

      const freshUser =
        response.data?.user ?? response.user

      if (!freshUser) return false

      updateUser(freshUser)

      return true
    } catch (error: unknown) {
      const apiError = error as {
        status?: number
        statusCode?: number
      }

      const status =
        apiError.statusCode ?? apiError.status

      if (status === 401) {
        clearSession()
      }

      return false
    }
  }

  const clearSession = () => {
    if (import.meta.client) {
      for (const storage of [
        sessionStorage,
        localStorage,
      ]) {
        storage.removeItem('rworkcentral-auth')
        storage.removeItem('rworkcentral-token')
        storage.removeItem('rworkcentral-user')
      }
    }

    token.value = null
    user.value = null
    authenticated.value = false
    hydrated.value = true
  }

  return {
    user,
    token,
    privileges,
    isAuthenticated: readonly(authenticated),
    isHydrated: readonly(hydrated),
    roleName,
    portal,
    homePath,
    canAccessAdminTimekeeping,
    can,
    refreshUser,
    hydrate,
    setSession,
    updateUser,
    clearSession,
  }
}
