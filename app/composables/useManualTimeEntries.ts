import type {
  ManualTimeEntry,
  ManualTimeEntryFormData,
  ManualTimeEntryStatus,
  ManualTimeEntryType,
} from '~/types/manualTimeEntry'

export const useManualTimeEntries = () => {
  const {
    employees,
  } = useEmployees()

  /* =========================================================
     MOCK DATA
  ========================================================= */

  const entries =
    useState<
      ManualTimeEntry[]
    >(
      'manual-time-entries',
      () => [
        {
          id: 1,

          entryNumber:
            'MTE-2026-001',

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
            '2026-09-11',

          schedule:
            '8:00 AM - 5:00 PM',

          entryType:
            'Time In',

          time:
            '8:02 AM',

          reason:
            'Biometric device was temporarily unavailable during employee arrival.',

          status:
            'Pending',

          encodedBy:
            'Maria Santos',

          encodedAt:
            '2026-09-11T08:10:00',
        },

        {
          id: 2,

          entryNumber:
            'MTE-2026-002',

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
            '2026-09-11',

          schedule:
            '8:00 AM - 5:00 PM',

          entryType:
            'Time Out',

          time:
            '5:03 PM',

          reason:
            'Manual entry was requested after the biometric terminal failed to record time out.',

          attachment: {
            name:
              'supervisor-confirmation.pdf',
          },

          status:
            'Completed',

          encodedBy:
            'Maria Santos',

          encodedAt:
            '2026-09-11T17:10:00',

          validatedBy:
            'Maria Santos',

          validatedAt:
            '2026-09-11T17:20:00',
        },

        {
          id: 3,

          entryNumber:
            'MTE-2026-003',

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
            '2026-09-10',

          schedule:
            '8:00 AM - 5:00 PM',

          entryType:
            'Time In',

          time:
            '7:58 AM',

          reason:
            'Attendance terminal was being maintained during office opening.',

          status:
            'Completed',

          encodedBy:
            'HR Administrator',

          encodedAt:
            '2026-09-10T08:20:00',

          validatedBy:
            'HR Administrator',

          validatedAt:
            '2026-09-10T09:00:00',
        },

        {
          id: 4,

          entryNumber:
            'MTE-2026-004',

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
            '2026-09-10',

          schedule:
            '8:00 AM - 5:00 PM',

          entryType:
            'Time Out',

          time:
            '5:08 PM',

          reason:
            'Employee returned from an assigned client trip after the biometric device was already offline.',

          status:
            'Pending',

          encodedBy:
            'Maria Santos',

          encodedAt:
            '2026-09-10T17:25:00',
        },

        {
          id: 5,

          entryNumber:
            'MTE-2026-005',

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
            '2026-09-09',

          schedule:
            '8:00 AM - 5:00 PM',

          entryType:
            'Break Out',

          time:
            '12:03 PM',

          reason:
            'Break out was not captured by the attendance device.',

          status:
            'Completed',

          encodedBy:
            'Maria Santos',

          encodedAt:
            '2026-09-09T13:05:00',

          validatedBy:
            'Maria Santos',

          validatedAt:
            '2026-09-09T14:00:00',
        },

        {
          id: 6,

          entryNumber:
            'MTE-2026-006',

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
            '2026-09-08',

          schedule:
            '8:00 AM - 5:00 PM',

          entryType:
            'Break In',

          time:
            '1:02 PM',

          reason:
            'Manual break-in entry was filed because the biometric terminal temporarily lost network connectivity.',

          status:
            'Completed',

          encodedBy:
            'Maria Santos',

          encodedAt:
            '2026-09-08T13:20:00',

          validatedBy:
            'Maria Santos',

          validatedAt:
            '2026-09-08T14:10:00',
        },

        {
          id: 7,

          entryNumber:
            'MTE-2026-007',

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
            '2026-09-07',

          schedule:
            '8:00 AM - 5:00 PM',

          entryType:
            'Time In',

          time:
            '8:05 AM',

          reason:
            'Entry was initially encoded without sufficient supporting verification.',

          status:
            'Cancelled',

          encodedBy:
            'Maria Santos',

          encodedAt:
            '2026-09-07T08:30:00',

          validationNotes:
            'Cancelled after verification of the original attendance record.',
        },

        {
          id: 8,

          entryNumber:
            'MTE-2026-008',

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
            '2026-09-06',

          schedule:
            '8:00 AM - 5:00 PM',

          entryType:
            'Time Out',

          time:
            '5:00 PM',

          reason:
            'Employee was unable to scan out because the attendance device restarted during closing time.',

          status:
            'Pending',

          encodedBy:
            'Maria Santos',

          encodedAt:
            '2026-09-06T17:15:00',
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

  const entryType =
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
     FILTER
  ========================================================= */

  const filteredEntries =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return entries.value.filter(
        entry => {
          const matchesSearch =
            !keyword ||
            entry.employeeName
              .toLowerCase()
              .includes(keyword) ||
            entry.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            entry.entryNumber
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            entry.department ===
              department.value

          const matchesEntryType =
            !entryType.value ||
            entry.entryType ===
              entryType.value

          const matchesStatus =
            !status.value ||
            entry.status ===
              status.value

          const matchesFrom =
            !dateFrom.value ||
            entry.attendanceDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            entry.attendanceDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesEntryType &&
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
      const today =
        new Date()
          .toLocaleDateString(
            'en-CA',
          )

      const manualToday =
        entries.value.filter(
          entry =>
            entry.attendanceDate ===
            today,
        ).length

      const pending =
        entries.value.filter(
          entry =>
            entry.status ===
            'Pending',
        ).length

      const completed =
        entries.value.filter(
          entry =>
            entry.status ===
            'Completed',
        ).length

      /*
       * UI mock value for employees that
       * still need a missing attendance log.
       * Backend/time-log integration can
       * replace this later.
       */
      const missingLogs =
        entries.value.filter(
          entry =>
            entry.status ===
              'Pending' &&
            (
              entry.entryType ===
                'Time In' ||
              entry.entryType ===
                'Time Out'
            ),
        ).length

      return {
        today:
          manualToday,

        pending,

        completed,

        missingLogs,
      }
    })

  /* =========================================================
     OPTIONS
  ========================================================= */

  const departments =
    computed(() => {
      return [
        ...new Set(
          entries.value.map(
            entry =>
              entry.department,
          ),
        ),
      ].sort()
    })

  const entryTypeOptions:
    ManualTimeEntryType[] = [
      'Time In',
      'Break Out',
      'Break In',
      'Time Out',
    ]

  const statusOptions:
    ManualTimeEntryStatus[] = [
      'Pending',
      'Completed',
      'Cancelled',
    ]

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredEntries
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedEntries =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredEntries
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
        !filteredEntries
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

        filteredEntries
          .value.length,
      )
    })

  /* =========================================================
     FORMAT TIME
  ========================================================= */

  const formatTime = (
    value: string,
  ) => {
    if (!value) {
      return ''
    }

    const [
      hourString = '0',
      minute = '00',
    ] =
      value.split(':')

    const hour =
      Number(hourString)

    const period =
      hour >= 12
        ? 'PM'
        : 'AM'

    const displayHour =
      hour % 12 || 12

    return `${displayHour}:${minute} ${period}`
  }

  /* =========================================================
     CREATE
  ========================================================= */

  const createEntry = (
    data:
      ManualTimeEntryFormData,
  ) => {
    if (
      data.employeeId ===
      null
    ) {
      return null
    }

    const employee =
      employees.value.find(
        employee =>
          employee.id ===
          data.employeeId,
      )

    if (!employee) {
      return null
    }

    const nextId =
      entries.value.length
        ? Math.max(
            ...entries.value.map(
              entry =>
                entry.id,
            ),
          ) + 1
        : 1

    const year =
      new Date()
        .getFullYear()

    const entryNumber =
      `MTE-${year}-${String(
        nextId,
      ).padStart(
        3,
        '0',
      )}`

    const employeeName =
      [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' ')

    const entry:
      ManualTimeEntry = {
        id:
          nextId,

        entryNumber,

        employeeId:
          employee.id,

        employeeNumber:
          employee.employeeNumber,

        employeeName,

        department:
          employee.department,

        position:
          employee.position,

        attendanceDate:
          data.attendanceDate,

        schedule:
          employee.workSchedule ||
          '8:00 AM - 5:00 PM',

        entryType:
          data.entryType,

        time:
          formatTime(
            data.time,
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

        encodedBy:
          'Maria Santos',

        encodedAt:
          new Date()
            .toISOString(),
      }

    entries.value.unshift(
      entry,
    )

    return entry
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  const updateEntry = (
    id: number,
    data:
      ManualTimeEntryFormData,
  ) => {
    const entry =
      entries.value.find(
        item =>
          item.id === id,
      )

    if (!entry) {
      return null
    }

    if (
      data.employeeId !==
      null
    ) {
      const employee =
        employees.value.find(
          employee =>
            employee.id ===
            data.employeeId,
        )

      if (employee) {
        entry.employeeId =
          employee.id

        entry.employeeNumber =
          employee.employeeNumber

        entry.employeeName =
          [
            employee.firstName,
            employee.middleName,
            employee.lastName,
          ]
            .filter(Boolean)
            .join(' ')

        entry.department =
          employee.department

        entry.position =
          employee.position

        entry.schedule =
          employee.workSchedule ||
          entry.schedule
      }
    }

    entry.attendanceDate =
      data.attendanceDate

    entry.entryType =
      data.entryType

    entry.time =
      formatTime(
        data.time,
      )

    entry.reason =
      data.reason

    entry.attachment =
      data.attachmentName
        ? {
            name:
              data.attachmentName,
          }
        : undefined

    entry.status =
      'Pending'

    entry.encodedAt =
      new Date()
        .toISOString()

    entry.validatedBy =
      undefined

    entry.validatedAt =
      undefined

    return entry
  }

  /* =========================================================
     VALIDATE
  ========================================================= */

  const validateEntry = (
    id: number,
  ) => {
    const entry =
      entries.value.find(
        item =>
          item.id === id,
      )

    if (!entry) {
      return false
    }

    entry.status =
      'Completed'

    entry.validatedBy =
      'Maria Santos'

    entry.validatedAt =
      new Date()
        .toISOString()

    return true
  }

  /* =========================================================
     CANCEL
  ========================================================= */

  const cancelEntry = (
    id: number,
  ) => {
    const entry =
      entries.value.find(
        item =>
          item.id === id,
      )

    if (!entry) {
      return false
    }

    entry.status =
      'Cancelled'

    return true
  }

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''

    department.value = ''

    entryType.value = ''

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
      entryType,
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
    entries,

    search,
    department,
    entryType,
    status,
    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredEntries,
    paginatedEntries,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    departments,
    entryTypeOptions,
    statusOptions,

    createEntry,
    updateEntry,
    validateEntry,
    cancelEntry,

    resetFilters,
  }
}