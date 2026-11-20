import type {
  EmployeePayrollFilters,
  EmployeePayrollResponse,
  SendPayslipsPayload,
  SendPayslipsResult,
} from '~/types/payroll/employee-payroll/employeePayroll'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useEmployeePayroll = () => {
  const { $api } = useNuxtApp()

  const loading = ref(false)

  const fetchEmployeePayrolls = async (filters: EmployeePayrollFilters) => {
    loading.value = true

    try {
      const query = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== null && value !== undefined && value !== ''),
      )

      const res = await $api<ApiResponse<EmployeePayrollResponse>>('/admin/employee-payrolls', { query })
      return res.data
    } finally {
      loading.value = false
    }
  }

  const sending = ref(false)

  // Returns the whole response: success is false (HTTP 200) when nothing was sent.
  const sendPayslips = async (payload: SendPayslipsPayload) => {
    sending.value = true

    try {
      return await $api<ApiResponse<SendPayslipsResult>>('/admin/employee-payrolls/send-payslips', {
        method: 'POST',
        body: payload,
      })
    } finally {
      sending.value = false
    }
  }

  return {
    loading,
    sending,
    fetchEmployeePayrolls,
    sendPayslips,
  }
}