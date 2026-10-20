import type {
  LeaveBalance,
  LeaveBalanceStatus,
  LeaveCreditAdjustmentFormData,
  LeaveCreditBreakdown,
  LeaveCreditKey,
  LeaveCreditType,
} from '~/types/leaveBalance'

export const useLeaveBalances = () => {
  /* =========================================================
     HELPERS
  ========================================================= */

  const credit = (
    allocated: number,
    used: number,
  ): LeaveCreditBreakdown => {
    return {
      allocated,
      used,
      available:
        Math.max(
          0,
          allocated - used,
        ),
    }
  }

  const getStatus = (
    available: number,
  ): LeaveBalanceStatus => {
    if (
      available <= 2
    ) {
      return 'Exhausted'
    }

    if (
      available <= 12
    ) {
      return 'Low Balance'
    }

    return 'Healthy'
  }

  const buildBalance = (
    data: {
      id: number
      employeeId: number
      employeeNumber: string
      employeeName: string
      department: string
      position: string

      vacation: [
        number,
        number,
      ]

      sick: [
        number,
        number,
      ]

      emergency: [
        number,
        number,
      ]

      special: [
        number,
        number,
      ]

      lastUpdated: string
    },
  ): LeaveBalance => {
    const vacationLeave =
      credit(
        ...data.vacation,
      )

    const sickLeave =
      credit(
        ...data.sick,
      )

    const emergencyLeave =
      credit(
        ...data.emergency,
      )

    const specialLeave =
      credit(
        ...data.special,
      )

    const credits = [
      vacationLeave,
      sickLeave,
      emergencyLeave,
      specialLeave,
    ]

    const totalAllocated =
      credits.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.allocated,
        0,
      )

    const totalUsed =
      credits.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.used,
        0,
      )

    const totalAvailable =
      credits.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.available,
        0,
      )

    return {
      id:
        data.id,

      employeeId:
        data.employeeId,

      employeeNumber:
        data.employeeNumber,

      employeeName:
        data.employeeName,

      department:
        data.department,

      position:
        data.position,

      vacationLeave,
      sickLeave,
      emergencyLeave,
      specialLeave,

      totalAllocated,
      totalUsed,
      totalAvailable,

      status:
        getStatus(
          totalAvailable,
        ),

      lastUpdated:
        data.lastUpdated,
    }
  }

  /* =========================================================
     DATA
  ========================================================= */

  const balances =
    useState<LeaveBalance[]>(
      'leave-balances',
      () => [
        buildBalance({
          id: 1,
          employeeId: 1,
          employeeNumber:
            'EMP-001',
          employeeName:
            'Juan Dela Cruz',
          department:
            'Operations',
          position:
            'Driver',

          vacation:
            [15, 6],

          sick:
            [15, 2],

          emergency:
            [5, 1],

          special:
            [3, 0],

          lastUpdated:
            '2026-10-05',
        }),

        buildBalance({
          id: 2,
          employeeId: 2,
          employeeNumber:
            'EMP-002',
          employeeName:
            'Maria Santos',
          department:
            'Human Resources',
          position:
            'HR Administrator',

          vacation:
            [15, 8],

          sick:
            [15, 3],

          emergency:
            [5, 0],

          special:
            [3, 1],

          lastUpdated:
            '2026-10-04',
        }),

        buildBalance({
          id: 3,
          employeeId: 3,
          employeeNumber:
            'EMP-003',
          employeeName:
            'Pedro Reyes',
          department:
            'Finance',
          position:
            'Finance Staff',

          vacation:
            [15, 13],

          sick:
            [15, 11],

          emergency:
            [5, 4],

          special:
            [3, 2],

          lastUpdated:
            '2026-10-06',
        }),

        buildBalance({
          id: 4,
          employeeId: 4,
          employeeNumber:
            'EMP-004',
          employeeName:
            'Ana Garcia',
          department:
            'Operations',
          position:
            'Operations Staff',

          vacation:
            [15, 4],

          sick:
            [15, 1],

          emergency:
            [5, 1],

          special:
            [3, 0],

          lastUpdated:
            '2026-10-02',
        }),

        buildBalance({
          id: 5,
          employeeId: 5,
          employeeNumber:
            'EMP-005',
          employeeName:
            'Carlo Mendoza',
          department:
            'IT',
          position:
            'Developer',

          vacation:
            [15, 15],

          sick:
            [15, 13],

          emergency:
            [5, 5],

          special:
            [3, 3],

          lastUpdated:
            '2026-10-06',
        }),

        buildBalance({
          id: 6,
          employeeId: 6,
          employeeNumber:
            'EMP-006',
          employeeName:
            'Angela Flores',
          department:
            'Finance',
          position:
            'Finance Staff',

          vacation:
            [15, 7],

          sick:
            [15, 4],

          emergency:
            [5, 0],

          special:
            [3, 1],

          lastUpdated:
            '2026-10-01',
        }),

        buildBalance({
          id: 7,
          employeeId: 7,
          employeeNumber:
            'EMP-007',
          employeeName:
            'Mark Lopez',
          department:
            'IT',
          position:
            'IT Support',

          vacation:
            [15, 12],

          sick:
            [15, 9],

          emergency:
            [5, 4],

          special:
            [3, 1],

          lastUpdated:
            '2026-10-03',
        }),

        buildBalance({
          id: 8,
          employeeId: 8,
          employeeNumber:
            'EMP-008',
          employeeName:
            'Jenny Ramos',
          department:
            'Human Resources',
          position:
            'HR Staff',

          vacation:
            [15, 5],

          sick:
            [15, 2],

          emergency:
            [5, 1],

          special:
            [3, 1],

          lastUpdated:
            '2026-10-05',
        }),

        buildBalance({
          id: 9,
          employeeId: 9,
          employeeNumber:
            'EMP-009',
          employeeName:
            'Robert Castillo',
          department:
            'Finance',
          position:
            'Finance Officer',

          vacation:
            [15, 10],

          sick:
            [15, 7],

          emergency:
            [5, 2],

          special:
            [3, 1],

          lastUpdated:
            '2026-10-04',
        }),

        buildBalance({
          id: 10,
          employeeId: 10,
          employeeNumber:
            'EMP-010',
          employeeName:
            'Grace Navarro',
          department:
            'Human Resources',
          position:
            'HR Staff',

          vacation:
            [15, 14],

          sick:
            [15, 10],

          emergency:
            [5, 4],

          special:
            [3, 2],

          lastUpdated:
            '2026-10-06',
        }),
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

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

  /* =========================================================
     STATS
  ========================================================= */

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

  /* =========================================================
     PAGINATION
  ========================================================= */

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
        !filteredBalances
          .value.length
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

  /* =========================================================
     CREDIT HELPERS
  ========================================================= */

  const creditKeys:
    Record<
      LeaveCreditType,
      LeaveCreditKey
    > = {
      'Vacation Leave':
        'vacationLeave',

      'Sick Leave':
        'sickLeave',

      'Emergency Leave':
        'emergencyLeave',

      'Special Leave':
        'specialLeave',
    }

  const leaveTypeOptions:
    LeaveCreditType[] = [
      'Vacation Leave',
      'Sick Leave',
      'Emergency Leave',
      'Special Leave',
    ]

  const getBalanceByEmployeeId = (
    employeeId: number,
  ) => {
    return balances.value.find(
      item =>
        item.employeeId ===
        Number(
          employeeId,
        ),
    )
  }

  const recalculateBalance = (
    balance:
      LeaveBalance,
  ) => {
    const credits = [
      balance.vacationLeave,
      balance.sickLeave,
      balance.emergencyLeave,
      balance.specialLeave,
    ]

    balance.totalAllocated =
      credits.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.allocated,
        0,
      )

    balance.totalUsed =
      credits.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.used,
        0,
      )

    balance.totalAvailable =
      credits.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.available,
        0,
      )

    balance.status =
      getStatus(
        balance.totalAvailable,
      )

    balance.lastUpdated =
      new Date()
        .toISOString()
        .slice(
          0,
          10,
        )
  }

  /* =========================================================
     ADJUST CREDITS
  ========================================================= */

  const adjustCredits = (
    data:
      LeaveCreditAdjustmentFormData,
  ) => {
    const balance =
      getBalanceByEmployeeId(
        data.employeeId,
      )

    if (!balance) {
      return {
        success:
          false,

        message:
          'Employee leave balance could not be found.',
      }
    }

    const creditKey =
      creditKeys[
        data.leaveType
      ]

    const selectedCredit =
      balance[
        creditKey
      ]

    const adjustmentDays =
      Math.max(
        0,
        Number(
          data.days,
        ),
      )

    if (
      adjustmentDays <= 0
    ) {
      return {
        success:
          false,

        message:
          'Adjustment days must be greater than zero.',
      }
    }

    if (
      data.adjustmentType ===
      'Add Credits'
    ) {
      selectedCredit.allocated +=
        adjustmentDays
    } else {
      if (
        adjustmentDays >
        selectedCredit.available
      ) {
        return {
          success:
            false,

          message:
            `You can only deduct up to ${selectedCredit.available} available day(s).`,
        }
      }

      selectedCredit.allocated -=
        adjustmentDays
    }

    selectedCredit.available =
      Math.max(
        0,
        selectedCredit.allocated -
          selectedCredit.used,
      )

    recalculateBalance(
      balance,
    )

    return {
      success:
        true,

      balance,

      message:
        `${data.leaveType} successfully adjusted.`,
    }
  }

  /* =========================================================
     RESET
  ========================================================= */

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
    leaveTypeOptions,

    getBalanceByEmployeeId,
    adjustCredits,

    resetFilters,
  }
}