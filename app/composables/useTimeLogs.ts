import type {
  TimeLogRecord,
  TimeLogStatus,
} from '~/types/timekeeping'

import type {
  TimeLogAttendanceSource,
  TimeLogViewRecord,
  TimeLogWorkScope,
} from '~/types/timeLogView'

export const useTimeLogs = () => {
  const {
    employees,
  } = useEmployees()

  const {
    assignments,
  } = useClientEmployeeAssignments()

  const {
    clients:
      clientDirectoryRecords,
  } = useClientDirectory()

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

  /* =========================================================
     CREATE BASE TIME LOG
  ========================================================= */

  const createTimeLog = (
    data: {
      id: number

      employeeId: number

      date: string

      timeIn?: string
      breakOut?: string
      breakIn?: string
      timeOut?: string

      lateMinutes?: number
      undertimeMinutes?: number

      hoursWorked?: number

      status: TimeLogStatus
    },
  ): TimeLogRecord => {
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

      employeeId:
        employee.id,

      employeeNumber:
        employee.employeeNumber,

      employeeName:
        [
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

      date:
        data.date,

      schedule:
        employee.workSchedule ||
        '8:00 AM - 5:00 PM',

      timeIn:
        data.timeIn,

      breakOut:
        data.breakOut,

      breakIn:
        data.breakIn,

      timeOut:
        data.timeOut,

      lateMinutes:
        data.lateMinutes ?? 0,

      undertimeMinutes:
        data.undertimeMinutes ?? 0,

      hoursWorked:
        data.hoursWorked,

      status:
        data.status,
    }
  }

  /* =========================================================
     MOCK TIME LOGS
  ========================================================= */

  const timeLogs =
    useState<TimeLogRecord[]>(
      'employee-time-logs',
      () => [
        createTimeLog({
          id: 1,
          employeeId: 1,
          date: '2026-09-03',
          timeIn: '7:55 AM',
          breakOut: '12:00 PM',
          breakIn: '1:00 PM',
          timeOut: '5:02 PM',
          hoursWorked: 8.12,
          status: 'Complete',
        }),

        createTimeLog({
          id: 2,
          employeeId: 2,
          date: '2026-09-03',
          timeIn: '8:08 AM',
          breakOut: '12:03 PM',
          breakIn: '1:00 PM',
          timeOut: '5:00 PM',
          lateMinutes: 8,
          hoursWorked: 7.87,
          status: 'Complete',
        }),

        createTimeLog({
          id: 3,
          employeeId: 3,
          date: '2026-09-03',
          timeIn: '7:58 AM',
          breakOut: '12:00 PM',
          breakIn: '1:00 PM',
          timeOut: '5:05 PM',
          hoursWorked: 8.12,
          status: 'Complete',
        }),

        createTimeLog({
          id: 4,
          employeeId: 4,
          date: '2026-09-03',
          status: 'Missing Log',
        }),

        createTimeLog({
          id: 5,
          employeeId: 5,
          date: '2026-09-03',
          timeIn: '7:51 AM',
          breakOut: '12:00 PM',
          breakIn: '1:00 PM',
          timeOut: '5:01 PM',
          hoursWorked: 8.17,
          status: 'Complete',
        }),

        createTimeLog({
          id: 6,
          employeeId: 6,
          date: '2026-09-03',
          timeIn: '7:59 AM',
          breakOut: '12:00 PM',
          breakIn: '1:00 PM',
          timeOut: '5:10 PM',
          hoursWorked: 8.18,
          status: 'Complete',
        }),

        createTimeLog({
          id: 7,
          employeeId: 7,
          date: '2026-09-03',
          timeIn: '8:15 AM',
          breakOut: '12:00 PM',
          breakIn: '1:00 PM',
          lateMinutes: 15,
          status: 'Incomplete',
        }),

        createTimeLog({
          id: 8,
          employeeId: 8,
          date: '2026-09-03',
          timeIn: '7:52 AM',
          breakOut: '12:00 PM',
          breakIn: '1:00 PM',
          timeOut: '5:00 PM',
          hoursWorked: 8.13,
          status: 'Complete',
        }),

        createTimeLog({
          id: 9,
          employeeId: 9,
          date: '2026-09-02',
          timeIn: '7:48 AM',
          breakOut: '12:00 PM',
          breakIn: '1:00 PM',
          timeOut: '5:03 PM',
          hoursWorked: 8.25,
          status: 'Complete',
        }),

        createTimeLog({
          id: 10,
          employeeId: 10,
          date: '2026-09-02',
          status: 'On Leave',
        }),

        createTimeLog({
          id: 11,
          employeeId: 11,
          date: '2026-09-02',
          timeIn: '7:45 AM',
          breakOut: '12:00 PM',
          breakIn: '1:00 PM',
          timeOut: '4:40 PM',
          undertimeMinutes: 20,
          hoursWorked: 7.92,
          status: 'Complete',
        }),

        createTimeLog({
          id: 12,
          employeeId: 12,
          date: '2026-09-02',
          timeIn: '7:50 AM',
          breakOut: '12:00 PM',
          breakIn: '1:00 PM',
          timeOut: '5:08 PM',
          hoursWorked: 8.30,
          status: 'Complete',
        }),

        createTimeLog({
          id: 13,
          employeeId: 1,
          date: '2026-09-01',
          timeIn: '8:04 AM',
          breakOut: '12:00 PM',
          breakIn: '1:00 PM',
          timeOut: '5:00 PM',
          lateMinutes: 4,
          hoursWorked: 7.93,
          status: 'Complete',
        }),

        createTimeLog({
          id: 14,
          employeeId: 2,
          date: '2026-09-01',
          timeIn: '7:55 AM',
          breakOut: '12:00 PM',
          breakIn: '1:00 PM',
          timeOut: '5:02 PM',
          hoursWorked: 8.12,
          status: 'Complete',
        }),

        createTimeLog({
          id: 15,
          employeeId: 3,
          date: '2026-09-01',
          status: 'Rest Day',
        }),
      ],
    )

  /* =========================================================
     ACTIVE / HISTORICAL CLIENT ASSIGNMENT
  ========================================================= */

  const getAssignmentForDate = (
    employeeId: number,
    date: string,
  ) => {
    return assignments.value
      .filter(
        assignment => {
          if (
            assignment.employeeId !==
            employeeId
          ) {
            return false
          }

          /*
          Pending assignments are not yet effective.
          */

          if (
            assignment.status ===
            'Pending'
          ) {
            return false
          }

          /*
          Assignment must already have started.
          */

          if (
            assignment.assignmentDate >
            date
          ) {
            return false
          }

          /*
          If there is an end date,
          attendance must still fall inside it.
          */

          if (
            assignment.endDate &&
            date >
              assignment.endDate
          ) {
            return false
          }

          return true
        },
      )
      .sort(
        (
          first,
          second,
        ) =>
          second.assignmentDate
            .localeCompare(
              first.assignmentDate,
            ),
      )[0]
  }

  /* =========================================================
     WORK LOCATION
  ========================================================= */

  const getClientLocation = (
    clientId: number,
    clientName: string,
  ) => {
    const clientRecord =
      clientDirectoryRecords.value.find(
        item =>
          item.id ===
          clientId,
      )

    return (
      clientRecord?.address ||
      `${clientName} - Client Site`
    )
  }

  /* =========================================================
     ATTENDANCE SOURCE
  ========================================================= */

  const getAttendanceSource = (
    workScope:
      TimeLogWorkScope,
  ): TimeLogAttendanceSource => {
    if (
      workScope ===
      'Client Assigned'
    ) {
      return 'Client Biometric'
    }

    return 'RWorkCentral Biometric'
  }

  /* =========================================================
     ENRICH TIME LOGS
  ========================================================= */

  const viewLogs =
    computed<
      TimeLogViewRecord[]
    >(() => {
      return timeLogs.value.map(
        log => {
          const assignment =
            getAssignmentForDate(
              log.employeeId,
              log.date,
            )

          if (assignment) {
            return {
              ...log,

              workScope:
                'Client Assigned',

              clientId:
                assignment.clientId,

              clientCode:
                assignment.clientCode,

              clientName:
                assignment.clientName,

              workLocation:
                getClientLocation(
                  assignment.clientId,
                  assignment.clientName,
                ),

              attendanceSource:
                getAttendanceSource(
                  'Client Assigned',
                ),
            }
          }

          return {
            ...log,

            workScope:
              'Internal',

            workLocation:
              'RWorkCentral - Main Branch',

            attendanceSource:
              getAttendanceSource(
                'Internal',
              ),
          }
        },
      )
    })

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const workScope =
    ref<
      '' |
      TimeLogWorkScope
    >('')

  const client =
    ref('')

  const workLocation =
    ref('')

  const department =
    ref('')

  const attendanceSource =
    ref('')

  const status =
    ref('')

  const dateFrom =
    ref('2026-09-01')

  const dateTo =
    ref('2026-09-03')

  /* =========================================================
     PAGINATION
  ========================================================= */

  const currentPage =
    ref(1)

  const perPage =
    ref(8)

  /* =========================================================
     OPTIONS
  ========================================================= */

  const departments =
    computed(() => {
      return [
        ...new Set(
          viewLogs.value.map(
            log =>
              log.department,
          ),
        ),
      ].sort()
    })

  const clients =
    computed(() => {
      return [
        ...new Set(
          viewLogs.value
            .map(
              log =>
                log.clientName,
            )
            .filter(
              (
                value,
              ): value is string =>
                Boolean(value),
            ),
        ),
      ].sort()
    })

  const workLocations =
    computed(() => {
      return [
        ...new Set(
          viewLogs.value.map(
            log =>
              log.workLocation,
          ),
        ),
      ].sort()
    })

  const attendanceSources =
    computed(() => {
      return [
        ...new Set(
          viewLogs.value.map(
            log =>
              log.attendanceSource,
          ),
        ),
      ].sort()
    })

  const statusOptions:
    TimeLogStatus[] = [
      'Complete',
      'Incomplete',
      'Missing Log',
      'On Leave',
      'Rest Day',
    ]

  /* =========================================================
     SCOPE COUNTS
  ========================================================= */

  const scopeCounts =
    computed(() => {
      return {
        all:
          viewLogs.value.length,

        internal:
          viewLogs.value.filter(
            log =>
              log.workScope ===
              'Internal',
          ).length,

        clientAssigned:
          viewLogs.value.filter(
            log =>
              log.workScope ===
              'Client Assigned',
          ).length,
      }
    })

  /* =========================================================
     FILTERED LOGS
  ========================================================= */

  const filteredLogs =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return viewLogs.value.filter(
        log => {
          const searchable =
            [
              log.employeeName,
              log.employeeNumber,
              log.department,
              log.position,
              log.clientCode ?? '',
              log.clientName ?? '',
              log.workLocation,
              log.attendanceSource,
            ]
              .join(' ')
              .toLowerCase()

          const matchesSearch =
            !keyword ||
            searchable.includes(
              keyword,
            )

          const matchesScope =
            !workScope.value ||
            log.workScope ===
              workScope.value

          const matchesClient =
            !client.value ||
            log.clientName ===
              client.value

          const matchesLocation =
            !workLocation.value ||
            log.workLocation ===
              workLocation.value

          const matchesDepartment =
            !department.value ||
            log.department ===
              department.value

          const matchesSource =
            !attendanceSource.value ||
            log.attendanceSource ===
              attendanceSource.value

          const matchesStatus =
            !status.value ||
            log.status ===
              status.value

          const matchesFrom =
            !dateFrom.value ||
            log.date >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            log.date <=
              dateTo.value

          return (
            matchesSearch &&
            matchesScope &&
            matchesClient &&
            matchesLocation &&
            matchesDepartment &&
            matchesSource &&
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
      const records =
        filteredLogs.value

      const complete =
        records.filter(
          log =>
            log.status ===
            'Complete',
        ).length

      const missing =
        records.filter(
          log =>
            log.status ===
            'Missing Log',
        ).length

      const issues =
        records.filter(
          log =>
            log.status ===
              'Incomplete' ||
            log.status ===
              'Missing Log' ||
            log.lateMinutes >
              0 ||
            log.undertimeMinutes >
              0,
        ).length

      return {
        total:
          records.length,

        complete,

        missing,

        issues,
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
          filteredLogs.value
            .length /
            perPage.value,
        ),
      )
    })

  const paginatedLogs =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredLogs.value.slice(
        start,
        start +
          perPage.value,
      )
    })

  const showingFrom =
    computed(() => {
      if (
        filteredLogs.value
          .length ===
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

        filteredLogs.value
          .length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value =
      ''

    workScope.value =
      ''

    client.value =
      ''

    workLocation.value =
      ''

    department.value =
      ''

    attendanceSource.value =
      ''

    status.value =
      ''

    dateFrom.value =
      '2026-09-01'

    dateTo.value =
      '2026-09-03'

    currentPage.value =
      1
  }

  /* =========================================================
     FILTER RELATIONSHIP
  ========================================================= */

  watch(
    workScope,
    value => {
      if (
        value ===
        'Internal'
      ) {
        client.value =
          ''
      }
    },
  )

  watch(
    client,
    value => {
      if (value) {
        workScope.value =
          'Client Assigned'
      }
    },
  )

  /* =========================================================
     WATCH FILTERS
  ========================================================= */

  watch(
    [
      search,
      workScope,
      client,
      workLocation,
      department,
      attendanceSource,
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
    timeLogs,
    viewLogs,

    search,

    workScope,
    client,
    workLocation,

    department,
    attendanceSource,
    status,

    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredLogs,
    paginatedLogs,

    totalPages,
    showingFrom,
    showingTo,

    stats,
    scopeCounts,

    departments,
    clients,
    workLocations,
    attendanceSources,
    statusOptions,

    resetFilters,
  }
}