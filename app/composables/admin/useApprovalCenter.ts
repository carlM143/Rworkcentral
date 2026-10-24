import type {
  ApprovalRequest,
  ApprovalRequestType,
} from '~/types/approval'

export const useApprovalCenter = () => {
  const {
    employees,
  } = useEmployees()

  /* =========================================================
     EMPLOYEE HELPER
  ========================================================= */

  const employeeById = (
    id: number,
  ) => {
    return employees.value.find(
      employee =>
        employee.id === id,
    )
  }

  const createRequest = (
    data: {
      id: number
      reference: string

      employeeId: number

      type: ApprovalRequestType

      title: string
      description: string

      requestDate: string
      submittedAt: string

      priority?: 'Normal' | 'Urgent'

      approver?: string
    },
  ): ApprovalRequest => {
    const employee =
      employeeById(
        data.employeeId,
      )

    if (!employee) {
      throw new Error(
        `Employee ${data.employeeId} not found`,
      )
    }

    return {
      id:
        data.id,

      reference:
        data.reference,

      employeeId:
        employee.id,

      employeeNumber:
        employee.employeeNumber,

      employeeName: [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' '),

      department:
        employee.department,

      position:
        employee.position,

      type:
        data.type,

      title:
        data.title,

      description:
        data.description,

      requestDate:
        data.requestDate,

      submittedAt:
        data.submittedAt,

      status:
        'Pending',

      priority:
        data.priority ??
        'Normal',

      approver:
        data.approver,
    }
  }

  /* =========================================================
     MOCK PENDING REQUESTS
  ========================================================= */

  const requests =
    ref<ApprovalRequest[]>([
      createRequest({
        id: 1,

        reference:
          'LV-2026-001',

        employeeId: 1,

        type:
          'Leave',

        title:
          'Vacation Leave',

        description:
          'Vacation leave request for September 8–9.',

        requestDate:
          '2026-09-08',

        submittedAt:
          '2026-09-03T08:15:00',

        priority:
          'Normal',

        approver:
          'Maria Santos',
      }),

      createRequest({
        id: 2,

        reference:
          'OT-2026-004',

        employeeId: 2,

        type:
          'Overtime',

        title:
          '2.5 Hours Overtime',

        description:
          'Payroll preparation support after regular working hours.',

        requestDate:
          '2026-09-04',

        submittedAt:
          '2026-09-03T09:20:00',

        priority:
          'Normal',

        approver:
          'Claire Villanueva',
      }),

      createRequest({
        id: 3,

        reference:
          'TLC-2026-012',

        employeeId: 7,

        type:
          'Time Log Correction',

        title:
          'Missing Time Out',

        description:
          'Employee requested correction for missing September 3 time out.',

        requestDate:
          '2026-09-03',

        submittedAt:
          '2026-09-03T10:10:00',

        priority:
          'Urgent',

        approver:
          'Leo Martinez',
      }),

      createRequest({
        id: 4,

        reference:
          'LV-2026-005',

        employeeId: 3,

        type:
          'Leave',

        title:
          'Vacation Leave',

        description:
          'Two-day vacation leave for family event.',

        requestDate:
          '2026-09-15',

        submittedAt:
          '2026-09-03T10:45:00',

        priority:
          'Normal',

        approver:
          'Maria Santos',
      }),

      createRequest({
        id: 5,

        reference:
          'OT-2026-007',

        employeeId: 4,

        type:
          'Overtime',

        title:
          '3 Hours Overtime',

        description:
          'Additional dispatch support for scheduled trips.',

        requestDate:
          '2026-09-05',

        submittedAt:
          '2026-09-03T11:05:00',

        priority:
          'Normal',

        approver:
          'Leo Martinez',
      }),

      createRequest({
        id: 6,

        reference:
          'WFH-2026-002',

        employeeId: 8,

        type:
          'WFH',

        title:
          'Work From Home',

        description:
          'Request to work from home due to scheduled home maintenance.',

        requestDate:
          '2026-09-05',

        submittedAt:
          '2026-09-03T11:45:00',

        priority:
          'Normal',

        approver:
          'Claire Villanueva',
      }),

      createRequest({
        id: 7,

        reference:
          'TLC-2026-014',

        employeeId: 6,

        type:
          'Time Log Correction',

        title:
          'Incorrect Time In',

        description:
          'Employee requested adjustment of recorded time-in.',

        requestDate:
          '2026-09-02',

        submittedAt:
          '2026-09-03T13:10:00',

        priority:
          'Urgent',

        approver:
          'Maria Santos',
      }),

      createRequest({
        id: 8,

        reference:
          'OT-2026-009',

        employeeId: 9,

        type:
          'Overtime',

        title:
          '2 Hours Overtime',

        description:
          'Additional payroll processing work required.',

        requestDate:
          '2026-09-06',

        submittedAt:
          '2026-09-03T14:00:00',

        priority:
          'Normal',

        approver:
          'Claire Villanueva',
      }),
    ])

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const type =
    ref('')

  const department =
    ref('')

  const priority =
    ref('')

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  /* =========================================================
     FILTERED REQUESTS
  ========================================================= */

  const filteredRequests =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return requests.value.filter(
        request => {
          const matchesSearch =
            !keyword ||
            request.employeeName
              .toLowerCase()
              .includes(keyword) ||
            request.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            request.reference
              .toLowerCase()
              .includes(keyword)

          const matchesType =
            !type.value ||
            request.type ===
              type.value

          const matchesDepartment =
            !department.value ||
            request.department ===
              department.value

          const matchesPriority =
            !priority.value ||
            request.priority ===
              priority.value

          return (
            matchesSearch &&
            matchesType &&
            matchesDepartment &&
            matchesPriority
          )
        },
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => ({
      total:
        requests.value.length,

      leaves:
        requests.value.filter(
          request =>
            request.type ===
            'Leave',
        ).length,

      overtime:
        requests.value.filter(
          request =>
            request.type ===
            'Overtime',
        ).length,

      corrections:
        requests.value.filter(
          request =>
            request.type ===
            'Time Log Correction',
        ).length,
    }))

  /* =========================================================
     TYPE COUNTS
  ========================================================= */

  const typeSummary =
    computed(() => ({
      leave:
        requests.value.filter(
          request =>
            request.type === 'Leave',
        ).length,

      overtime:
        requests.value.filter(
          request =>
            request.type === 'Overtime',
        ).length,

      corrections:
        requests.value.filter(
          request =>
            request.type ===
            'Time Log Correction',
        ).length,

      wfh:
        requests.value.filter(
          request =>
            request.type === 'WFH',
        ).length,
    }))

  /* =========================================================
     URGENT
  ========================================================= */

  const urgentRequests =
    computed(() => {
      return requests.value.filter(
        request =>
          request.priority ===
          'Urgent',
      )
    })

  /* =========================================================
     OPTIONS
  ========================================================= */

  const typeOptions = [
    'Leave',
    'Overtime',
    'Time Log Correction',
    'WFH',
  ]

  const priorityOptions = [
    'Normal',
    'Urgent',
  ]

  const departments =
    computed(() => {
      return [
        ...new Set(
          requests.value.map(
            request =>
              request.department,
          ),
        ),
      ].sort()
    })

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredRequests.value.length /
            perPage.value,
        ),
      )
    })

  const paginatedRequests =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredRequests.value.slice(
        start,
        start +
          perPage.value,
      )
    })

  const showingFrom =
    computed(() => {
      if (
        !filteredRequests.value.length
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

        filteredRequests.value.length,
      )
    })

  /* =========================================================
     UI APPROVE / REJECT
  ========================================================= */

  const approveRequest = (
    request: ApprovalRequest,
  ) => {
    requests.value =
      requests.value.filter(
        item =>
          item.id !==
          request.id,
      )
  }

  const rejectRequest = (
    request: ApprovalRequest,
  ) => {
    requests.value =
      requests.value.filter(
        item =>
          item.id !==
          request.id,
      )
  }

  const resetFilters = () => {
    search.value = ''
    type.value = ''
    department.value = ''
    priority.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      type,
      department,
      priority,
    ],
    () => {
      currentPage.value = 1
    },
  )

  return {
    requests,

    search,
    type,
    department,
    priority,

    currentPage,

    filteredRequests,
    paginatedRequests,

    totalPages,
    showingFrom,
    showingTo,

    stats,
    typeSummary,
    urgentRequests,

    typeOptions,
    priorityOptions,
    departments,

    approveRequest,
    rejectRequest,

    resetFilters,
  }
}