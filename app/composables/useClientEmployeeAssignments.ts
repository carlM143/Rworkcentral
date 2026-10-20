import type {
  ClientAssignmentFormData,
  ClientAssignmentStatus,
  ClientAssignmentType,
  ClientEmployeeAssignment,
} from '~/types/clientEmployeeAssignment'

export const useClientEmployeeAssignments = () => {
  const {
    employees,
  } = useEmployees(
    'Active',
  )

  const {
    clients,
  } = useClientDirectory()

  /* =========================================================
     DATA
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

          department:
            'Human Resources',

          position:
            'HR Assistant',

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

          department: 'Finance',
          position: 'Payroll Officer',

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

          department:
            'Human Resources',

          position:
            'HR Assistant',

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
          position: 'Supervisor',

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

          department:
            'Human Resources',

          position:
            'HR Manager',

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

          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',

          department:
            'Finance',

          position:
            'Accountant',

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
     AVAILABLE EMPLOYEES

     Billing employees excluded because billing module
     was removed from the current HRIS scope.
  ========================================================= */

  const availableEmployees =
    computed(() => {
      return employees.value.filter(
        employee =>
          employee.status ===
            'Active' &&
          employee.department !==
            'Billing',
      )
    })

  /* =========================================================
     CLIENTS
  ========================================================= */

  const availableClients =
    computed(() => {
      return clients.value.filter(
        client =>
          client.status !==
          'Inactive',
      )
    })

  /* =========================================================
     OPTIONS
  ========================================================= */

  const clientOptions =
    computed(() => {
      return availableClients.value
        .map(
          item =>
            item.name,
        )
        .sort()
    })

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          assignments.value
            .map(
              assignment =>
                assignment.department,
            )
            .filter(
              value =>
                value !==
                'Billing',
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
     FILTER
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
          filteredAssignments.value.length /
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

      return filteredAssignments.value.slice(
        start,
        start +
          perPage.value,
      )
    })

  const showingFrom =
    computed(() => {
      if (
        !filteredAssignments.value.length
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

        filteredAssignments.value.length,
      )
    })

  /* =========================================================
     GET
  ========================================================= */

  const getAssignmentById = (
    id:
      number |
      string,
  ) => {
    return assignments.value.find(
      assignment =>
        assignment.id ===
        Number(id),
    )
  }

  /* =========================================================
     CREATE
  ========================================================= */

  const createAssignment = (
    data:
      ClientAssignmentFormData,
  ) => {
    const employee =
      availableEmployees.value.find(
        item =>
          item.id ===
          Number(
            data.employeeId,
          ),
      )

    const selectedClient =
      availableClients.value.find(
        item =>
          item.id ===
          Number(
            data.clientId,
          ),
      )

    if (
      !employee ||
      !selectedClient
    ) {
      return null
    }

    const nextId =
      assignments.value.length
        ? Math.max(
            ...assignments.value.map(
              item =>
                item.id,
            ),
          ) + 1
        : 1

    const assignment:
      ClientEmployeeAssignment = {
        id:
          nextId,

        employeeId:
          employee.id,

        employeeNumber:
          employee.employeeNumber,

        employeeName:
          `${employee.firstName} ${employee.lastName}`,

        department:
          employee.department,

        position:
          employee.position,

        clientId:
          selectedClient.id,

        clientCode:
          selectedClient.code,

        clientName:
          selectedClient.name,

        assignmentDate:
          data.assignmentDate,

        endDate:
          data.endDate ||
          undefined,

        assignmentType:
          data.assignmentType,

        status:
          data.status,

        assignedBy:
          'Maria Santos',

        createdAt:
          new Date()
            .toISOString(),

        remarks:
          data.remarks ||
          undefined,
      }

    assignments.value.unshift(
      assignment,
    )

    return assignment
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  const updateAssignment = (
    id: number,

    data:
      ClientAssignmentFormData,
  ) => {
    const index =
      assignments.value.findIndex(
        assignment =>
          assignment.id === id,
      )

    if (
      index === -1
    ) {
      return null
    }

    const employee =
      availableEmployees.value.find(
        item =>
          item.id ===
          Number(
            data.employeeId,
          ),
      )

    const selectedClient =
      availableClients.value.find(
        item =>
          item.id ===
          Number(
            data.clientId,
          ),
      )

    if (
      !employee ||
      !selectedClient
    ) {
      return null
    }

    const current =
      assignments.value[index]

    assignments.value[index] = {
      ...current,

      employeeId:
        employee.id,

      employeeNumber:
        employee.employeeNumber,

      employeeName:
        `${employee.firstName} ${employee.lastName}`,

      department:
        employee.department,

      position:
        employee.position,

      clientId:
        selectedClient.id,

      clientCode:
        selectedClient.code,

      clientName:
        selectedClient.name,

      assignmentDate:
        data.assignmentDate,

      endDate:
        data.endDate ||
        undefined,

      assignmentType:
        data.assignmentType,

      status:
        data.status,

      remarks:
        data.remarks ||
        undefined,
    }

    return assignments.value[index]
  }

  /* =========================================================
     ACTIVATE
  ========================================================= */

  const activateAssignment = (
    id: number,
  ) => {
    const assignment =
      getAssignmentById(
        id,
      )

    if (!assignment) {
      return null
    }

    assignment.status =
      'Active'

    assignment.endDate =
      undefined

    return assignment
  }

  /* =========================================================
     END ASSIGNMENT
  ========================================================= */

  const endAssignment = (
    id: number,
  ) => {
    const assignment =
      getAssignmentById(
        id,
      )

    if (!assignment) {
      return null
    }

    assignment.status =
      'Ended'

    assignment.endDate =
      new Date()
        .toISOString()
        .slice(
          0,
          10,
        )

    return assignment
  }

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    client.value = ''
    department.value = ''
    status.value = ''
    assignmentType.value = ''

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

    availableEmployees,
    availableClients,

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

    getAssignmentById,

    createAssignment,
    updateAssignment,
    activateAssignment,
    endAssignment,

    resetFilters,
  }
}