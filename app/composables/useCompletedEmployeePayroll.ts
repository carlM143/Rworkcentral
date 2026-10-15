import type {
  CompletedEmployeePayroll,
  EmployeePayrollPaymentStatus,
} from '~/types/completedEmployeePayroll'

export const useCompletedEmployeePayroll = () => {
  const payrolls =
    useState<CompletedEmployeePayroll[]>(
      'completed-employee-payroll',
      () => [
        {
          id: 1,

          payrollNumber:
            'EMP-PAY-2026-0831-001',

          employeeId: 2,

          employeeNumber:
            'EMP-002',

          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Supervisor',

          periodId: 3,

          periodCode:
            'EMP-PP-2026-0831',

          periodName:
            'August 16–31, 2026',

          periodStart:
            '2026-08-16',

          periodEnd:
            '2026-08-31',

          regularDays: 11,

          regularHours: 88,

          overtimeHours: 8,

          basicPay: 18500,

          overtimePay: 1250,

          holidayPay: 0,

          nightDifferential: 0,

          allowances: 1500,

          otherEarnings: 0,

          grossPay: 21250,

          sss: 1200,

          philHealth: 700,

          pagIbig: 200,

          loanDeduction: 1500,

          lateDeduction: 0,

          undertimeDeduction: 0,

          absenceDeduction: 0,

          otherDeductions: 525,

          totalDeductions: 4125,

          netPay: 17125,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Paid',

          completedBy:
            'Payroll Administrator',

          completedAt:
            '2026-09-01T09:00:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-09-05T08:00:00',

          referenceNumber:
            'EMP-PMT-2026-0905-001',

          remarks:
            'Payroll successfully completed and paid.',
        },

        {
          id: 2,

          payrollNumber:
            'EMP-PAY-2026-0831-002',

          employeeId: 3,

          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Accountant',

          periodId: 3,

          periodCode:
            'EMP-PP-2026-0831',

          periodName:
            'August 16–31, 2026',

          periodStart:
            '2026-08-16',

          periodEnd:
            '2026-08-31',

          regularDays: 11,

          regularHours: 88,

          overtimeHours: 5,

          basicPay: 17250,

          overtimePay: 780,

          holidayPay: 0,

          nightDifferential: 0,

          allowances: 1200,

          otherEarnings: 300,

          grossPay: 19530,

          sss: 1100,

          philHealth: 650,

          pagIbig: 200,

          loanDeduction: 0,

          lateDeduction: 125,

          undertimeDeduction: 0,

          absenceDeduction: 0,

          otherDeductions: 300,

          totalDeductions: 2375,

          netPay: 17155,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Released',

          completedBy:
            'Payroll Administrator',

          completedAt:
            '2026-09-01T09:15:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-09-05T08:15:00',

          referenceNumber:
            'EMP-PMT-2026-0905-002',
        },

        {
          id: 3,

          payrollNumber:
            'EMP-PAY-2026-0831-003',

          employeeId: 4,

          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Dispatcher',

          periodId: 3,

          periodCode:
            'EMP-PP-2026-0831',

          periodName:
            'August 16–31, 2026',

          periodStart:
            '2026-08-16',

          periodEnd:
            '2026-08-31',

          regularDays: 10,

          regularHours: 80,

          overtimeHours: 6,

          basicPay: 14500,

          overtimePay: 825,

          holidayPay: 0,

          nightDifferential: 350,

          allowances: 1000,

          otherEarnings: 0,

          grossPay: 16675,

          sss: 1000,

          philHealth: 600,

          pagIbig: 200,

          loanDeduction: 2000,

          lateDeduction: 210,

          undertimeDeduction: 325,

          absenceDeduction: 725,

          otherDeductions: 0,

          totalDeductions: 5060,

          netPay: 11615,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Paid',

          completedBy:
            'Payroll Administrator',

          completedAt:
            '2026-09-01T09:25:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-09-05T08:30:00',

          referenceNumber:
            'EMP-PMT-2026-0905-003',
        },

        {
          id: 4,

          payrollNumber:
            'EMP-PAY-2026-0831-004',

          employeeId: 6,

          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Officer',

          periodId: 3,

          periodCode:
            'EMP-PP-2026-0831',

          periodName:
            'August 16–31, 2026',

          periodStart:
            '2026-08-16',

          periodEnd:
            '2026-08-31',

          regularDays: 11,

          regularHours: 88,

          overtimeHours: 4,

          basicPay: 15750,

          overtimePay: 550,

          holidayPay: 0,

          nightDifferential: 0,

          allowances: 1250,

          otherEarnings: 0,

          grossPay: 17550,

          sss: 1050,

          philHealth: 625,

          pagIbig: 200,

          loanDeduction: 2500,

          lateDeduction: 0,

          undertimeDeduction: 0,

          absenceDeduction: 0,

          otherDeductions: 125,

          totalDeductions: 4500,

          netPay: 13050,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Pending Payment',

          completedBy:
            'Payroll Administrator',

          completedAt:
            '2026-09-01T09:40:00',

          remarks:
            'Payroll completed. Waiting for payment release.',
        },

        {
          id: 5,

          payrollNumber:
            'EMP-PAY-2026-0815-001',

          employeeId: 8,

          employeeNumber:
            'EMP-008',

          employeeName:
            'Jenny Ramos',

          department:
            'Administration',

          position:
            'Administrative Assistant',

          periodId: 4,

          periodCode:
            'EMP-PP-2026-0815',

          periodName:
            'August 1–15, 2026',

          periodStart:
            '2026-08-01',

          periodEnd:
            '2026-08-15',

          regularDays: 10,

          regularHours: 80,

          overtimeHours: 3,

          basicPay: 13250,

          overtimePay: 375,

          holidayPay: 0,

          nightDifferential: 0,

          allowances: 900,

          otherEarnings: 0,

          grossPay: 14525,

          sss: 900,

          philHealth: 550,

          pagIbig: 200,

          loanDeduction: 0,

          lateDeduction: 75,

          undertimeDeduction: 0,

          absenceDeduction: 0,

          otherDeductions: 100,

          totalDeductions: 1825,

          netPay: 12700,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Released',

          completedBy:
            'Payroll Administrator',

          completedAt:
            '2026-08-16T08:45:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-08-20T08:00:00',

          referenceNumber:
            'EMP-PMT-2026-0820-008',
        },

        {
          id: 6,

          payrollNumber:
            'EMP-PAY-2026-0815-002',

          employeeId: 10,

          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Assistant',

          periodId: 4,

          periodCode:
            'EMP-PP-2026-0815',

          periodName:
            'August 1–15, 2026',

          periodStart:
            '2026-08-01',

          periodEnd:
            '2026-08-15',

          regularDays: 11,

          regularHours: 88,

          overtimeHours: 2,

          basicPay: 14000,

          overtimePay: 250,

          holidayPay: 0,

          nightDifferential: 0,

          allowances: 1000,

          otherEarnings: 250,

          grossPay: 15500,

          sss: 950,

          philHealth: 575,

          pagIbig: 200,

          loanDeduction: 0,

          lateDeduction: 0,

          undertimeDeduction: 0,

          absenceDeduction: 0,

          otherDeductions: 100,

          totalDeductions: 1825,

          netPay: 13675,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Paid',

          completedBy:
            'Payroll Administrator',

          completedAt:
            '2026-08-16T09:00:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-08-20T08:15:00',

          referenceNumber:
            'EMP-PMT-2026-0820-010',
        },

        {
          id: 7,

          payrollNumber:
            'EMP-PAY-2026-0731-001',

          employeeId: 11,

          employeeNumber:
            'EMP-011',

          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Dispatcher',

          periodId: 5,

          periodCode:
            'EMP-PP-2026-0731',

          periodName:
            'July 16–31, 2026',

          periodStart:
            '2026-07-16',

          periodEnd:
            '2026-07-31',

          regularDays: 11,

          regularHours: 88,

          overtimeHours: 4,

          basicPay: 14850,

          overtimePay: 550,

          holidayPay: 650,

          nightDifferential: 0,

          allowances: 950,

          otherEarnings: 0,

          grossPay: 17000,

          sss: 1000,

          philHealth: 600,

          pagIbig: 200,

          loanDeduction: 0,

          lateDeduction: 0,

          undertimeDeduction: 0,

          absenceDeduction: 0,

          otherDeductions: 150,

          totalDeductions: 1950,

          netPay: 15050,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Released',

          completedBy:
            'Payroll Administrator',

          completedAt:
            '2026-08-01T09:15:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-08-05T08:00:00',

          referenceNumber:
            'EMP-PMT-2026-0805-011',
        },

        {
          id: 8,

          payrollNumber:
            'EMP-PAY-2026-0731-002',

          employeeId: 12,

          employeeNumber:
            'EMP-012',

          employeeName:
            'Claire Villanueva',

          department:
            'Administration',

          position:
            'Office Staff',

          periodId: 5,

          periodCode:
            'EMP-PP-2026-0731',

          periodName:
            'July 16–31, 2026',

          periodStart:
            '2026-07-16',

          periodEnd:
            '2026-07-31',

          regularDays: 10,

          regularHours: 80,

          overtimeHours: 2,

          basicPay: 13750,

          overtimePay: 275,

          holidayPay: 0,

          nightDifferential: 0,

          allowances: 900,

          otherEarnings: 0,

          grossPay: 14925,

          sss: 925,

          philHealth: 560,

          pagIbig: 200,

          loanDeduction: 500,

          lateDeduction: 75,

          undertimeDeduction: 0,

          absenceDeduction: 0,

          otherDeductions: 0,

          totalDeductions: 2260,

          netPay: 12665,

          payrollStatus:
            'Completed',

          paymentStatus:
            'Paid',

          completedBy:
            'Payroll Administrator',

          completedAt:
            '2026-08-01T09:30:00',

          paidBy:
            'Finance Admin',

          paidAt:
            '2026-08-05T08:20:00',

          referenceNumber:
            'EMP-PMT-2026-0805-012',
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
    EmployeePayrollPaymentStatus[] = [
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
     FILTERING
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
            payroll.employeeName
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