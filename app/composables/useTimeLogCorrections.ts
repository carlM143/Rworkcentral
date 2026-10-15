import type {
  TimeCorrectionStatus,
  TimeCorrectionType,
  TimeLogCorrectionRequest,
} from '~/types/timeLogCorrection'

/* =========================================================
   CREATE REQUEST PAYLOAD
========================================================= */

export type CreateCorrectionRequestPayload =
  Omit<
    TimeLogCorrectionRequest,
    | 'id'
    | 'requestNumber'
    | 'status'
    | 'requestedAt'
    | 'reviewedBy'
    | 'reviewedAt'
    | 'reviewNotes'
  >

export const useTimeLogCorrections = () => {
  /* =========================================================
     SHARED CORRECTION REQUESTS
  ========================================================= */

  const requests =
    useState<
      TimeLogCorrectionRequest[]
    >(
      'time-log-correction-requests',
      () => [
        {
          id: 1,

          requestNumber:
            'TCR-2026-001',

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
            '2026-09-09',

          correctionType:
            'Time In',

          originalTimeIn:
            '08:18 AM',

          originalTimeOut:
            '05:04 PM',

          requestedTimeIn:
            '08:00 AM',

          requestedTimeOut:
            '05:04 PM',

          reason:
            'Biometric device failed to capture the correct time in. Employee arrived before the scheduled start time.',

          attachment: {
            name:
              'attendance-proof.jpg',
          },

          priority:
            'Urgent',

          status:
            'Pending',

          requestedAt:
            '2026-09-09T10:20:00',

          requestedBy:
            'Juan Dela Cruz',
        },

        {
          id: 2,

          requestNumber:
            'TCR-2026-002',

          employeeId: 2,

          employeeNumber:
            'EMP-002',

          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Officer',

          attendanceDate:
            '2026-09-08',

          correctionType:
            'Time Out',

          originalTimeIn:
            '08:01 AM',

          originalTimeOut:
            '04:12 PM',

          requestedTimeIn:
            '08:01 AM',

          requestedTimeOut:
            '05:00 PM',

          reason:
            'Time out was recorded early due to biometric synchronization delay.',

          priority:
            'Normal',

          status:
            'Pending',

          requestedAt:
            '2026-09-09T09:15:00',

          requestedBy:
            'Maria Santos',
        },

        {
          id: 3,

          requestNumber:
            'TCR-2026-003',

          employeeId: 3,

          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Accountant',

          attendanceDate:
            '2026-09-07',

          correctionType:
            'Missing Log',

          requestedTimeIn:
            '08:05 AM',

          requestedTimeOut:
            '05:10 PM',

          reason:
            'No biometric record was generated during the employee shift.',

          attachment: {
            name:
              'supervisor-confirmation.pdf',
          },

          priority:
            'Urgent',

          status:
            'Pending',

          requestedAt:
            '2026-09-08T14:40:00',

          requestedBy:
            'Pedro Reyes',
        },

        {
          id: 4,

          requestNumber:
            'TCR-2026-004',

          employeeId: 4,

          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Dispatcher',

          attendanceDate:
            '2026-09-05',

          correctionType:
            'Time In & Out',

          originalTimeIn:
            '08:45 AM',

          originalTimeOut:
            '04:30 PM',

          requestedTimeIn:
            '08:00 AM',

          requestedTimeOut:
            '05:00 PM',

          reason:
            'Attendance terminal temporarily displayed an incorrect system time.',

          priority:
            'Normal',

          status:
            'Approved',

          requestedAt:
            '2026-09-06T08:30:00',

          requestedBy:
            'Ana Garcia',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-06T11:15:00',

          reviewNotes:
            'Verified against supervisor attendance record.',
        },

        {
          id: 5,

          requestNumber:
            'TCR-2026-005',

          employeeId: 5,

          employeeNumber:
            'EMP-005',

          employeeName:
            'Carlo Mendoza',

          department:
            'Operations',

          position:
            'Driver',

          attendanceDate:
            '2026-09-04',

          correctionType:
            'Time Out',

          originalTimeIn:
            '07:58 AM',

          originalTimeOut:
            '03:42 PM',

          requestedTimeIn:
            '07:58 AM',

          requestedTimeOut:
            '05:03 PM',

          reason:
            'Employee forgot to scan out after completing the scheduled trip.',

          priority:
            'Normal',

          status:
            'Approved',

          requestedAt:
            '2026-09-05T09:05:00',

          requestedBy:
            'Carlo Mendoza',

          reviewedBy:
            'Leo Martinez',

          reviewedAt:
            '2026-09-05T13:20:00',
        },

        {
          id: 6,

          requestNumber:
            'TCR-2026-006',

          employeeId: 6,

          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Officer',

          attendanceDate:
            '2026-09-03',

          correctionType:
            'Time In',

          originalTimeIn:
            '09:10 AM',

          originalTimeOut:
            '05:02 PM',

          requestedTimeIn:
            '08:00 AM',

          requestedTimeOut:
            '05:02 PM',

          reason:
            'Requested correction based on employee declaration.',

          priority:
            'Normal',

          status:
            'Rejected',

          requestedAt:
            '2026-09-04T10:45:00',

          requestedBy:
            'Angela Flores',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-04T15:10:00',

          reviewNotes:
            'Unable to verify the requested time against available attendance records.',
        },

        {
          id: 7,

          requestNumber:
            'TCR-2026-007',

          employeeId: 7,

          employeeNumber:
            'EMP-007',

          employeeName:
            'Mark Lopez',

          department:
            'Operations',

          position:
            'Driver',

          attendanceDate:
            '2026-09-09',

          correctionType:
            'Time Out',

          originalTimeIn:
            '08:03 AM',

          requestedTimeIn:
            '08:03 AM',

          requestedTimeOut:
            '05:05 PM',

          reason:
            'Missing time out after returning from an assigned client trip.',

          priority:
            'Urgent',

          status:
            'Pending',

          requestedAt:
            '2026-09-10T08:10:00',

          requestedBy:
            'Mark Lopez',
        },

        {
          id: 8,

          requestNumber:
            'TCR-2026-008',

          employeeId: 8,

          employeeNumber:
            'EMP-008',

          employeeName:
            'Jenny Ramos',

          department:
            'Human Resources',

          position:
            'HR Assistant',

          attendanceDate:
            '2026-09-02',

          correctionType:
            'Time In & Out',

          originalTimeIn:
            '08:09 AM',

          originalTimeOut:
            '04:55 PM',

          requestedTimeIn:
            '08:00 AM',

          requestedTimeOut:
            '05:00 PM',

          reason:
            'Attendance log required adjustment after schedule validation.',

          priority:
            'Normal',

          status:
            'Approved',

          requestedAt:
            '2026-09-03T11:00:00',

          requestedBy:
            'Jenny Ramos',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-03T14:20:00',
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

  const status =
    ref('')

  const correctionType =
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
              .includes(
                keyword,
              ) ||
            request.employeeNumber
              .toLowerCase()
              .includes(
                keyword,
              ) ||
            request.requestNumber
              .toLowerCase()
              .includes(
                keyword,
              )

          const matchesDepartment =
            !department.value ||
            request.department ===
              department.value

          const matchesStatus =
            !status.value ||
            request.status ===
              status.value

          const matchesType =
            !correctionType.value ||
            request.correctionType ===
              correctionType.value

          const matchesDateFrom =
            !dateFrom.value ||
            request.attendanceDate >=
              dateFrom.value

          const matchesDateTo =
            !dateTo.value ||
            request.attendanceDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus &&
            matchesType &&
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
      const now =
        new Date()

      const year =
        now.getFullYear()

      const month =
        String(
          now.getMonth() + 1,
        ).padStart(
          2,
          '0',
        )

      const monthPrefix =
        `${year}-${month}`

      return {
        pending:
          requests.value.filter(
            request =>
              request.status ===
              'Pending',
          ).length,

        approved:
          requests.value.filter(
            request =>
              request.status ===
              'Approved',
          ).length,

        rejected:
          requests.value.filter(
            request =>
              request.status ===
              'Rejected',
          ).length,

        thisMonth:
          requests.value.filter(
            request =>
              request.requestedAt
                .startsWith(
                  monthPrefix,
                ),
          ).length,
      }
    })

  /* =========================================================
     REVIEW SUMMARY
  ========================================================= */

  const reviewSummary =
    computed(() => {
      return {
        pending:
          requests.value.filter(
            request =>
              request.status ===
              'Pending',
          ).length,

        urgent:
          requests.value.filter(
            request =>
              request.status ===
                'Pending' &&
              request.priority ===
                'Urgent',
          ).length,

        withAttachment:
          requests.value.filter(
            request =>
              request.status ===
                'Pending' &&
              Boolean(
                request.attachment,
              ),
          ).length,

        missingLog:
          requests.value.filter(
            request =>
              request.status ===
                'Pending' &&
              request.correctionType ===
                'Missing Log',
          ).length,
      }
    })

  /* =========================================================
     OPTIONS
  ========================================================= */

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

  const statusOptions:
    TimeCorrectionStatus[] = [
      'Pending',
      'Approved',
      'Rejected',
    ]

  const correctionTypeOptions:
    TimeCorrectionType[] = [
      'Time In',
      'Time Out',
      'Time In & Out',
      'Missing Log',
    ]

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

      return filteredRequests.value.slice(
        start,
        start +
          perPage.value,
      )
    })

  const showingFrom =
    computed(() => {
      if (
        !filteredRequests
          .value.length
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
     CREATE CORRECTION REQUEST
  ========================================================= */

  const createCorrectionRequest = (
    data:
      CreateCorrectionRequestPayload,
  ) => {
    const nextId =
      requests.value.length
        ? Math.max(
            ...requests.value.map(
              request =>
                request.id,
            ),
          ) + 1
        : 1

    const currentYear =
      new Date()
        .getFullYear()

    const nextRequestNumber =
      `TCR-${currentYear}-${String(
        nextId,
      ).padStart(
        3,
        '0',
      )}`

    const newRequest:
      TimeLogCorrectionRequest = {
        ...data,

        id:
          nextId,

        requestNumber:
          nextRequestNumber,

        status:
          'Pending',

        requestedAt:
          new Date()
            .toISOString(),
      }

    requests.value.unshift(
      newRequest,
    )

    return newRequest
  }

  /* =========================================================
     APPROVE REQUEST
  ========================================================= */

  const approveRequest = (
    id: number,
    reviewNotes?: string,
  ) => {
    const request =
      requests.value.find(
        item =>
          item.id === id,
      )

    if (!request) {
      return false
    }

    request.status =
      'Approved'

    request.reviewedBy =
      'Maria Santos'

    request.reviewedAt =
      new Date()
        .toISOString()

    if (reviewNotes) {
      request.reviewNotes =
        reviewNotes
    }

    return true
  }

  /* =========================================================
     REJECT REQUEST
  ========================================================= */

  const rejectRequest = (
    id: number,
    reviewNotes?: string,
  ) => {
    const request =
      requests.value.find(
        item =>
          item.id === id,
      )

    if (!request) {
      return false
    }

    request.status =
      'Rejected'

    request.reviewedBy =
      'Maria Santos'

    request.reviewedAt =
      new Date()
        .toISOString()

    if (reviewNotes) {
      request.reviewNotes =
        reviewNotes
    }

    return true
  }

  /* =========================================================
     GET REQUEST BY ID
  ========================================================= */

  const getRequestById = (
    id: number,
  ) => {
    return requests.value.find(
      request =>
        request.id === id,
    )
  }

  /* =========================================================
     GET REQUESTS FOR TIME LOG
  ========================================================= */

  const getRequestsByTimeLogId = (
    timeLogId: number,
  ) => {
    return requests.value.filter(
      request =>
        request.timeLogId ===
        timeLogId,
    )
  }

  /* =========================================================
     CHECK ACTIVE REQUEST FOR TIME LOG
  ========================================================= */

  const hasPendingRequestForTimeLog = (
    timeLogId: number,
  ) => {
    return requests.value.some(
      request =>
        request.timeLogId ===
          timeLogId &&
        request.status ===
          'Pending',
    )
  }

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {
    search.value = ''

    department.value = ''

    status.value = ''

    correctionType.value = ''

    dateFrom.value = ''

    dateTo.value = ''

    currentPage.value =
      1
  }

  /* =========================================================
     WATCH FILTERS
  ========================================================= */

  watch(
    [
      search,
      department,
      status,
      correctionType,
      dateFrom,
      dateTo,
    ],
    () => {
      currentPage.value =
        1
    },
  )

  /* =========================================================
     WATCH PAGINATION
  ========================================================= */

  watch(
    totalPages,
    () => {
      if (
        currentPage.value >
        totalPages.value
      ) {
        currentPage.value =
          totalPages.value
      }
    },
  )

  /* =========================================================
     RETURN
  ========================================================= */

  return {
    requests,

    search,
    department,
    status,
    correctionType,
    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredRequests,
    paginatedRequests,

    totalPages,
    showingFrom,
    showingTo,

    stats,
    reviewSummary,

    departments,
    statusOptions,
    correctionTypeOptions,

    createCorrectionRequest,

    approveRequest,
    rejectRequest,

    getRequestById,
    getRequestsByTimeLogId,
    hasPendingRequestForTimeLog,

    resetFilters,
  }
}