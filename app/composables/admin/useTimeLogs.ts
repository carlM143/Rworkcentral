import type {
  TimeLogRecord,
  TimeLogStatus,
} from '~/types/timekeeping'

export const useTimeLogs = () => {
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
      id: data.id,

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
    useState<TimeLogRecord[]>('rworkcentral-time-logs', () => [
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
    ])

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
    ref('2026-09-01')

  const dateTo =
    ref('2026-09-03')

  const currentPage =
    ref(1)

  const perPage =
    ref(8)

  /* =========================================================
     FILTERED LOGS
  ========================================================= */

  const filteredLogs =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return timeLogs.value.filter(
        log => {
          const matchesSearch =
            !keyword ||
            log.employeeName
              .toLowerCase()
              .includes(keyword) ||
            log.employeeNumber
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            log.department ===
              department.value

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

  const stats = computed(() => {
    const logs =
      filteredLogs.value

    const complete =
      logs.filter(
        log =>
          log.status ===
          'Complete',
      ).length

    const missing =
      logs.filter(
        log =>
          log.status ===
          'Missing Log',
      ).length

    const issues =
      logs.filter(
        log =>
          log.status ===
            'Incomplete' ||
          log.status ===
            'Missing Log' ||
          log.lateMinutes > 0 ||
          log.undertimeMinutes > 0,
      ).length

    return {
      total: logs.length,
      complete,
      missing,
      issues,
    }
  })

  /* =========================================================
     OPTIONS
  ========================================================= */

  const departments =
    computed(() => {
      return [
        ...new Set(
          timeLogs.value.map(
            log =>
              log.department,
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
     PAGINATION
  ========================================================= */

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredLogs.value.length /
            perPage.value,
        ),
      )
    })

  const paginatedLogs =
    computed(() => {
      const start =
        (currentPage.value - 1) *
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
        !filteredLogs.value.length
      ) {
        return 0
      }

      return (
        (currentPage.value - 1) *
          perPage.value +
        1
      )
    })

  const showingTo =
    computed(() => {
      return Math.min(
        currentPage.value *
          perPage.value,

        filteredLogs.value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    status.value = ''
    dateFrom.value =
      '2026-09-01'
    dateTo.value =
      '2026-09-03'

    currentPage.value = 1
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
      currentPage.value = 1
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
    timeLogs,

    search,
    department,
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

    departments,
    statusOptions,

    resetFilters,
  }
}