import type {
  EmployeePayPeriod,
  EmployeePayPeriodStatus,
} from '~/types/employeePayPeriod'

export const useEmployeePayPeriods = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const periods =
    useState<EmployeePayPeriod[]>(
      'employee-pay-periods',
      () => [
        {
          id: 1,

          periodCode:
            'EMP-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          payrollType:
            'Employee Payroll',

          startDate:
            '2026-09-01',

          endDate:
            '2026-09-15',

          cutoffDate:
            '2026-09-15',

          payDate:
            '2026-09-20',

          totalEmployees:
            86,

          pendingEmployees:
            18,

          processedEmployees:
            68,

          completedEmployees:
            68,

          grossAmount:
            1245000,

          totalDeductions:
            184500,

          netAmount:
            1060500,

          status:
            'Processing',

          remarks:
            'First employee payroll cutoff for September 2026.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-08-28T09:15:00',
        },

        {
          id: 2,

          periodCode:
            'EMP-PP-2026-0930',

          periodName:
            'September 16–30, 2026',

          payrollType:
            'Employee Payroll',

          startDate:
            '2026-09-16',

          endDate:
            '2026-09-30',

          cutoffDate:
            '2026-09-30',

          payDate:
            '2026-10-05',

          totalEmployees:
            88,

          pendingEmployees:
            88,

          processedEmployees:
            0,

          completedEmployees:
            0,

          grossAmount:
            0,

          totalDeductions:
            0,

          netAmount:
            0,

          status:
            'Open',

          remarks:
            'Second employee payroll cutoff for September 2026.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-12T10:00:00',
        },

        {
          id: 3,

          periodCode:
            'EMP-PP-2026-0831',

          periodName:
            'August 16–31, 2026',

          payrollType:
            'Employee Payroll',

          startDate:
            '2026-08-16',

          endDate:
            '2026-08-31',

          cutoffDate:
            '2026-08-31',

          payDate:
            '2026-09-05',

          totalEmployees:
            84,

          pendingEmployees:
            0,

          processedEmployees:
            84,

          completedEmployees:
            84,

          grossAmount:
            1198000,

          totalDeductions:
            176200,

          netAmount:
            1021800,

          status:
            'Closed',

          remarks:
            'Completed employee payroll period.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-08-12T08:30:00',
        },

        {
          id: 4,

          periodCode:
            'EMP-PP-2026-0815',

          periodName:
            'August 1–15, 2026',

          payrollType:
            'Employee Payroll',

          startDate:
            '2026-08-01',

          endDate:
            '2026-08-15',

          cutoffDate:
            '2026-08-15',

          payDate:
            '2026-08-20',

          totalEmployees:
            83,

          pendingEmployees:
            0,

          processedEmployees:
            83,

          completedEmployees:
            83,

          grossAmount:
            1174500,

          totalDeductions:
            173800,

          netAmount:
            1000700,

          status:
            'Closed',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-07-27T13:15:00',
        },

        {
          id: 5,

          periodCode:
            'EMP-PP-2026-0731',

          periodName:
            'July 16–31, 2026',

          payrollType:
            'Employee Payroll',

          startDate:
            '2026-07-16',

          endDate:
            '2026-07-31',

          cutoffDate:
            '2026-07-31',

          payDate:
            '2026-08-05',

          totalEmployees:
            82,

          pendingEmployees:
            0,

          processedEmployees:
            82,

          completedEmployees:
            82,

          grossAmount:
            1149800,

          totalDeductions:
            169500,

          netAmount:
            980300,

          status:
            'Closed',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-07-12T09:30:00',
        },

        {
          id: 6,

          periodCode:
            'EMP-PP-2026-1015',

          periodName:
            'October 1–15, 2026',

          payrollType:
            'Employee Payroll',

          startDate:
            '2026-10-01',

          endDate:
            '2026-10-15',

          cutoffDate:
            '2026-10-15',

          payDate:
            '2026-10-20',

          totalEmployees:
            88,

          pendingEmployees:
            88,

          processedEmployees:
            0,

          completedEmployees:
            0,

          grossAmount:
            0,

          totalDeductions:
            0,

          netAmount:
            0,

          status:
            'Draft',

          remarks:
            'Upcoming first October employee payroll period.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-16T10:00:00',
        },

        {
          id: 7,

          periodCode:
            'EMP-PP-2026-0715',

          periodName:
            'July 1–15, 2026',

          payrollType:
            'Employee Payroll',

          startDate:
            '2026-07-01',

          endDate:
            '2026-07-15',

          cutoffDate:
            '2026-07-15',

          payDate:
            '2026-07-20',

          totalEmployees:
            80,

          pendingEmployees:
            0,

          processedEmployees:
            80,

          completedEmployees:
            80,

          grossAmount:
            1112500,

          totalDeductions:
            164300,

          netAmount:
            948200,

          status:
            'Closed',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-06-27T09:00:00',
        },

        {
          id: 8,

          periodCode:
            'EMP-PP-2026-0630-X',

          periodName:
            'June 16–30, 2026',

          payrollType:
            'Employee Payroll',

          startDate:
            '2026-06-16',

          endDate:
            '2026-06-30',

          cutoffDate:
            '2026-06-30',

          payDate:
            '2026-07-05',

          totalEmployees:
            80,

          pendingEmployees:
            0,

          processedEmployees:
            0,

          completedEmployees:
            0,

          grossAmount:
            0,

          totalDeductions:
            0,

          netAmount:
            0,

          status:
            'Cancelled',

          remarks:
            'Cancelled period due to payroll schedule adjustment.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-06-12T11:00:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const status =
    ref('')

  const year =
    ref('')

  const month =
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
    EmployeePayPeriodStatus[] = [
      'Draft',
      'Open',
      'Processing',
      'Closed',
      'Cancelled',
    ]

  const monthOptions = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const yearOptions =
    computed(() => {
      return [
        ...new Set(
          periods.value.map(
            period =>
              new Date(
                `${period.startDate}T00:00:00`,
              )
                .getFullYear()
                .toString(),
          ),
        ),
      ].sort(
        (
          a,
          b,
        ) =>
          Number(b) -
          Number(a),
      )
    })

  /* =========================================================
     FILTERED DATA
  ========================================================= */

  const filteredPeriods =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return periods.value.filter(
        period => {
          const start =
            new Date(
              `${period.startDate}T00:00:00`,
            )

          const periodYear =
            start
              .getFullYear()
              .toString()

          const periodMonth =
            monthOptions[
              start.getMonth()
            ]

          const matchesSearch =
            !keyword ||
            period.periodCode
              .toLowerCase()
              .includes(keyword) ||
            period.periodName
              .toLowerCase()
              .includes(keyword)

          const matchesStatus =
            !status.value ||
            period.status ===
              status.value

          const matchesYear =
            !year.value ||
            periodYear ===
              year.value

          const matchesMonth =
            !month.value ||
            periodMonth ===
              month.value

          const matchesFrom =
            !dateFrom.value ||
            period.startDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            period.endDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesStatus &&
            matchesYear &&
            matchesMonth &&
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
      return {
        total:
          periods.value.length,

        open:
          periods.value.filter(
            period =>
              period.status ===
              'Open',
          ).length,

        processing:
          periods.value.filter(
            period =>
              period.status ===
              'Processing',
          ).length,

        closed:
          periods.value.filter(
            period =>
              period.status ===
              'Closed',
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
          filteredPeriods
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedPeriods =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredPeriods
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
        filteredPeriods.value
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
        filteredPeriods.value
          .length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value =
      ''

    status.value =
      ''

    year.value =
      ''

    month.value =
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
      status,
      year,
      month,
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
    periods,

    search,
    status,
    year,
    month,
    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredPeriods,
    paginatedPeriods,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    statusOptions,
    monthOptions,
    yearOptions,

    resetFilters,
  }
}