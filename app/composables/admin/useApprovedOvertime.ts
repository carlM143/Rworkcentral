import type {
  ApprovedOvertime,
  ApprovedOvertimePayrollStatus,
  ApprovedOvertimeType,
} from '~/types/approvedOvertime'

export const useApprovedOvertime = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const records =
    useState<ApprovedOvertime[]>(
      'approved-overtime',
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

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-10-04T13:30:00',

          payrollStatus:
            'Ready for Payroll',

          payrollPeriod:
            'Oct 1–15, 2026',
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

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-10-03T16:30:00',

          payrollStatus:
            'Ready for Payroll',

          payrollPeriod:
            'Oct 1–15, 2026',

          remarks:
            'Approved for 2.5 hours only.',
        },

        {
          id: 3,

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

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-29T11:20:00',

          payrollStatus:
            'Included in Payroll',

          payrollPeriod:
            'Sep 16–30, 2026',
        },

        {
          id: 4,

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

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-19T11:00:00',

          payrollStatus:
            'Processed',

          payrollPeriod:
            'Sep 16–30, 2026',
        },

        {
          id: 5,

          requestNumber:
            'OT-2026-011',

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
            '2026-10-02',

          startTime:
            '17:00',

          endTime:
            '19:00',

          requestedHours: 2,
          approvedHours: 2,

          overtimeType:
            'Regular OT',

          reason:
            'Client manpower coordination',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-10-01T15:20:00',

          payrollStatus:
            'Ready for Payroll',

          payrollPeriod:
            'Oct 1–15, 2026',
        },

        {
          id: 6,

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

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-26T10:15:00',

          payrollStatus:
            'Included in Payroll',

          payrollPeriod:
            'Sep 16–30, 2026',
        },

        {
          id: 7,

          requestNumber:
            'OT-2026-013',

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
            '2026-09-25',

          startTime:
            '18:00',

          endTime:
            '21:30',

          requestedHours: 3.5,
          approvedHours: 3.5,

          overtimeType:
            'Regular OT',

          reason:
            'System maintenance',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-24T14:30:00',

          payrollStatus:
            'Processed',

          payrollPeriod:
            'Sep 16–30, 2026',
        },

        {
          id: 8,

          requestNumber:
            'OT-2026-014',

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
            '2026-10-03',

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

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-10-02T16:00:00',

          payrollStatus:
            'Ready for Payroll',

          payrollPeriod:
            'Oct 1–15, 2026',
        },

        {
          id: 9,

          requestNumber:
            'OT-2026-015',

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
            '2026-09-18',

          startTime:
            '17:00',

          endTime:
            '20:00',

          requestedHours: 3,
          approvedHours: 3,

          overtimeType:
            'Regular OT',

          reason:
            'Client coordination',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-17T13:00:00',

          payrollStatus:
            'Processed',

          payrollPeriod:
            'Sep 16–30, 2026',
        },

        {
          id: 10,

          requestNumber:
            'OT-2026-016',

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
            '2026-10-01',

          startTime:
            '18:00',

          endTime:
            '22:00',

          requestedHours: 4,
          approvedHours: 4,

          overtimeType:
            'Regular OT',

          reason:
            'Application deployment',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-30T14:00:00',

          payrollStatus:
            'Ready for Payroll',

          payrollPeriod:
            'Oct 1–15, 2026',
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
    ApprovedOvertimeType[] = [
      'Regular OT',
      'Rest Day OT',
      'Holiday OT',
    ]

  const payrollStatusOptions:
    ApprovedOvertimePayrollStatus[] = [
      'Ready for Payroll',
      'Included in Payroll',
      'Processed',
    ]

  /* =========================================================
     FILTERED
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
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
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

          const matchesPayrollStatus =
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
            matchesPayrollStatus &&
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
        approvedRequests:
          data.length,

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

        readyForPayroll:
          data.filter(
            item =>
              item.payrollStatus ===
              'Ready for Payroll',
          ).length,

        processed:
          data.filter(
            item =>
              item.payrollStatus ===
              'Processed',
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
    payrollStatusOptions,

    resetFilters,
  }
}