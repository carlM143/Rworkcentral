import type {
  PayrollPeriod,
  PayrollPeriodPayload,
} from '~/types/payroll/payroll-periods/payrollPeriod'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PayrollPeriodFilters {
  search?: string
  status?: string
  year?: number | string | null
  month?: number | string | null
  date_from?: string
  date_to?: string
}

export const usePayrollPeriod = () => {
  const { $api } = useNuxtApp()

  const periods = ref<PayrollPeriod[]>([])
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
      `/admin/payroll-periods${endpoint}`,
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
        errors?: Record<string, string[] | string>
      }
      message?: string
    }

    const first = Object.values(apiError.data?.errors || {})[0]
    const firstError = Array.isArray(first) ? first[0] : first

    return (
      firstError ||
      apiError.data?.message ||
      apiError.message ||
      'Something went wrong. Please try again.'
    )
  }

  const stats = computed(() => {
    const count = (status: string) =>
      periods.value.filter(p => p.status?.toLowerCase() === status).length

    return {
      total: periods.value.length,
      draft: count('draft'),
      open: count('open'),
      processing: count('processing'),
      closed: count('closed'),
    }
  })

  const filterPeriods = (filters: PayrollPeriodFilters = {}) => {
    const keyword = filters.search?.trim().toLowerCase() ?? ''

    return periods.value.filter((p) => {
      if (keyword) {
        const haystack = `${p.id} ${p.period_name ?? ''} ${p.label ?? ''}`.toLowerCase()
        if (!haystack.includes(keyword)) return false
      }

      if (filters.status && p.status?.toLowerCase() !== filters.status.toLowerCase()) {
        return false
      }

      const start = p.pay_period_start ?? ''
      const end = p.pay_period_end ?? ''

      if (filters.year && start.slice(0, 4) !== String(filters.year)) {
        return false
      }

      if (filters.month && Number(start.slice(5, 7)) !== Number(filters.month)) {
        return false
      }

      if (filters.date_from && end < filters.date_from) {
        return false
      }

      if (filters.date_to && start > filters.date_to) {
        return false
      }

      return true
    })
  }

  const years = computed(() =>
    [...new Set(
      periods.value
        .map(p => p.pay_period_start?.slice(0, 4))
        .filter(Boolean) as string[],
    )].sort((a, b) => Number(b) - Number(a)),
  )

  const fetchPeriods = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await request<ApiResponse<PayrollPeriod[]>>('')
      periods.value = response.data
      return response.data
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPeriod = async (id: number) => {
    const response = await request<ApiResponse<PayrollPeriod>>(`/${id}`)
    return response.data
  }

  const createPeriod = async (payload: PayrollPeriodPayload) => {
    saving.value = true

    try {
      const response = await request<ApiResponse<PayrollPeriod>>('', {
        method: 'POST',
        body: payload,
      })

      await fetchPeriods()
      return response
    } finally {
      saving.value = false
    }
  }

  const updatePeriod = async (id: number, payload: PayrollPeriodPayload) => {
    saving.value = true

    try {
      const response = await request<ApiResponse<PayrollPeriod>>(`/${id}`, {
        method: 'PUT',
        body: payload,
      })

      await fetchPeriods()
      return response
    } finally {
      saving.value = false
    }
  }

  const deletePeriod = async (id: number) => {
    saving.value = true

    try {
      const response = await request<ApiResponse<null>>(`/${id}`, {
        method: 'DELETE',
      })

      await fetchPeriods()
      return response
    } finally {
      saving.value = false
    }
  }

  return {
    periods,
    stats,
    years,
    loading,
    saving,
    error,

    fetchPeriods,
    fetchPeriod,
    createPeriod,
    updatePeriod,
    deletePeriod,
    filterPeriods,

    getErrorMessage,
  }
}