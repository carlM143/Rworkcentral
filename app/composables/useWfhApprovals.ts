import type {
  WfhApproval,
  WfhApprovalStatus,
  WfhRequestType,
} from '~/types/wfhApproval'

export const useWfhApprovals = () => {
  const requests =
    useState<WfhApproval[]>(
      'wfh-approvals',
      () => [
        {
          id: 1,

          requestNumber:
            'WFH-2026-001',

          employeeId: 5,
          employeeNumber:
            'EMP-005',

          employeeName:
            'Carlo Mendoza',

          department:
            'IT',

          position:
            'Software Developer',

          requestType:
            'Full Day WFH',

          startDate:
            '2026-10-08',

          endDate:
            '2026-10-08',

          totalDays: 1,

          workLocation:
            'Home',

          reason:
            'Home internet maintenance appointment while continuing development tasks remotely.',

          workPlan:
            'Continue API integration, bug fixing and code review for assigned HRIS modules.',

          filedAt:
            '2026-10-06T08:20:00',

          immediateSupervisor:
            'IT Manager',

          status:
            'Pending',
        },

        {
          id: 2,

          requestNumber:
            'WFH-2026-002',

          employeeId: 7,
          employeeNumber:
            'EMP-007',

          employeeName:
            'Mark Lopez',

          department:
            'IT',

          position:
            'IT Support',

          requestType:
            'Half Day WFH',

          startDate:
            '2026-10-09',

          endDate:
            '2026-10-09',

          totalDays: 0.5,

          workLocation:
            'Home',

          reason:
            'Personal appointment in the morning.',

          workPlan:
            'Remote user support, ticket monitoring and documentation updates during the afternoon.',

          filedAt:
            '2026-10-06T09:15:00',

          immediateSupervisor:
            'IT Manager',

          status:
            'For Review',
        },

        {
          id: 3,

          requestNumber:
            'WFH-2026-003',

          employeeId: 2,
          employeeNumber:
            'EMP-002',

          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Administrator',

          requestType:
            'Hybrid Schedule',

          startDate:
            '2026-10-12',

          endDate:
            '2026-10-14',

          totalDays: 2,

          workLocation:
            'Home / Main Office',

          reason:
            'Scheduled remote HR documentation and reporting work.',

          workPlan:
            'Prepare employee reports, review HR documents and conduct scheduled online meetings.',

          filedAt:
            '2026-10-05T13:30:00',

          immediateSupervisor:
            'General Manager',

          status:
            'Approved',

          reviewedBy:
            'General Manager',

          reviewedAt:
            '2026-10-05T15:00:00',

          remarks:
            'Approved hybrid schedule.',
        },

        {
          id: 4,

          requestNumber:
            'WFH-2026-004',

          employeeId: 3,
          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Finance Staff',

          requestType:
            'Full Day WFH',

          startDate:
            '2026-10-10',

          endDate:
            '2026-10-10',

          totalDays: 1,

          workLocation:
            'Home',

          reason:
            'Transportation issue due to scheduled vehicle maintenance.',

          workPlan:
            'Continue payroll reconciliation and financial report preparation remotely.',

          filedAt:
            '2026-10-05T10:30:00',

          immediateSupervisor:
            'Robert Castillo',

          status:
            'Rejected',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-05T14:20:00',

          remarks:
            'On-site finance documents required for the requested date.',
        },

        {
          id: 5,

          requestNumber:
            'WFH-2026-005',

          employeeId: 8,
          employeeNumber:
            'EMP-008',

          employeeName:
            'Jenny Ramos',

          department:
            'Human Resources',

          position:
            'HR Staff',

          requestType:
            'Full Day WFH',

          startDate:
            '2026-10-15',

          endDate:
            '2026-10-15',

          totalDays: 1,

          workLocation:
            'Home',

          reason:
            'Family-related home arrangement requiring presence at home.',

          workPlan:
            'Recruitment screening, employee records update and HR documentation.',

          filedAt:
            '2026-10-06T10:00:00',

          immediateSupervisor:
            'Maria Santos',

          status:
            'Pending',
        },

        {
          id: 6,

          requestNumber:
            'WFH-2026-006',

          employeeId: 6,
          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Staff',

          requestType:
            'Half Day WFH',

          startDate:
            '2026-10-11',

          endDate:
            '2026-10-11',

          totalDays: 0.5,

          workLocation:
            'Home',

          reason:
            'Medical appointment in the morning.',

          workPlan:
            'Billing verification and document preparation remotely in the afternoon.',

          filedAt:
            '2026-10-06T07:45:00',

          immediateSupervisor:
            'Billing Supervisor',

          status:
            'For Review',
        },

        {
          id: 7,

          requestNumber:
            'WFH-2026-007',

          employeeId: 10,
          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Staff',

          requestType:
            'Full Day WFH',

          startDate:
            '2026-10-03',

          endDate:
            '2026-10-03',

          totalDays: 1,

          workLocation:
            'Home',

          reason:
            'Remote document processing assignment.',

          workPlan:
            'Update employee master records and prepare onboarding documentation.',

          filedAt:
            '2026-10-02T09:00:00',

          immediateSupervisor:
            'Maria Santos',

          status:
            'Approved',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-02T10:00:00',
        },

        {
          id: 8,

          requestNumber:
            'WFH-2026-008',

          employeeId: 9,
          employeeNumber:
            'EMP-009',

          employeeName:
            'Robert Castillo',

          department:
            'Finance',

          position:
            'Finance Officer',

          requestType:
            'Full Day WFH',

          startDate:
            '2026-10-16',

          endDate:
            '2026-10-16',

          totalDays: 1,

          workLocation:
            'Home',

          reason:
            'Remote report preparation and financial analysis.',

          workPlan:
            'Finalize management reports and financial reconciliation remotely.',

          filedAt:
            '2026-10-06T11:00:00',

          immediateSupervisor:
            'Finance Manager',

          status:
            'For Review',
        },

        {
          id: 9,

          requestNumber:
            'WFH-2026-009',

          employeeId: 12,
          employeeNumber:
            'EMP-012',

          employeeName:
            'Claire Villanueva',

          department:
            'Operations',

          position:
            'Operations Coordinator',

          requestType:
            'Hybrid Schedule',

          startDate:
            '2026-10-19',

          endDate:
            '2026-10-21',

          totalDays: 2,

          workLocation:
            'Home / Client Site',

          reason:
            'Client coordination can be completed remotely for selected dates.',

          workPlan:
            'Coordinate manpower deployment, prepare client updates and attend online meetings.',

          filedAt:
            '2026-10-06T11:30:00',

          immediateSupervisor:
            'Operations Manager',

          status:
            'Pending',
        },

        {
          id: 10,

          requestNumber:
            'WFH-2026-010',

          employeeId: 4,
          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Operations Staff',

          requestType:
            'Full Day WFH',

          startDate:
            '2026-10-07',

          endDate:
            '2026-10-07',

          totalDays: 1,

          workLocation:
            'Home',

          reason:
            'Request no longer required.',

          workPlan:
            'Administrative operations support.',

          filedAt:
            '2026-10-05T16:00:00',

          immediateSupervisor:
            'Carlos Ramirez',

          status:
            'Cancelled',

          remarks:
            'Cancelled by employee.',
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

  const requestType =
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

  const requestTypeOptions:
    WfhRequestType[] = [
      'Full Day WFH',
      'Half Day WFH',
      'Hybrid Schedule',
    ]

  const statusOptions:
    WfhApprovalStatus[] = [
      'Pending',
      'For Review',
      'Approved',
      'Rejected',
      'Cancelled',
    ]

  /* =========================================================
     FILTERED
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
              .includes(keyword) ||
            item.workLocation
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesType =
            !requestType.value ||
            item.requestType ===
              requestType.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          const matchesFrom =
            !dateFrom.value ||
            item.startDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            item.endDate <=
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

        approvedDays:
          data
            .filter(
              item =>
                item.status ===
                'Approved',
            )
            .reduce(
              (
                total,
                item,
              ) =>
                total +
                item.totalDays,
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
    requestType.value = ''
    status.value = ''
    dateFrom.value = ''
    dateTo.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      requestType,
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

  
  /* =========================================
     APPROVAL ACTIONS
  ========================================= */

  const approveRequest = (
    request: WfhApproval,
    remarks = '',
  ): boolean => {
    const index = requests.value.findIndex(
      item => item.id === request.id,
    )

    if (index === -1) return false

    const current = requests.value[index]

    if (
      !current ||
      !['Pending', 'For Review'].includes(current.status)
    ) {
      return false
    }

    requests.value[index] = {
      ...current,
      status: 'Approved',
      reviewedBy: 'Maria Santos',
      reviewedAt: new Date().toISOString(),
      remarks: remarks || 'WFH request approved.',
    }

    return true
  }

  const rejectRequest = (
    request: WfhApproval,
    remarks: string,
  ): boolean => {
    if (!remarks.trim()) return false

    const index = requests.value.findIndex(
      item => item.id === request.id,
    )

    if (index === -1) return false

    const current = requests.value[index]

    if (
      !current ||
      !['Pending', 'For Review'].includes(current.status)
    ) {
      return false
    }

    requests.value[index] = {
      ...current,
      status: 'Rejected',
      reviewedBy: 'Maria Santos',
      reviewedAt: new Date().toISOString(),
      remarks: remarks.trim(),
    }

    return true
  }

  const getApprovedRequests = computed(() => {
    return requests.value.filter(
      item => item.status === 'Approved',
    )
  })

  return {
    requests,
    approveRequest,
    rejectRequest,
    getApprovedRequests,
    search,
    department,
    requestType,
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
    requestTypeOptions,
    statusOptions,

    resetFilters,
  }
}