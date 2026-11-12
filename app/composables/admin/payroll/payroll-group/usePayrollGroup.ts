import type {
  PayrollGroup,
  PayrollGroupPayload,
  PayrollGroupStats,
  PayrollEmployee,
  PayrollAssignment,
  LaravelPagination,
  ApiResponse,
} from '~/types/payroll/payroll-groups/payrollGroup'

export interface FilterDepartment {
  id: number
  department_name?: string
  name?: string
  [key: string]: unknown
}

export interface FilterLocation {
  id: number
  location_name: string
  city?: string | null
  province?: string | null
}

export interface AssignableEmployee {
  id: number
  emp_id: string
  firstname: string
  lastname: string
  department_id: number | null
  status: boolean
  department?: FilterDepartment | null
  latest_employment?: {
    location?: { id: number, location_name: string } | null
  } | null
  payroll_group_assignments: {
    id: number
    payroll_group_id: number
    effective_from: string
    payroll_group?: { id: number, group_name: string, frequency: string } | null
  }[]
}

export interface BulkAssignResult {
  assigned: { employee_id: number, name: string, moved_from_group_id: number | null }[]
  skipped: { employee_id: number, name: string | null, reason: string }[]
}

interface GroupListResponse {
  success: boolean
  message: string
  data: PayrollGroup[]
  stats: PayrollGroupStats
}

interface EmployeeListResponse {
  success: boolean
  data: LaravelPagination<PayrollEmployee>
}

interface AssignmentListResponse {
  success: boolean
  data: LaravelPagination<PayrollAssignment>
}

export const usePayrollGroup = () => {
  const { $api } = useNuxtApp()

  const groups = ref<PayrollGroup[]>([])

  const stats = ref<PayrollGroupStats>({
    total: 0,
    active: 0,
    inactive: 0,
  })

  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const request = async <T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      query?: Record<string, string | number | boolean | undefined>
      body?: unknown
    } = {},
  ): Promise<T> => {
    return await $api<T>(
      `/admin/payroll-groups${endpoint}`,
      {
        method: options.method || 'GET',
        query: options.query,
        body: options.body as Record<string, unknown> | undefined,
      },
    )
  }

  const getErrorMessage = (err: unknown): string => {
    const apiError = err as {
      data?: {
        message?: string
        errors?: Record<string, string[]>
      }
      message?: string
    }

    const firstError = Object.values(
      apiError.data?.errors || {},
    )[0]?.[0]

    return (
      firstError ||
      apiError.data?.message ||
      apiError.message ||
      'Something went wrong. Please try again.'
    )
  }

  const fetchGroups = async (filters: {
    search?: string
    is_active?: boolean | null
  } = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await request<GroupListResponse>('', {
        query: {
          search: filters.search || undefined,
          is_active:
            filters.is_active === null ||
            filters.is_active === undefined
              ? undefined
              : Number(filters.is_active),
        },
      })

      groups.value = response.data
      stats.value = response.stats

      return response.data
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchGroup = async (id: number) => {
    const response = await request<ApiResponse<PayrollGroup>>(
      `/${id}`,
    )

    return response.data
  }

  const createGroup = async (
    payload: PayrollGroupPayload,
  ) => {
    saving.value = true

    try {
      const response = await request<ApiResponse<PayrollGroup>>(
        '',
        {
          method: 'POST',
          body: payload,
        },
      )

      await fetchGroups()

      return response
    } finally {
      saving.value = false
    }
  }

  const updateGroup = async (
    id: number,
    payload: Partial<PayrollGroupPayload>,
  ) => {
    saving.value = true

    try {
      const response = await request<ApiResponse<PayrollGroup>>(
        `/${id}`,
        {
          method: 'PUT',
          body: payload,
        },
      )

      await fetchGroups()

      return response
    } finally {
      saving.value = false
    }
  }

  const deleteGroup = async (id: number) => {
    saving.value = true

    try {
      const response = await request<ApiResponse<null>>(
        `/${id}`,
        {
          method: 'DELETE',
        },
      )

      await fetchGroups()

      return response
    } finally {
      saving.value = false
    }
  }

  const fetchEmployees = async (filters: {
    search?: string
    date?: string
    per_page?: number
  } = {}) => {
    const response = await request<EmployeeListResponse>(
      '/employees',
      {
        query: {
          search: filters.search || undefined,
          date: filters.date || undefined,
          per_page: filters.per_page || 25,
        },
      },
    )

    return response.data
  }

  const fetchEmployeeFilters = async () => {
    const response = await request<{
      success: boolean
      data: {
        departments: FilterDepartment[]
        locations: FilterLocation[]
      }
    }>('/employee-filters')

    return response.data
  }

  const fetchAssignableEmployees = async (filters: {
    search?: string
    department_id?: number | null
    location_id?: number | null
    date?: string
  } = {}) => {
    const response = await request<{
      success: boolean
      data: AssignableEmployee[]
    }>('/employees', {
      query: {
        all: '1',
        search: filters.search?.trim() || undefined,
        department_id: filters.department_id || undefined,
        location_id: filters.location_id || undefined,
        date: filters.date || undefined,
      },
    })

    return response.data
  }

  const fetchAssignments = async (
    groupId: number,
    page = 1,
    perPage = 15,
  ) => {
    const response = await request<AssignmentListResponse>(
      `/${groupId}/assignments`,
      {
        query: {
          page,
          per_page: perPage,
        },
      },
    )

    return response.data
  }

  const assignEmployee = async (
    groupId: number,
    payload: {
      employee_id: number
      effective_from: string
    },
  ) => {
    return await request<ApiResponse<PayrollAssignment>>(
      `/${groupId}/assignments`,
      {
        method: 'POST',
        body: payload,
      },
    )
  }

  const bulkAssign = async (
    groupId: number,
    employeeIds: number[],
    effectiveFrom: string,
  ) => {
    saving.value = true

    try {
      return await request<{
        success: boolean
        message: string
        data: BulkAssignResult
      }>(`/${groupId}/assignments/bulk`, {
        method: 'POST',
        body: {
          employee_ids: employeeIds,
          effective_from: effectiveFrom,
        },
      })
    } finally {
      saving.value = false
    }
  }

  const endAssignment = async (
    groupId: number,
    assignmentId: number,
    effectiveTo: string,
  ) => {
    return await request<ApiResponse<PayrollAssignment>>(
      `/${groupId}/assignments/${assignmentId}/end`,
      {
        method: 'PATCH',
        body: {
          effective_to: effectiveTo,
        },
      },
    )
  }

  // Undo (delete) an assignment made by mistake. The backend only allows the
  // employee's latest assignment and refuses if payroll was already generated
  // under it. If the assignment had closed a previous one, that previous
  // assignment is reopened and returned as `restored_assignment`.
  const undoAssignment = async (
    groupId: number,
    assignmentId: number,
  ) => {
    return await request<{
      success: boolean
      message: string
      data: { restored_assignment: PayrollAssignment | null }
    }>(`/${groupId}/assignments/${assignmentId}`, {
      method: 'DELETE',
    })
  }

  return {
    groups,
    stats,
    loading,
    saving,
    error,

    fetchGroups,
    fetchGroup,
    createGroup,
    updateGroup,
    deleteGroup,

    fetchEmployees,
    fetchEmployeeFilters,
    fetchAssignableEmployees,
    fetchAssignments,
    assignEmployee,
    bulkAssign,
    endAssignment,
    undoAssignment,

    getErrorMessage,
  }
}