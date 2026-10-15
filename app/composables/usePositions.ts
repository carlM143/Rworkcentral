import type {
  Position,
  PositionLevel,
  PositionStatus,
} from '~/types/position'

export const usePositions = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const positions =
    useState<Position[]>(
      'positions',
      () => [
        {
          id: 1,

          code: 'OPS-DRV',

          name: 'Driver',

          department: 'Operations',

          level: 'Staff',

          description:
            'Responsible for company and client transportation operations.',

          currentHeadcount: 28,

          approvedHeadcount: 32,

          minimumSalary: 18000,
          maximumSalary: 22000,

          status: 'Active',

          createdAt:
            '2026-01-05T09:00:00',

          updatedAt:
            '2026-09-28T10:30:00',
        },

        {
          id: 2,

          code: 'OPS-COORD',

          name:
            'Operations Coordinator',

          department: 'Operations',

          level: 'Supervisor',

          description:
            'Coordinates daily manpower deployment and client operations.',

          currentHeadcount: 8,

          approvedHeadcount: 10,

          minimumSalary: 24000,
          maximumSalary: 32000,

          status: 'Active',

          createdAt:
            '2026-01-05T09:10:00',

          updatedAt:
            '2026-09-26T11:15:00',
        },

        {
          id: 3,

          code: 'HR-STAFF',

          name: 'HR Staff',

          department:
            'Human Resources',

          level: 'Staff',

          description:
            'Supports employee records, recruitment and HR administration.',

          currentHeadcount: 5,

          approvedHeadcount: 6,

          minimumSalary: 20000,
          maximumSalary: 26000,

          status: 'Active',

          createdAt:
            '2026-01-05T09:20:00',

          updatedAt:
            '2026-09-29T14:10:00',
        },

        {
          id: 4,

          code: 'HR-ADMIN',

          name:
            'HR Administrator',

          department:
            'Human Resources',

          level: 'Manager',

          description:
            'Manages HR operations, employee records and administrative workflows.',

          currentHeadcount: 2,

          approvedHeadcount: 2,

          minimumSalary: 35000,
          maximumSalary: 45000,

          status: 'Active',

          createdAt:
            '2026-01-05T09:30:00',

          updatedAt:
            '2026-09-30T09:40:00',
        },

        {
          id: 5,

          code: 'FIN-STAFF',

          name:
            'Finance Staff',

          department: 'Finance',

          level: 'Staff',

          description:
            'Supports payroll preparation, financial records and reconciliation.',

          currentHeadcount: 6,

          approvedHeadcount: 7,

          minimumSalary: 22000,
          maximumSalary: 28000,

          status: 'Active',

          createdAt:
            '2026-01-05T09:40:00',

          updatedAt:
            '2026-09-28T13:00:00',
        },

        {
          id: 6,

          code: 'FIN-OFF',

          name:
            'Finance Officer',

          department: 'Finance',

          level: 'Senior',

          description:
            'Handles finance monitoring, payroll review and financial controls.',

          currentHeadcount: 3,

          approvedHeadcount: 4,

          minimumSalary: 30000,
          maximumSalary: 38000,

          status: 'Active',

          createdAt:
            '2026-02-01T08:30:00',

          updatedAt:
            '2026-09-25T10:00:00',
        },

        {
          id: 7,

          code: 'IT-DEV',

          name:
            'Software Developer',

          department: 'IT',

          level: 'Staff',

          description:
            'Develops and maintains company software applications and internal systems.',

          currentHeadcount: 4,

          approvedHeadcount: 6,

          minimumSalary: 30000,
          maximumSalary: 45000,

          status: 'Active',

          createdAt:
            '2026-02-05T09:00:00',

          updatedAt:
            '2026-09-30T13:20:00',
        },

        {
          id: 8,

          code: 'IT-SUPPORT',

          name:
            'IT Support',

          department: 'IT',

          level: 'Staff',

          description:
            'Provides technical support, workstation maintenance and user assistance.',

          currentHeadcount: 3,

          approvedHeadcount: 4,

          minimumSalary: 22000,
          maximumSalary: 28000,

          status: 'Active',

          createdAt:
            '2026-02-05T09:15:00',

          updatedAt:
            '2026-09-22T08:50:00',
        },

        {
          id: 9,

          code: 'BILL-STAFF',

          name:
            'Billing Staff',

          department: 'Billing',

          level: 'Staff',

          description:
            'Prepares client billings, billing records and supporting documents.',

          currentHeadcount: 5,

          approvedHeadcount: 6,

          minimumSalary: 21000,
          maximumSalary: 27000,

          status: 'Active',

          createdAt:
            '2026-02-10T10:00:00',

          updatedAt:
            '2026-09-27T09:30:00',
        },

        {
          id: 10,

          code: 'OPS-OLD',

          name:
            'Operations Assistant',

          department: 'Operations',

          level: 'Entry Level',

          description:
            'Legacy operations position retained for historical employee records.',

          currentHeadcount: 0,

          approvedHeadcount: 0,

          minimumSalary: 16000,
          maximumSalary: 18000,

          status: 'Inactive',

          createdAt:
            '2025-01-01T08:00:00',

          updatedAt:
            '2026-01-01T08:00:00',
        },

        {
          id: 11,

          code: 'OPS-SUP',

          name:
            'Operations Supervisor',

          department: 'Operations',

          level: 'Supervisor',

          description:
            'Supervises daily field operations, employees and client deployment.',

          currentHeadcount: 4,

          approvedHeadcount: 5,

          minimumSalary: 32000,
          maximumSalary: 40000,

          status: 'Active',

          createdAt:
            '2026-03-01T08:30:00',

          updatedAt:
            '2026-09-30T11:20:00',
        },

        {
          id: 12,

          code: 'ACC-MGR',

          name:
            'Account Manager',

          department: 'Operations',

          level: 'Manager',

          description:
            'Manages client accounts and ensures manpower service requirements are met.',

          currentHeadcount: 3,

          approvedHeadcount: 4,

          minimumSalary: 38000,
          maximumSalary: 50000,

          status: 'Active',

          createdAt:
            '2026-03-10T09:00:00',

          updatedAt:
            '2026-10-01T09:20:00',
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

  const level =
    ref('')

  const status =
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

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          positions.value.map(
            item =>
              item.department,
          ),
        ),
      ].sort()
    })

  const levelOptions:
    PositionLevel[] = [
      'Entry Level',
      'Staff',
      'Senior',
      'Supervisor',
      'Manager',
      'Executive',
    ]

  const statusOptions:
    PositionStatus[] = [
      'Active',
      'Inactive',
    ]

  /* =========================================================
     FILTERED DATA
  ========================================================= */

  const filteredPositions =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return positions.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.code
              .toLowerCase()
              .includes(keyword) ||
            item.name
              .toLowerCase()
              .includes(keyword) ||
            item.description
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesLevel =
            !level.value ||
            item.level ===
              level.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesLevel &&
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
        filteredPositions.value

      const active =
        data.filter(
          item =>
            item.status ===
            'Active',
        )

      const totalHeadcount =
        active.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.currentHeadcount,
          0,
        )

      const totalVacancies =
        active.reduce(
          (
            total,
            item,
          ) =>
            total +
            Math.max(
              0,
              item.approvedHeadcount -
                item.currentHeadcount,
            ),
          0,
        )

      return {
        totalPositions:
          data.length,

        activePositions:
          active.length,

        totalHeadcount,

        vacancies:
          totalVacancies,
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
          filteredPositions
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedPositions =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredPositions
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
        filteredPositions
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

        filteredPositions
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    level.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      level,
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
    positions,

    search,
    department,
    level,
    status,

    currentPage,

    filteredPositions,
    paginatedPositions,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    departmentOptions,
    levelOptions,
    statusOptions,

    resetFilters,
  }
}