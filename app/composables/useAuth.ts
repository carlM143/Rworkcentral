export interface AuthRole {
  id?: number
  name?: string
}

export interface AuthUser {
  id?: number
  employee_id?: number | null
  name?: string
  email?: string
  role?: string | AuthRole | null
  roles?: Array<string | AuthRole>
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

const normalizeRole = (user: AuthUser | null) => {
  if (!user) return ''

  const candidate =
    user.role
    ?? user.roles?.[0]
    ?? user.user_type
    ?? user.type

  const value = typeof candidate === 'string'
    ? candidate
    : candidate?.name

  return value?.trim().toLowerCase() ?? ''
}

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const token = useState<string | null>('auth-token', () => null)
  const authenticated = useState('auth-authenticated', () => false)

  const hydrate = () => {
    if (!import.meta.client) return

    const authStorage = sessionStorage.getItem('rworkcentral-auth') === '1'
      ? sessionStorage
      : localStorage.getItem('rworkcentral-auth') === '1'
        ? localStorage
        : null

    if (!authStorage) {
      user.value = null
      token.value = null
      authenticated.value = false
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

    authenticated.value = Boolean(token.value && user.value)
  }

  const roleName = computed(() => normalizeRole(user.value))

  const portal = computed<Portal | null>(() => {
    if (ADMIN_ROLES.has(roleName.value)) return 'admin'
    if (EMPLOYEE_ROLES.has(roleName.value)) return 'employee'
    return null
  })

  const homePath = computed(() => {
    if (portal.value === 'admin') return '/admin'
    if (portal.value === 'employee') return '/employee'
    return null
  })

  const setSession = (options: {
    token: string
    user: AuthUser
    remember: boolean
  }) => {
    if (!import.meta.client) return

    const storage = options.remember ? localStorage : sessionStorage
    const otherStorage = options.remember ? sessionStorage : localStorage

    for (const key of [
      'rworkcentral-auth',
      'rworkcentral-token',
      'rworkcentral-user',
    ]) {
      otherStorage.removeItem(key)
    }

    storage.setItem('rworkcentral-auth', '1')
    storage.setItem('rworkcentral-token', options.token)
    storage.setItem('rworkcentral-user', JSON.stringify(options.user))

    token.value = options.token
    user.value = options.user
    authenticated.value = true
  }

  const clearSession = () => {
    if (import.meta.client) {
      for (const storage of [sessionStorage, localStorage]) {
        storage.removeItem('rworkcentral-auth')
        storage.removeItem('rworkcentral-token')
        storage.removeItem('rworkcentral-user')
      }
    }

    token.value = null
    user.value = null
    authenticated.value = false
  }

  return {
    user,
    token,
    isAuthenticated: readonly(authenticated),
    roleName,
    portal,
    homePath,
    hydrate,
    setSession,
    clearSession,
  }
}
