import type {
  PendingDriverPayroll,
  PendingDriverPayrollStatus,
} from '~/types/pendingDriverPayroll'

export const usePendingDriverPayroll = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const payrolls =
    useState<PendingDriverPayroll[]>(
      'pending-driver-payroll',
      () => [
        {
          id: 1,

          payrollNumber:
            'DRV-PAY-2026-0915-001',

          driverId: 7,

          employeeNumber:
            'EMP-007',

          driverName:
            'Mark Lopez',

          department:
            'Operations',

          position:
            'Driver',

          periodId: 1,

          periodCode:
            'DRV-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          totalTrips: 12,

          regularHours: 104,

          overtimeHours: 10,

          regularPay: 8450,

          tripPay: 3000,

          overtimePay: 1250,

          holidayPay: 0,

          allowance: 500,

          grossPay: 13200,

          sss: 900,

          philHealth: 450,

          pagIbig: 200,

          loanDeduction: 700,

          otherDeductions: 200,

          totalDeductions: 2450,

          netPay: 10750,

          status:
            'For Review',

          issueCount: 0,

          remarks:
            'Payroll ready for supervisor review.',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-15T10:15:00',
        },

        {
          id: 2,

          payrollNumber:
            'DRV-PAY-2026-0915-002',

          driverId: 1,

          employeeNumber:
            'EMP-001',

          driverName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          periodId: 1,

          periodCode:
            'DRV-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          totalTrips: 14,

          regularHours: 108,

          overtimeHours: 12.5,

          regularPay: 8775,

          tripPay: 3500,

          overtimePay: 1562.5,

          holidayPay: 650,

          allowance: 500,

          grossPay: 14987.5,

          sss: 950,

          philHealth: 475,

          pagIbig: 200,

          loanDeduction: 1250,

          otherDeductions: 0,

          totalDeductions: 2875,

          netPay: 12112.5,

          status:
            'Ready',

          issueCount: 0,

          remarks:
            'Timekeeping and trip records verified.',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-15T10:22:00',
        },

        {
          id: 3,

          payrollNumber:
            'DRV-PAY-2026-0915-003',

          driverId: 5,

          employeeNumber:
            'EMP-005',

          driverName:
            'Carlo Mendoza',

          department:
            'Operations',

          position:
            'Driver',

          periodId: 1,

          periodCode:
            'DRV-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          totalTrips: 9,

          regularHours: 96,

          overtimeHours: 7,

          regularPay: 7800,

          tripPay: 2250,

          overtimePay: 875,

          holidayPay: 0,

          allowance: 350,

          grossPay: 11275,

          sss: 850,

          philHealth: 425,

          pagIbig: 200,

          loanDeduction: 500,

          otherDeductions: 150,

          totalDeductions: 2125,

          netPay: 9150,

          status:
            'With Issue',

          issueCount: 2,

          remarks:
            'Two trip records require verification.',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-15T10:30:00',
        },

        {
          id: 4,

          payrollNumber:
            'DRV-PAY-2026-0915-004',

          driverId: 9,

          employeeNumber:
            'EMP-009',

          driverName:
            'Robert Castillo',

          department:
            'Operations',

          position:
            'Driver',

          periodId: 1,

          periodCode:
            'DRV-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          totalTrips: 11,

          regularHours: 102,

          overtimeHours: 8,

          regularPay: 8287.5,

          tripPay: 2750,

          overtimePay: 1000,

          holidayPay: 0,

          allowance: 400,

          grossPay: 12437.5,

          sss: 875,

          philHealth: 440,

          pagIbig: 200,

          loanDeduction: 0,

          otherDeductions: 100,

          totalDeductions: 1615,

          netPay: 10822.5,

          status:
            'Pending',

          issueCount: 0,

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-15T10:42:00',
        },

        {
          id: 5,

          payrollNumber:
            'DRV-PAY-2026-0915-005',

          driverId: 12,

          employeeNumber:
            'EMP-012',

          driverName:
            'Claire Villanueva',

          department:
            'Operations',

          position:
            'Driver',

          periodId: 1,

          periodCode:
            'DRV-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          totalTrips: 10,

          regularHours: 100,

          overtimeHours: 5.5,

          regularPay: 8125,

          tripPay: 2500,

          overtimePay: 687.5,

          holidayPay: 0,

          allowance: 400,

          grossPay: 11712.5,

          sss: 850,

          philHealth: 425,

          pagIbig: 200,

          loanDeduction: 600,

          otherDeductions: 0,

          totalDeductions: 2075,

          netPay: 9637.5,

          status:
            'Ready',

          issueCount: 0,

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-15T10:50:00',
        },

        {
          id: 6,

          payrollNumber:
            'DRV-PAY-2026-0915-006',

          driverId: 14,

          employeeNumber:
            'EMP-014',

          driverName:
            'Daniel Ramos',

          department:
            'Logistics',

          position:
            'Driver',

          periodId: 1,

          periodCode:
            'DRV-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          totalTrips: 13,

          regularHours: 105,

          overtimeHours: 9,

          regularPay: 8531.25,

          tripPay: 3250,

          overtimePay: 1125,

          holidayPay: 0,

          allowance: 500,

          grossPay: 13406.25,

          sss: 900,

          philHealth: 450,

          pagIbig: 200,

          loanDeduction: 0,

          otherDeductions: 150,

          totalDeductions: 1700,

          netPay: 11706.25,

          status:
            'For Review',

          issueCount: 0,

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-15T11:00:00',
        },

        {
          id: 7,

          payrollNumber:
            'DRV-PAY-2026-0930-001',

          driverId: 15,

          employeeNumber:
            'EMP-015',

          driverName:
            'Joseph Fernandez',

          department:
            'Logistics',

          position:
            'Driver',

          periodId: 2,

          periodCode:
            'DRV-PP-2026-0930',

          periodName:
            'September 16–30, 2026',

          periodStart:
            '2026-09-16',

          periodEnd:
            '2026-09-30',

          totalTrips: 4,

          regularHours: 32,

          overtimeHours: 2,

          regularPay: 2600,

          tripPay: 1000,

          overtimePay: 250,

          holidayPay: 0,

          allowance: 150,

          grossPay: 4000,

          sss: 300,

          philHealth: 150,

          pagIbig: 100,

          loanDeduction: 0,

          otherDeductions: 0,

          totalDeductions: 550,

          netPay: 3450,

          status:
            'Pending',

          issueCount: 0,

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-16T09:00:00',
        },

        {
          id: 8,

          payrollNumber:
            'DRV-PAY-2026-0930-002',

          driverId: 16,

          employeeNumber:
            'EMP-016',

          driverName:
            'Michael Torres',

          department:
            'Logistics',

          position:
            'Driver',

          periodId: 2,

          periodCode:
            'DRV-PP-2026-0930',

          periodName:
            'September 16–30, 2026',

          periodStart:
            '2026-09-16',

          periodEnd:
            '2026-09-30',

          totalTrips: 3,

          regularHours: 30,

          overtimeHours: 1,

          regularPay: 2437.5,

          tripPay: 750,

          overtimePay: 125,

          holidayPay: 0,

          allowance: 150,

          grossPay: 3462.5,

          sss: 275,

          philHealth: 140,

          pagIbig: 100,

          loanDeduction: 0,

          otherDeductions: 0,

          totalDeductions: 515,

          netPay: 2947.5,

          status:
            'With Issue',

          issueCount: 1,

          remarks:
            'Missing final trip confirmation.',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-16T09:10:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const period =
    ref('')

  const department =
    ref('')

  const status =
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

  const statusOptions:
    PendingDriverPayrollStatus[] = [
      'Pending',
      'For Review',
      'With Issue',
      'Ready',
    ]

  const periodOptions =
    computed(() => {
      return [
        ...new Set(
          payrolls.value.map(
            payroll =>
              payroll.periodCode,
          ),
        ),
      ]
    })

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          payrolls.value.map(
            payroll =>
              payroll.department,
          ),
        ),
      ].sort()
    })

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredPayrolls =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return payrolls.value.filter(
        payroll => {
          const matchesSearch =
            !keyword ||
            payroll.payrollNumber
              .toLowerCase()
              .includes(keyword) ||
            payroll.driverName
              .toLowerCase()
              .includes(keyword) ||
            payroll.employeeNumber
              .toLowerCase()
              .includes(keyword)

          const matchesPeriod =
            !period.value ||
            payroll.periodCode ===
              period.value

          const matchesDepartment =
            !department.value ||
            payroll.department ===
              department.value

          const matchesStatus =
            !status.value ||
            payroll.status ===
              status.value

          const matchesFrom =
            !dateFrom.value ||
            payroll.periodStart >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            payroll.periodEnd <=
              dateTo.value

          return (
            matchesSearch &&
            matchesPeriod &&
            matchesDepartment &&
            matchesStatus &&
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
      const records =
        filteredPayrolls.value

      return {
        pendingDrivers:
          records.length,

        forReview:
          records.filter(
            payroll =>
              payroll.status ===
              'For Review',
          ).length,

        grossPay:
          records.reduce(
            (
              total,
              payroll,
            ) =>
              total +
              payroll.grossPay,
            0,
          ),

        netPay:
          records.reduce(
            (
              total,
              payroll,
            ) =>
              total +
              payroll.netPay,
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
          filteredPayrolls
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedPayrolls =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredPayrolls
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
        filteredPayrolls.value
          .length === 0
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

        filteredPayrolls
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value =
      ''

    period.value =
      ''

    department.value =
      ''

    status.value =
      ''

    dateFrom.value =
      ''

    dateTo.value =
      ''

    currentPage.value =
      1
  }

  watch(
    [
      search,
      period,
      department,
      status,
      dateFrom,
      dateTo,
    ],
    () => {
      currentPage.value =
        1
    },
  )

  watch(
    totalPages,
    () => {
      if (
        currentPage.value >
        totalPages.value
      ) {
        currentPage.value =
          totalPages.value
      }
    },
  )

  return {
    payrolls,

    search,
    period,
    department,
    status,
    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredPayrolls,
    paginatedPayrolls,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    periodOptions,
    departmentOptions,
    statusOptions,

    resetFilters,
  }
}