import type {
  CompletedDriverPayroll,
  DriverPayrollPaymentStatus,
} from '~/types/completedDriverPayroll'

export const useCompletedDriverPayroll = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const payrolls =
    useState<CompletedDriverPayroll[]>(
      'completed-driver-payroll',
      () => [
        {
          id: 1,

          payrollNumber:
            'DRV-PAY-2026-0831-001',

          driverId: 7,

          employeeNumber:
            'EMP-007',

          driverName:
            'Mark Lopez',

          department:
            'Operations',

          position:
            'Driver',

          periodId: 3,

          periodCode:
            'DRV-PP-2026-0831',

          periodName:
            'August 16–31, 2026',

          periodStart:
            '2026-08-16',

          periodEnd:
            '2026-08-31',

          totalTrips: 13,

          regularHours: 104,

          overtimeHours: 11,

          regularPay: 8450,

          tripPay: 3250,

          overtimePay: 1375,

          holidayPay: 675,

          allowance: 500,

          grossPay: 14250,

          sss: 900,

          philHealth: 450,

          pagIbig: 200,

          loanDeduction: 700,

          otherDeductions: 200,

          totalDeductions: 2450,

          netPay: 11800,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Paid',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-01T09:30:00',

          paidBy:
            'Maria Santos',

          paidAt:
            '2026-09-05T08:00:00',

          referenceNumber:
            'DRV-PMT-2026-0905-001',

          remarks:
            'Payroll successfully completed and paid.',
        },

        {
          id: 2,

          payrollNumber:
            'DRV-PAY-2026-0831-002',

          driverId: 1,

          employeeNumber:
            'EMP-001',

          driverName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          periodId: 3,

          periodCode:
            'DRV-PP-2026-0831',

          periodName:
            'August 16–31, 2026',

          periodStart:
            '2026-08-16',

          periodEnd:
            '2026-08-31',

          totalTrips: 15,

          regularHours: 108,

          overtimeHours: 13,

          regularPay: 8775,

          tripPay: 3750,

          overtimePay: 1625,

          holidayPay: 650,

          allowance: 500,

          grossPay: 15300,

          sss: 950,

          philHealth: 475,

          pagIbig: 200,

          loanDeduction: 1250,

          otherDeductions: 0,

          totalDeductions: 2875,

          netPay: 12425,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Released',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-01T09:45:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-09-05T08:15:00',

          referenceNumber:
            'DRV-PMT-2026-0905-002',
        },

        {
          id: 3,

          payrollNumber:
            'DRV-PAY-2026-0831-003',

          driverId: 5,

          employeeNumber:
            'EMP-005',

          driverName:
            'Carlo Mendoza',

          department:
            'Operations',

          position:
            'Driver',

          periodId: 3,

          periodCode:
            'DRV-PP-2026-0831',

          periodName:
            'August 16–31, 2026',

          periodStart:
            '2026-08-16',

          periodEnd:
            '2026-08-31',

          totalTrips: 10,

          regularHours: 98,

          overtimeHours: 8,

          regularPay: 7962.5,

          tripPay: 2500,

          overtimePay: 1000,

          holidayPay: 0,

          allowance: 350,

          grossPay: 11812.5,

          sss: 850,

          philHealth: 425,

          pagIbig: 200,

          loanDeduction: 500,

          otherDeductions: 150,

          totalDeductions: 2125,

          netPay: 9687.5,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Paid',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-01T10:10:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-09-05T08:30:00',

          referenceNumber:
            'DRV-PMT-2026-0905-003',
        },

        {
          id: 4,

          payrollNumber:
            'DRV-PAY-2026-0831-004',

          driverId: 9,

          employeeNumber:
            'EMP-009',

          driverName:
            'Robert Castillo',

          department:
            'Operations',

          position:
            'Driver',

          periodId: 3,

          periodCode:
            'DRV-PP-2026-0831',

          periodName:
            'August 16–31, 2026',

          periodStart:
            '2026-08-16',

          periodEnd:
            '2026-08-31',

          totalTrips: 11,

          regularHours: 102,

          overtimeHours: 9,

          regularPay: 8287.5,

          tripPay: 2750,

          overtimePay: 1125,

          holidayPay: 0,

          allowance: 400,

          grossPay: 12562.5,

          sss: 875,

          philHealth: 440,

          pagIbig: 200,

          loanDeduction: 0,

          otherDeductions: 100,

          totalDeductions: 1615,

          netPay: 10947.5,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Pending Payment',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-01T10:25:00',

          remarks:
            'Payroll completed. Payment is awaiting release.',
        },

        {
          id: 5,

          payrollNumber:
            'DRV-PAY-2026-0815-001',

          driverId: 12,

          employeeNumber:
            'EMP-012',

          driverName:
            'Claire Villanueva',

          department:
            'Operations',

          position:
            'Driver',

          periodId: 4,

          periodCode:
            'DRV-PP-2026-0815',

          periodName:
            'August 1–15, 2026',

          periodStart:
            '2026-08-01',

          periodEnd:
            '2026-08-15',

          totalTrips: 12,

          regularHours: 101,

          overtimeHours: 7,

          regularPay: 8206.25,

          tripPay: 3000,

          overtimePay: 875,

          holidayPay: 0,

          allowance: 400,

          grossPay: 12481.25,

          sss: 850,

          philHealth: 425,

          pagIbig: 200,

          loanDeduction: 600,

          otherDeductions: 0,

          totalDeductions: 2075,

          netPay: 10406.25,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Released',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-08-16T09:00:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-08-20T08:20:00',

          referenceNumber:
            'DRV-PMT-2026-0820-012',
        },

        {
          id: 6,

          payrollNumber:
            'DRV-PAY-2026-0815-002',

          driverId: 14,

          employeeNumber:
            'EMP-014',

          driverName:
            'Daniel Ramos',

          department:
            'Logistics',

          position:
            'Driver',

          periodId: 4,

          periodCode:
            'DRV-PP-2026-0815',

          periodName:
            'August 1–15, 2026',

          periodStart:
            '2026-08-01',

          periodEnd:
            '2026-08-15',

          totalTrips: 14,

          regularHours: 106,

          overtimeHours: 10,

          regularPay: 8612.5,

          tripPay: 3500,

          overtimePay: 1250,

          holidayPay: 0,

          allowance: 500,

          grossPay: 13862.5,

          sss: 900,

          philHealth: 450,

          pagIbig: 200,

          loanDeduction: 0,

          otherDeductions: 150,

          totalDeductions: 1700,

          netPay: 12162.5,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Paid',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-08-16T09:15:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-08-20T08:35:00',

          referenceNumber:
            'DRV-PMT-2026-0820-014',
        },

        {
          id: 7,

          payrollNumber:
            'DRV-PAY-2026-0731-001',

          driverId: 15,

          employeeNumber:
            'EMP-015',

          driverName:
            'Joseph Fernandez',

          department:
            'Logistics',

          position:
            'Driver',

          periodId: 5,

          periodCode:
            'DRV-PP-2026-0731',

          periodName:
            'July 16–31, 2026',

          periodStart:
            '2026-07-16',

          periodEnd:
            '2026-07-31',

          totalTrips: 11,

          regularHours: 100,

          overtimeHours: 6,

          regularPay: 8125,

          tripPay: 2750,

          overtimePay: 750,

          holidayPay: 650,

          allowance: 400,

          grossPay: 12675,

          sss: 850,

          philHealth: 425,

          pagIbig: 200,

          loanDeduction: 0,

          otherDeductions: 0,

          totalDeductions: 1475,

          netPay: 11200,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Released',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-08-01T09:30:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-08-05T08:00:00',

          referenceNumber:
            'DRV-PMT-2026-0805-015',
        },

        {
          id: 8,

          payrollNumber:
            'DRV-PAY-2026-0731-002',

          driverId: 16,

          employeeNumber:
            'EMP-016',

          driverName:
            'Michael Torres',

          department:
            'Logistics',

          position:
            'Driver',

          periodId: 5,

          periodCode:
            'DRV-PP-2026-0731',

          periodName:
            'July 16–31, 2026',

          periodStart:
            '2026-07-16',

          periodEnd:
            '2026-07-31',

          totalTrips: 9,

          regularHours: 96,

          overtimeHours: 5,

          regularPay: 7800,

          tripPay: 2250,

          overtimePay: 625,

          holidayPay: 0,

          allowance: 350,

          grossPay: 11025,

          sss: 825,

          philHealth: 415,

          pagIbig: 200,

          loanDeduction: 500,

          otherDeductions: 0,

          totalDeductions: 1940,

          netPay: 9085,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Paid',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-08-01T09:45:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-08-05T08:15:00',

          referenceNumber:
            'DRV-PMT-2026-0805-016',
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

  const paymentStatus =
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

  const paymentStatusOptions:
    DriverPayrollPaymentStatus[] = [
      'Pending Payment',
      'Paid',
      'Released',
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
              .includes(keyword) ||
            (
              payroll.referenceNumber ??
              ''
            )
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

          const matchesPayment =
            !paymentStatus.value ||
            payroll.paymentStatus ===
              paymentStatus.value

          const completedDate =
            payroll.completedAt
              .slice(0, 10)

          const matchesFrom =
            !dateFrom.value ||
            completedDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            completedDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesPeriod &&
            matchesDepartment &&
            matchesPayment &&
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
        completed:
          records.length,

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

        deductions:
          records.reduce(
            (
              total,
              payroll,
            ) =>
              total +
              payroll.totalDeductions,
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
        filteredPayrolls
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

    paymentStatus.value =
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
      paymentStatus,
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
    paymentStatus,
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
    paymentStatusOptions,

    resetFilters,
  }
}