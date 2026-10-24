import type {
  LifecycleActivity,
  LifecycleTransaction,
  LifecycleTransactionStatus,
  LifecycleTransactionType,
  LifecycleUpcomingAction,
} from '~/types/employeeLifecycle'

export const useEmployeeLifecycle = () => {
  const {
    employees,
  } = useEmployees()

  /* =========================================================
     EMPLOYEE HELPER
  ========================================================= */

  const employeeById = (
    id: number,
  ) => {
    return employees.value.find(
      employee =>
        employee.id === id,
    )
  }

  const createTransaction = (
    data: {
      id: number
      reference: string

      employeeId: number

      type: LifecycleTransactionType

      currentValue?: string
      newValue?: string

      effectiveDate: string

      requestedBy: string

      remarks?: string

      status: LifecycleTransactionStatus
    },
  ): LifecycleTransaction => {
    const employee =
      employeeById(
        data.employeeId,
      )

    if (!employee) {
      throw new Error(
        `Employee ${data.employeeId} not found`,
      )
    }

    return {
      id:
        data.id,

      reference:
        data.reference,

      employeeId:
        employee.id,

      employeeNumber:
        employee.employeeNumber,

      employeeName: [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' '),

      department:
        employee.department,

      position:
        employee.position,

      type:
        data.type,

      currentValue:
        data.currentValue,

      newValue:
        data.newValue,

      effectiveDate:
        data.effectiveDate,

      requestedBy:
        data.requestedBy,

      remarks:
        data.remarks,

      status:
        data.status,
    }
  }

  /* =========================================================
     TRANSACTIONS
  ========================================================= */

  const transactions =
    ref<LifecycleTransaction[]>([
      createTransaction({
        id: 1,

        reference:
          'LC-2026-001',

        employeeId: 7,

        type:
          'Regularization',

        currentValue:
          'Probationary',

        newValue:
          'Regular',

        effectiveDate:
          '2026-09-18',

        requestedBy:
          'Leo Martinez',

        remarks:
          'For regularization review.',

        status:
          'Pending',
      }),

      createTransaction({
        id: 2,

        reference:
          'LC-2026-002',

        employeeId: 3,

        type:
          'Transfer',

        currentValue:
          'Finance',

        newValue:
          'Billing',

        effectiveDate:
          '2026-09-15',

        requestedBy:
          'Maria Santos',

        remarks:
          'Department transfer request.',

        status:
          'Scheduled',
      }),

      createTransaction({
        id: 3,

        reference:
          'LC-2026-003',

        employeeId: 5,

        type:
          'Promotion',

        currentValue:
          'Driver',

        newValue:
          'Senior Driver',

        effectiveDate:
          '2026-09-20',

        requestedBy:
          'Leo Martinez',

        remarks:
          'Recommended for promotion.',

        status:
          'Pending',
      }),

      createTransaction({
        id: 4,

        reference:
          'LC-2026-004',

        employeeId: 8,

        type:
          'Employment Change',

        currentValue:
          'Contractual',

        newValue:
          'Regular',

        effectiveDate:
          '2026-10-01',

        requestedBy:
          'Claire Villanueva',

        remarks:
          'Employment status review.',

        status:
          'In Progress',
      }),

      createTransaction({
        id: 5,

        reference:
          'LC-2026-005',

        employeeId: 10,

        type:
          'Regularization',

        currentValue:
          'Probationary',

        newValue:
          'Regular',

        effectiveDate:
          '2026-10-01',

        requestedBy:
          'Maria Santos',

        remarks:
          'Regularization assessment pending.',

        status:
          'Pending',
      }),

      createTransaction({
        id: 6,

        reference:
          'LC-2026-006',

        employeeId: 4,

        type:
          'Offboarding',

        currentValue:
          'Active',

        newValue:
          'Inactive',

        effectiveDate:
          '2026-09-30',

        requestedBy:
          'Maria Santos',

        remarks:
          'End of contractual employment.',

        status:
          'In Progress',
      }),

      createTransaction({
        id: 7,

        reference:
          'LC-2026-007',

        employeeId: 2,

        type:
          'Promotion',

        currentValue:
          'HR Officer',

        newValue:
          'Senior HR Officer',

        effectiveDate:
          '2026-08-15',

        requestedBy:
          'Claire Villanueva',

        remarks:
          'Promotion successfully completed.',

        status:
          'Completed',
      }),
    ])

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const type =
    ref('')

  const status =
    ref('')

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  const filteredTransactions =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return transactions.value.filter(
        transaction => {
          const matchesSearch =
            !keyword ||
            transaction.employeeName
              .toLowerCase()
              .includes(keyword) ||
            transaction.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            transaction.reference
              .toLowerCase()
              .includes(keyword)

          const matchesType =
            !type.value ||
            transaction.type ===
              type.value

          const matchesStatus =
            !status.value ||
            transaction.status ===
              status.value

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus
          )
        },
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => ({
      onboarding:
        transactions.value.filter(
          transaction =>
            transaction.type ===
              'Onboarding' &&
            transaction.status !==
              'Completed',
        ).length,

      regularization:
        transactions.value.filter(
          transaction =>
            transaction.type ===
              'Regularization' &&
            transaction.status !==
              'Completed',
        ).length,

      transfers:
        transactions.value.filter(
          transaction =>
            transaction.type ===
              'Transfer' &&
            transaction.status !==
              'Completed',
        ).length,

      offboarding:
        transactions.value.filter(
          transaction =>
            transaction.type ===
              'Offboarding' &&
            transaction.status !==
              'Completed',
        ).length,
    }))

  /* =========================================================
     UPCOMING ACTIONS
  ========================================================= */

  const upcomingActions =
    ref<LifecycleUpcomingAction[]>([
      {
        id: 1,

        employeeName:
          'Mark Lopez',

        employeeNumber:
          'EMP-007',

        type:
          'Regularization',

        action:
          'Regularization Review',

        dueDate:
          '2026-09-18',
      },

      {
        id: 2,

        employeeName:
          'Pedro Reyes',

        employeeNumber:
          'EMP-003',

        type:
          'Transfer',

        action:
          'Department Transfer',

        dueDate:
          '2026-09-15',
      },

      {
        id: 3,

        employeeName:
          'Carlo Mendoza',

        employeeNumber:
          'EMP-005',

        type:
          'Promotion',

        action:
          'Promotion Review',

        dueDate:
          '2026-09-20',
      },

      {
        id: 4,

        employeeName:
          'Ana Garcia',

        employeeNumber:
          'EMP-004',

        type:
          'Offboarding',

        action:
          'Complete Clearance',

        dueDate:
          '2026-09-30',
      },
    ])

  /* =========================================================
     SUMMARY
  ========================================================= */

  const transactionSummary =
    computed(() => ({
      regularization:
        transactions.value.filter(
          item =>
            item.type ===
            'Regularization',
        ).length,

      transfers:
        transactions.value.filter(
          item =>
            item.type ===
            'Transfer',
        ).length,

      promotions:
        transactions.value.filter(
          item =>
            item.type ===
            'Promotion',
        ).length,

      offboarding:
        transactions.value.filter(
          item =>
            item.type ===
            'Offboarding',
        ).length,
    }))

  /* =========================================================
     RECENT ACTIVITY
  ========================================================= */

  const recentActivity =
    ref<LifecycleActivity[]>([
      {
        id: 1,

        employeeName:
          'Maria Santos',

        action:
          'Promotion Completed',

        description:
          'Position updated from HR Officer to Senior HR Officer.',

        date:
          '2026-08-15',
      },

      {
        id: 2,

        employeeName:
          'Pedro Reyes',

        action:
          'Transfer Scheduled',

        description:
          'Department transfer from Finance to Billing has been scheduled.',

        date:
          '2026-09-03',
      },

      {
        id: 3,

        employeeName:
          'Mark Lopez',

        action:
          'Regularization Filed',

        description:
          'Employee regularization review was submitted.',

        date:
          '2026-09-03',
      },

      {
        id: 4,

        employeeName:
          'Ana Garcia',

        action:
          'Offboarding Started',

        description:
          'Employee offboarding and clearance process has started.',

        date:
          '2026-09-02',
      },
    ])

  /* =========================================================
     OPTIONS
  ========================================================= */

  const typeOptions:
    LifecycleTransactionType[] = [
      'Onboarding',
      'Regularization',
      'Transfer',
      'Promotion',
      'Employment Change',
      'Offboarding',
    ]

  const statusOptions:
    LifecycleTransactionStatus[] = [
      'Pending',
      'In Progress',
      'Scheduled',
      'Completed',
      'Cancelled',
    ]

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredTransactions.value.length /
            perPage.value,
        ),
      )
    })

  const paginatedTransactions =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredTransactions.value.slice(
        start,
        start +
          perPage.value,
      )
    })

  const showingFrom =
    computed(() => {
      if (
        !filteredTransactions.value.length
      ) {
        return 0
      }

      return (
        (
          currentPage.value -
          1
        ) *
          perPage.value +
        1
      )
    })

  const showingTo =
    computed(() => {
      return Math.min(
        currentPage.value *
          perPage.value,

        filteredTransactions.value.length,
      )
    })

  const resetFilters = () => {
    search.value = ''
    type.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      type,
      status,
    ],
    () => {
      currentPage.value = 1
    },
  )

  return {
    transactions,

    search,
    type,
    status,

    currentPage,

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