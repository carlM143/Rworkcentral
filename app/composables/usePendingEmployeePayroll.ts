import type {
  PendingEmployeePayroll,
  PendingEmployeePayrollStatus,
} from '~/types/pendingEmployeePayroll'

export const usePendingEmployeePayroll = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const payrolls =
    useState<PendingEmployeePayroll[]>(
      'pending-employee-payroll',
      () => [
        {
          id: 1,

          payrollNumber:
            'EMP-PAY-2026-0915-001',

          employeeId: 2,

          employeeNumber:
            'EMP-002',

          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Supervisor',

          periodId: 1,

          periodCode:
            'EMP-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          regularDays: 11,

          regularHours: 88,

          overtimeHours: 8,

          lateMinutes: 0,

          undertimeMinutes: 0,

          absentDays: 0,

          leaveDays: 0,

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

          status:
            'For Review',

          issueCount: 0,

          remarks:
            'Payroll calculation completed and ready for review.',

          preparedBy:
            'Payroll Administrator',

          preparedAt:
            '2026-09-15T09:10:00',
        },

        {
          id: 2,

          payrollNumber:
            'EMP-PAY-2026-0915-002',

          employeeId: 3,

          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Accountant',

          periodId: 1,

          periodCode:
            'EMP-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          regularDays: 11,

          regularHours: 88,

          overtimeHours: 5,

          lateMinutes: 15,

          undertimeMinutes: 0,

          absentDays: 0,

          leaveDays: 0,

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

          status:
            'Ready',

          issueCount: 0,

          preparedBy:
            'Payroll Administrator',

          preparedAt:
            '2026-09-15T09:20:00',
        },

        {
          id: 3,

          payrollNumber:
            'EMP-PAY-2026-0915-003',

          employeeId: 4,

          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Dispatcher',

          periodId: 1,

          periodCode:
            'EMP-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          regularDays: 10,

          regularHours: 80,

          overtimeHours: 6,

          lateMinutes: 30,

          undertimeMinutes: 45,

          absentDays: 1,

          leaveDays: 0,

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

          status:
            'With Issue',

          issueCount: 2,

          remarks:
            'Undertime and absence records require validation.',

          preparedBy:
            'Payroll Administrator',

          preparedAt:
            '2026-09-15T09:35:00',
        },

        {
          id: 4,

          payrollNumber:
            'EMP-PAY-2026-0915-004',

          employeeId: 6,

          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Officer',

          periodId: 1,

          periodCode:
            'EMP-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          regularDays: 11,

          regularHours: 88,

          overtimeHours: 4,

          lateMinutes: 0,

          undertimeMinutes: 0,

          absentDays: 0,

          leaveDays: 0,

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

          status:
            'Pending',

          issueCount: 0,

          preparedBy:
            'Payroll Administrator',

          preparedAt:
            '2026-09-15T09:45:00',
        },

        {
          id: 5,

          payrollNumber:
            'EMP-PAY-2026-0915-005',

          employeeId: 8,

          employeeNumber:
            'EMP-008',

          employeeName:
            'Jenny Ramos',

          department:
            'Administration',

          position:
            'Administrative Assistant',

          periodId: 1,

          periodCode:
            'EMP-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          regularDays: 10,

          regularHours: 80,

          overtimeHours: 3,

          lateMinutes: 10,

          undertimeMinutes: 0,

          absentDays: 0,

          leaveDays: 1,

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

          status:
            'Ready',

          issueCount: 0,

          preparedBy:
            'Payroll Administrator',

          preparedAt:
            '2026-09-15T10:00:00',
        },

        {
          id: 6,

          payrollNumber:
            'EMP-PAY-2026-0915-006',

          employeeId: 10,

          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Assistant',

          periodId: 1,

          periodCode:
            'EMP-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          regularDays: 11,

          regularHours: 88,

          overtimeHours: 2,

          lateMinutes: 0,

          undertimeMinutes: 0,

          absentDays: 0,

          leaveDays: 0,

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

          status:
            'For Review',

          issueCount: 0,

          preparedBy:
            'Payroll Administrator',

          preparedAt:
            '2026-09-15T10:10:00',
        },

        {
          id: 7,

          payrollNumber:
            'EMP-PAY-2026-0930-001',

          employeeId: 11,

          employeeNumber:
            'EMP-011',

          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Dispatcher',

          periodId: 2,

          periodCode:
            'EMP-PP-2026-0930',

          periodName:
            'September 16–30, 2026',

          periodStart:
            '2026-09-16',

          periodEnd:
            '2026-09-30',

          regularDays: 1,

          regularHours: 8,

          overtimeHours: 1,

          lateMinutes: 0,

          undertimeMinutes: 0,

          absentDays: 0,

          leaveDays: 0,

          basicPay: 1320,

          overtimePay: 165,

          holidayPay: 0,

          nightDifferential: 0,

          allowances: 100,

          otherEarnings: 0,

          grossPay: 1585,

          sss: 110,

          philHealth: 70,

          pagIbig: 50,

          loanDeduction: 0,

          lateDeduction: 0,

          undertimeDeduction: 0,

          absenceDeduction: 0,

          otherDeductions: 0,

          totalDeductions: 230,

          netPay: 1355,

          status:
            'Pending',

          issueCount: 0,

          preparedBy:
            'Payroll Administrator',

          preparedAt:
            '2026-09-16T09:10:00',
        },

        {
          id: 8,

          payrollNumber:
            'EMP-PAY-2026-0930-002',

          employeeId: 12,

          employeeNumber:
            'EMP-012',

          employeeName:
            'Claire Villanueva',

          department:
            'Administration',

          position:
            'Office Staff',

          periodId: 2,

          periodCode:
            'EMP-PP-2026-0930',

          periodName:
            'September 16–30, 2026',

          periodStart:
            '2026-09-16',

          periodEnd:
            '2026-09-30',

          regularDays: 1,

          regularHours: 8,

          overtimeHours: 0,

          lateMinutes: 20,

          undertimeMinutes: 0,

          absentDays: 0,

          leaveDays: 0,

          basicPay: 1250,

          overtimePay: 0,

          holidayPay: 0,

          nightDifferential: 0,

          allowances: 100,

          otherEarnings: 0,

          grossPay: 1350,

          sss: 100,

          philHealth: 65,

          pagIbig: 50,

          loanDeduction: 0,

          lateDeduction: 85,

          undertimeDeduction: 0,

          absenceDeduction: 0,

          otherDeductions: 0,

          totalDeductions: 300,

          netPay: 1050,

          status:
            'With Issue',

          issueCount: 1,

          remarks:
            'Late record requires verification.',

          preparedBy:
            'Payroll Administrator',

          preparedAt:
            '2026-09-16T09:20:00',
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
    PendingEmployeePayrollStatus[] = [
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
        pendingEmployees:
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