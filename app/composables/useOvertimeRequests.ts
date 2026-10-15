import type {
  OvertimeRequest,
  OvertimeRequestStatus,
  OvertimeType,
} from '~/types/overtimeRequest'

export const useOvertimeRequests = () => {
  const requests =
    useState<OvertimeRequest[]>(
      'overtime-requests',
      () => [
        {
          id: 1,
          requestNumber: 'OT-2026-001',
          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',
          department: 'Operations',
          position: 'Driver',
          overtimeDate: '2026-10-05',
          startTime: '17:00',
          endTime: '20:00',
          requestedHours: 3,
          approvedHours: 3,
          overtimeType: 'Regular OT',
          reason: 'Extended client delivery operations',
          status: 'Approved',
          requestedAt: '2026-10-04T09:15:00',
          reviewedBy: 'Maria Santos',
          reviewedAt: '2026-10-04T13:30:00',
        },

        {
          id: 2,
          requestNumber: 'OT-2026-002',
          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',
          department: 'Finance',
          position: 'Finance Staff',
          overtimeDate: '2026-10-06',
          startTime: '17:00',
          endTime: '19:30',
          requestedHours: 2.5,
          overtimeType: 'Regular OT',
          reason: 'Payroll reconciliation',
          status: 'Pending',
          requestedAt: '2026-10-05T10:00:00',
        },

        {
          id: 3,
          requestNumber: 'OT-2026-003',
          employeeId: 4,
          employeeNumber: 'EMP-004',
          employeeName: 'Ana Garcia',
          department: 'Operations',
          position: 'Operations Staff',
          overtimeDate: '2026-10-06',
          startTime: '08:00',
          endTime: '13:00',
          requestedHours: 5,
          overtimeType: 'Rest Day OT',
          reason: 'Client manpower support',
          status: 'For Review',
          requestedAt: '2026-10-05T11:30:00',
        },

        {
          id: 4,
          requestNumber: 'OT-2026-004',
          employeeId: 6,
          employeeNumber: 'EMP-006',
          employeeName: 'Angela Flores',
          department: 'Billing',
          position: 'Billing Staff',
          overtimeDate: '2026-10-04',
          startTime: '17:30',
          endTime: '20:30',
          requestedHours: 3,
          approvedHours: 2.5,
          overtimeType: 'Regular OT',
          reason: 'Billing cutoff preparation',
          status: 'Approved',
          requestedAt: '2026-10-03T15:15:00',
          reviewedBy: 'Maria Santos',
          reviewedAt: '2026-10-03T16:30:00',
          remarks: 'Approved for 2.5 hours only.',
        },

        {
          id: 5,
          requestNumber: 'OT-2026-005',
          employeeId: 7,
          employeeNumber: 'EMP-007',
          employeeName: 'Mark Lopez',
          department: 'IT',
          position: 'IT Support',
          overtimeDate: '2026-10-03',
          startTime: '18:00',
          endTime: '22:00',
          requestedHours: 4,
          approvedHours: 0,
          overtimeType: 'Regular OT',
          reason: 'Server maintenance',
          status: 'Rejected',
          requestedAt: '2026-10-02T09:00:00',
          reviewedBy: 'Maria Santos',
          reviewedAt: '2026-10-02T14:00:00',
          remarks: 'Maintenance rescheduled.',
        },

        {
          id: 6,
          requestNumber: 'OT-2026-006',
          employeeId: 9,
          employeeNumber: 'EMP-009',
          employeeName: 'Robert Castillo',
          department: 'Finance',
          position: 'Finance Officer',
          overtimeDate: '2026-09-30',
          startTime: '17:00',
          endTime: '21:00',
          requestedHours: 4,
          approvedHours: 4,
          overtimeType: 'Regular OT',
          reason: 'Month-end closing',
          status: 'Approved',
          requestedAt: '2026-09-29T08:30:00',
          reviewedBy: 'Maria Santos',
          reviewedAt: '2026-09-29T11:20:00',
        },

        {
          id: 7,
          requestNumber: 'OT-2026-007',
          employeeId: 10,
          employeeNumber: 'EMP-010',
          employeeName: 'Grace Navarro',
          department: 'Human Resources',
          position: 'HR Staff',
          overtimeDate: '2026-10-07',
          startTime: '17:00',
          endTime: '19:00',
          requestedHours: 2,
          overtimeType: 'Regular OT',
          reason: 'Employee records preparation',
          status: 'Pending',
          requestedAt: '2026-10-06T08:45:00',
        },

        {
          id: 8,
          requestNumber: 'OT-2026-008',
          employeeId: 11,
          employeeNumber: 'EMP-011',
          employeeName: 'Leo Martinez',
          department: 'Operations',
          position: 'Driver',
          overtimeDate: '2026-09-21',
          startTime: '07:00',
          endTime: '15:00',
          requestedHours: 8,
          approvedHours: 8,
          overtimeType: 'Holiday OT',
          reason: 'Holiday client operations',
          status: 'Approved',
          requestedAt: '2026-09-19T09:00:00',
          reviewedBy: 'Maria Santos',
          reviewedAt: '2026-09-19T11:00:00',
        },

        {
          id: 9,
          requestNumber: 'OT-2026-009',
          employeeId: 12,
          employeeNumber: 'EMP-012',
          employeeName: 'Claire Villanueva',
          department: 'Operations',
          position: 'Coordinator',
          overtimeDate: '2026-10-08',
          startTime: '17:00',
          endTime: '20:00',
          requestedHours: 3,
          overtimeType: 'Regular OT',
          reason: 'Client coordination',
          status: 'For Review',
          requestedAt: '2026-10-06T09:30:00',
        },

        {
          id: 10,
          requestNumber: 'OT-2026-010',
          employeeId: 5,
          employeeNumber: 'EMP-005',
          employeeName: 'Carlo Mendoza',
          department: 'IT',
          position: 'Developer',
          overtimeDate: '2026-10-04',
          startTime: '18:00',
          endTime: '21:00',
          requestedHours: 3,
          overtimeType: 'Regular OT',
          reason: 'System deployment support',
          status: 'Cancelled',
          requestedAt: '2026-10-03T10:20:00',
          remarks: 'Deployment postponed.',
        },
      ],
    )

  const search = ref('')
  const department = ref('')
  const overtimeType = ref('')
  const status = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')

  const currentPage = ref(1)
  const perPage = ref(6)

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          requests.value.map(
            item => item.department,
          ),
        ),
      ].sort()
    })

  const overtimeTypeOptions:
    OvertimeType[] = [
      'Regular OT',
      'Rest Day OT',
      'Holiday OT',
    ]

  const statusOptions:
    OvertimeRequestStatus[] = [
      'Pending',
      'For Review',
      'Approved',
      'Rejected',
      'Cancelled',
    ]

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

          const matchesFrom =
            !dateFrom.value ||
            item.overtimeDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            item.overtimeDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesType &&
            matchesStatus &&
            matchesFrom &&
            matchesTo
          )
        },
      )
    })

  const stats =
    computed(() => {
      const data =
        filteredRequests.value

      return {
        totalRequests:
          data.length,

        pending:
          data.filter(
            item =>
              item.status === 'Pending' ||
              item.status === 'For Review',
          ).length,

        approved:
          data.filter(
            item =>
              item.status === 'Approved',
          ).length,

        approvedHours:
          data.reduce(
            (total, item) =>
              total +
              (
                item.approvedHours ??
                0
              ),
            0,
          ),
      }
    })

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
        ) * perPage.value

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