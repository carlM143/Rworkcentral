import type {
  SystemUser,
  SystemUserRole,
  SystemUserStatus,
} from '~/types/userAccess'

interface SystemUserApiRecord {
  user_id: number | null
  employee_id: number | null
  name: string
  email: string | null
  role: { id: number; name: string } | null
  department: { id: number; name: string; code: string } | null
  account_status: string
  two_factor_status: string
  last_login_at: string | null
  can_setup_account: boolean
}

interface SystemUsersApiResponse {
  success: boolean
  message: string
  data: SystemUserApiRecord[]
}

export interface SystemUserRoleOption {
  id: number
  name: string
}

interface SystemUserEditResponse {
  success: boolean
  message: string
  data: {
    user: SystemUserApiRecord
    available_roles: SystemUserRoleOption[]
  }
}

interface SystemUserUpdateResponse {
  success: boolean
  message: string
  data: SystemUserApiRecord
}

const mapAccountStatus = (status: string): SystemUserStatus => {
  const normalizedStatus = status.toLowerCase()

  if (normalizedStatus === 'active') return 'Active'
  if (normalizedStatus === 'pending_setup' || normalizedStatus === 'invited') return 'Invited'

  return 'Disabled'
}

const isAssignedRole = (
  role: SystemUser['role'],
): role is SystemUserRole => role !== '-'

const mapSystemUser = (record: SystemUserApiRecord, index: number): SystemUser => ({
  // Pending employee accounts have no user ID yet, so a negative employee ID
  // provides a stable, collision-free key until account setup is completed.
  id: record.user_id ?? -(record.employee_id ?? index + 1),
  employeeId: record.employee_id ?? undefined,
  canSetupAccount: record.can_setup_account,
  name: record.name,
  email: record.email ?? 'No email address',
  role: (record.role?.name ?? '-') as SystemUser['role'],
  department: record.department?.name ?? undefined,
  status: mapAccountStatus(record.account_status),
  twoFactorEnabled: record.two_factor_status.toLowerCase() === 'enabled',
  lastLogin: record.last_login_at ?? undefined,
})

export const useUsersAccess = () => {
  const { $api } = useNuxtApp()

  const users = ref<SystemUser[]>([])
  const loading = ref(true)
  const loadError = ref('')

  const loadUsers = async () => {
    loading.value = true
    loadError.value = ''

    try {
      const response = await $api<SystemUsersApiResponse>('/admin/system-users', {
        method: 'GET',
      })

      users.value = response.data.map(mapSystemUser)
    } catch (problem: any) {
      users.value = []
      loadError.value = problem?.data?.message
        ?? problem?.response?._data?.message
        ?? problem?.message
        ?? 'Unable to load system users from the backend.'

      console.error('System Users API Error:', problem)
    } finally {
      loading.value = false
    }
  }

  const loadUserEditData = (user: SystemUser) => {
    const endpoint = user.canSetupAccount && user.employeeId
      ? `/admin/system-users/employees/${user.employeeId}/edit`
      : `/admin/system-users/${user.id}/edit`

    return $api<SystemUserEditResponse>(endpoint, {
      method: 'GET',
    })
  }

  const setupUserAccount = (
    employeeId: number,
    payload: {
      email: string
      role_id: number
      password: string
      password_confirmation: string
    },
  ) => $api<SystemUserUpdateResponse>(
    `/admin/system-users/employees/${employeeId}/setup-account`,
    {
      method: 'POST',
      body: payload,
    },
  )

  const updateSystemUser = (
    userId: number,
    payload: {
      email?: string
      role_id?: number
      password?: string
      password_confirmation?: string
    },
  ) => $api<SystemUserUpdateResponse>(`/admin/system-users/${userId}`, {
    method: 'PATCH',
    body: payload,
  })

  const updateUserRole = (userId: number, roleId: number) => (
    $api<SystemUserUpdateResponse>(`/admin/system-users/${userId}/role`, {
      method: 'PATCH',
      body: {
        role_id: roleId,
      },
    })
  )

  onMounted(() => {
    void loadUsers()
  })

  const search = ref('')
  const role = ref('')
  const status = ref('')
  const currentPage = ref(1)
  const perPage = ref(7)

  const filteredUsers = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return users.value.filter(user => {
      const matchesSearch = !keyword
        || user.name.toLowerCase().includes(keyword)
        || user.email.toLowerCase().includes(keyword)
        || user.employeeNumber?.toLowerCase().includes(keyword)

      const matchesRole = !role.value || user.role === role.value
      const matchesStatus = !status.value || user.status === status.value

      return matchesSearch && matchesRole && matchesStatus
    })
  })

  const stats = computed(() => ({
    total: users.value.length,
    active: users.value.filter(user => user.status === 'Active').length,
    roles: new Set(
      users.value
        .map(user => user.role)
        .filter(isAssignedRole),
    ).size,
    disabled: users.value.filter(user => user.status === 'Disabled').length,
  }))

  const roleOptions = computed<SystemUserRole[]>(() => (
    [...new Set(
      users.value
        .map(user => user.role)
        .filter(isAssignedRole),
    )]
      .sort((first, second) => first.localeCompare(second))
  ))

  const statusOptions: SystemUserStatus[] = [
    'Active',
    'Invited',
    'Disabled',
  ]

  const totalPages = computed(() => Math.max(
    1,
    Math.ceil(filteredUsers.value.length / perPage.value),
  ))

  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * perPage.value

    return filteredUsers.value.slice(start, start + perPage.value)
  })

  const showingFrom = computed(() => {
    if (!filteredUsers.value.length) return 0

    return (currentPage.value - 1) * perPage.value + 1
  })

  const showingTo = computed(() => Math.min(
    currentPage.value * perPage.value,
    filteredUsers.value.length,
  ))

  const resetFilters = () => {
    search.value = ''
    role.value = ''
    status.value = ''
    currentPage.value = 1
  }

  watch([search, role, status], () => {
    currentPage.value = 1
  })

  watch(totalPages, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  })

  return {
    users,
    loading,
    loadError,
    loadUsers,
    loadUserEditData,
    setupUserAccount,
    updateSystemUser,
    updateUserRole,
    search,
    role,
    status,
    currentPage,
    filteredUsers,
    paginatedUsers,
    totalPages,
    showingFrom,
    showingTo,
    stats,
    roleOptions,
    statusOptions,
    resetFilters,
  }
}
