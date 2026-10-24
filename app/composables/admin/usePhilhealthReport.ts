import type {
  PhilhealthContributionStatus,
  PhilhealthReportRecord,
} from '~/types/philhealthReport'

export const usePhilhealthReport = () => {
  const records =
    useState<PhilhealthReportRecord[]>(
      'philhealth-report-records',
      () => [
        {
          id: 1,

          referenceNumber: 'PHIC-2026-1001',

          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          philhealthNumber: '12-345678901-2',

          department: 'Operations',
          position: 'Driver',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyBasicSalary: 25000,
          contributionBasis: 25000,

          employeeShare: 625,
          employerShare: 625,

          totalPremium: 1250,

          remittanceReference: 'RMT-PHIC-2026-1001',
          remittanceDate: '2026-11-08',

          status: 'Remitted',

          remarks: 'Contribution successfully remitted.',
        },

        {
          id: 2,

          referenceNumber: 'PHIC-2026-1002',

          employeeId: 2,
          employeeNumber: 'EMP-002',
          employeeName: 'Maria Santos',

          philhealthNumber: '12-445678901-3',

          department: 'Human Resources',
          position: 'HR Administrator',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyBasicSalary: 52000,
          contributionBasis: 52000,

          employeeShare: 1300,
          employerShare: 1300,

          totalPremium: 2600,

          status: 'Ready for Remittance',
        },

        {
          id: 3,

          referenceNumber: 'PHIC-2026-1003',

          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',

          philhealthNumber: '12-545678901-4',

          department: 'Finance',
          position: 'Finance Staff',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyBasicSalary: 30000,
          contributionBasis: 30000,

          employeeShare: 750,
          employerShare: 750,

          totalPremium: 1500,

          remittanceReference: 'RMT-PHIC-2026-1003',
          remittanceDate: '2026-11-08',

          status: 'Remitted',
        },

        {
          id: 4,

          referenceNumber: 'PHIC-2026-1004',

          employeeId: 4,
          employeeNumber: 'EMP-004',
          employeeName: 'Ana Garcia',

          philhealthNumber: '12-645678901-5',

          department: 'Operations',
          position: 'Operations Staff',

          employmentType: 'Probationary',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyBasicSalary: 29000,
          contributionBasis: 29000,

          employeeShare: 725,
          employerShare: 725,

          totalPremium: 1450,

          status: 'For Review',

          remarks: 'For HR validation.',
        },

        {
          id: 5,

          referenceNumber: 'PHIC-2026-1005',

          employeeId: 5,
          employeeNumber: 'EMP-005',
          employeeName: 'Carlo Mendoza',

          philhealthNumber: '12-745678901-6',

          department: 'Information Technology',
          position: 'Software Developer',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyBasicSalary: 42000,
          contributionBasis: 42000,

          employeeShare: 1050,
          employerShare: 1050,

          totalPremium: 2100,

          remittanceReference: 'RMT-PHIC-2026-1005',
          remittanceDate: '2026-11-08',

          status: 'Remitted',
        },

        {
          id: 6,

          referenceNumber: 'PHIC-2026-1006',

          employeeId: 6,
          employeeNumber: 'EMP-006',
          employeeName: 'Angela Flores',

          philhealthNumber: '12-845678901-7',

          department: 'Billing',
          position: 'Billing Staff',

          employmentType: 'Probationary',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyBasicSalary: 27500,
          contributionBasis: 27500,

          employeeShare: 687.5,
          employerShare: 687.5,

          totalPremium: 1375,

          status: 'Draft',

          remarks: 'Contribution record not yet finalized.',
        },

        {
          id: 7,

          referenceNumber: 'PHIC-2026-1007',

          employeeId: 7,
          employeeNumber: 'EMP-007',
          employeeName: 'Mark Lopez',

          philhealthNumber: '12-945678901-8',

          department: 'Information Technology',
          position: 'IT Support',

          employmentType: 'Contractual',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyBasicSalary: 32000,
          contributionBasis: 32000,

          employeeShare: 800,
          employerShare: 800,

          totalPremium: 1600,

          status: 'Ready for Remittance',
        },

        {
          id: 8,

          referenceNumber: 'PHIC-2026-1008',

          employeeId: 8,
          employeeNumber: 'EMP-008',
          employeeName: 'Jenny Ramos',

          philhealthNumber: '13-145678901-9',

          department: 'Human Resources',
          position: 'HR Officer',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyBasicSalary: 33000,
          contributionBasis: 33000,

          employeeShare: 825,
          employerShare: 825,

          totalPremium: 1650,

          remittanceReference: 'RMT-PHIC-2026-1008',
          remittanceDate: '2026-11-08',

          status: 'Remitted',
        },

        {
          id: 9,

          referenceNumber: 'PHIC-2026-1009',

          employeeId: 9,
          employeeNumber: 'EMP-009',
          employeeName: 'Robert Castillo',

          philhealthNumber: '13-245678901-0',

          department: 'Finance',
          position: 'Finance Officer',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyBasicSalary: 39000,
          contributionBasis: 39000,

          employeeShare: 975,
          employerShare: 975,

          totalPremium: 1950,

          status: 'Ready for Remittance',
        },

        {
          id: 10,

          referenceNumber: 'PHIC-2026-1010',

          employeeId: 10,
          employeeNumber: 'EMP-010',
          employeeName: 'Grace Navarro',

          philhealthNumber: '13-345678901-1',

          department: 'Human Resources',
          position: 'Recruitment Coordinator',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyBasicSalary: 30500,
          contributionBasis: 30500,

          employeeShare: 762.5,
          employerShare: 762.5,

          totalPremium: 1525,

          status: 'For Review',
        },

        {
          id: 11,

          referenceNumber: 'PHIC-2026-1011',

          employeeId: 11,
          employeeNumber: 'EMP-011',
          employeeName: 'Leo Martinez',

          philhealthNumber: '13-445678901-2',

          department: 'Operations',
          position: 'Driver',

          employmentType: 'Project-Based',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyBasicSalary: 21000,
          contributionBasis: 21000,

          employeeShare: 525,
          employerShare: 525,

          totalPremium: 1050,

          status: 'Draft',
        },

        {
          id: 12,

          referenceNumber: 'PHIC-2026-1012',

          employeeId: 12,
          employeeNumber: 'EMP-012',
          employeeName: 'Claire Villanueva',

          philhealthNumber: '13-545678901-3',

          department: 'Operations',
          position: 'Operations Coordinator',

          employmentType: 'Regular',

          contributionMonth: 'October',
          contributionYear: 2026,

          monthlyBasicSalary: 34000,
          contributionBasis: 34000,

          employeeShare: 850,
          employerShare: 850,

          totalPremium: 1700,

          remittanceReference: 'RMT-PHIC-2026-1012',
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
    PhilhealthContributionStatus[] = [
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
            item.philhealthNumber
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

        totalPremium:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.totalPremium,
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
        monthlyBasicSalary:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.monthlyBasicSalary,
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

        totalPremium:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.totalPremium,
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