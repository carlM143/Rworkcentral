import type {
  PayrollEmploymentType,
  PayrollReportRecord,
  PayrollReportStatus,
} from '~/types/payrollReport'

export const usePayrollReport = () => {
  const records =
    useState<PayrollReportRecord[]>(
      'payroll-report-records',
      () => [
        {
          id: 1,

          payrollNumber:
            'PAY-2026-1001',

          employeeId: 1,
          employeeNumber:
            'EMP-001',
          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          employmentType:
            'Regular',

          payPeriod:
            'October 1-15, 2026',

          periodStart:
            '2026-10-01',

          periodEnd:
            '2026-10-15',

          basicPay:
            12500,

          overtimePay:
            1850,

          holidayPay:
            750,

          allowances:
            1200,

          otherEarnings:
            300,

          grossPay:
            16600,

          sss:
            675,

          philHealth:
            312.5,

          pagibig:
            100,

          withholdingTax:
            825,

          loanDeductions:
            500,

          otherDeductions:
            150,

          totalDeductions:
            2562.5,

          netPay:
            14037.5,

          status:
            'Completed',
        },

        {
          id: 2,

          payrollNumber:
            'PAY-2026-1002',

          employeeId: 2,
          employeeNumber:
            'EMP-002',
          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Administrator',

          employmentType:
            'Regular',

          payPeriod:
            'October 1-15, 2026',

          periodStart:
            '2026-10-01',

          periodEnd:
            '2026-10-15',

          basicPay:
            26000,

          overtimePay:
            500,

          holidayPay:
            0,

          allowances:
            2500,

          otherEarnings:
            750,

          grossPay:
            29750,

          sss:
            1350,

          philHealth:
            650,

          pagibig:
            200,

          withholdingTax:
            2450,

          loanDeductions:
            0,

          otherDeductions:
            250,

          totalDeductions:
            4900,

          netPay:
            24850,

          status:
            'Completed',
        },

        {
          id: 3,

          payrollNumber:
            'PAY-2026-1003',

          employeeId: 3,
          employeeNumber:
            'EMP-003',
          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Finance Staff',

          employmentType:
            'Regular',

          payPeriod:
            'October 1-15, 2026',

          periodStart:
            '2026-10-01',

          periodEnd:
            '2026-10-15',

          basicPay:
            15000,

          overtimePay:
            900,

          holidayPay:
            450,

          allowances:
            1500,

          otherEarnings:
            250,

          grossPay:
            18100,

          sss:
            800,

          philHealth:
            375,

          pagibig:
            100,

          withholdingTax:
            1050,

          loanDeductions:
            1200,

          otherDeductions:
            0,

          totalDeductions:
            3525,

          netPay:
            14575,

          status:
            'Completed',
        },

        {
          id: 4,

          payrollNumber:
            'PAY-2026-1004',

          employeeId: 4,
          employeeNumber:
            'EMP-004',
          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Operations Staff',

          employmentType:
            'Probationary',

          payPeriod:
            'October 1-15, 2026',

          periodStart:
            '2026-10-01',

          periodEnd:
            '2026-10-15',

          basicPay:
            14500,

          overtimePay:
            350,

          holidayPay:
            0,

          allowances:
            1000,

          otherEarnings:
            0,

          grossPay:
            15850,

          sss:
            700,

          philHealth:
            350,

          pagibig:
            100,

          withholdingTax:
            650,

          loanDeductions:
            0,

          otherDeductions:
            250,

          totalDeductions:
            2050,

          netPay:
            13800,

          status:
            'Processed',
        },

        {
          id: 5,

          payrollNumber:
            'PAY-2026-1005',

          employeeId: 5,
          employeeNumber:
            'EMP-005',
          employeeName:
            'Carlo Mendoza',

          department:
            'Information Technology',

          position:
            'Software Developer',

          employmentType:
            'Regular',

          payPeriod:
            'October 1-15, 2026',

          periodStart:
            '2026-10-01',

          periodEnd:
            '2026-10-15',

          basicPay:
            21000,

          overtimePay:
            3150,

          holidayPay:
            0,

          allowances:
            2000,

          otherEarnings:
            500,

          grossPay:
            26650,

          sss:
            1150,

          philHealth:
            525,

          pagibig:
            200,

          withholdingTax:
            1900,

          loanDeductions:
            500,

          otherDeductions:
            100,

          totalDeductions:
            4375,

          netPay:
            22275,

          status:
            'Completed',
        },

        {
          id: 6,

          payrollNumber:
            'PAY-2026-1006',

          employeeId: 6,
          employeeNumber:
            'EMP-006',
          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Staff',

          employmentType:
            'Probationary',

          payPeriod:
            'October 1-15, 2026',

          periodStart:
            '2026-10-01',

          periodEnd:
            '2026-10-15',

          basicPay:
            13750,

          overtimePay:
            0,

          holidayPay:
            350,

          allowances:
            900,

          otherEarnings:
            0,

          grossPay:
            15000,

          sss:
            650,

          philHealth:
            325,

          pagibig:
            100,

          withholdingTax:
            525,

          loanDeductions:
            850,

          otherDeductions:
            125,

          totalDeductions:
            2575,

          netPay:
            12425,

          status:
            'Pending',
        },

        {
          id: 7,

          payrollNumber:
            'PAY-2026-1007',

          employeeId: 7,
          employeeNumber:
            'EMP-007',
          employeeName:
            'Mark Lopez',

          department:
            'Information Technology',

          position:
            'IT Support',

          employmentType:
            'Contractual',

          payPeriod:
            'October 1-15, 2026',

          periodStart:
            '2026-10-01',

          periodEnd:
            '2026-10-15',

          basicPay:
            16000,

          overtimePay:
            1250,

          holidayPay:
            0,

          allowances:
            1250,

          otherEarnings:
            200,

          grossPay:
            18700,

          sss:
            850,

          philHealth:
            400,

          pagibig:
            100,

          withholdingTax:
            900,

          loanDeductions:
            0,

          otherDeductions:
            100,

          totalDeductions:
            2350,

          netPay:
            16350,

          status:
            'Processed',
        },

        {
          id: 8,

          payrollNumber:
            'PAY-2026-1008',

          employeeId: 8,
          employeeNumber:
            'EMP-008',
          employeeName:
            'Jenny Ramos',

          department:
            'Human Resources',

          position:
            'HR Officer',

          employmentType:
            'Regular',

          payPeriod:
            'October 1-15, 2026',

          periodStart:
            '2026-10-01',

          periodEnd:
            '2026-10-15',

          basicPay:
            16500,

          overtimePay:
            650,

          holidayPay:
            0,

          allowances:
            1500,

          otherEarnings:
            300,

          grossPay:
            18950,

          sss:
            850,

          philHealth:
            412.5,

          pagibig:
            100,

          withholdingTax:
            1025,

          loanDeductions:
            0,

          otherDeductions:
            50,

          totalDeductions:
            2437.5,

          netPay:
            16512.5,

          status:
            'Completed',
        },

        {
          id: 9,

          payrollNumber:
            'PAY-2026-1009',

          employeeId: 9,
          employeeNumber:
            'EMP-009',
          employeeName:
            'Robert Castillo',

          department:
            'Finance',

          position:
            'Finance Officer',

          employmentType:
            'Regular',

          payPeriod:
            'October 1-15, 2026',

          periodStart:
            '2026-10-01',

          periodEnd:
            '2026-10-15',

          basicPay:
            19500,

          overtimePay:
            1100,

          holidayPay:
            600,

          allowances:
            1800,

          otherEarnings:
            250,

          grossPay:
            23250,

          sss:
            1000,

          philHealth:
            487.5,

          pagibig:
            200,

          withholdingTax:
            1450,

          loanDeductions:
            1000,

          otherDeductions:
            0,

          totalDeductions:
            4137.5,

          netPay:
            19112.5,

          status:
            'Completed',
        },

        {
          id: 10,

          payrollNumber:
            'PAY-2026-1010',

          employeeId: 10,
          employeeNumber:
            'EMP-010',
          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'Recruitment Coordinator',

          employmentType:
            'Regular',

          payPeriod:
            'October 1-15, 2026',

          periodStart:
            '2026-10-01',

          periodEnd:
            '2026-10-15',

          basicPay:
            15250,

          overtimePay:
            450,

          holidayPay:
            0,

          allowances:
            1300,

          otherEarnings:
            0,

          grossPay:
            17000,

          sss:
            750,

          philHealth:
            375,

          pagibig:
            100,

          withholdingTax:
            775,

          loanDeductions:
            400,

          otherDeductions:
            100,

          totalDeductions:
            2500,

          netPay:
            14500,

          status:
            'Processed',
        },

        {
          id: 11,

          payrollNumber:
            'PAY-2026-1011',

          employeeId: 11,
          employeeNumber:
            'EMP-011',
          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Driver',

          employmentType:
            'Project-Based',

          payPeriod:
            'October 1-15, 2026',

          periodStart:
            '2026-10-01',

          periodEnd:
            '2026-10-15',

          basicPay:
            10500,

          overtimePay:
            0,

          holidayPay:
            0,

          allowances:
            750,

          otherEarnings:
            0,

          grossPay:
            11250,

          sss:
            500,

          philHealth:
            275,

          pagibig:
            100,

          withholdingTax:
            300,

          loanDeductions:
            800,

          otherDeductions:
            250,

          totalDeductions:
            2225,

          netPay:
            9025,

          status:
            'Pending',
        },

        {
          id: 12,

          payrollNumber:
            'PAY-2026-1012',

          employeeId: 12,
          employeeNumber:
            'EMP-012',
          employeeName:
            'Claire Villanueva',

          department:
            'Operations',

          position:
            'Operations Coordinator',

          employmentType:
            'Regular',

          payPeriod:
            'October 1-15, 2026',

          periodStart:
            '2026-10-01',

          periodEnd:
            '2026-10-15',

          basicPay:
            17000,

          overtimePay:
            975,

          holidayPay:
            425,

          allowances:
            1400,

          otherEarnings:
            200,

          grossPay:
            20000,

          sss:
            900,

          philHealth:
            425,

          pagibig:
            100,

          withholdingTax:
            1150,

          loanDeductions:
            0,

          otherDeductions:
            75,

          totalDeductions:
            2650,

          netPay:
            17350,

          status:
            'Completed',
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

  const employmentType =
    ref('')

  const status =
    ref('')

  const period =
    ref('October 1-15, 2026')

  /* =========================================================
     PAGINATION
  ========================================================= */

  const currentPage =
    ref(1)

  const perPage =
    ref(7)

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

  const periodOptions =
    computed(() => {
      return [
        ...new Set(
          records.value.map(
            item =>
              item.payPeriod,
          ),
        ),
      ]
    })

  const employmentTypeOptions:
    PayrollEmploymentType[] = [
      'Regular',
      'Probationary',
      'Contractual',
      'Project-Based',
    ]

  const statusOptions:
    PayrollReportStatus[] = [
      'Draft',
      'Pending',
      'Processed',
      'Completed',
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
            item.payrollNumber
              .toLowerCase()
              .includes(keyword) ||
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

          const matchesEmploymentType =
            !employmentType.value ||
            item.employmentType ===
              employmentType.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          const matchesPeriod =
            !period.value ||
            item.payPeriod ===
              period.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesEmploymentType &&
            matchesStatus &&
            matchesPeriod
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
        employees:
          data.length,

        grossPay:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.grossPay,
            0,
          ),

        deductions:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.totalDeductions,
            0,
          ),

        netPay:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.netPay,
            0,
          ),
      }
    })

  /* =========================================================
     TOTALS
  ========================================================= */

  const totals =
    computed(() => {
      const data =
        filteredRecords.value

      return {
        basicPay:
          data.reduce(
            (sum, item) =>
              sum +
              item.basicPay,
            0,
          ),

        overtimePay:
          data.reduce(
            (sum, item) =>
              sum +
              item.overtimePay,
            0,
          ),

        holidayPay:
          data.reduce(
            (sum, item) =>
              sum +
              item.holidayPay,
            0,
          ),

        allowances:
          data.reduce(
            (sum, item) =>
              sum +
              item.allowances,
            0,
          ),

        otherEarnings:
          data.reduce(
            (sum, item) =>
              sum +
              item.otherEarnings,
            0,
          ),

        grossPay:
          data.reduce(
            (sum, item) =>
              sum +
              item.grossPay,
            0,
          ),

        sss:
          data.reduce(
            (sum, item) =>
              sum +
              item.sss,
            0,
          ),

        philHealth:
          data.reduce(
            (sum, item) =>
              sum +
              item.philHealth,
            0,
          ),

        pagibig:
          data.reduce(
            (sum, item) =>
              sum +
              item.pagibig,
            0,
          ),

        tax:
          data.reduce(
            (sum, item) =>
              sum +
              item.withholdingTax,
            0,
          ),

        loanDeductions:
          data.reduce(
            (sum, item) =>
              sum +
              item.loanDeductions,
            0,
          ),

        otherDeductions:
          data.reduce(
            (sum, item) =>
              sum +
              item.otherDeductions,
            0,
          ),

        totalDeductions:
          data.reduce(
            (sum, item) =>
              sum +
              item.totalDeductions,
            0,
          ),

        netPay:
          data.reduce(
            (sum, item) =>
              sum +
              item.netPay,
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
    employmentType.value = ''
    status.value = ''

    period.value =
      'October 1-15, 2026'

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      employmentType,
      status,
      period,
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
    employmentType,
    status,
    period,

    currentPage,

    filteredRecords,
    paginatedRecords,

    stats,
    totals,

    totalPages,
    showingFrom,
    showingTo,

    departmentOptions,
    employmentTypeOptions,
    statusOptions,
    periodOptions,

    resetFilters,
  }
}