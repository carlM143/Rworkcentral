
import type {
  LifecycleActivity,
  LifecycleTransaction,
  LifecycleTransactionStatus,
  LifecycleTransactionType,
  LifecycleUpcomingAction,
} from '~/types/employeeLifecycle'

export const useEmployeeLifecycle = () => {
  const { employees } = useEmployees()

  /* =========================================
     EMPLOYEE HELPERS
  ========================================= */

  const employeeById = (id: number) => {
    return employees.value.find(employee => employee.id === id)
  }

  type TransactionInput = {
    employeeId: number
    type: LifecycleTransactionType
    effectiveDate: string
    requestedBy: string
    status: LifecycleTransactionStatus
    currentValue?: string
    newValue?: string
    remarks?: string
  }

  const createTransaction = (
    data: TransactionInput & {
      id: number
      reference: string
    },
  ): LifecycleTransaction => {
    const employee = employeeById(data.employeeId)

    if (!employee) {
      throw new Error(`Employee ${data.employeeId} not found`)
    }

    return {
      id: data.id,
      reference: data.reference,
      employeeId: employee.id,
      employeeNumber: employee.employeeNumber,
      employeeName: [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ].filter(Boolean).join(' '),
      department: employee.department,
      position: employee.position,
      type: data.type,
      currentValue: data.currentValue,
      newValue: data.newValue,
      effectiveDate: data.effectiveDate,
      requestedBy: data.requestedBy,
      remarks: data.remarks,
      status: data.status,
    }
  }

  /* =========================================
     TRANSACTION DATA
  ========================================= */

  const transactions = useState<LifecycleTransaction[]>(
    'employee-lifecycle-transactions',
    () => [
      createTransaction({
        id: 1,
        reference: 'LC-2026-001',
        employeeId: 7,
        type: 'Regularization',
        currentValue: 'Probationary',
        newValue: 'Regular',
        effectiveDate: '2026-09-18',
        requestedBy: 'Leo Martinez',
        remarks: 'For regularization review.',
        status: 'Pending',
      }),
      createTransaction({
        id: 2,
        reference: 'LC-2026-002',
        employeeId: 3,
        type: 'Transfer',
        currentValue: 'Finance',
        newValue: 'Billing',
        effectiveDate: '2026-09-15',
        requestedBy: 'Maria Santos',
        remarks: 'Department transfer request.',
        status: 'Scheduled',
      }),
      createTransaction({
        id: 3,
        reference: 'LC-2026-003',
        employeeId: 5,
        type: 'Promotion',
        currentValue: 'Driver',
        newValue: 'Senior Driver',
        effectiveDate: '2026-09-20',
        requestedBy: 'Leo Martinez',
        remarks: 'Recommended for promotion.',
        status: 'Pending',
      }),
      createTransaction({
        id: 4,
        reference: 'LC-2026-004',
        employeeId: 8,
        type: 'Employment Change',
        currentValue: 'Contractual',
        newValue: 'Regular',
        effectiveDate: '2026-10-01',
        requestedBy: 'Claire Villanueva',
        remarks: 'Employment status review.',
        status: 'In Progress',
      }),
      createTransaction({
        id: 5,
        reference: 'LC-2026-005',
        employeeId: 10,
        type: 'Regularization',
        currentValue: 'Probationary',
        newValue: 'Regular',
        effectiveDate: '2026-10-01',
        requestedBy: 'Maria Santos',
        remarks: 'Regularization assessment pending.',
        status: 'Pending',
      }),
      createTransaction({
        id: 6,
        reference: 'LC-2026-006',
        employeeId: 4,
        type: 'Offboarding',
        currentValue: 'Active',
        newValue: 'Inactive',
        effectiveDate: '2026-09-30',
        requestedBy: 'Maria Santos',
        remarks: 'End of contractual employment.',
        status: 'In Progress',
      }),
      createTransaction({
        id: 7,
        reference: 'LC-2026-007',
        employeeId: 2,
        type: 'Promotion',
        currentValue: 'HR Officer',
        newValue: 'Senior HR Officer',
        effectiveDate: '2026-08-15',
        requestedBy: 'Claire Villanueva',
        remarks: 'Promotion successfully completed.',
        status: 'Completed',
      }),
    ],
  )

  /* =========================================
     FILTERS
  ========================================= */

  const search = ref('')
  const type = ref('')
  const status = ref('')

  const currentPage = ref(1)
  const perPage = ref(6)

  const filteredTransactions = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return transactions.value.filter(transaction => {
      const matchesSearch =
        !keyword ||
        transaction.employeeName.toLowerCase().includes(keyword) ||
        transaction.employeeNumber.toLowerCase().includes(keyword) ||
        transaction.reference.toLowerCase().includes(keyword)

      const matchesType =
        !type.value ||
        transaction.type === type.value

      const matchesStatus =
        !status.value ||
        transaction.status === status.value

      return matchesSearch && matchesType && matchesStatus
    })
  })

  /* =========================================
     STATISTICS
  ========================================= */

  const stats = computed(() => {
    const activeRecords = transactions.value.filter(
      item => !['Completed', 'Cancelled'].includes(item.status),
    )

    return {
      onboarding: activeRecords.filter(
        item => item.type === 'Onboarding',
      ).length,

      regularization: activeRecords.filter(
        item => item.type === 'Regularization',
      ).length,

      transfers: activeRecords.filter(
        item => item.type === 'Transfer',
      ).length,

      offboarding: activeRecords.filter(
        item => item.type === 'Offboarding',
      ).length,
    }
  })

  /* =========================================
     UPCOMING ACTIONS
  ========================================= */

  const upcomingActions = ref<LifecycleUpcomingAction[]>([
    {
      id: 1,
      employeeName: 'Mark Lopez',
      employeeNumber: 'EMP-007',
      type: 'Regularization',
      action: 'Regularization Review',
      dueDate: '2026-09-18',
    },
    {
      id: 2,
      employeeName: 'Pedro Reyes',
      employeeNumber: 'EMP-003',
      type: 'Transfer',
      action: 'Department Transfer',
      dueDate: '2026-09-15',
    },
    {
      id: 3,
      employeeName: 'Carlo Mendoza',
      employeeNumber: 'EMP-005',
      type: 'Promotion',
      action: 'Promotion Review',
      dueDate: '2026-09-20',
    },
    {
      id: 4,
      employeeName: 'Ana Garcia',
      employeeNumber: 'EMP-004',
      type: 'Offboarding',
      action: 'Complete Clearance',
      dueDate: '2026-09-30',
    },
  ])

  /* =========================================
     LIFECYCLE SUMMARY
  ========================================= */

  const transactionSummary = computed(() => ({
    regularization: transactions.value.filter(
      item => item.type === 'Regularization',
    ).length,

    transfers: transactions.value.filter(
      item => item.type === 'Transfer',
    ).length,

    promotions: transactions.value.filter(
      item => item.type === 'Promotion',
    ).length,

    offboarding: transactions.value.filter(
      item => item.type === 'Offboarding',
    ).length,
  }))

  /* =========================================
     RECENT ACTIVITY
  ========================================= */

  const recentActivity = useState<LifecycleActivity[]>(
    'employee-lifecycle-activities',
    () => [
      {
        id: 1,
        employeeName: 'Maria Santos',
        action: 'Promotion Completed',
        description:
          'Position updated from HR Officer to Senior HR Officer.',
        date: '2026-08-15',
      },
      {
        id: 2,
        employeeName: 'Pedro Reyes',
        action: 'Transfer Scheduled',
        description:
          'Department transfer from Finance to Billing has been scheduled.',
        date: '2026-09-03',
      },
      {
        id: 3,
        employeeName: 'Mark Lopez',
        action: 'Regularization Filed',
        description:
          'Employee regularization review was submitted.',
        date: '2026-09-03',
      },
      {
        id: 4,
        employeeName: 'Ana Garcia',
        action: 'Offboarding Started',
        description:
          'Employee offboarding and clearance process has started.',
        date: '2026-09-02',
      },
    ],
  )

  /* =========================================
     OPTIONS
  ========================================= */

  const typeOptions: LifecycleTransactionType[] = [
    'Onboarding',
    'Regularization',
    'Transfer',
    'Promotion',
    'Employment Change',
    'Offboarding',
  ]

  const statusOptions: LifecycleTransactionStatus[] = [
    'Pending',
    'In Progress',
    'Scheduled',
    'Completed',
    'Cancelled',
  ]

  /* =========================================
     PAGINATION
  ========================================= */

  const totalPages = computed(() => {
    return Math.max(
      1,
      Math.ceil(filteredTransactions.value.length / perPage.value),
    )
  })

  const paginatedTransactions = computed(() => {
    const start = (currentPage.value - 1) * perPage.value

    return filteredTransactions.value.slice(
      start,
      start + perPage.value,
    )
  })

  const showingFrom = computed(() => {
    if (!filteredTransactions.value.length) return 0

    return (currentPage.value - 1) * perPage.value + 1
  })

  const showingTo = computed(() => {
    return Math.min(
      currentPage.value * perPage.value,
      filteredTransactions.value.length,
    )
  })

  /* =========================================
     RESET FILTERS
  ========================================= */

  const resetFilters = () => {
    search.value = ''
    type.value = ''
    status.value = ''
    currentPage.value = 1
  }

  watch([search, type, status], () => {
    currentPage.value = 1
  })

  watch(totalPages, pages => {
    if (currentPage.value > pages) {
      currentPage.value = pages
    }
  })

  /* =========================================
     ADD NEW TRANSACTION
  ========================================= */

  const addTransaction = (data: TransactionInput) => {
    const nextId = Math.max(
      0,
      ...transactions.value.map(item => item.id),
    ) + 1

    const reference = `LC-${new Date().getFullYear()}-${String(
      nextId,
    ).padStart(3, '0')}`

    const item = createTransaction({
      ...data,
      id: nextId,
      reference,
    })

    transactions.value.unshift(item)
    currentPage.value = 1

    recentActivity.value.unshift({
      id: Math.max(0, ...recentActivity.value.map(a => a.id)) + 1,
      employeeName: item.employeeName,
      action: `${item.type} Created`,
      description: `Lifecycle transaction ${item.reference} created.`,
      date: new Date().toISOString().slice(0, 10),
    })

    return item
  }

  /* =========================================
     UPDATE TRANSACTION STATUS
  ========================================= */

  const updateTransactionStatus = (
    id: number,
    nextStatus: LifecycleTransactionStatus,
    remarks?: string,
  ) => {
    const item = transactions.value.find(row => row.id === id)

    if (!item) return false

    if (['Completed', 'Cancelled'].includes(item.status)) {
      return false
    }

    item.status = nextStatus

    if (remarks?.trim()) {
      item.remarks = remarks.trim()
    }

    recentActivity.value.unshift({
      id: Math.max(0, ...recentActivity.value.map(a => a.id)) + 1,
      employeeName: item.employeeName,
      action: `${item.type} ${nextStatus}`,
      description: `${item.reference} status updated to ${nextStatus}.`,
      date: new Date().toISOString().slice(0, 10),
    })

    return true
  }

  /* =========================================
     RETURN
  ========================================= */

  return {
    transactions,
    addTransaction,
    updateTransactionStatus,

    search,
    type,
    status,

    currentPage,
    perPage,

    filteredTransactions,
    paginatedTransactions,

    totalPages,
    showingFrom,
    showingTo,

    stats,
    upcomingActions,
    transactionSummary,
    recentActivity,

    typeOptions,
    statusOptions,

    resetFilters,
  }
}
