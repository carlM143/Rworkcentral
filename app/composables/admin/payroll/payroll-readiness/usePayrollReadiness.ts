import type {
  PayrollReadinessResult,
  PeriodStatus,
} from '~/types/payroll/payroll-readiness/payrollReadiness'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const usePayrollReadiness = () => {
  const { $api } = useNuxtApp()

  const readiness = ref<PayrollReadinessResult | null>(null)
  const loading = ref(false)
  const updatingStatus = ref(false)
  const error = ref<string | null>(null)

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

  const fetchReadiness = async (
    periodId: number,
    groupId?: number | null,
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<ApiResponse<PayrollReadinessResult>>(
        '/admin/payroll-readiness',
        {
          query: {
            payroll_period_id: periodId,
            payroll_group_id: groupId || undefined,
          },
        },
      )

      readiness.value = response.data
      return response.data
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePeriodStatus = async (
    periodId: number,
    status: PeriodStatus,
  ) => {
    updatingStatus.value = true

    try {
      return await $api<ApiResponse<unknown>>(
        `/admin/payroll-periods/${periodId}/status`,
        {
          method: 'PATCH',
          body: { status },
        },
      )
    } finally {
      updatingStatus.value = false
    }
  }

  return {
    readiness,
    loading,
    updatingStatus,
    error,

    fetchReadiness,
    updatePeriodStatus,

    getErrorMessage,
  }
}