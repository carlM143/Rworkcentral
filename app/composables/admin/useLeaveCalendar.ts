import type {
  LeaveCalendarEvent,
  LeaveCalendarStatus,
  LeaveCalendarType,
} from '~/types/leaveCalendar'

export const useLeaveCalendar = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const events =
    useState<LeaveCalendarEvent[]>(
      'leave-calendar-events',
      () => [
        {
          id: 1,
          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          department: 'Operations',
          position: 'Driver',

          leaveType: 'Vacation Leave',

          startDate: '2026-10-08',
          endDate: '2026-10-09',

          days: 2,

          reason: 'Personal appointment',

          status: 'Approved',
        },

        {
          id: 2,
          employeeId: 2,
          employeeNumber: 'EMP-002',
          employeeName: 'Maria Santos',

          department: 'Human Resources',
          position: 'HR Administrator',

          leaveType: 'Sick Leave',

          startDate: '2026-10-12',
          endDate: '2026-10-13',

          days: 2,

          reason: 'Medical recovery',

          status: 'Approved',
        },

        {
          id: 3,
          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',

          department: 'Finance',
          position: 'Finance Staff',

          leaveType: 'Vacation Leave',

          startDate: '2026-10-15',
          endDate: '2026-10-16',

          days: 2,

          reason: 'Family event',

          status: 'Approved',
        },

        {
          id: 4,
          employeeId: 4,
          employeeNumber: 'EMP-004',
          employeeName: 'Ana Garcia',

          department: 'Operations',
          position: 'Operations Staff',

          leaveType: 'Emergency Leave',

          startDate: '2026-10-06',
          endDate: '2026-10-06',

          days: 1,

          reason: 'Family emergency',

          status: 'Approved',
        },

        {
          id: 5,
          employeeId: 6,
          employeeNumber: 'EMP-006',
          employeeName: 'Angela Flores',

          department: 'Billing',
          position: 'Billing Staff',

          leaveType: 'Sick Leave',

          startDate: '2026-10-19',
          endDate: '2026-10-20',

          days: 2,

          reason: 'Medical consultation',

          status: 'Pending',
        },

        {
          id: 6,
          employeeId: 7,
          employeeNumber: 'EMP-007',
          employeeName: 'Mark Lopez',

          department: 'IT',
          position: 'IT Support',

          leaveType: 'Vacation Leave',

          startDate: '2026-10-22',
          endDate: '2026-10-23',

          days: 2,

          reason: 'Personal leave',

          status: 'Approved',
        },

        {
          id: 7,
          employeeId: 8,
          employeeNumber: 'EMP-008',
          employeeName: 'Jenny Ramos',

          department: 'Human Resources',
          position: 'HR Staff',

          leaveType: 'Special Leave',

          startDate: '2026-10-26',
          endDate: '2026-10-26',

          days: 1,

          reason: 'Special circumstance',

          status: 'Approved',
        },

        {
          id: 8,
          employeeId: 9,
          employeeNumber: 'EMP-009',
          employeeName: 'Robert Castillo',

          department: 'Finance',
          position: 'Finance Officer',

          leaveType: 'Vacation Leave',

          startDate: '2026-10-28',
          endDate: '2026-10-30',

          days: 3,

          reason: 'Family vacation',

          status: 'Pending',
        },

        {
          id: 9,
          employeeId: 10,
          employeeNumber: 'EMP-010',
          employeeName: 'Grace Navarro',

          department: 'Human Resources',
          position: 'HR Staff',

          leaveType: 'Sick Leave',

          startDate: '2026-09-30',
          endDate: '2026-10-02',

          days: 3,

          reason: 'Medical recovery',

          status: 'Approved',
        },

        {
          id: 10,
          employeeId: 11,
          employeeNumber: 'EMP-011',
          employeeName: 'Leo Martinez',

          department: 'Operations',
          position: 'Driver',

          leaveType: 'Vacation Leave',

          startDate: '2026-11-02',
          endDate: '2026-11-04',

          days: 3,

          reason: 'Scheduled vacation',

          status: 'Approved',
        },
      ],
    )

  /* =========================================================
     CURRENT MONTH
  ========================================================= */

  const currentMonth =
    ref(
      new Date(
        2026,
        9,
        1,
      ),
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

  /* =========================================================
     OPTIONS
  ========================================================= */

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          events.value.map(
            event =>
              event.department,
          ),
        ),
      ].sort()
    })

  const leaveTypeOptions:
    LeaveCalendarType[] = [
      'Vacation Leave',
      'Sick Leave',
      'Emergency Leave',
      'Special Leave',
      'Maternity Leave',
      'Paternity Leave',
    ]

  const statusOptions:
    LeaveCalendarStatus[] = [
      'Approved',
      'Pending',
    ]

  /* =========================================================
     FILTERED EVENTS
  ========================================================= */

  const filteredEvents =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return events.value.filter(
        event => {
          const matchesSearch =
            !keyword ||
            event.employeeName
              .toLowerCase()
              .includes(keyword) ||
            event.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            event.reason
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            event.department ===
              department.value

          const matchesType =
            !leaveType.value ||
            event.leaveType ===
              leaveType.value

          const matchesStatus =
            !status.value ||
            event.status ===
              status.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesType &&
            matchesStatus
          )
        },
      )
    })

  /* =========================================================
     MONTH LABEL
  ========================================================= */

  const monthLabel =
    computed(() => {
      return new Intl.DateTimeFormat(
        'en-US',
        {
          month: 'long',
          year: 'numeric',
        },
      ).format(
        currentMonth.value,
      )
    })

  /* =========================================================
     CALENDAR DAYS
  ========================================================= */

  const calendarDays =
    computed(() => {
      const year =
        currentMonth.value
          .getFullYear()

      const month =
        currentMonth.value
          .getMonth()

      const firstDay =
        new Date(
          year,
          month,
          1,
        )

      const startOffset =
        firstDay.getDay()

      const startDate =
        new Date(
          year,
          month,
          1 -
            startOffset,
        )

      return Array.from(
        {
          length: 42,
        },
        (_, index) => {
          const date =
            new Date(
              startDate,
            )

          date.setDate(
            startDate.getDate() +
              index,
          )

          const dateString =
            [
              date.getFullYear(),
              String(
                date.getMonth() +
                  1,
              ).padStart(
                2,
                '0',
              ),
              String(
                date.getDate(),
              ).padStart(
                2,
                '0',
              ),
            ].join('-')

          const eventsForDate =
            filteredEvents.value.filter(
              event =>
                dateString >=
                  event.startDate &&
                dateString <=
                  event.endDate,
            )

          return {
            date,
            dateString,

            dayNumber:
              date.getDate(),

            isCurrentMonth:
              date.getMonth() ===
              month,

            isToday:
              dateString ===
              '2026-10-06',

            events:
              eventsForDate,
          }
        },
      )
    })

  /* =========================================================
     MONTH EVENTS
  ========================================================= */

  const currentMonthEvents =
    computed(() => {
      const year =
        currentMonth.value
          .getFullYear()

      const month =
        String(
          currentMonth.value
            .getMonth() +
            1,
        ).padStart(
          2,
          '0',
        )

      const prefix =
        `${year}-${month}`

      return filteredEvents.value.filter(
        event =>
          event.startDate.startsWith(
            prefix,
          ) ||
          event.endDate.startsWith(
            prefix,
          ),
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => {
      const data =
        currentMonthEvents.value

      const approved =
        data.filter(
          event =>
            event.status ===
            'Approved',
        )

      const totalApprovedDays =
        approved.reduce(
          (
            total,
            event,
          ) =>
            total +
            event.days,
          0,
        )

      const affectedDepartments =
        new Set(
          approved.map(
            event =>
              event.department,
          ),
        ).size

      const upcoming =
        approved.filter(
          event =>
            event.startDate >=
            '2026-10-06',
        ).length

      return {
        leaveEvents:
          data.length,

        approvedDays:
          totalApprovedDays,

        upcomingLeaves:
          upcoming,

        departmentsAffected:
          affectedDepartments,
      }
    })

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const previousMonth = () => {
    currentMonth.value =
      new Date(
        currentMonth.value
          .getFullYear(),

        currentMonth.value
          .getMonth() -
          1,

        1,
      )
  }

  const nextMonth = () => {
    currentMonth.value =
      new Date(
        currentMonth.value
          .getFullYear(),

        currentMonth.value
          .getMonth() +
          1,

        1,
      )
  }

  const goToday = () => {
    currentMonth.value =
      new Date(
        2026,
        9,
        1,
      )
  }

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    leaveType.value = ''
    status.value = ''
  }

  return {
    events,

    currentMonth,

    search,
    department,
    leaveType,
    status,

    filteredEvents,

    monthLabel,
    calendarDays,

    stats,

    departmentOptions,
    leaveTypeOptions,
    statusOptions,

    previousMonth,
    nextMonth,
    goToday,

    resetFilters,
  }
}