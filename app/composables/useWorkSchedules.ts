import type {
  ScheduleActivity,
  WorkSchedule,
} from '~/types/workSchedule'

export const useWorkSchedules = () => {
  const schedules = ref<WorkSchedule[]>([
    {
      id: 1,
      code: 'WS-001',
      name: 'Regular Day Shift',
      type: 'Regular',
      timeIn: '08:00 AM',
      timeOut: '05:00 PM',
      breakStart: '12:00 PM',
      breakEnd: '01:00 PM',
      workHours: 8,
      gracePeriod: 5,
      restDays: ['Sunday'],
      employeeCount: 8,
      status: 'Active',
    },

    {
      id: 2,
      code: 'WS-002',
      name: 'Morning Shift',
      type: 'Morning Shift',
      timeIn: '06:00 AM',
      timeOut: '03:00 PM',
      breakStart: '11:00 AM',
      breakEnd: '12:00 PM',
      workHours: 8,
      gracePeriod: 5,
      restDays: ['Sunday'],
      employeeCount: 2,
      status: 'Active',
    },

    {
      id: 3,
      code: 'WS-003',
      name: 'Night Shift',
      type: 'Night Shift',
      timeIn: '10:00 PM',
      timeOut: '07:00 AM',
      breakStart: '02:00 AM',
      breakEnd: '03:00 AM',
      workHours: 8,
      gracePeriod: 5,
      restDays: ['Saturday'],
      employeeCount: 1,
      status: 'Active',
    },

    {
      id: 4,
      code: 'WS-004',
      name: 'Flexible Schedule',
      type: 'Flexible',
      workHours: 8,
      gracePeriod: 0,
      restDays: ['Saturday', 'Sunday'],
      employeeCount: 1,
      status: 'Active',
    },
  ])

  const search = ref('')
  const type = ref('')
  const status = ref('')

  const filteredSchedules = computed(() => {
    const keyword =
      search.value
        .trim()
        .toLowerCase()

    return schedules.value.filter(
      schedule => {
        const matchesSearch =
          !keyword ||
          schedule.name
            .toLowerCase()
            .includes(keyword) ||
          schedule.code
            .toLowerCase()
            .includes(keyword)

        const matchesType =
          !type.value ||
          schedule.type === type.value

        const matchesStatus =
          !status.value ||
          schedule.status === status.value

        return (
          matchesSearch &&
          matchesType &&
          matchesStatus
        )
      },
    )
  })

  const stats = computed(() => ({
    total:
      schedules.value.length,

    active:
      schedules.value.filter(
        schedule =>
          schedule.status === 'Active',
      ).length,

    employees:
      schedules.value.reduce(
        (total, schedule) =>
          total +
          schedule.employeeCount,
        0,
      ),

    restDayConfigurations:
      schedules.value.filter(
        schedule =>
          schedule.restDays.length,
      ).length,
  }))

  const scheduleSummary = computed(() => {
    return schedules.value.map(
      schedule => ({
        name: schedule.type,
        employees:
          schedule.employeeCount,
      }),
    )
  })

  const recentActivity =
    ref<ScheduleActivity[]>([
      {
        id: 1,
        title:
          'Regular Day Shift Updated',
        description:
          'Grace period was reviewed and set to 5 minutes.',
        performedBy:
          'Maria Santos',
        date:
          '2026-09-08',
      },
      {
        id: 2,
        title:
          'Employee Schedule Assigned',
        description:
          'Two employees were assigned to Morning Shift.',
        performedBy:
          'Maria Santos',
        date:
          '2026-09-07',
      },
      {
        id: 3,
        title:
          'Night Shift Updated',
        description:
          'Night shift rest day was updated.',
        performedBy:
          'Leo Martinez',
        date:
          '2026-09-06',
      },
    ])

  const resetFilters = () => {
    search.value = ''
    type.value = ''
    status.value = ''
  }

  return {
    schedules,

    search,
    type,
    status,

    filteredSchedules,

    stats,
    scheduleSummary,
    recentActivity,

    resetFilters,
  }
}