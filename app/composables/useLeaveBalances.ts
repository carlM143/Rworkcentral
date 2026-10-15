import type {
  LeaveBalance,
  LeaveBalanceStatus,
} from '~/types/leaveBalance'

export const useLeaveBalances = () => {
  const balances =
    useState<LeaveBalance[]>(
      'leave-balances',
      () => [
        {
          id: 1,
          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',
          department: 'Operations',
          position: 'Driver',

          vacationLeave: {
            allocated: 15,
            used: 6,
            available: 9,
          },

          sickLeave: {
            allocated: 15,
            used: 2,
            available: 13,
          },

          emergencyLeave: {
            allocated: 5,
            used: 1,
            available: 4,
          },

          specialLeave: {
            allocated: 3,
            used: 0,
            available: 3,
          },

          totalAllocated: 38,
          totalUsed: 9,
          totalAvailable: 29,

          status: 'Healthy',

          lastUpdated: '2026-10-05',
        },

        {
          id: 2,
          employeeId: 2,
          employeeNumber: 'EMP-002',
          employeeName: 'Maria Santos',
          department: 'Human Resources',
          position: 'HR Administrator',

          vacationLeave: {
            allocated: 15,
            used: 8,
            available: 7,
          },

          sickLeave: {
            allocated: 15,
            used: 3,
            available: 12,
          },

          emergencyLeave: {
            allocated: 5,
            used: 0,
            available: 5,
          },

          specialLeave: {
            allocated: 3,
            used: 1,
            available: 2,
          },

          totalAllocated: 38,
          totalUsed: 12,
          totalAvailable: 26,

          status: 'Healthy',

          lastUpdated: '2026-10-04',
        },

        {
          id: 3,
          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',
          department: 'Finance',
          position: 'Finance Staff',

          vacationLeave: {
            allocated: 15,
            used: 13,
            available: 2,
          },

          sickLeave: {
            allocated: 15,
            used: 11,
            available: 4,
          },

          emergencyLeave: {
            allocated: 5,
            used: 4,
            available: 1,
          },

          specialLeave: {
            allocated: 3,
            used: 2,
            available: 1,
          },

          totalAllocated: 38,
          totalUsed: 30,
          totalAvailable: 8,

          status: 'Low Balance',

          lastUpdated: '2026-10-06',
        },

        {
          id: 4,
          employeeId: 4,
          employeeNumber: 'EMP-004',
          employeeName: 'Ana Garcia',
          department: 'Operations',
          position: 'Operations Staff',

          vacationLeave: {
            allocated: 15,
            used: 4,
            available: 11,
          },

          sickLeave: {
            allocated: 15,
            used: 1,
            available: 14,
          },

          emergencyLeave: {
            allocated: 5,
            used: 1,
            available: 4,
          },

          specialLeave: {
            allocated: 3,
            used: 0,
            available: 3,
          },

          totalAllocated: 38,
          totalUsed: 6,
          totalAvailable: 32,

          status: 'Healthy',

          lastUpdated: '2026-10-02',
        },

        {
          id: 5,
          employeeId: 5,
          employeeNumber: 'EMP-005',
          employeeName: 'Carlo Mendoza',
          department: 'IT',
          position: 'Developer',

          vacationLeave: {
            allocated: 15,
            used: 15,
            available: 0,
          },

          sickLeave: {
            allocated: 15,
            used: 13,
            available: 2,
          },

          emergencyLeave: {
            allocated: 5,
            used: 5,
            available: 0,
          },

          specialLeave: {
            allocated: 3,
            used: 3,
            available: 0,
          },

          totalAllocated: 38,
          totalUsed: 36,
          totalAvailable: 2,

          status: 'Exhausted',

          lastUpdated: '2026-10-06',
        },

        {
          id: 6,
          employeeId: 6,
          employeeNumber: 'EMP-006',
          employeeName: 'Angela Flores',
          department: 'Billing',
          position: 'Billing Staff',

          vacationLeave: {
            allocated: 15,
            used: 7,
            available: 8,
          },

          sickLeave: {
            allocated: 15,
            used: 4,
            available: 11,
          },

          emergencyLeave: {
            allocated: 5,
            used: 0,
            available: 5,
          },

          specialLeave: {
            allocated: 3,
            used: 1,
            available: 2,
          },

          totalAllocated: 38,
          totalUsed: 12,
          totalAvailable: 26,

          status: 'Healthy',

          lastUpdated: '2026-10-01',
        },

        {
          id: 7,
          employeeId: 7,
          employeeNumber: 'EMP-007',
          employeeName: 'Mark Lopez',
          department: 'IT',
          position: 'IT Support',

          vacationLeave: {
            allocated: 15,
            used: 12,
            available: 3,
          },

          sickLeave: {
            allocated: 15,
            used: 9,
            available: 6,
          },

          emergencyLeave: {
            allocated: 5,
            used: 4,
            available: 1,
          },

          specialLeave: {
            allocated: 3,
            used: 1,
            available: 2,
          },

          totalAllocated: 38,
          totalUsed: 26,
          totalAvailable: 12,

          status: 'Low Balance',

          lastUpdated: '2026-10-03',
        },

        {
          id: 8,
          employeeId: 8,
          employeeNumber: 'EMP-008',
          employeeName: 'Jenny Ramos',
          department: 'Human Resources',
          position: 'HR Staff',

          vacationLeave: {
            allocated: 15,
            used: 5,
            available: 10,
          },

          sickLeave: {
            allocated: 15,
            used: 2,
            available: 13,
          },

          emergencyLeave: {
            allocated: 5,
            used: 1,
            available: 4,
          },

          specialLeave: {
            allocated: 3,
            used: 1,
            available: 2,
          },

          totalAllocated: 38,
          totalUsed: 9,
          totalAvailable: 29,

          status: 'Healthy',

          lastUpdated: '2026-10-05',
        },

        {
          id: 9,
          employeeId: 9,
          employeeNumber: 'EMP-009',
          employeeName: 'Robert Castillo',
          department: 'Finance',
          position: 'Finance Officer',

          vacationLeave: {
            allocated: 15,
            used: 10,
            available: 5,
          },

          sickLeave: {
            allocated: 15,
            used: 7,
            available: 8,
          },

          emergencyLeave: {
            allocated: 5,
            used: 2,
            available: 3,
          },

          specialLeave: {
            allocated: 3,
            used: 1,
            available: 2,
          },

          totalAllocated: 38,
          totalUsed: 20,
          totalAvailable: 18,

          status: 'Healthy',

          lastUpdated: '2026-10-04',
        },

        {
          id: 10,
          employeeId: 10,
          employeeNumber: 'EMP-010',
          employeeName: 'Grace Navarro',
          department: 'Human Resources',
          position: 'HR Staff',

          vacationLeave: {
            allocated: 15,
            used: 14,
            available: 1,
          },

          sickLeave: {
            allocated: 15,
            used: 10,
            available: 5,
          },

          emergencyLeave: {
            allocated: 5,
            used: 4,
            available: 1,
          },

          specialLeave: {
            allocated: 3,
            used: 2,
            available: 1,
          },

          totalAllocated: 38,
          totalUsed: 30,
          totalAvailable: 8,

          status: 'Low Balance',

          lastUpdated: '2026-10-06',
        },
      ],
    )

  const search =
    ref('')

  const department =
    ref('')

  const status =
    ref('')

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          balances.value.map(
            item =>
              item.department,
          ),
        ),
      ].sort()
    })

  const statusOptions:
    LeaveBalanceStatus[] = [
      'Healthy',
      'Low Balance',
      'Exhausted',
    ]

  const filteredBalances =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return balances.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.position
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus
          )
        },
      )
    })

  const stats =
    computed(() => {
      const data =
        filteredBalances.value

      return {
        employees:
          data.length,

        availableCredits:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.totalAvailable,
            0,
          ),

        lowBalance:
          data.filter(
            item =>
              item.status ===
              'Low Balance',
          ).length,

        exhausted:
          data.filter(
            item =>
              item.status ===
              'Exhausted',
          ).length,
      }
    })

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredBalances
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedBalances =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredBalances
        .value
        .slice(
          start,
          start +
            perPage.value,
        )
    })

  const showingFrom =
    computed(() => {
      if (
        filteredBalances
          .value.length === 0
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

        filteredBalances
          .value.length,
      )
    })

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      status,
    ],
    () => {
      currentPage.value = 1
    },
  )

  watch(
    totalPages,
    value => {
      if (
        currentPage.value >
        value
      ) {
        currentPage.value =
          value
      }
    },
  )

  return {
    balances,

    search,
    department,
    status,

    currentPage,

    filteredBalances,
    paginatedBalances,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    departmentOptions,
    statusOptions,

    resetFilters,
  }
}