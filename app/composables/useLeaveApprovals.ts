import type {
  LeaveApproval,
  LeaveApprovalStatus,
  LeaveApprovalType,
} from '~/types/leaveApproval'

export const useLeaveApprovals = () => {
  const requests =
    useState<LeaveApproval[]>(
      'leave-approvals',
      () => [
        {
          id: 1,

          requestNumber:
            'LV-2026-001',

          employeeId: 1,
          employeeNumber:
            'EMP-001',

          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          leaveType:
            'Vacation Leave',

          startDate:
            '2026-10-12',

          endDate:
            '2026-10-13',

          totalDays: 2,

          availableBalance: 9,

          reason:
            'Personal appointment and family matters.',

          filedAt:
            '2026-10-05T09:15:00',

          status:
            'Pending',

          immediateSupervisor:
            'Carlos Ramirez',
        },

        {
          id: 2,

          requestNumber:
            'LV-2026-002',

          employeeId: 3,
          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Finance Staff',

          leaveType:
            'Sick Leave',

          startDate:
            '2026-10-07',

          endDate:
            '2026-10-08',

          totalDays: 2,

          availableBalance: 4,

          reason:
            'Medical consultation and recovery.',

          filedAt:
            '2026-10-06T08:30:00',

          status:
            'For Review',

          immediateSupervisor:
            'Robert Castillo',
        },

        {
          id: 3,

          requestNumber:
            'LV-2026-003',

          employeeId: 4,
          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Operations Staff',

          leaveType:
            'Emergency Leave',

          startDate:
            '2026-10-06',

          endDate:
            '2026-10-06',

          totalDays: 1,

          availableBalance: 4,

          reason:
            'Urgent family emergency.',

          filedAt:
            '2026-10-06T07:15:00',

          status:
            'Approved',

          immediateSupervisor:
            'Carlos Ramirez',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-06T07:45:00',

          remarks:
            'Approved due to emergency situation.',
        },

        {
          id: 4,

          requestNumber:
            'LV-2026-004',

          employeeId: 6,
          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Staff',

          leaveType:
            'Vacation Leave',

          startDate:
            '2026-10-19',

          endDate:
            '2026-10-21',

          totalDays: 3,

          availableBalance: 8,

          reason:
            'Scheduled family vacation.',

          filedAt:
            '2026-10-04T10:20:00',

          status:
            'Pending',

          immediateSupervisor:
            'Billing Supervisor',
        },

        {
          id: 5,

          requestNumber:
            'LV-2026-005',

          employeeId: 7,
          employeeNumber:
            'EMP-007',

          employeeName:
            'Mark Lopez',

          department:
            'IT',

          position:
            'IT Support',

          leaveType:
            'Vacation Leave',

          startDate:
            '2026-10-15',

          endDate:
            '2026-10-16',

          totalDays: 2,

          availableBalance: 3,

          reason:
            'Personal leave.',

          filedAt:
            '2026-10-02T13:00:00',

          status:
            'Rejected',

          immediateSupervisor:
            'IT Manager',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-03T09:30:00',

          remarks:
            'Insufficient manpower coverage for requested dates.',
        },

        {
          id: 6,

          requestNumber:
            'LV-2026-006',

          employeeId: 8,
          employeeNumber:
            'EMP-008',

          employeeName:
            'Jenny Ramos',

          department:
            'Human Resources',

          position:
            'HR Staff',

          leaveType:
            'Special Leave',

          startDate:
            '2026-10-22',

          endDate:
            '2026-10-22',

          totalDays: 1,

          availableBalance: 2,

          reason:
            'Special family event.',

          filedAt:
            '2026-10-05T15:00:00',

          status:
            'For Review',

          immediateSupervisor:
            'Maria Santos',
        },

        {
          id: 7,

          requestNumber:
            'LV-2026-007',

          employeeId: 10,
          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Staff',

          leaveType:
            'Sick Leave',

          startDate:
            '2026-10-03',

          endDate:
            '2026-10-03',

          totalDays: 1,

          availableBalance: 5,

          reason:
            'Medical checkup.',

          filedAt:
            '2026-10-02T08:00:00',

          status:
            'Approved',

          immediateSupervisor:
            'Maria Santos',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-02T09:00:00',
        },

        {
          id: 8,

          requestNumber:
            'LV-2026-008',

          employeeId: 11,
          employeeNumber:
            'EMP-011',

          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Driver',

          leaveType:
            'Unpaid Leave',

          startDate:
            '2026-10-24',

          endDate:
            '2026-10-25',

          totalDays: 2,

          availableBalance: 0,

          reason:
            'Personal commitment.',

          filedAt:
            '2026-10-06T09:20:00',

          status:
            'Pending',

          immediateSupervisor:
            'Carlos Ramirez',
        },

        {
          id: 9,

          requestNumber:
            'LV-2026-009',

          employeeId: 12,
          employeeNumber:
            'EMP-012',

          employeeName:
            'Claire Villanueva',

          department:
            'Operations',

          position:
            'Operations Coordinator',

          leaveType:
            'Vacation Leave',

          startDate:
            '2026-10-28',

          endDate:
            '2026-10-30',

          totalDays: 3,

          availableBalance: 10,

          reason:
            'Scheduled family trip.',

          filedAt:
            '2026-10-01T09:45:00',

          status:
            'For Review',

          immediateSupervisor:
            'Operations Manager',
        },

        {
          id: 10,

          requestNumber:
            'LV-2026-010',

          employeeId: 5,
          employeeNumber:
            'EMP-005',

          employeeName:
            'Carlo Mendoza',

          department:
            'IT',

          position:
            'Software Developer',

          leaveType:
            'Vacation Leave',

          startDate:
            '2026-10-10',

          endDate:
            '2026-10-10',

          totalDays: 1,

          availableBalance: 0,

          reason:
            'Personal leave.',

          filedAt:
            '2026-10-04T11:00:00',

          status:
            'Cancelled',

          immediateSupervisor:
            'IT Manager',

          remarks:
            'Request cancelled by employee.',
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

  const leaveType =
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

  const leaveTypeOptions:
    LeaveApprovalType[] = [
      'Vacation Leave',
      'Sick Leave',
      'Emergency Leave',
      'Special Leave',
      'Maternity Leave',
      'Paternity Leave',
      'Unpaid Leave',
    ]

  const statusOptions:
    LeaveApprovalStatus[] = [
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

          const matchesLeaveType =
            !leaveType.value ||
            item.leaveType ===
              leaveType.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          const matchesDateFrom =
            !dateFrom.value ||
            item.startDate >=
              dateFrom.value

          const matchesDateTo =
            !dateTo.value ||
            item.endDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesLeaveType &&
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

        rejected:
          data.filter(
            item =>
              item.status ===
              'Rejected',
          ).length,
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
    leaveType.value = ''
    status.value = ''
    dateFrom.value = ''
    dateTo.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      leaveType,
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
    leaveType,
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
    leaveTypeOptions,
    statusOptions,

    resetFilters,
  }
}