
import type {
  TimeLogRecord,
  TimeLogStatus,
} from '~/types/timekeeping'

interface ApiTimeLog {
  id: number
  employee_id: number
  employee_number: string | null
  employee_name: string | null
  department: string | null
  work_date: string | null
  schedule: string | null
  time_in: string | null
  break_out: string | null
  break_in: string | null
  time_out: string | null
  late_minutes: number | null
  undertime_minutes: number | null
  worked_minutes: number | null
  worked_hours: number | null
  status: string | null
}

interface TimeLogsApiResponse {
  success: boolean
  message?: string
  data: ApiTimeLog[]
}

export const useTimeLogs = () => {
  const { $api } = useNuxtApp()

  const timeLogs = ref<TimeLogRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // =====================================================
  // FILTERS
  // =====================================================

  const search = ref('')
  const department = ref('')
  const status = ref('')

  // Sample records from the TimeLogSeeder.
  const dateFrom = ref('2026-09-01')
  const dateTo = ref('2026-09-05')

  const currentPage = ref(1)
  const perPage = ref(8)

  // =====================================================
  // STATUS MAPPING
  // =====================================================

  const mapStatus = (value: string | null): TimeLogStatus => {
    const normalized = String(value ?? '')
      .trim()
      .toLowerCase()

    if (normalized === 'missing' || normalized === 'absent') {
      return 'Missing Log'
    }

    if (normalized === 'incomplete') {
      return 'Incomplete'
    }

    if (normalized === 'on leave') {
      return 'On Leave'
    }

    if (normalized === 'rest day') {
      return 'Rest Day'
    }

    // Late and undertime are tracked separately
    // through lateMinutes and undertimeMinutes.
    return 'Complete'
  }

  // =====================================================
  // API RESPONSE TRANSFORMATION
  // =====================================================

  const transformTimeLog = (
    record: ApiTimeLog,
  ): TimeLogRecord => {
    return {
      id: record.id,

      employeeId: record.employee_id,

      employeeNumber:
        record.employee_number ||
        `EMP-${String(record.employee_id).padStart(3, '0')}`,

      employeeName:
        record.employee_name ||
        'Unknown Employee',

      department:
        record.department ||
        'Unassigned',

      // The Time Logs table does not display position.
      // Keep the field for compatibility with the type.
      position: '',

      date: record.work_date || '',

      schedule:
        record.schedule ||
        '8:00 AM - 5:00 PM',

      timeIn: record.time_in || undefined,

      breakOut:
        record.break_out || undefined,

      breakIn:
        record.break_in || undefined,

      timeOut:
        record.time_out || undefined,

      lateMinutes:
        Number(record.late_minutes ?? 0),

      undertimeMinutes:
        Number(record.undertime_minutes ?? 0),

      hoursWorked:
        record.worked_hours === null ||
        record.worked_hours === undefined
          ? undefined
          : Number(record.worked_hours),

      status: mapStatus(record.status),
    }
  }

 // =====================================================
// FETCH LARAVEL TIME LOGS
// =====================================================

let latestRequestId = 0

const fetchTimeLogs = async (): Promise<void> => {
  const requestId = ++latestRequestId

  loading.value = true
  error.value = null

  try {
    const response = await $api<TimeLogsApiResponse>(
      '/admin/time-logs',
      {
        method: 'GET',
        query: {
          limit: 500,
          _refresh: Date.now(),
        },
      },
    )

    if (requestId !== latestRequestId) {
      return
    }

    if (!response.success) {
      throw new Error(
        response.message || 'Failed to retrieve time logs.',
      )
    }

    timeLogs.value = (
      Array.isArray(response.data)
        ? response.data
        : []
    ).map(transformTimeLog)
  } catch (err: unknown) {
    if (requestId !== latestRequestId) {
      return
    }

    const apiError = err as {
      data?: { message?: string }
      message?: string
    }

    error.value =
      apiError?.data?.message ||
      apiError?.message ||
      'Unable to load time logs from the server.'

    console.error('Failed to fetch time logs:', err)
  } finally {
    if (requestId === latestRequestId) {
      loading.value = false
    }
  }
}

  // =====================================================
  // FILTERED LOGS
  // =====================================================

  const filteredLogs = computed(() => {
    const keyword = search.value
      .trim()
      .toLowerCase()

    return timeLogs.value.filter((log) => {
      const matchesSearch =
        !keyword ||
        log.employeeName
          .toLowerCase()
          .includes(keyword) ||
        log.employeeNumber
          .toLowerCase()
          .includes(keyword) ||
        log.department
          .toLowerCase()
          .includes(keyword)

      const matchesDepartment =
        !department.value ||
        log.department === department.value

      const matchesStatus =
        !status.value ||
        log.status === status.value

      const matchesFrom =
        !dateFrom.value ||
        log.date >= dateFrom.value

      const matchesTo =
        !dateTo.value ||
        log.date <= dateTo.value

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus &&
        matchesFrom &&
        matchesTo
      )
    })
  })

  // =====================================================
  // STATISTICS
  // =====================================================

  const stats = computed(() => {
    const logs = filteredLogs.value

    const complete = logs.filter(
      log => log.status === 'Complete',
    ).length

    const missing = logs.filter(
      log => log.status === 'Missing Log',
    ).length

    const issues = logs.filter(
      log =>
        log.status === 'Incomplete' ||
        log.status === 'Missing Log' ||
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

  // =====================================================
  // OPTIONS
  // =====================================================

  const departments = computed(() => {
    return [
      ...new Set(
        timeLogs.value.map(
          log => log.department,
        ),
      ),
    ].sort()
  })

  const statusOptions: TimeLogStatus[] = [
    'Complete',
    'Incomplete',
    'Missing Log',
    'On Leave',
    'Rest Day',
  ]

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = computed(() => {
    return Math.max(
      1,
      Math.ceil(
        filteredLogs.value.length /
          perPage.value,
      ),
    )
  })

  const paginatedLogs = computed(() => {
    const start =
      (currentPage.value - 1) *
      perPage.value

    return filteredLogs.value.slice(
      start,
      start + perPage.value,
    )
  })

  const showingFrom = computed(() => {
    if (!filteredLogs.value.length) {
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
      currentPage.value * perPage.value,
      filteredLogs.value.length,
    )
  })

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    status.value = ''

    dateFrom.value = '2026-09-01'
    dateTo.value = '2026-09-05'

    currentPage.value = 1
  }

  // =====================================================
  // WATCH FILTERS
  // =====================================================

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

  watch(totalPages, (pages) => {
    if (currentPage.value > pages) {
      currentPage.value = pages
    }
  })

  // =====================================================
  // RETURN
  // =====================================================

  return {
    timeLogs,
    loading,
    error,
    fetchTimeLogs,

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
