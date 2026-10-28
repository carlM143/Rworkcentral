import type {
  TimeLogApproval,
  TimeLogApprovalStatus,
  TimeLogCorrectionType,
} from '~/types/timeLogApproval'

export const useTimeLogApprovals = () => {
  const requests =
    useState<TimeLogApproval[]>(
      'time-log-approvals',
      () => [
        {
          id: 1,

          requestNumber:
            'TLC-2026-001',

          employeeId: 1,
          employeeNumber:
            'EMP-001',

          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          attendanceDate:
            '2026-10-05',

          correctionType:
            'Missing Time Out',

          originalTimeIn:
            '08:01',

          originalTimeOut:
            undefined,

          requestedTimeIn:
            '08:01',

          requestedTimeOut:
            '17:05',

          reason:
            'Forgot to time out after returning from client delivery.',

          filedAt:
            '2026-10-06T08:15:00',

          immediateSupervisor:
            'Carlos Ramirez',

          status:
            'Pending',
        },

        {
          id: 2,

          requestNumber:
            'TLC-2026-002',

          employeeId: 3,
          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Finance Staff',

          attendanceDate:
            '2026-10-05',

          correctionType:
            'Incorrect Time In',

          originalTimeIn:
            '09:12',

          originalTimeOut:
            '17:03',

          requestedTimeIn:
            '08:05',

          requestedTimeOut:
            '17:03',

          reason:
            'Biometric failed during actual morning time in.',

          filedAt:
            '2026-10-05T17:30:00',

          immediateSupervisor:
            'Robert Castillo',

          status:
            'For Review',
        },

        {
          id: 3,

          requestNumber:
            'TLC-2026-003',

          employeeId: 4,
          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Operations Staff',

          attendanceDate:
            '2026-10-04',

          correctionType:
            'Missing Time Log',

          originalTimeIn:
            undefined,

          originalTimeOut:
            undefined,

          requestedTimeIn:
            '08:00',

          requestedTimeOut:
            '17:00',

          reason:
            'Employee was assigned off-site and no biometric device was available.',

          filedAt:
            '2026-10-05T09:00:00',

          immediateSupervisor:
            'Carlos Ramirez',

          status:
            'Approved',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-05T10:30:00',

          remarks:
            'Verified against field assignment records.',
        },

        {
          id: 4,

          requestNumber:
            'TLC-2026-004',

          employeeId: 5,
          employeeNumber:
            'EMP-005',

          employeeName:
            'Carlo Mendoza',

          department:
            'IT',

          position:
            'Software Developer',

          attendanceDate:
            '2026-10-03',

          correctionType:
            'Incorrect Time Out',

          originalTimeIn:
            '08:03',

          originalTimeOut:
            '16:02',

          requestedTimeIn:
            '08:03',

          requestedTimeOut:
            '18:15',

          reason:
            'Incorrect biometric exit recorded before deployment support.',

          filedAt:
            '2026-10-04T08:20:00',

          immediateSupervisor:
            'IT Manager',

          status:
            'Approved',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-04T11:15:00',
        },

        {
          id: 5,

          requestNumber:
            'TLC-2026-005',

          employeeId: 6,
          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Staff',

          attendanceDate:
            '2026-10-02',

          correctionType:
            'Incorrect Time In & Out',

          originalTimeIn:
            '09:01',

          originalTimeOut:
            '16:10',

          requestedTimeIn:
            '08:00',

          requestedTimeOut:
            '17:05',

          reason:
            'Requested correction based on manual attendance sheet.',

          filedAt:
            '2026-10-03T09:30:00',

          immediateSupervisor:
            'Billing Supervisor',

          status:
            'Rejected',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-03T14:00:00',

          remarks:
            'Manual attendance sheet did not match supervisor records.',
        },

        {
          id: 6,

          requestNumber:
            'TLC-2026-006',

          employeeId: 7,
          employeeNumber:
            'EMP-007',

          employeeName:
            'Mark Lopez',

          department:
            'IT',

          position:
            'IT Support',

          attendanceDate:
            '2026-10-06',

          correctionType:
            'Missing Time In',

          originalTimeIn:
            undefined,

          originalTimeOut:
            '17:10',

          requestedTimeIn:
            '07:58',

          requestedTimeOut:
            '17:10',

          reason:
            'Morning biometric device was temporarily offline.',

          filedAt:
            '2026-10-06T17:25:00',

          immediateSupervisor:
            'IT Manager',

          status:
            'Pending',
        },

        {
          id: 7,

          requestNumber:
            'TLC-2026-007',

          employeeId: 8,
          employeeNumber:
            'EMP-008',

          employeeName:
            'Jenny Ramos',

          department:
            'Human Resources',

          position:
            'HR Staff',

          attendanceDate:
            '2026-10-01',

          correctionType:
            'Incorrect Time Out',

          originalTimeIn:
            '07:59',

          originalTimeOut:
            '15:25',

          requestedTimeIn:
            '07:59',

          requestedTimeOut:
            '17:00',

          reason:
            'System recorded premature logout.',

          filedAt:
            '2026-10-02T08:00:00',

          immediateSupervisor:
            'Maria Santos',

          status:
            'For Review',
        },

        {
          id: 8,

          requestNumber:
            'TLC-2026-008',

          employeeId: 9,
          employeeNumber:
            'EMP-009',

          employeeName:
            'Robert Castillo',

          department:
            'Finance',

          position:
            'Finance Officer',

          attendanceDate:
            '2026-09-30',

          correctionType:
            'Missing Time Out',

          originalTimeIn:
            '08:02',

          originalTimeOut:
            undefined,

          requestedTimeIn:
            '08:02',

          requestedTimeOut:
            '21:00',

          reason:
            'Month-end closing finished after regular office hours.',

          filedAt:
            '2026-10-01T08:30:00',

          immediateSupervisor:
            'Finance Manager',

          status:
            'Approved',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-10-01T09:45:00',

          remarks:
            'Verified with approved overtime.',
        },

        {
          id: 9,

          requestNumber:
            'TLC-2026-009',

          employeeId: 11,
          employeeNumber:
            'EMP-011',

          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Driver',

          attendanceDate:
            '2026-10-05',

          correctionType:
            'Missing Time Log',

          originalTimeIn:
            undefined,

          originalTimeOut:
            undefined,

          requestedTimeIn:
            '06:30',

          requestedTimeOut:
            '16:15',

          reason:
            'Assigned directly to client site for the entire shift.',

          filedAt:
            '2026-10-06T07:30:00',

          immediateSupervisor:
            'Carlos Ramirez',

          status:
            'For Review',
        },

        {
          id: 10,

          requestNumber:
            'TLC-2026-010',

          employeeId: 12,
          employeeNumber:
            'EMP-012',

          employeeName:
            'Claire Villanueva',

          department:
            'Operations',

          position:
            'Operations Coordinator',

          attendanceDate:
            '2026-09-29',

          correctionType:
            'Incorrect Time In',

          originalTimeIn:
            '10:02',

          originalTimeOut:
            '18:01',

          requestedTimeIn:
            '08:02',

          requestedTimeOut:
            '18:01',

          reason:
            'Correction request was withdrawn after attendance review.',

          filedAt:
            '2026-09-30T08:20:00',

          immediateSupervisor:
            'Operations Manager',

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

  const correctionType =
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

  const correctionTypeOptions:
    TimeLogCorrectionType[] = [
      'Missing Time In',
      'Missing Time Out',
      'Incorrect Time In',
      'Incorrect Time Out',
      'Incorrect Time In & Out',
      'Missing Time Log',
    ]

  const statusOptions:
    TimeLogApprovalStatus[] = [
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
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesType =
            !correctionType.value ||
            item.correctionType ===
              correctionType.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          const matchesFrom =
            !dateFrom.value ||
            item.attendanceDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            item.attendanceDate <=
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
    correctionType.value = ''
    status.value = ''
    dateFrom.value = ''
    dateTo.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      correctionType,
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
    correctionType,
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
    correctionTypeOptions,
    statusOptions,

    resetFilters,
  }
}