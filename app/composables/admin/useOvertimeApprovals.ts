import type {
  OvertimeApproval,
  OvertimeApprovalStatus,
  OvertimeApprovalType,
} from '~/types/overtimeApproval'

export const useOvertimeApprovals = () => {
  const requests =
    useState<OvertimeApproval[]>(
      'overtime-approvals',
      () => [
        {
          id: 1,

          requestNumber:
            'OT-2026-001',

          employeeId: 1,
          employeeNumber:
            'EMP-001',

          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          overtimeDate:
            '2026-10-07',

          startTime:
            '17:00',

          endTime:
            '20:00',

          requestedHours: 3,

          overtimeType:
            'Regular OT',

          reason:
            'Extended client delivery operations.',

          filedAt:
            '2026-10-06T08:15:00',

          status:
            'Pending',

          immediateSupervisor:
            'Carlos Ramirez',
        },

        {
          id: 2,

          requestNumber:
            'OT-2026-002',

          employeeId: 3,
          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Finance Staff',

          overtimeDate:
            '2026-10-08',

          startTime:
            '17:00',

          endTime:
            '19:30',

          requestedHours: 2.5,

          overtimeType:
            'Regular OT',

          reason:
            'Payroll reconciliation and cutoff preparation.',

          filedAt:
            '2026-10-06T09:00:00',

          status:
            'For Review',

          immediateSupervisor:
            'Robert Castillo',
        },

        {
          id: 3,

          requestNumber:
            'OT-2026-003',

          employeeId: 4,
          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Operations Staff',

          overtimeDate:
            '2026-10-10',

          startTime:
            '08:00',

          endTime:
            '13:00',

          requestedHours: 5,

          overtimeType:
            'Rest Day OT',

          reason:
            'Client manpower support during scheduled rest day.',

          filedAt:
            '2026-10-05T14:30:00',

          status:
            'Pending',

          immediateSupervisor:
            'Carlos Ramirez',
        },

        {
          id: 4,

          requestNumber:
            'OT-2026-004',

          employeeId: 6,
          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Staff',

          overtimeDate:
            '2026-10-05',

          startTime:
            '17:30',

          endTime:
            '20:30',

          requestedHours: 3,

          approvedHours: 2.5,

          overtimeType:
            'Regular OT',

          reason:
            'Billing cutoff preparation.',

          filedAt:
            '2026-10-04T10:10:00',

          status:
            'Approved',

          immediateSupervisor:
            'Billing Supervisor',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-04T15:20:00',

          remarks:
            'Approved for 2.5 hours only.',
        },

        {
          id: 5,

          requestNumber:
            'OT-2026-005',

          employeeId: 7,
          employeeNumber:
            'EMP-007',

          employeeName:
            'Mark Lopez',

          department:
            'IT',

          position:
            'IT Support',

          overtimeDate:
            '2026-10-03',

          startTime:
            '18:00',

          endTime:
            '22:00',

          requestedHours: 4,

          approvedHours: 0,

          overtimeType:
            'Regular OT',

          reason:
            'Server maintenance and application update.',

          filedAt:
            '2026-10-02T09:00:00',

          status:
            'Rejected',

          immediateSupervisor:
            'IT Manager',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-02T14:00:00',

          remarks:
            'Maintenance schedule was moved.',
        },

        {
          id: 6,

          requestNumber:
            'OT-2026-006',

          employeeId: 9,
          employeeNumber:
            'EMP-009',

          employeeName:
            'Robert Castillo',

          department:
            'Finance',

          position:
            'Finance Officer',

          overtimeDate:
            '2026-10-09',

          startTime:
            '17:00',

          endTime:
            '21:00',

          requestedHours: 4,

          overtimeType:
            'Regular OT',

          reason:
            'Month-end and payroll document preparation.',

          filedAt:
            '2026-10-06T08:40:00',

          status:
            'For Review',

          immediateSupervisor:
            'Finance Manager',
        },

        {
          id: 7,

          requestNumber:
            'OT-2026-007',

          employeeId: 10,
          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Staff',

          overtimeDate:
            '2026-10-11',

          startTime:
            '17:00',

          endTime:
            '19:00',

          requestedHours: 2,

          overtimeType:
            'Regular OT',

          reason:
            'Employee record updates and document filing.',

          filedAt:
            '2026-10-06T10:10:00',

          status:
            'Pending',

          immediateSupervisor:
            'Maria Santos',
        },

        {
          id: 8,

          requestNumber:
            'OT-2026-008',

          employeeId: 11,
          employeeNumber:
            'EMP-011',

          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Driver',

          overtimeDate:
            '2026-09-21',

          startTime:
            '07:00',

          endTime:
            '15:00',

          requestedHours: 8,

          approvedHours: 8,

          overtimeType:
            'Holiday OT',

          reason:
            'Holiday client operations.',

          filedAt:
            '2026-09-19T09:00:00',

          status:
            'Approved',

          immediateSupervisor:
            'Carlos Ramirez',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-19T11:00:00',
        },

        {
          id: 9,

          requestNumber:
            'OT-2026-009',

          employeeId: 12,
          employeeNumber:
            'EMP-012',

          employeeName:
            'Claire Villanueva',

          department:
            'Operations',

          position:
            'Operations Coordinator',

          overtimeDate:
            '2026-10-12',

          startTime:
            '17:00',

          endTime:
            '20:00',

          requestedHours: 3,

          overtimeType:
            'Regular OT',

          reason:
            'Client deployment coordination.',

          filedAt:
            '2026-10-06T11:30:00',

          status:
            'For Review',

          immediateSupervisor:
            'Operations Manager',
        },

        {
          id: 10,

          requestNumber:
            'OT-2026-010',

          employeeId: 5,
          employeeNumber:
            'EMP-005',

          employeeName:
            'Carlo Mendoza',

          department:
            'IT',

          position:
            'Software Developer',

          overtimeDate:
            '2026-10-04',

          startTime:
            '18:00',

          endTime:
            '21:00',

          requestedHours: 3,

          overtimeType:
            'Regular OT',

          reason:
            'Production deployment support.',

          filedAt:
            '2026-10-03T10:20:00',

          status:
            'Cancelled',

          immediateSupervisor:
            'IT Manager',

          remarks:
            'Deployment postponed.',
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

  const overtimeType =
    ref('')

  const status =
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

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          requests.value.map(
            item =>
              item.department,
          ),
        ),
      ].sort()
    })

  const overtimeTypeOptions:
    OvertimeApprovalType[] = [
      'Regular OT',
      'Rest Day OT',
      'Holiday OT',
    ]

  const statusOptions:
    OvertimeApprovalStatus[] = [
      'Pending',
      'For Review',
      'Approved',
      'Rejected',
      'Cancelled',
    ]

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredRequests =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return requests.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.requestNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.reason
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesType =
            !overtimeType.value ||
            item.overtimeType ===
              overtimeType.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          const matchesDateFrom =
            !dateFrom.value ||
            item.overtimeDate >=
              dateFrom.value

          const matchesDateTo =
            !dateTo.value ||
            item.overtimeDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesType &&
            matchesStatus &&
            matchesDateFrom &&
            matchesDateTo
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
        filteredRequests.value

      return {
        totalRequests:
          data.length,

        pendingReview:
          data.filter(
            item =>
              item.status ===
                'Pending' ||
              item.status ===
                'For Review',
          ).length,

        approved:
          data.filter(
            item =>
              item.status ===
              'Approved',
          ).length,

        requestedHours:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.requestedHours,
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
          filteredRequests
            .value.length /
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

      return filteredRequests
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
        filteredRequests
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

        filteredRequests
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    overtimeType.value = ''
    status.value = ''
    dateFrom.value = ''
    dateTo.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      overtimeType,
      status,
      dateFrom,
      dateTo,
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
    requests,

    search,
    department,
    overtimeType,
    status,
    dateFrom,
    dateTo,

    currentPage,

    filteredRequests,
    paginatedRequests,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    departmentOptions,
    overtimeTypeOptions,
    statusOptions,

    resetFilters,
  }
}