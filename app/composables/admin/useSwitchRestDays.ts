import type {
  SwitchRestDayFormData,
  SwitchRestDayRecord,
  SwitchRestDayStatus,
} from '~/types/switchRestDay'

export const useSwitchRestDays = () => {
  const {
    employees,
  } = useEmployees()

  /* =========================================================
     SCHEDULE HELPERS
  ========================================================= */

  const scheduleMap:
    Record<
      number,
      {
        schedule: string
        restDay: string
      }
    > = {
      1: {
        schedule:
          'Regular Day Shift · 8:00 AM - 5:00 PM',
        restDay:
          'Sunday',
      },

      2: {
        schedule:
          'Regular Day Shift · 8:00 AM - 5:00 PM',
        restDay:
          'Sunday',
      },

      3: {
        schedule:
          'Finance Day Shift · 8:00 AM - 5:00 PM',
        restDay:
          'Sunday',
      },

      4: {
        schedule:
          'Operations Shift · 8:00 AM - 5:00 PM',
        restDay:
          'Saturday',
      },

      5: {
        schedule:
          'Operations Shift · 7:00 AM - 4:00 PM',
        restDay:
          'Sunday',
      },

      6: {
        schedule:
          'Billing Day Shift · 8:00 AM - 5:00 PM',
        restDay:
          'Sunday',
      },

      7: {
        schedule:
          'Driver Schedule · 8:00 AM - 5:00 PM',
        restDay:
          'Sunday',
      },

      8: {
        schedule:
          'Regular Day Shift · 8:00 AM - 5:00 PM',
        restDay:
          'Sunday',
      },

      9: {
        schedule:
          'Regular Day Shift · 8:00 AM - 5:00 PM',
        restDay:
          'Saturday',
      },

      10: {
        schedule:
          'HR Day Shift · 8:00 AM - 5:00 PM',
        restDay:
          'Sunday',
      },

      11: {
        schedule:
          'Operations Shift · 8:00 AM - 5:00 PM',
        restDay:
          'Saturday',
      },

      12: {
        schedule:
          'Regular Day Shift · 8:00 AM - 5:00 PM',
        restDay:
          'Sunday',
      },
    }

  const getScheduleInfo = (
    employeeId: number,
  ) => {
    return (
      scheduleMap[
        employeeId
      ] ?? {
        schedule:
          'Regular Day Shift · 8:00 AM - 5:00 PM',

        restDay:
          'Sunday',
      }
    )
  }

  /* =========================================================
     EFFECTIVE WEEK
  ========================================================= */

  const getEffectiveWeek = (
    date: string,
  ) => {
    if (!date) {
      return ''
    }

    const current =
      new Date(
        `${date}T00:00:00`,
      )

    const day =
      current.getDay()

    const start =
      new Date(current)

    start.setDate(
      current.getDate() -
        day,
    )

    const end =
      new Date(start)

    end.setDate(
      start.getDate() +
        6,
    )

    const formatter =
      new Intl.DateTimeFormat(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
        },
      )

    return `${formatter.format(
      start,
    )} - ${formatter.format(
      end,
    )}, ${end.getFullYear()}`
  }

  /* =========================================================
     MOCK DATA
  ========================================================= */

  const requests =
    useState<
      SwitchRestDayRecord[]
    >(
      'switch-rest-days',
      () => [
        {
          id: 1,

          requestNumber:
            'SRD-2026-001',

          employeeId: 1,
          employeeNumber:
            'EMP-001',
          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          currentSchedule:
            'Regular Day Shift · 8:00 AM - 5:00 PM',

          currentRestDay:
            'Sunday',

          requestedRestDay:
            'Monday',

          effectiveDate:
            '2026-09-14',

          effectiveWeek:
            'Sep 13 - Sep 19, 2026',

          reason:
            'Family commitment scheduled on Sunday. Requesting Monday as replacement rest day.',

          status:
            'Pending',

          requestedBy:
            'Juan Dela Cruz',

          requestedAt:
            '2026-09-11T08:20:00',
        },

        {
          id: 2,

          requestNumber:
            'SRD-2026-002',

          employeeId: 7,
          employeeNumber:
            'EMP-007',
          employeeName:
            'Mark Lopez',

          department:
            'Operations',

          position:
            'Driver',

          currentSchedule:
            'Driver Schedule · 8:00 AM - 5:00 PM',

          currentRestDay:
            'Sunday',

          requestedRestDay:
            'Tuesday',

          effectiveDate:
            '2026-09-15',

          effectiveWeek:
            'Sep 13 - Sep 19, 2026',

          reason:
            'Requested adjustment due to assigned client delivery on Sunday.',

          attachment: {
            name:
              'supervisor-approval.pdf',
          },

          status:
            'Approved',

          requestedBy:
            'Mark Lopez',

          requestedAt:
            '2026-09-10T15:20:00',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-10T16:05:00',

          approvalNotes:
            'Verified against the operations schedule.',
        },

        {
          id: 3,

          requestNumber:
            'SRD-2026-003',

          employeeId: 5,
          employeeNumber:
            'EMP-005',
          employeeName:
            'Carlo Mendoza',

          department:
            'Operations',

          position:
            'Driver',

          currentSchedule:
            'Operations Shift · 7:00 AM - 4:00 PM',

          currentRestDay:
            'Sunday',

          requestedRestDay:
            'Saturday',

          effectiveDate:
            '2026-09-12',

          effectiveWeek:
            'Sep 6 - Sep 12, 2026',

          reason:
            'Personal appointment requiring schedule adjustment.',

          status:
            'Rejected',

          requestedBy:
            'Carlo Mendoza',

          requestedAt:
            '2026-09-09T14:10:00',

          rejectedBy:
            'Maria Santos',

          rejectedAt:
            '2026-09-09T16:30:00',

          rejectionReason:
            'Saturday has insufficient manpower coverage for the assigned operations shift.',
        },

        {
          id: 4,

          requestNumber:
            'SRD-2026-004',

          employeeId: 3,
          employeeNumber:
            'EMP-003',
          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Accountant',

          currentSchedule:
            'Finance Day Shift · 8:00 AM - 5:00 PM',

          currentRestDay:
            'Sunday',

          requestedRestDay:
            'Monday',

          effectiveDate:
            '2026-09-07',

          effectiveWeek:
            'Sep 6 - Sep 12, 2026',

          reason:
            'Required attendance for scheduled finance reconciliation activity on Sunday.',

          status:
            'Approved',

          requestedBy:
            'Pedro Reyes',

          requestedAt:
            '2026-09-04T13:20:00',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-04T15:00:00',
        },

        {
          id: 5,

          requestNumber:
            'SRD-2026-005',

          employeeId: 6,
          employeeNumber:
            'EMP-006',
          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Officer',

          currentSchedule:
            'Billing Day Shift · 8:00 AM - 5:00 PM',

          currentRestDay:
            'Sunday',

          requestedRestDay:
            'Friday',

          effectiveDate:
            '2026-09-18',

          effectiveWeek:
            'Sep 13 - Sep 19, 2026',

          reason:
            'Requesting adjustment due to scheduled weekend billing support.',

          status:
            'Pending',

          requestedBy:
            'Angela Flores',

          requestedAt:
            '2026-09-11T09:45:00',
        },

        {
          id: 6,

          requestNumber:
            'SRD-2026-006',

          employeeId: 11,
          employeeNumber:
            'EMP-011',
          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Dispatcher',

          currentSchedule:
            'Operations Shift · 8:00 AM - 5:00 PM',

          currentRestDay:
            'Saturday',

          requestedRestDay:
            'Sunday',

          effectiveDate:
            '2026-09-13',

          effectiveWeek:
            'Sep 13 - Sep 19, 2026',

          reason:
            'Temporary rest day adjustment for operations coverage.',

          status:
            'Approved',

          requestedBy:
            'Leo Martinez',

          requestedAt:
            '2026-09-10T10:30:00',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-10T11:10:00',
        },

        {
          id: 7,

          requestNumber:
            'SRD-2026-007',

          employeeId: 10,
          employeeNumber:
            'EMP-010',
          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Assistant',

          currentSchedule:
            'HR Day Shift · 8:00 AM - 5:00 PM',

          currentRestDay:
            'Sunday',

          requestedRestDay:
            'Wednesday',

          effectiveDate:
            '2026-09-16',

          effectiveWeek:
            'Sep 13 - Sep 19, 2026',

          reason:
            'Requested rest day switch for personal commitment.',

          status:
            'Cancelled',

          requestedBy:
            'Grace Navarro',

          requestedAt:
            '2026-09-11T10:15:00',

          cancelledBy:
            'Grace Navarro',

          cancelledAt:
            '2026-09-11T11:05:00',

          cancellationReason:
            'Personal schedule changed and the request is no longer needed.',
        },

        {
          id: 8,

          requestNumber:
            'SRD-2026-008',

          employeeId: 4,
          employeeNumber:
            'EMP-004',
          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Dispatcher',

          currentSchedule:
            'Operations Shift · 8:00 AM - 5:00 PM',

          currentRestDay:
            'Saturday',

          requestedRestDay:
            'Monday',

          effectiveDate:
            '2026-09-21',

          effectiveWeek:
            'Sep 20 - Sep 26, 2026',

          reason:
            'Operations coverage is required during the regular rest day.',

          status:
            'Pending',

          requestedBy:
            'Ana Garcia',

          requestedAt:
            '2026-09-11T11:30:00',
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
            request =>
              request.department,
          ),
        ),
      ].sort()
    })

  const statusOptions:
    SwitchRestDayStatus[] = [
      'Pending',
      'Approved',
      'Rejected',
      'Cancelled',
    ]

  const restDayOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
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
        request => {
          const matchesSearch =
            !keyword ||
            request.requestNumber
              .toLowerCase()
              .includes(keyword) ||
            request.employeeName
              .toLowerCase()
              .includes(keyword) ||
            request.employeeNumber
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            request.department ===
              department.value

          const matchesStatus =
            !status.value ||
            request.status ===
              status.value

          const matchesFrom =
            !dateFrom.value ||
            request.effectiveDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            request.effectiveDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesDepartment &&
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
      const now =
        new Date()

      const month =
        now.getMonth()

      const year =
        now.getFullYear()

      const thisMonth =
        requests.value.filter(
          request => {
            const date =
              new Date(
                request.requestedAt,
              )

            return (
              date.getMonth() ===
                month &&
              date.getFullYear() ===
                year
            )
          },
        ).length

      return {
        thisMonth,

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
     CREATE
  ========================================================= */

  const createRequest = (
    data:
      SwitchRestDayFormData,
  ) => {
    if (
      data.employeeId ===
      null
    ) {
      return null
    }

    const employee =
      employees.value.find(
        item =>
          item.id ===
          data.employeeId,
      )

    if (!employee) {
      return null
    }

    const schedule =
      getScheduleInfo(
        employee.id,
      )

    if (
      data.requestedRestDay ===
      schedule.restDay
    ) {
      return null
    }

    const nextId =
      requests.value.length
        ? Math.max(
            ...requests.value.map(
              request =>
                request.id,
            ),
          ) + 1
        : 1

    const employeeName =
      [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' ')

    const year =
      new Date()
        .getFullYear()

    const request:
      SwitchRestDayRecord = {
        id:
          nextId,

        requestNumber:
          `SRD-${year}-${String(
            nextId,
          ).padStart(
            3,
            '0',
          )}`,

        employeeId:
          employee.id,

        employeeNumber:
          employee.employeeNumber,

        employeeName,

        department:
          employee.department,

        position:
          employee.position,

        currentSchedule:
          schedule.schedule,

        currentRestDay:
          schedule.restDay,

        requestedRestDay:
          data.requestedRestDay,

        effectiveDate:
          data.effectiveDate,

        effectiveWeek:
          getEffectiveWeek(
            data.effectiveDate,
          ),

        reason:
          data.reason,

        attachment:
          data.attachmentName
            ? {
                name:
                  data.attachmentName,
              }
            : undefined,

        status:
          'Pending',

        requestedBy:
          employeeName,

        requestedAt:
          new Date()
            .toISOString(),
      }

    requests.value.unshift(
      request,
    )

    return request
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  const updateRequest = (
    id: number,
    data:
      SwitchRestDayFormData,
  ) => {
    const request =
      requests.value.find(
        item =>
          item.id === id,
      )

    if (!request) {
      return null
    }

    if (
      data.employeeId ===
      null
    ) {
      return null
    }

    const employee =
      employees.value.find(
        item =>
          item.id ===
          data.employeeId,
      )

    if (!employee) {
      return null
    }

    const schedule =
      getScheduleInfo(
        employee.id,
      )

    if (
      data.requestedRestDay ===
      schedule.restDay
    ) {
      return null
    }

    request.employeeId =
      employee.id

    request.employeeNumber =
      employee.employeeNumber

    request.employeeName =
      [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' ')

    request.department =
      employee.department

    request.position =
      employee.position

    request.currentSchedule =
      schedule.schedule

    request.currentRestDay =
      schedule.restDay

    request.requestedRestDay =
      data.requestedRestDay

    request.effectiveDate =
      data.effectiveDate

    request.effectiveWeek =
      getEffectiveWeek(
        data.effectiveDate,
      )

    request.reason =
      data.reason

    request.attachment =
      data.attachmentName
        ? {
            name:
              data.attachmentName,
          }
        : undefined

    request.status =
      'Pending'

    request.approvedBy =
      undefined

    request.approvedAt =
      undefined

    request.approvalNotes =
      undefined

    request.rejectedBy =
      undefined

    request.rejectedAt =
      undefined

    request.rejectionReason =
      undefined

    return request
  }

  /* =========================================================
     APPROVE
  ========================================================= */

  const approveRequest = (
    id: number,
    notes?: string,
  ) => {
    const request =
      requests.value.find(
        item =>
          item.id === id,
      )

    if (!request) {
      return null
    }

    request.status =
      'Approved'

    request.approvedBy =
      'Maria Santos'

    request.approvedAt =
      new Date()
        .toISOString()

    request.approvalNotes =
      notes ||
      undefined

    return request
  }

  /* =========================================================
     REJECT
  ========================================================= */

  const rejectRequest = (
    id: number,
    reason: string,
  ) => {
    const request =
      requests.value.find(
        item =>
          item.id === id,
      )

    if (!request) {
      return null
    }

    request.status =
      'Rejected'

    request.rejectedBy =
      'Maria Santos'

    request.rejectedAt =
      new Date()
        .toISOString()

    request.rejectionReason =
      reason

    return request
  }

  /* =========================================================
     CANCEL
  ========================================================= */

  const cancelRequest = (
    id: number,
    reason: string,
  ) => {
    const request =
      requests.value.find(
        item =>
          item.id === id,
      )

    if (!request) {
      return null
    }

    request.status =
      'Cancelled'

    request.cancelledBy =
      'Maria Santos'

    request.cancelledAt =
      new Date()
        .toISOString()

    request.cancellationReason =
      reason

    return request
  }

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''

    department.value = ''

    status.value = ''

    dateFrom.value = ''

    dateTo.value = ''

    currentPage.value =
      1
  }

  watch(
    [
      search,
      department,
      status,
      dateFrom,
      dateTo,
    ],
    () => {
      currentPage.value =
        1
    },
  )

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

  return {
    requests,

    search,
    department,
    status,
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

    departmentOptions,
    statusOptions,
    restDayOptions,

    getScheduleInfo,
    getEffectiveWeek,

    createRequest,
    updateRequest,

    approveRequest,
    rejectRequest,
    cancelRequest,

    resetFilters,
  }
}