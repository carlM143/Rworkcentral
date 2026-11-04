
import { computed, ref } from 'vue'


import type {
  EmployeeLoan,
  EmployeeLoanResponse,
  EmployeeLoanPayload,
} from '~/types/loans/employee-loans/employeeLoan'
export const useEmployeeLoans = () => {
  const { $api } = useNuxtApp()

  // DATA
  const employeeLoans = ref<EmployeeLoan[]>([])
  const loading = ref(false)
  const loadError = ref('')

  // FILTERS
  const search = ref('')
  const statusFilter = ref('')
  const loanTypeFilter = ref('')

  // FETCH EMPLOYEE LOANS
  const getEmployeeLoans = async () => {
    loading.value = true
    loadError.value = ''

    try {
      const response = await $api<EmployeeLoansResponse>(
        '/admin/employee-loans',
        {
          method: 'GET',
        },
      )

      if (response.success === false) {
        throw new Error(response.message)
      }

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid employee loans response.')
      }

      employeeLoans.value = response.data
    } catch (error: unknown) {
      const problem = error as {
        data?: { message?: string }
        response?: { _data?: { message?: string } }
        message?: string
      }

      loadError.value =
        problem?.data?.message ||
        problem?.response?._data?.message ||
        problem?.message ||
        'Unable to load employee loans.'

      employeeLoans.value = []
    } finally {
      loading.value = false
    }
  }

  // LOAN TYPE OPTIONS
    const loanTypeOptions = computed<string[]>(() =>
    [...new Set<string>(
      employeeLoans.value
        .map((item: EmployeeLoan): string =>
          item.loan_type?.loan_name ?? '',
        )
        .filter((name: string) => name.length > 0),
    )].sort(),
  )

  // SEARCH AND FILTER
  const filteredEmployeeLoans = computed(() => {
    const keyword = search.value.trim().toLowerCase()
    const selectedStatus = statusFilter.value.trim().toLowerCase()
    const selectedType = loanTypeFilter.value.trim().toLowerCase()

    return employeeLoans.value.filter(item => {
      const employeeName = item.employee?.name ?? ''
      const employeeNumber = String(item.employee?.emp_id ?? '')
      const loanName = item.loan_type?.loan_name ?? ''
      const loanCode = item.loan_type?.loan_code ?? ''

      const matchesSearch =
        !keyword ||
        employeeName.toLowerCase().includes(keyword) ||
        employeeNumber.toLowerCase().includes(keyword) ||
        item.loan_reference_no.toLowerCase().includes(keyword) ||
        loanName.toLowerCase().includes(keyword) ||
        loanCode.toLowerCase().includes(keyword)

      const matchesStatus =
        !selectedStatus ||
        (item.status ? 'active' : 'inactive') === selectedStatus

      const matchesType =
        !selectedType ||
        loanName.toLowerCase() === selectedType

      return matchesSearch && matchesStatus && matchesType
    })
  })

  
  const getEmployeeLoan = async (
    id: number,
  ): Promise<EmployeeLoan> => {
    const response = await $api<EmployeeLoanResponse>(
      `/admin/employee-loans/${id}`,
      { method: 'GET' },
    )

    if (response.success === false || !response.data) {
      throw new Error(response.message || 'Unable to load employee loan.')
    }

    return response.data
  }

  const createEmployeeLoan = async (
    payload: EmployeeLoanPayload,
  ): Promise<EmployeeLoan> => {
    const response = await $api<EmployeeLoanResponse>(
      '/admin/employee-loans',
      {
        method: 'POST',
        body: payload,
      },
    )

    if (response.success === false || !response.data) {
      throw new Error(response.message || 'Unable to create employee loan.')
    }

    return response.data
  }

  const updateEmployeeLoan = async (
    id: number,
    payload: EmployeeLoanPayload,
  ): Promise<EmployeeLoan> => {
    const response = await $api<EmployeeLoanResponse>(
      `/admin/employee-loans/${id}`,
      {
        method: 'PUT',
        body: payload,
      },
    )

    if (response.success === false || !response.data) {
      throw new Error(response.message || 'Unable to update employee loan.')
    }

    return response.data
  }


  // STATISTICS
  const stats = computed(() => ({
    total: employeeLoans.value.length,

    active: employeeLoans.value.filter(
      item => item.status,
    ).length,

    inactive: employeeLoans.value.filter(
      item => !item.status,
    ).length,
  }))

  // RESET FILTERS
  const resetFilters = () => {
    search.value = ''
    statusFilter.value = ''
    loanTypeFilter.value = ''
  }

  return {
    employeeLoans,
    filteredEmployeeLoans,
    loading,
    loadError,

    search,
    statusFilter,
    loanTypeFilter,
    loanTypeOptions,

    getEmployeeLoan,
    createEmployeeLoan,
    updateEmployeeLoan,
    stats,
    getEmployeeLoans,
    resetFilters,
    
  }
}
