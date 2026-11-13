import type { Payslip, PayslipList } from '~/types/payroll/payslip/payslip'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const usePayslip = () => {
  const { $api } = useNuxtApp()

  const loadingList = ref(false)
  const loadingPayslip = ref(false)

  const fetchPayslips = async (periodId: number) => {
    loadingList.value = true

    try {
      const res = await $api<ApiResponse<PayslipList>>('/admin/payslips', {
        query: { payroll_period_id: periodId },
      })
      return res.data
    } finally {
      loadingList.value = false
    }
  }

  const fetchPayslip = async (payrollId: number) => {
    loadingPayslip.value = true

    try {
      const res = await $api<ApiResponse<Payslip>>(`/admin/payslips/${payrollId}`)
      return res.data
    } finally {
      loadingPayslip.value = false
    }
  }

  const getErrorMessage = (err: unknown) => {
    const e = err as { data?: { message?: string }, message?: string }
    return e?.data?.message ?? e?.message ?? 'Something went wrong.'
  }

  return {
    loadingList,
    loadingPayslip,
    fetchPayslips,
    fetchPayslip,
    getErrorMessage,
  }
}