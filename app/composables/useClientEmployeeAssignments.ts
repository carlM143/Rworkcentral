import type {
  ClientAssignmentStatus,
  ClientAssignmentType,
  ClientEmployeeAssignment,
} from '~/types/clientEmployeeAssignment'

export const useClientEmployeeAssignments = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const assignments =
    useState<ClientEmployeeAssignment[]>(
      'client-employee-assignments',
      () => [
        {
          id: 1,

          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          department: 'Operations',
          position: 'Driver',

          clientId: 1,
          clientCode: 'CL-001',
          clientName:
            'Davao Transport Services Inc.',

          assignmentDate:
            '2026-09-01',

          assignmentType:
            'Primary',

          status:
            'Active',

          assignedBy:
            'Maria Santos',

          createdAt:
            '2026-09-01T08:30:00',

          remarks:
            'Primary driver assignment.',
        },

        {
          id: 2,

          employeeId: 4,
          employeeNumber: 'EMP-004',
          employeeName: 'Ana Garcia',

          department: 'Operations',
          position: 'Dispatcher',

          clientId: 1,
          clientCode: 'CL-001',
          clientName:
            'Davao Transport Services Inc.',

          assignmentDate:
            '2026-09-01',

          assignmentType:
            'Primary',

          status:
            'Active',

          assignedBy:
            'Maria Santos',

          createdAt:
            '2026-09-01T08:35:00',
        },

        {
          id: 3,

          employeeId: 5,
          employeeNumber: 'EMP-005',
          employeeName: 'Carlo Mendoza',

          department: 'Operations',
          position: 'Driver',

          clientId: 2,
          clientCode: 'CL-002',
          clientName:
            'Prime Logistics Solutions',

          assignmentDate:
            '2026-09-03',

          assignmentType:
            'Primary',

          status:
            'Active',

          assignedBy:
            'Maria Santos',

          createdAt:
            '2026-09-03T09:00:00',
        },

        {
          id: 4,

          employeeId: 7,
          employeeNumber: 'EMP-007',
          employeeName: 'Mark Lopez',

          department: 'Operations',
          position: 'Driver',

          clientId: 2,
          clientCode: 'CL-002',
          clientName:
            'Prime Logistics Solutions',

          assignmentDate:
            '2026-09-05',

          assignmentType:
            'Temporary',

          status:
            'Pending',

          assignedBy:
            'Maria Santos',

          createdAt:
            '2026-09-05T10:20:00',

          remarks:
            'Temporary assignment pending confirmation.',
        },

        {
          id: 5,

          employeeId: 8,
          employeeNumber: 'EMP-008',
          employeeName: 'Jenny Ramos',

          department: 'Administration',
          position: 'Administrative Assistant',

          clientId: 3,
          clientCode: 'CL-003',
          clientName:
            'Mindanao Retail Group',

          assignmentDate:
            '2026-08-15',

          assignmentType:
            'Project-Based',

          status:
            'Active',

          assignedBy:
            'Maria Santos',

          createdAt:
            '2026-08-15T08:45:00',
        },

        {
          id: 6,

          employeeId: 9,
          employeeNumber: 'EMP-009',
          employeeName: 'Robert Castillo',

          department: 'Operations',
          position: 'Driver',

          clientId: 3,
          clientCode: 'CL-003',
          clientName:
            'Mindanao Retail Group',

          assignmentDate:
            '2026-08-20',

          assignmentType:
            'Reliever',

          status:
            'Active',

          assignedBy:
            'Maria Santos',

          createdAt:
            '2026-08-20T09:15:00',
        },

        {
          id: 7,

          employeeId: 10,
          employeeNumber: 'EMP-010',
          employeeName: 'Grace Navarro',

          department: 'Human Resources',
          position: 'HR Assistant',

          clientId: 4,
          clientCode: 'CL-004',
          clientName:
            'Southern Food Corporation',

          assignmentDate:
            '2026-09-10',

          assignmentType:
            'Temporary',

          status:
            'Pending',

          assignedBy:
            'Maria Santos',

          createdAt:
            '2026-09-10T11:00:00',

          remarks:
            'Pending client confirmation.',
        },

        {
          id: 8,

          employeeId: 11,
          employeeNumber: 'EMP-011',
          employeeName: 'Leo Martinez',

          department: 'Operations',
          position: 'Dispatcher',

          clientId: 5,
          clientCode: 'CL-005',
          clientName:
            'Greenfield Manufacturing Corp.',

          assignmentDate:
            '2026-07-01',

          assignmentType:
            'Primary',

          status:
            'Transferred',

          endDate:
            '2026-09-01',

          assignedBy:
            'Maria Santos',

          createdAt:
            '2026-07-01T08:30:00',

          remarks:
            'Employee transferred to another client.',
        },

        {
          id: 9,

          employeeId: 12,
          employeeNumber: 'EMP-012',
          employeeName: 'Claire Villanueva',

          department: 'Administration',
          position: 'Office Staff',

          clientId: 6,
          clientCode: 'CL-006',
          clientName:
            'Metro Property Management',

          assignmentDate:
            '2026-03-01',

          assignmentType:
            'Primary',

          status:
            'Ended',

          endDate:
            '2026-08-31',

          assignedBy:
            'Maria Santos',

          createdAt:
            '2026-03-01T08:00:00',

          remarks:
            'Assignment contract ended.',
        },

        {
          id: 10,

          employeeId: 6,
          employeeNumber: 'EMP-006',
          employeeName: 'Angela Flores',

          department: 'Billing',
          position: 'Billing Officer',

          clientId: 7,
          clientCode: 'CL-007',
          clientName:
            'Pacific Warehousing Services',

          assignmentDate:
            '2026-09-12',

          assignmentType:
            'Project-Based',

          status:
            'Active',

          assignedBy:
            'Maria Santos',

          createdAt:
            '2026-09-12T08:45:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const client =
    ref('')

  const department =
    ref('')

  const status =
    ref('')

  const assignmentType =
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

  const clientOptions =
    computed(() => {
      return [
        ...new Set(
          assignments.value.map(
            assignment =>
              assignment.clientName,
          ),
        ),
      ].sort()
    })

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          assignments.value.map(
            assignment =>
              assignment.department,
          ),
        ),
      ].sort()
    })

  const statusOptions:
    ClientAssignmentStatus[] = [
      'Active',
      'Pending',
      'Ended',
      'Transferred',
    ]

  const assignmentTypeOptions:
    ClientAssignmentType[] = [
      'Primary',
      'Temporary',
      'Reliever',
      'Project-Based',
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
        assignment => {
          const matchesSearch =
            !keyword ||
            assignment.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            assignment.employeeName
              .toLowerCase()
              .includes(keyword) ||
            assignment.position
              .toLowerCase()
              .includes(keyword) ||
            assignment.clientCode
              .toLowerCase()
              .includes(keyword) ||
            assignment.clientName
              .toLowerCase()
              .includes(keyword)

          const matchesClient =
            !client.value ||
            assignment.clientName ===
              client.value

          const matchesDepartment =
            !department.value ||
            assignment.department ===
              department.value

          const matchesStatus =
            !status.value ||
            assignment.status ===
              status.value

          const matchesType =
            !assignmentType.value ||
            assignment.assignmentType ===
              assignmentType.value

          return (
            matchesSearch &&
            matchesClient &&
            matchesDepartment &&
            matchesStatus &&
            matchesType
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
        filteredAssignments.value

      return {
        totalAssignments:
          records.length,

        activeAssignments:
          records.filter(
            assignment =>
              assignment.status ===
              'Active',
          ).length,

        pendingAssignments:
          records.filter(
            assignment =>
              assignment.status ===
              'Pending',
          ).length,

        assignedClients:
          new Set(
            records
              .filter(
                assignment =>
                  assignment.status ===
                    'Active' ||
                  assignment.status ===
                    'Pending',
              )
              .map(
                assignment =>
                  assignment.clientId,
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

        filteredAssignments
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value =
      ''

    client.value =
      ''

    department.value =
      ''

    status.value =
      ''

    assignmentType.value =
      ''

    currentPage.value =
      1
  }

  watch(
    [
      search,
      client,
      department,
      status,
      assignmentType,
    ],
    () => {
      currentPage.value =
        1
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
    client,
    department,
    status,
    assignmentType,

    currentPage,
    perPage,

    filteredAssignments,
    paginatedAssignments,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    clientOptions,
    departmentOptions,
    statusOptions,
    assignmentTypeOptions,

    resetFilters,
  }
}