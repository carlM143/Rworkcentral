
import { computed, ref, watch } from 'vue'
import { useLeaveBalanceApi } from './useLeaveBalanceApi'
import type {
  LeaveBalance,
  EmployeeLeaveBalance,
  LeaveBalanceStatus,
  LeaveBalanceOption,
} from '~/types/leaveBalance'

export const useLeaveBalances = () => {
  const { getLeaveBalances } = useLeaveBalanceApi()

  const balances = ref<LeaveBalance[]>([])
  const loading = ref(false)
  const loadError = ref('')

  const search = ref('')
  const department = ref('all')
  const status = ref('all')
  const currentPage = ref(1)
  const perPage = 8

  const normalize = (item: LeaveBalance): LeaveBalance => ({
    ...item,
    allocated: Number(item.allocated) || 0,
    deductions: Number(item.deductions) || 0,
    adjustments: Number(item.adjustments) || 0,
    carry_over: Number(item.carry_over) || 0,
    expired: Number(item.expired) || 0,
    reversals: Number(item.reversals) || 0,
    available: Number(item.available) || 0,
  })

  const loadBalances = async () => {
    loading.value = true
    loadError.value = ''

    try {
      const response = await getLeaveBalances()

      if (response.success === false)
        throw new Error(response.message)

      if (!Array.isArray(response.data))
        throw new Error('Invalid leave balances response.')

      balances.value = response.data.map(normalize)
    } catch (error: any) {
      loadError.value =
        error?.data?.message ||
        error?.response?._data?.message ||
        error?.message ||
        'Unable to load employee leave balances.'
    } finally {
      loading.value = false
    }
  }

  const leaveTypes = computed(() =>
    [...new Set(
      balances.value.map(
        item => item.leave_type || `Policy #${item.leave_policy_id}`,
      ),
    )].sort(),
  )

  const employeeBalances = computed<EmployeeLeaveBalance[]>(() => {
    const grouped = new Map<number, EmployeeLeaveBalance>()

    for (const item of balances.value) {
      if (!grouped.has(item.employee_id)) {
        grouped.set(item.employee_id, {
          employee_id: item.employee_id,
          employee: item.employee,
          emp_id: item.emp_id,
          department: item.department || null,
          records: [],
          totalAllocated: 0,
          totalUsed: 0,
          totalAvailable: 0,
          status: 'healthy',
        })
      }

      const employee = grouped.get(item.employee_id)!

      employee.records.push(item)
      employee.totalAllocated += item.allocated
      employee.totalUsed += Math.max(
        0,
        -item.deductions - Math.max(0, item.reversals),
      )
      employee.totalAvailable += item.available
    }

    return [...grouped.values()].map(employee => {
      const threshold = Math.max(
        3,
        employee.totalAllocated * 0.25,
      )

      const balanceStatus: LeaveBalanceStatus =
        employee.totalAvailable <= 0
          ? 'none'
          : employee.totalAvailable <= threshold
            ? 'low'
            : 'healthy'

      return {
        ...employee,
        status: balanceStatus,
      }
    })
  })

  const departmentOptions = computed<LeaveBalanceOption[]>(() => [
    { label: 'All Departments', value: 'all' },
    ...[...new Set(
      employeeBalances.value
        .map(item => item.department)
        .filter((value): value is string => !!value),
    )].sort().map(value => ({
      label: value,
      value,
    })),
  ])

  const statusOptions: LeaveBalanceOption[] = [
    { label: 'All Balance Status', value: 'all' },
    { label: 'Healthy', value: 'healthy' },
    { label: 'Low Balance', value: 'low' },
    { label: 'No Credits', value: 'none' },
  ]

  const stats = computed(() => ({
    employeesWithCredits: employeeBalances.value.filter(
      item => item.totalAvailable > 0,
    ).length,
    remainingCredits: employeeBalances.value.reduce(
      (sum, item) => sum + item.totalAvailable, 0,
    ),
    lowBalance: employeeBalances.value.filter(
      item => item.status === 'low',
    ).length,
    noCredits: employeeBalances.value.filter(
      item => item.status === 'none',
    ).length,
  }))

  const filteredBalances = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return employeeBalances.value.filter(item => {
      const matchesSearch =
        !keyword ||
        item.employee.toLowerCase().includes(keyword) ||
        String(item.emp_id ?? '').toLowerCase().includes(keyword) ||
        (item.department ?? '').toLowerCase().includes(keyword) ||
        item.records.some(record =>
          (record.leave_type ?? '').toLowerCase().includes(keyword),
        )

      const matchesDepartment =
        department.value === 'all' ||
        item.department === department.value

      const matchesStatus =
        status.value === 'all' ||
        item.status === status.value

      return matchesSearch && matchesDepartment && matchesStatus
    })
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredBalances.value.length / perPage)),
  )

  const paginatedBalances = computed(() =>
    filteredBalances.value.slice(
      (currentPage.value - 1) * perPage,
      currentPage.value * perPage,
    ),
  )

  const showingFrom = computed(() =>
    filteredBalances.value.length
      ? (currentPage.value - 1) * perPage + 1
      : 0,
  )

  const showingTo = computed(() =>
    Math.min(currentPage.value * perPage, filteredBalances.value.length),
  )

  watch([search, department, status], () => {
    currentPage.value = 1
  })

  watch(totalPages, pages => {
    if (currentPage.value > pages)
      currentPage.value = pages
  })

  const resetFilters = () => {
    search.value = ''
    department.value = 'all'
    status.value = 'all'
    currentPage.value = 1
  }

  return {
    balances,
    loading,
    loadError,
    search,
    department,
    status,
    currentPage,
    leaveTypes,
    employeeBalances,
    filteredBalances,
    paginatedBalances,
    totalPages,
    showingFrom,
    showingTo,
    stats,
    departmentOptions,
    statusOptions,
    loadBalances,
    resetFilters,
  }
}
