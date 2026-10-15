import type {
  SssContributionStatus,
  SssEmploymentType,
  SssReportRecord,
} from '~/types/sssReport'

export const useSssReport = () => {
  const records =
    useState<SssReportRecord[]>(
      'sss-report-records',
      () => [
        {
          id: 1,

          referenceNumber: 'SSS-2026-1001',

          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          sssNumber: '34-1234567-8',

          department: 'Operations',
          position: 'Driver',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          compensation: 25000,
          contributionBasis: 25000,

          employeeShare: 1250,
          employerShare: 2500,
          ecContribution: 30,

          totalContribution: 3780,

          remittanceReference: 'RMT-SSS-2026-1001',
          remittanceDate: '2026-11-08',

          status: 'Remitted',

          remarks: 'Contribution successfully remitted.',
        },

        {
          id: 2,

          referenceNumber: 'SSS-2026-1002',

          employeeId: 2,
          employeeNumber: 'EMP-002',
          employeeName: 'Maria Santos',

          sssNumber: '34-2234567-9',

          department: 'Human Resources',
          position: 'HR Administrator',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          compensation: 52000,
          contributionBasis: 35000,

          employeeShare: 1750,
          employerShare: 3500,
          ecContribution: 30,

          totalContribution: 5280,

          status: 'Ready for Remittance',
        },

        {
          id: 3,

          referenceNumber: 'SSS-2026-1003',

          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',

          sssNumber: '34-3234567-0',

          department: 'Finance',
          position: 'Finance Staff',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          compensation: 30000,
          contributionBasis: 30000,

          employeeShare: 1500,
          employerShare: 3000,
          ecContribution: 30,

          totalContribution: 4530,

          remittanceReference: 'RMT-SSS-2026-1003',
          remittanceDate: '2026-11-08',

          status: 'Remitted',
        },

        {
          id: 4,

          referenceNumber: 'SSS-2026-1004',

          employeeId: 4,
          employeeNumber: 'EMP-004',
          employeeName: 'Ana Garcia',

          sssNumber: '34-4234567-1',

          department: 'Operations',
          position: 'Operations Staff',

          employmentType: 'Probationary',

          contributionMonth: 'October',
          contributionYear: 2026,

          compensation: 29000,
          contributionBasis: 29000,

          employeeShare: 1450,
          employerShare: 2900,
          ecContribution: 30,

          totalContribution: 4380,

          status: 'For Review',

          remarks: 'For HR validation.',
        },

        {
          id: 5,

          referenceNumber: 'SSS-2026-1005',

          employeeId: 5,
          employeeNumber: 'EMP-005',
          employeeName: 'Carlo Mendoza',

          sssNumber: '34-5234567-2',

          department: 'Information Technology',
          position: 'Software Developer',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          compensation: 42000,
          contributionBasis: 35000,

          employeeShare: 1750,
          employerShare: 3500,
          ecContribution: 30,

          totalContribution: 5280,

          remittanceReference: 'RMT-SSS-2026-1005',
          remittanceDate: '2026-11-08',

          status: 'Remitted',
        },

        {
          id: 6,

          referenceNumber: 'SSS-2026-1006',

          employeeId: 6,
          employeeNumber: 'EMP-006',
          employeeName: 'Angela Flores',

          sssNumber: '34-6234567-3',

          department: 'Billing',
          position: 'Billing Staff',

          employmentType: 'Probationary',

          contributionMonth: 'October',
          contributionYear: 2026,

          compensation: 27500,
          contributionBasis: 27500,

          employeeShare: 1375,
          employerShare: 2750,
          ecContribution: 30,

          totalContribution: 4155,

          status: 'Draft',

          remarks: 'Contribution record not yet finalized.',
        },

        {
          id: 7,

          referenceNumber: 'SSS-2026-1007',

          employeeId: 7,
          employeeNumber: 'EMP-007',
          employeeName: 'Mark Lopez',

          sssNumber: '34-7234567-4',

          department: 'Information Technology',
          position: 'IT Support',

          employmentType: 'Contractual',

          contributionMonth: 'October',
          contributionYear: 2026,

          compensation: 32000,
          contributionBasis: 32000,

          employeeShare: 1600,
          employerShare: 3200,
          ecContribution: 30,

          totalContribution: 4830,

          status: 'Ready for Remittance',
        },

        {
          id: 8,

          referenceNumber: 'SSS-2026-1008',

          employeeId: 8,
          employeeNumber: 'EMP-008',
          employeeName: 'Jenny Ramos',

          sssNumber: '34-8234567-5',

          department: 'Human Resources',
          position: 'HR Officer',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          compensation: 33000,
          contributionBasis: 33000,

          employeeShare: 1650,
          employerShare: 3300,
          ecContribution: 30,

          totalContribution: 4980,

          remittanceReference: 'RMT-SSS-2026-1008',
          remittanceDate: '2026-11-08',

          status: 'Remitted',
        },

        {
          id: 9,

          referenceNumber: 'SSS-2026-1009',

          employeeId: 9,
          employeeNumber: 'EMP-009',
          employeeName: 'Robert Castillo',

          sssNumber: '34-9234567-6',

          department: 'Finance',
          position: 'Finance Officer',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          compensation: 39000,
          contributionBasis: 35000,

          employeeShare: 1750,
          employerShare: 3500,
          ecContribution: 30,

          totalContribution: 5280,

          status: 'Ready for Remittance',
        },

        {
          id: 10,

          referenceNumber: 'SSS-2026-1010',

          employeeId: 10,
          employeeNumber: 'EMP-010',
          employeeName: 'Grace Navarro',

          sssNumber: '35-1234567-7',

          department: 'Human Resources',
          position: 'Recruitment Coordinator',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          compensation: 30500,
          contributionBasis: 30500,

          employeeShare: 1525,
          employerShare: 3050,
          ecContribution: 30,

          totalContribution: 4605,

          status: 'For Review',
        },

        {
          id: 11,

          referenceNumber: 'SSS-2026-1011',

          employeeId: 11,
          employeeNumber: 'EMP-011',
          employeeName: 'Leo Martinez',

          sssNumber: '35-2234567-8',

          department: 'Operations',
          position: 'Driver',

          employmentType: 'Project-Based',

          contributionMonth: 'October',
          contributionYear: 2026,

          compensation: 21000,
          contributionBasis: 21000,

          employeeShare: 1050,
          employerShare: 2100,
          ecContribution: 30,

          totalContribution: 3180,

          status: 'Draft',
        },

        {
          id: 12,

          referenceNumber: 'SSS-2026-1012',

          employeeId: 12,
          employeeNumber: 'EMP-012',
          employeeName: 'Claire Villanueva',

          sssNumber: '35-3234567-9',

          department: 'Operations',
          position: 'Operations Coordinator',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          compensation: 34000,
          contributionBasis: 34000,

          employeeShare: 1700,
          employerShare: 3400,
          ecContribution: 30,

          totalContribution: 5130,

          remittanceReference: 'RMT-SSS-2026-1012',
          remittanceDate: '2026-11-08',

          status: 'Remitted',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

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

  const monthOptions =
    [
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

  const statusOptions:
    SssContributionStatus[] = [
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
            item.sssNumber
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
        compensation:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.compensation,
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

        ecContribution:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.ecContribution,
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