import type {
  PayrollGenerationResult,
  PayrollRunData,
} from '~/types/payroll/payroll-generation/payrollGeneration'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const usePayrollGeneration = () => {
  const { $api } = useNuxtApp()

  const generating = ref(false)
  const finalizing = ref(false)
  const loadingPayrolls = ref(false)

  const generatePayroll = async (periodId: number, groupId?: number | null) => {
    generating.value = true

    try {
      return await $api<ApiResponse<PayrollGenerationResult>>(
        `/admin/payroll-generation/${periodId}/generate`,
        {
          method: 'POST',
          body: { payroll_group_id: groupId || null },
        },
      )
    } finally {
      generating.value = false
    }
  }

  const finalizePayroll = async (periodId: number) => {
    finalizing.value = true

    try {
      return await $api<ApiResponse<{ finalized: number }>>(
        `/admin/payroll-generation/${periodId}/finalize`,
        { method: 'POST' },
      )
    } finally {
      finalizing.value = false
    }
  }

  const fetchPayrolls = async (periodId: number) => {
    loadingPayrolls.value = true

    try {
      const response = await $api<ApiResponse<PayrollRunData>>(
        `/admin/payroll-generation/${periodId}`,
      )

      return response.data
    } finally {
      loadingPayrolls.value = false
    }
  }

  return {
    generating,
    finalizing,
    loadingPayrolls,
    generatePayroll,
    finalizePayroll,
    fetchPayrolls,
  }
}