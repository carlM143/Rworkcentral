import type {
  OvertimeHistory,
  OvertimeHistoryPayrollStatus,
  OvertimeHistoryStatus,
  OvertimeHistoryType,
} from '~/types/overtimeHistory'

export const useOvertimeHistory = () => {
  const records =
    useState<OvertimeHistory[]>(
      'overtime-history',
      () => [
        {
          id: 1,

          requestNumber:
            'OT-2026-001',

          employeeId: 1,
          employeeNumber:
            'EMP-001',

          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          overtimeDate:
            '2026-10-05',

          startTime:
            '17:00',

          endTime:
            '20:00',

          requestedHours: 3,
          approvedHours: 3,

          overtimeType:
            'Regular OT',

          reason:
            'Extended client delivery operations',

          status:
            'Approved',

          payrollStatus:
            'Ready for Payroll',

          payrollPeriod:
            'Oct 1–15, 2026',

          requestedAt:
            '2026-10-04T09:15:00',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-04T13:30:00',
        },

        {
          id: 2,

          requestNumber:
            'OT-2026-004',

          employeeId: 6,
          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Staff',

          overtimeDate:
            '2026-10-04',

          startTime:
            '17:30',

          endTime:
            '20:30',

          requestedHours: 3,
          approvedHours: 2.5,

          overtimeType:
            'Regular OT',

          reason:
            'Billing cutoff preparation',

          status:
            'Approved',

          payrollStatus:
            'Ready for Payroll',

          payrollPeriod:
            'Oct 1–15, 2026',

          requestedAt:
            '2026-10-03T15:15:00',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-03T16:30:00',

          remarks:
            'Approved for 2.5 hours only.',
        },

        {
          id: 3,

          requestNumber:
            'OT-2026-005',

          employeeId: 7,
          employeeNumber:
            'EMP-007',

          employeeName:
            'Mark Lopez',

          department:
            'IT',

          position:
            'IT Support',

          overtimeDate:
            '2026-10-03',

          startTime:
            '18:00',

          endTime:
            '22:00',

          requestedHours: 4,
          approvedHours: 0,

          overtimeType:
            'Regular OT',

          reason:
            'Server maintenance',

          status:
            'Rejected',

          payrollStatus:
            'Not Applicable',

          requestedAt:
            '2026-10-02T09:00:00',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-02T14:00:00',

          remarks:
            'Maintenance rescheduled.',
        },

        {
          id: 4,

          requestNumber:
            'OT-2026-006',

          employeeId: 9,
          employeeNumber:
            'EMP-009',

          employeeName:
            'Robert Castillo',

          department:
            'Finance',

          position:
            'Finance Officer',

          overtimeDate:
            '2026-09-30',

          startTime:
            '17:00',

          endTime:
            '21:00',

          requestedHours: 4,
          approvedHours: 4,

          overtimeType:
            'Regular OT',

          reason:
            'Month-end closing',

          status:
            'Approved',

          payrollStatus:
            'Included in Payroll',

          payrollPeriod:
            'Sep 16–30, 2026',

          requestedAt:
            '2026-09-29T08:30:00',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-29T11:20:00',
        },

        {
          id: 5,

          requestNumber:
            'OT-2026-008',

          employeeId: 11,
          employeeNumber:
            'EMP-011',

          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Driver',

          overtimeDate:
            '2026-09-21',

          startTime:
            '07:00',

          endTime:
            '15:00',

          requestedHours: 8,
          approvedHours: 8,

          overtimeType:
            'Holiday OT',

          reason:
            'Holiday client operations',

          status:
            'Approved',

          payrollStatus:
            'Processed',

          payrollPeriod:
            'Sep 16–30, 2026',

          requestedAt:
            '2026-09-19T09:00:00',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-19T11:00:00',
        },

        {
          id: 6,

          requestNumber:
            'OT-2026-010',

          employeeId: 5,
          employeeNumber:
            'EMP-005',

          employeeName:
            'Carlo Mendoza',

          department:
            'IT',

          position:
            'Developer',

          overtimeDate:
            '2026-10-04',

          startTime:
            '18:00',

          endTime:
            '21:00',

          requestedHours: 3,
          approvedHours: 0,

          overtimeType:
            'Regular OT',

          reason:
            'System deployment support',

          status:
            'Cancelled',

          payrollStatus:
            'Not Applicable',

          requestedAt:
            '2026-10-03T10:20:00',

          remarks:
            'Deployment postponed.',
        },

        {
          id: 7,

          requestNumber:
            'OT-2026-012',

          employeeId: 3,
          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Finance Staff',

          overtimeDate:
            '2026-09-27',

          startTime:
            '08:00',

          endTime:
            '13:00',

          requestedHours: 5,
          approvedHours: 5,

          overtimeType:
            'Rest Day OT',

          reason:
            'Payroll preparation',

          status:
            'Approved',

          payrollStatus:
            'Processed',

          payrollPeriod:
            'Sep 16–30, 2026',

          requestedAt:
            '2026-09-26T08:00:00',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-26T10:15:00',
        },

        {
          id: 8,

          requestNumber:
            'OT-2026-017',

          employeeId: 10,
          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Staff',

          overtimeDate:
            '2026-09-15',

          startTime:
            '17:00',

          endTime:
            '19:00',

          requestedHours: 2,
          approvedHours: 2,

          overtimeType:
            'Regular OT',

          reason:
            'Employee records preparation',

          status:
            'Approved',

          payrollStatus:
            'Processed',

          payrollPeriod:
            'Sep 1–15, 2026',

          requestedAt:
            '2026-09-14T09:10:00',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-14T14:00:00',
        },

        {
          id: 9,

          requestNumber:
            'OT-2026-018',

          employeeId: 4,
          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Operations Staff',

          overtimeDate:
            '2026-09-12',

          startTime:
            '17:00',

          endTime:
            '20:00',

          requestedHours: 3,
          approvedHours: 0,

          overtimeType:
            'Regular OT',

          reason:
            'Client support',

          status:
            'Rejected',

          payrollStatus:
            'Not Applicable',

          requestedAt:
            '2026-09-11T10:00:00',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-11T15:30:00',

          remarks:
            'No prior OT authorization.',
        },

        {
          id: 10,

          requestNumber:
            'OT-2026-019',

          employeeId: 12,
          employeeNumber:
            'EMP-012',

          employeeName:
            'Claire Villanueva',

          department:
            'Operations',

          position:
            'Coordinator',

          overtimeDate:
            '2026-09-10',

          startTime:
            '17:00',

          endTime:
            '20:30',

          requestedHours: 3.5,
          approvedHours: 3.5,

          overtimeType:
            'Regular OT',

          reason:
            'Client coordination',

          status:
            'Approved',

          payrollStatus:
            'Processed',

          payrollPeriod:
            'Sep 1–15, 2026',

          requestedAt:
            '2026-09-09T09:30:00',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-09T13:00:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const department =
    ref('')

  const overtimeType =
    ref('')

  const status =
    ref('')

  const payrollStatus =
    ref('')

  const dateFrom =
    ref('')

  const dateTo =
    ref('')

  /* =========================================================
     PAGINATION
  ========================================================= */

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  /* =========================================================
     OPTIONS
  ========================================================= */

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          records.value.map(
            item =>
              item.department,
          ),
        ),
      ].sort()
    })

  const overtimeTypeOptions:
    OvertimeHistoryType[] = [
      'Regular OT',
      'Rest Day OT',
      'Holiday OT',
    ]

  const statusOptions:
    OvertimeHistoryStatus[] = [
      'Approved',
      'Rejected',
      'Cancelled',
    ]

  const payrollStatusOptions:
    OvertimeHistoryPayrollStatus[] = [
      'Not Applicable',
      'Ready for Payroll',
      'Included in Payroll',
      'Processed',
    ]

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredRecords =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return records.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.requestNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.reason
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesType =
            !overtimeType.value ||
            item.overtimeType ===
              overtimeType.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          const matchesPayroll =
            !payrollStatus.value ||
            item.payrollStatus ===
              payrollStatus.value

          const matchesFrom =
            !dateFrom.value ||
            item.overtimeDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            item.overtimeDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesType &&
            matchesStatus &&
            matchesPayroll &&
            matchesFrom &&
            matchesTo
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
        filteredRecords.value

      return {
        totalRecords:
          data.length,

        approved:
          data.filter(
            item =>
              item.status ===
              'Approved',
          ).length,

        rejectedOrCancelled:
          data.filter(
            item =>
              item.status ===
                'Rejected' ||
              item.status ===
                'Cancelled',
          ).length,

        approvedHours:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.approvedHours,
            0,
          ),
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
          filteredRecords
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedRecords =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredRecords
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
        filteredRecords
          .value.length ===
        0
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

        filteredRecords
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    overtimeType.value = ''
    status.value = ''
    payrollStatus.value = ''
    dateFrom.value = ''
    dateTo.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      overtimeType,
      status,
      payrollStatus,
      dateFrom,
      dateTo,
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
    records,

    search,
    department,
    overtimeType,
    status,
    payrollStatus,
    dateFrom,
    dateTo,

    currentPage,

    filteredRecords,
    paginatedRecords,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    departmentOptions,
    overtimeTypeOptions,
    statusOptions,
    payrollStatusOptions,

    resetFilters,
  }
}