import type {
  EmployeePayrollFilters,
  EmployeePayrollResponse,
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

  return {
    loading,
    fetchEmployeePayrolls,
  }
}