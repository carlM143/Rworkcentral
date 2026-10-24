import type {
  AttendanceRecord,
  AttendanceStatus,
} from '~/types/timekeeping'

export const useTimekeeping = () => {
  const {
    employees,
  } = useEmployees()

  /* =========================================================
     CURRENT DATE
  ========================================================= */

  const getLocalDateKey = () => {
    const now = new Date()

    const offset =
      now.getTimezoneOffset()

    return new Date(
      now.getTime() -
      offset * 60 * 1000,
    )
      .toISOString()
      .slice(0, 10)
  }

  const todayKey =
    getLocalDateKey()

  /* =========================================================
     HELPER
  ========================================================= */

  const employeeById = (
    id: number,
  ) => {
    return employees.value.find(
      employee =>
        employee.id === id,
    )
  }

  const createRecord = (
    data: {
      id: number
      employeeId: number
      timeIn?: string
      timeOut?: string
      lateMinutes?: number
      undertimeMinutes?: number
      status: AttendanceStatus
    },
  ): AttendanceRecord => {
    const employee =
      employeeById(data.employeeId)

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

      date: todayKey,

      schedule:
        employee.workSchedule ||
        '8:00 AM - 5:00 PM',

      timeIn:
        data.timeIn,

      timeOut:
        data.timeOut,

      lateMinutes:
        data.lateMinutes ?? 0,

      undertimeMinutes:
        data.undertimeMinutes ?? 0,

      status:
        data.status,
    }
  }

  /* =========================================================
     MOCK ATTENDANCE
  ========================================================= */

  const attendanceRecords =
    ref<AttendanceRecord[]>([
      createRecord({
        id: 1,
        employeeId: 1,
        timeIn: '7:55 AM',
        timeOut: '5:02 PM',
        status: 'Present',
      }),

      createRecord({
        id: 2,
        employeeId: 2,
        timeIn: '8:08 AM',
        timeOut: '5:00 PM',
        lateMinutes: 8,
        status: 'Late',
      }),

      createRecord({
        id: 3,
        employeeId: 3,
        timeIn: '7:58 AM',
        timeOut: '5:05 PM',
        status: 'Present',
      }),

      createRecord({
        id: 4,
        employeeId: 4,
        status: 'Absent',
      }),

      createRecord({
        id: 5,
        employeeId: 5,
        timeIn: '7:51 AM',
        timeOut: '5:01 PM',
        status: 'Present',
      }),

      createRecord({
        id: 6,
        employeeId: 6,
        timeIn: '7:59 AM',
        timeOut: '5:10 PM',
        status: 'Present',
      }),

      createRecord({
        id: 7,
        employeeId: 7,
        timeIn: '8:15 AM',
        lateMinutes: 15,
        status: 'Late',
      }),

      createRecord({
        id: 8,
        employeeId: 8,
        timeIn: '7:52 AM',
        timeOut: '5:00 PM',
        status: 'Present',
      }),

      createRecord({
        id: 9,
        employeeId: 9,
        timeIn: '7:48 AM',
        timeOut: '5:03 PM',
        status: 'Present',
      }),

      createRecord({
        id: 10,
        employeeId: 10,
        status: 'On Leave',
      }),

      createRecord({
        id: 11,
        employeeId: 11,
        timeIn: '7:45 AM',
        status: 'Present',
      }),

      createRecord({
        id: 12,
        employeeId: 12,
        timeIn: '7:50 AM',
        timeOut: '5:08 PM',
        status: 'Present',
      }),
    ])

  /* =========================================================
     FILTERS
  ========================================================= */

  const search = ref('')
  const department = ref('')
  const status = ref('')
  const date = ref(todayKey)

  const currentPage = ref(1)
  const perPage = ref(8)

  const filteredRecords =
    computed(() => {
      const keyword =
        search.value
          .toLowerCase()
          .trim()

      return attendanceRecords.value.filter(
        record => {
          const matchesSearch =
            !keyword ||
            record.employeeName
              .toLowerCase()
              .includes(keyword) ||
            record.employeeNumber
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            record.department ===
              department.value

          const matchesStatus =
            !status.value ||
            record.status ===
              status.value

          const matchesDate =
            !date.value ||
            record.date ===
              date.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus &&
            matchesDate
          )
        },
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats = computed(() => {
    const records =
      attendanceRecords.value.filter(
        record =>
          record.date ===
          date.value,
      )

    const present =
      records.filter(
        record =>
          record.status === 'Present' ||
          record.status === 'Late',
      ).length

    const late =
      records.filter(
        record =>
          record.status === 'Late',
      ).length

    const absent =
      records.filter(
        record =>
          record.status === 'Absent',
      ).length

    return {
      total: records.length,
      present,
      late,
      absent,
    }
  })

  /* =========================================================
     ISSUES
  ========================================================= */

  const issues = computed(() => {
    return {
      missingTimeOut:
        attendanceRecords.value.filter(
          record =>
            record.timeIn &&
            !record.timeOut &&
            (
              record.status === 'Present' ||
              record.status === 'Late'
            ),
        ).length,

      late:
        attendanceRecords.value.filter(
          record =>
            record.status === 'Late',
        ).length,

      absent:
        attendanceRecords.value.filter(
          record =>
            record.status === 'Absent',
        ).length,
    }
  })

  /* =========================================================
     OPTIONS
  ========================================================= */

  const departments = computed(() => {
    return [
      ...new Set(
        attendanceRecords.value.map(
          record =>
            record.department,
        ),
      ),
    ].sort()
  })

  const statusOptions:
    AttendanceStatus[] = [
      'Present',
      'Late',
      'Absent',
      'On Leave',
      'Rest Day',
    ]

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = computed(() => {
    return Math.max(
      1,
      Math.ceil(
        filteredRecords.value.length /
          perPage.value,
      ),
    )
  })

  const paginatedRecords =
    computed(() => {
      const start =
        (currentPage.value - 1) *
        perPage.value

      return filteredRecords.value.slice(
        start,
        start + perPage.value,
      )
    })

  const showingFrom = computed(() => {
    if (!filteredRecords.value.length) {
      return 0
    }

    return (
      (currentPage.value - 1) *
        perPage.value +
      1
    )
  })

  const showingTo = computed(() => {
    return Math.min(
      currentPage.value *
        perPage.value,

      filteredRecords.value.length,
    )
  })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    status.value = ''
    date.value = todayKey
    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      status,
      date,
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
    attendanceRecords,

    search,
    department,
    status,
    date,

    currentPage,
    perPage,

    filteredRecords,
    paginatedRecords,

    totalPages,

    showingFrom,
    showingTo,

    stats,
    issues,

    departments,
    statusOptions,

    resetFilters,
  }
}