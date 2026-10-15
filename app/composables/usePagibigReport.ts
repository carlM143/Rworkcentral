import type {
  PagibigContributionStatus,
  PagibigEmploymentType,
  PagibigReportRecord,
} from '~/types/pagibigReport'

export const usePagibigReport = () => {
  const records =
    useState<PagibigReportRecord[]>(
      'pagibig-report-records',
      () => [
        {
          id: 1,

          referenceNumber: 'HDMF-2026-1001',

          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          pagibigMidNumber: '1212-3456-7890',

          department: 'Operations',
          position: 'Driver',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyCompensation: 25000,
          contributionBasis: 5000,

          employeeShare: 100,
          employerShare: 100,

          totalContribution: 200,

          remittanceReference: 'RMT-HDMF-2026-1001',
          remittanceDate: '2026-11-08',

          status: 'Remitted',

          remarks: 'Contribution successfully remitted.',
        },

        {
          id: 2,

          referenceNumber: 'HDMF-2026-1002',

          employeeId: 2,
          employeeNumber: 'EMP-002',
          employeeName: 'Maria Santos',

          pagibigMidNumber: '1212-4456-7891',

          department: 'Human Resources',
          position: 'HR Administrator',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyCompensation: 52000,
          contributionBasis: 5000,

          employeeShare: 100,
          employerShare: 100,

          totalContribution: 200,

          status: 'Ready for Remittance',
        },

        {
          id: 3,

          referenceNumber: 'HDMF-2026-1003',

          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',

          pagibigMidNumber: '1212-5456-7892',

          department: 'Finance',
          position: 'Finance Staff',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyCompensation: 30000,
          contributionBasis: 5000,

          employeeShare: 100,
          employerShare: 100,

          totalContribution: 200,

          remittanceReference: 'RMT-HDMF-2026-1003',
          remittanceDate: '2026-11-08',

          status: 'Remitted',
        },

        {
          id: 4,

          referenceNumber: 'HDMF-2026-1004',

          employeeId: 4,
          employeeNumber: 'EMP-004',
          employeeName: 'Ana Garcia',

          pagibigMidNumber: '1212-6456-7893',

          department: 'Operations',
          position: 'Operations Staff',

          employmentType: 'Probationary',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyCompensation: 29000,
          contributionBasis: 5000,

          employeeShare: 100,
          employerShare: 100,

          totalContribution: 200,

          status: 'For Review',

          remarks: 'For HR validation before remittance.',
        },

        {
          id: 5,

          referenceNumber: 'HDMF-2026-1005',

          employeeId: 5,
          employeeNumber: 'EMP-005',
          employeeName: 'Carlo Mendoza',

          pagibigMidNumber: '1212-7456-7894',

          department: 'Information Technology',
          position: 'Software Developer',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyCompensation: 42000,
          contributionBasis: 5000,

          employeeShare: 100,
          employerShare: 100,

          totalContribution: 200,

          remittanceReference: 'RMT-HDMF-2026-1005',
          remittanceDate: '2026-11-08',

          status: 'Remitted',
        },

        {
          id: 6,

          referenceNumber: 'HDMF-2026-1006',

          employeeId: 6,
          employeeNumber: 'EMP-006',
          employeeName: 'Angela Flores',

          pagibigMidNumber: '1212-8456-7895',

          department: 'Billing',
          position: 'Billing Staff',

          employmentType: 'Probationary',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyCompensation: 27500,
          contributionBasis: 5000,

          employeeShare: 100,
          employerShare: 100,

          totalContribution: 200,

          status: 'Draft',

          remarks: 'Contribution record not yet finalized.',
        },

        {
          id: 7,

          referenceNumber: 'HDMF-2026-1007',

          employeeId: 7,
          employeeNumber: 'EMP-007',
          employeeName: 'Mark Lopez',

          pagibigMidNumber: '1212-9456-7896',

          department: 'Information Technology',
          position: 'IT Support',

          employmentType: 'Contractual',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyCompensation: 32000,
          contributionBasis: 5000,

          employeeShare: 100,
          employerShare: 100,

          totalContribution: 200,

          status: 'Ready for Remittance',
        },

        {
          id: 8,

          referenceNumber: 'HDMF-2026-1008',

          employeeId: 8,
          employeeNumber: 'EMP-008',
          employeeName: 'Jenny Ramos',

          pagibigMidNumber: '1312-1456-7897',

          department: 'Human Resources',
          position: 'HR Officer',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyCompensation: 33000,
          contributionBasis: 5000,

          employeeShare: 100,
          employerShare: 100,

          totalContribution: 200,

          remittanceReference: 'RMT-HDMF-2026-1008',
          remittanceDate: '2026-11-08',

          status: 'Remitted',
        },

        {
          id: 9,

          referenceNumber: 'HDMF-2026-1009',

          employeeId: 9,
          employeeNumber: 'EMP-009',
          employeeName: 'Robert Castillo',

          pagibigMidNumber: '1312-2456-7898',

          department: 'Finance',
          position: 'Finance Officer',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyCompensation: 39000,
          contributionBasis: 5000,

          employeeShare: 100,
          employerShare: 100,

          totalContribution: 200,

          status: 'Ready for Remittance',
        },

        {
          id: 10,

          referenceNumber: 'HDMF-2026-1010',

          employeeId: 10,
          employeeNumber: 'EMP-010',
          employeeName: 'Grace Navarro',

          pagibigMidNumber: '1312-3456-7899',

          department: 'Human Resources',
          position: 'Recruitment Coordinator',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyCompensation: 30500,
          contributionBasis: 5000,

          employeeShare: 100,
          employerShare: 100,

          totalContribution: 200,

          status: 'For Review',
        },

        {
          id: 11,

          referenceNumber: 'HDMF-2026-1011',

          employeeId: 11,
          employeeNumber: 'EMP-011',
          employeeName: 'Leo Martinez',

          pagibigMidNumber: '1312-4456-7800',

          department: 'Operations',
          position: 'Driver',

          employmentType: 'Project-Based',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyCompensation: 21000,
          contributionBasis: 5000,

          employeeShare: 100,
          employerShare: 100,

          totalContribution: 200,

          status: 'Draft',
        },

        {
          id: 12,

          referenceNumber: 'HDMF-2026-1012',

          employeeId: 12,
          employeeNumber: 'EMP-012',
          employeeName: 'Claire Villanueva',

          pagibigMidNumber: '1312-5456-7801',

          department: 'Operations',
          position: 'Operations Coordinator',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyCompensation: 34000,
          contributionBasis: 5000,

          employeeShare: 100,
          employerShare: 100,

          totalContribution: 200,

          remittanceReference: 'RMT-HDMF-2026-1012',
          remittanceDate: '2026-11-08',

          status: 'Remitted',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search = ref('')

  const month =
    ref('October')

  const year =
    ref('2026')

  const department =
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
          records.value.map(
            item =>
              String(
                item.contributionYear,
              ),
          ),
        ),
      ].sort(
        (a, b) =>
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

  const statusOptions:
    PagibigContributionStatus[] = [
      'Draft',
      'For Review',
      'Ready for Remittance',
      'Remitted',
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
            item.pagibigMidNumber
              .toLowerCase()
              .includes(keyword) ||
            item.position
              .toLowerCase()
              .includes(keyword)

          const matchesMonth =
            !month.value ||
            item.contributionMonth ===
              month.value

          const matchesYear =
            !year.value ||
            String(
              item.contributionYear,
            ) ===
              year.value

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
            matchesMonth &&
            matchesYear &&
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
        filteredRecords.value

      return {
        employees:
          data.length,

        employeeShare:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.employeeShare,
            0,
          ),

        employerShare:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.employerShare,
            0,
          ),

        totalContribution:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.totalContribution,
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
        monthlyCompensation:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.monthlyCompensation,
            0,
          ),

        contributionBasis:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.contributionBasis,
            0,
          ),

        employeeShare:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.employeeShare,
            0,
          ),

        employerShare:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.employerShare,
            0,
          ),

        totalContribution:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.totalContribution,
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
    month.value = 'October'
    year.value = '2026'
    department.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      month,
      year,
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
    search,
    month,
    year,
    department,
    status,

    currentPage,

    filteredRecords,
    paginatedRecords,

    stats,
    totals,

    totalPages,
    showingFrom,
    showingTo,

    monthOptions,
    yearOptions,
    departmentOptions,
    statusOptions,

    resetFilters,
  }
}