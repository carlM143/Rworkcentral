import type {
  DepartmentAssignment,
  DepartmentAssignmentStatus,
  DepartmentAssignmentType,
} from '~/types/departmentAssignment'

export const useDepartmentAssignments = () => {
  const assignments =
    useState<DepartmentAssignment[]>(
      'department-assignments',
      () => [
        {
          id: 1,

          assignmentNumber:
            'DA-2026-001',

          employeeId: 1,
          employeeNumber:
            'EMP-001',

          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          assignmentType:
            'Primary',

          status:
            'Active',

          supervisor:
            'Carlos Ramirez',

          effectiveDate:
            '2026-01-15',

          assignedBy:
            'Maria Santos',

          assignedAt:
            '2026-01-10T09:00:00',
        },

        {
          id: 2,

          assignmentNumber:
            'DA-2026-002',

          employeeId: 2,
          employeeNumber:
            'EMP-002',

          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Administrator',

          assignmentType:
            'Primary',

          status:
            'Active',

          supervisor:
            'General Manager',

          effectiveDate:
            '2026-01-05',

          assignedBy:
            'System Administrator',

          assignedAt:
            '2026-01-05T08:30:00',
        },

        {
          id: 3,

          assignmentNumber:
            'DA-2026-003',

          employeeId: 3,
          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Finance Staff',

          assignmentType:
            'Primary',

          status:
            'Active',

          supervisor:
            'Robert Castillo',

          effectiveDate:
            '2026-02-01',

          assignedBy:
            'Maria Santos',

          assignedAt:
            '2026-01-29T10:20:00',
        },

        {
          id: 4,

          assignmentNumber:
            'DA-2026-004',

          employeeId: 4,
          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Operations Staff',

          assignmentType:
            'Primary',

          status:
            'Active',

          supervisor:
            'Carlos Ramirez',

          effectiveDate:
            '2026-02-10',

          assignedBy:
            'Maria Santos',

          assignedAt:
            '2026-02-08T11:00:00',
        },

        {
          id: 5,

          assignmentNumber:
            'DA-2026-005',

          employeeId: 5,
          employeeNumber:
            'EMP-005',

          employeeName:
            'Carlo Mendoza',

          department:
            'IT',

          position:
            'Software Developer',

          assignmentType:
            'Primary',

          status:
            'Active',

          supervisor:
            'IT Manager',

          effectiveDate:
            '2026-03-01',

          assignedBy:
            'Maria Santos',

          assignedAt:
            '2026-02-25T09:45:00',
        },

        {
          id: 6,

          assignmentNumber:
            'DA-2026-006',

          employeeId: 6,
          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Staff',

          assignmentType:
            'Primary',

          status:
            'Active',

          supervisor:
            'Billing Supervisor',

          effectiveDate:
            '2026-03-05',

          assignedBy:
            'Maria Santos',

          assignedAt:
            '2026-03-03T14:00:00',
        },

        {
          id: 7,

          assignmentNumber:
            'DA-2026-007',

          employeeId: 7,
          employeeNumber:
            'EMP-007',

          employeeName:
            'Mark Lopez',

          department:
            'IT',

          position:
            'IT Support',

          assignmentType:
            'Temporary',

          status:
            'Temporary',

          supervisor:
            'IT Manager',

          effectiveDate:
            '2026-09-15',

          endDate:
            '2026-10-31',

          assignedBy:
            'Maria Santos',

          assignedAt:
            '2026-09-14T13:20:00',

          remarks:
            'Temporary support assignment.',
        },

        {
          id: 8,

          assignmentNumber:
            'DA-2026-008',

          employeeId: 8,
          employeeNumber:
            'EMP-008',

          employeeName:
            'Jenny Ramos',

          department:
            'Human Resources',

          position:
            'HR Staff',

          assignmentType:
            'Primary',

          status:
            'Active',

          supervisor:
            'Maria Santos',

          effectiveDate:
            '2026-04-01',

          assignedBy:
            'Maria Santos',

          assignedAt:
            '2026-03-29T08:30:00',
        },

        {
          id: 9,

          assignmentNumber:
            'DA-2026-009',

          employeeId: 9,
          employeeNumber:
            'EMP-009',

          employeeName:
            'Robert Castillo',

          department:
            'Finance',

          position:
            'Finance Officer',

          assignmentType:
            'Acting',

          status:
            'Temporary',

          supervisor:
            'Finance Manager',

          effectiveDate:
            '2026-09-01',

          endDate:
            '2026-11-30',

          assignedBy:
            'Maria Santos',

          assignedAt:
            '2026-08-30T10:00:00',

          remarks:
            'Acting finance lead.',
        },

        {
          id: 10,

          assignmentNumber:
            'DA-2026-010',

          employeeId: 10,
          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Staff',

          assignmentType:
            'Primary',

          status:
            'Ended',

          supervisor:
            'Maria Santos',

          effectiveDate:
            '2025-05-01',

          endDate:
            '2026-08-31',

          assignedBy:
            'Maria Santos',

          assignedAt:
            '2025-04-28T09:00:00',

          remarks:
            'Previous department assignment.',
        },

        {
          id: 11,

          assignmentNumber:
            'DA-2026-011',

          employeeId: 11,
          employeeNumber:
            'EMP-011',

          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Driver',

          assignmentType:
            'Primary',

          status:
            'Active',

          supervisor:
            'Carlos Ramirez',

          effectiveDate:
            '2026-05-15',

          assignedBy:
            'Maria Santos',

          assignedAt:
            '2026-05-12T11:30:00',
        },

        {
          id: 12,

          assignmentNumber:
            'DA-2026-012',

          employeeId: 12,
          employeeNumber:
            'EMP-012',

          employeeName:
            'Claire Villanueva',

          department:
            'Operations',

          position:
            'Operations Coordinator',

          assignmentType:
            'Primary',

          status:
            'Active',

          supervisor:
            'Operations Manager',

          effectiveDate:
            '2026-06-01',

          assignedBy:
            'Maria Santos',

          assignedAt:
            '2026-05-28T15:00:00',
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

  const assignmentType =
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
          assignments.value.map(
            item =>
              item.department,
          ),
        ),
      ].sort()
    })

  const assignmentTypeOptions:
    DepartmentAssignmentType[] = [
      'Primary',
      'Temporary',
      'Acting',
    ]

  const statusOptions:
    DepartmentAssignmentStatus[] = [
      'Active',
      'Temporary',
      'Ended',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredAssignments =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return assignments.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.assignmentNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.position
              .toLowerCase()
              .includes(keyword) ||
            item.supervisor
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesType =
            !assignmentType.value ||
            item.assignmentType ===
              assignmentType.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesType &&
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
        filteredAssignments.value

      const current =
        data.filter(
          item =>
            item.status !==
            'Ended',
        )

      return {
        totalAssignments:
          data.length,

        activeAssignments:
          data.filter(
            item =>
              item.status ===
              'Active',
          ).length,

        temporaryAssignments:
          data.filter(
            item =>
              item.status ===
              'Temporary',
          ).length,

        departmentsCovered:
          new Set(
            current.map(
              item =>
                item.department,
            ),
          ).size,
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
          filteredAssignments
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedAssignments =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredAssignments
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
        filteredAssignments
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

        filteredAssignments
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    assignmentType.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      assignmentType,
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
    assignments,

    search,
    department,
    assignmentType,
    status,

    currentPage,

    filteredAssignments,
    paginatedAssignments,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    departmentOptions,
    assignmentTypeOptions,
    statusOptions,

    resetFilters,
  }
}