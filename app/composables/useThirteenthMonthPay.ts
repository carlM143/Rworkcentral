import type {
  ThirteenthMonthEmploymentType,
  ThirteenthMonthRecord,
  ThirteenthMonthStatus,
} from '~/types/thirteenthMonthPay'

export const useThirteenthMonthPay = () => {
  const records =
    useState<ThirteenthMonthRecord[]>(
      'thirteenth-month-pay-records',
      () => [
        {
          id: 1,

          referenceNumber: '13M-2026-001',

          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          department: 'Operations',
          position: 'Driver',

          employmentType: 'Regular',

          coverageYear: 2026,

          employmentStartDate: '2024-03-15',

          monthsCovered: 12,

          basicSalaryEarned: 300000,
          adjustments: 0,

          eligibleBasicPay: 300000,

          computedAmount: 25000,

          previousRelease: 0,
          payableAmount: 25000,

          approvedBy: 'Maria Santos',

          releaseDate: '2026-12-15',

          status: 'Approved',

          remarks:
            'Full-year computation ready for scheduled release.',
        },

        {
          id: 2,

          referenceNumber: '13M-2026-002',

          employeeId: 2,
          employeeNumber: 'EMP-002',
          employeeName: 'Maria Santos',

          department: 'Human Resources',
          position: 'HR Administrator',

          employmentType: 'Regular',

          coverageYear: 2026,

          employmentStartDate: '2023-01-10',

          monthsCovered: 12,

          basicSalaryEarned: 624000,
          adjustments: 0,

          eligibleBasicPay: 624000,

          computedAmount: 52000,

          previousRelease: 26000,
          payableAmount: 26000,

          approvedBy: 'General Manager',

          releaseDate: '2026-12-15',

          status: 'For Release',

          remarks:
            'Partial amount previously released.',
        },

        {
          id: 3,

          referenceNumber: '13M-2026-003',

          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',

          department: 'Finance',
          position: 'Finance Staff',

          employmentType: 'Regular',

          coverageYear: 2026,

          employmentStartDate: '2025-07-01',

          monthsCovered: 12,

          basicSalaryEarned: 360000,
          adjustments: -2500,

          eligibleBasicPay: 357500,

          computedAmount: 29791.67,

          previousRelease: 0,
          payableAmount: 29791.67,

          approvedBy: 'Finance Manager',

          status: 'Approved',

          remarks:
            'Adjustment applied before final computation.',
        },

        {
          id: 4,

          referenceNumber: '13M-2026-004',

          employeeId: 4,
          employeeNumber: 'EMP-004',
          employeeName: 'Ana Garcia',

          department: 'Operations',
          position: 'Operations Staff',

          employmentType: 'Probationary',

          coverageYear: 2026,

          employmentStartDate: '2026-04-15',

          monthsCovered: 8,

          basicSalaryEarned: 116000,
          adjustments: 0,

          eligibleBasicPay: 116000,

          computedAmount: 9666.67,

          previousRelease: 0,
          payableAmount: 9666.67,

          status: 'For Review',

          remarks:
            'For HR validation before approval.',
        },

        {
          id: 5,

          referenceNumber: '13M-2026-005',

          employeeId: 5,
          employeeNumber: 'EMP-005',
          employeeName: 'Carlo Mendoza',

          department: 'Information Technology',
          position: 'Software Developer',

          employmentType: 'Regular',

          coverageYear: 2026,

          employmentStartDate: '2024-08-01',

          monthsCovered: 12,

          basicSalaryEarned: 504000,
          adjustments: 6000,

          eligibleBasicPay: 510000,

          computedAmount: 42500,

          previousRelease: 0,
          payableAmount: 42500,

          approvedBy: 'Maria Santos',

          status: 'Approved',

          remarks:
            'Salary adjustment included in eligible amount.',
        },

        {
          id: 6,

          referenceNumber: '13M-2026-006',

          employeeId: 6,
          employeeNumber: 'EMP-006',
          employeeName: 'Angela Flores',

          department: 'Billing',
          position: 'Billing Staff',

          employmentType: 'Probationary',

          coverageYear: 2026,

          employmentStartDate: '2026-05-10',

          monthsCovered: 7,

          basicSalaryEarned: 96250,
          adjustments: 0,

          eligibleBasicPay: 96250,

          computedAmount: 8020.83,

          previousRelease: 0,
          payableAmount: 8020.83,

          status: 'Draft',

          remarks:
            'Computation still being prepared.',
        },

        {
          id: 7,

          referenceNumber: '13M-2026-007',

          employeeId: 7,
          employeeNumber: 'EMP-007',
          employeeName: 'Mark Lopez',

          department: 'Information Technology',
          position: 'IT Support',

          employmentType: 'Contractual',

          coverageYear: 2026,

          employmentStartDate: '2026-02-01',

          monthsCovered: 11,

          basicSalaryEarned: 352000,
          adjustments: 0,

          eligibleBasicPay: 352000,

          computedAmount: 29333.33,

          previousRelease: 14666.67,
          payableAmount: 14666.66,

          approvedBy: 'Maria Santos',

          releaseDate: '2026-12-10',

          status: 'For Release',
        },

        {
          id: 8,

          referenceNumber: '13M-2026-008',

          employeeId: 8,
          employeeNumber: 'EMP-008',
          employeeName: 'Jenny Ramos',

          department: 'Human Resources',
          position: 'HR Officer',

          employmentType: 'Regular',

          coverageYear: 2026,

          employmentStartDate: '2025-02-15',

          monthsCovered: 12,

          basicSalaryEarned: 396000,
          adjustments: 0,

          eligibleBasicPay: 396000,

          computedAmount: 33000,

          previousRelease: 0,
          payableAmount: 33000,

          approvedBy: 'General Manager',

          releaseDate: '2026-12-15',

          status: 'Released',

          remarks:
            '13th month pay fully released.',
        },

        {
          id: 9,

          referenceNumber: '13M-2026-009',

          employeeId: 9,
          employeeNumber: 'EMP-009',
          employeeName: 'Robert Castillo',

          department: 'Finance',
          position: 'Finance Officer',

          employmentType: 'Regular',

          coverageYear: 2026,

          employmentStartDate: '2024-05-20',

          monthsCovered: 12,

          basicSalaryEarned: 468000,
          adjustments: 3500,

          eligibleBasicPay: 471500,

          computedAmount: 39291.67,

          previousRelease: 0,
          payableAmount: 39291.67,

          approvedBy: 'Finance Manager',

          status: 'Approved',
        },

        {
          id: 10,

          referenceNumber: '13M-2026-010',

          employeeId: 10,
          employeeNumber: 'EMP-010',
          employeeName: 'Grace Navarro',

          department: 'Human Resources',
          position: 'Recruitment Coordinator',

          employmentType: 'Regular',

          coverageYear: 2026,

          employmentStartDate: '2025-09-01',

          monthsCovered: 12,

          basicSalaryEarned: 366000,
          adjustments: 0,

          eligibleBasicPay: 366000,

          computedAmount: 30500,

          previousRelease: 15250,
          payableAmount: 15250,

          approvedBy: 'Maria Santos',

          status: 'For Release',
        },

        {
          id: 11,

          referenceNumber: '13M-2026-011',

          employeeId: 11,
          employeeNumber: 'EMP-011',
          employeeName: 'Leo Martinez',

          department: 'Operations',
          position: 'Driver',

          employmentType: 'Project-Based',

          coverageYear: 2026,

          employmentStartDate: '2026-03-01',
          employmentEndDate: '2026-10-31',

          monthsCovered: 8,

          basicSalaryEarned: 168000,
          adjustments: -2000,

          eligibleBasicPay: 166000,

          computedAmount: 13833.33,

          previousRelease: 0,
          payableAmount: 13833.33,

          status: 'For Review',

          remarks:
            'Final employment period validation pending.',
        },

        {
          id: 12,

          referenceNumber: '13M-2026-012',

          employeeId: 12,
          employeeNumber: 'EMP-012',
          employeeName: 'Claire Villanueva',

          department: 'Operations',
          position: 'Operations Coordinator',

          employmentType: 'Regular',

          coverageYear: 2026,

          employmentStartDate: '2024-11-20',

          monthsCovered: 12,

          basicSalaryEarned: 408000,
          adjustments: 0,

          eligibleBasicPay: 408000,

          computedAmount: 34000,

          previousRelease: 0,
          payableAmount: 34000,

          approvedBy: 'Maria Santos',

          status: 'Approved',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search = ref('')

  const year =
    ref('2026')

  const department =
    ref('')

  const employmentType =
    ref('')

  const status =
    ref('')

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

  const yearOptions =
    computed(() => {
      return [
        ...new Set(
          records.value.map(
            item =>
              String(
                item.coverageYear,
              ),
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

  const employmentTypeOptions:
    ThirteenthMonthEmploymentType[] = [
      'Regular',
      'Probationary',
      'Contractual',
      'Project-Based',
    ]

  const statusOptions:
    ThirteenthMonthStatus[] = [
      'Draft',
      'For Review',
      'Approved',
      'For Release',
      'Released',
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
            item.referenceNumber
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

          const matchesYear =
            !year.value ||
            String(
              item.coverageYear,
            ) ===
              year.value

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

          return (
            matchesSearch &&
            matchesYear &&
            matchesDepartment &&
            matchesEmploymentType &&
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
        filteredRecords.value

      return {
        employees:
          data.length,

        eligibleBasicPay:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.eligibleBasicPay,
            0,
          ),

        computedAmount:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.computedAmount,
            0,
          ),

        releasedAmount:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.previousRelease +
              (
                item.status ===
                  'Released'
                  ? item.payableAmount
                  : 0
              ),
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
        basicSalaryEarned:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.basicSalaryEarned,
            0,
          ),

        adjustments:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.adjustments,
            0,
          ),

        eligibleBasicPay:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.eligibleBasicPay,
            0,
          ),

        computedAmount:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.computedAmount,
            0,
          ),

        previousRelease:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.previousRelease,
            0,
          ),

        payableAmount:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.payableAmount,
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
    year.value = '2026'
    department.value = ''
    employmentType.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      year,
      department,
      employmentType,
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
    search,
    year,
    department,
    employmentType,
    status,

    currentPage,

    filteredRecords,
    paginatedRecords,

    stats,
    totals,

    totalPages,
    showingFrom,
    showingTo,

    yearOptions,
    departmentOptions,
    employmentTypeOptions,
    statusOptions,

    resetFilters,
  }
}