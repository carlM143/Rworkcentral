
import type {
  ManualTimeEntry,
  ManualTimeEntryStatus,
  ManualTimeEntryType,
} from '~/types/manualTimeEntry'

interface ManualTimeApiRecord {
  id: number
  employee_id: number
  employee_number: string | null
  employee_name: string | null
  work_date: string
  time_in: string | null
  time_out: string | null
  scheduled_time_in: string | null
  scheduled_time_out: string | null
  raw_late_minutes: number
  grace_period_minutes: number
  chargeable_late_minutes: number
  undertime_minutes: number
  worked_minutes: number
  source: string
  remarks: string | null
  status: string
  created_at: string | null
  updated_at: string | null
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface SaveManualAttendancePayload {
  employee_id: number
  work_date: string
  time_in?: string | null
  time_out?: string | null
  remarks?: string | null
}

export const useManualTimeEntries = () => {
  const { $api } = useNuxtApp()
  const { employees } = useEmployees()

  const entries = useState<ManualTimeEntry[]>(
    'manual-time-entries',
    () => [],
  )

  const loading = useState<boolean>(
    'manual-time-loading',
    () => false,
  )

  const fetchError = useState<string | null>(
    'manual-time-error',
    () => null,
  )

  const search = ref('')
  const department = ref('')
  const entryType = ref('')
  const status = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')

  const currentPage = ref(1)
  const perPage = ref(6)

  const formatTime = (value?: string | null): string => {
    if (!value) return ''

    const [hourText = '0', minute = '00'] =
      value.slice(0, 5).split(':')

    const hour = Number(hourText)

    return `${hour % 12 || 12}:${minute} ${
      hour >= 12 ? 'PM' : 'AM'
    }`
  }

  const formatSchedule = (
    timeIn?: string | null,
    timeOut?: string | null,
  ): string => {
    if (!timeIn || !timeOut) return 'Not recorded'

    return `${formatTime(timeIn)} - ${formatTime(timeOut)}`
  }

  const normalizeStatus = (
    value: string,
  ): ManualTimeEntryStatus => {
    if (value.toLowerCase() === 'cancelled') {
      return 'Cancelled'
    }

    // This API currently saves directly to time_logs.
    return 'Completed'
  }

  const mapRecord = (
    record: ManualTimeApiRecord,
  ): ManualTimeEntry => {
    const employee = employees.value.find(item =>
      item.employeeNumber === record.employee_number,
    )

    const attendanceType: ManualTimeEntryType =
      record.time_in ? 'Time In' : 'Time Out'

    const attendanceTime =
      record.time_in || record.time_out || ''

    return {
      id: record.id,

      entryNumber:
        `MTL-${String(record.id).padStart(5, '0')}`,

      employeeId: record.employee_id,

      employeeNumber:
        record.employee_number ?? '',

      employeeName:
        record.employee_name ?? 'Unknown Employee',

      department:
        employee?.department ?? '',

      position:
        employee?.position ?? '',

      
      attendanceDate: record.work_date,

      schedule: formatSchedule(
        record.scheduled_time_in,
        record.scheduled_time_out,
      ),

      // Actual attendance values from Laravel
      timeIn: record.time_in,
      timeOut: record.time_out,

      attendanceStatus: record.status,

      remarks: record.remarks ?? '',


      entryType: attendanceType,

      time: formatTime(attendanceTime),

      reason: record.remarks ?? '',

      status: normalizeStatus(record.status),

      encodedBy: 'HR / Administrator',

      encodedAt:
        record.created_at ?? '',

      validatedBy: undefined,
      validatedAt: undefined,
    }
  }

  const getApiMessage = (err: unknown): string => {
    const apiError = err as {
      data?: {
        message?: string
        errors?: Record<string, string[]>
      }
      message?: string
    }

    const validationErrors = apiError.data?.errors

    if (validationErrors) {
      const firstGroup = Object.values(validationErrors)[0]

      if (firstGroup?.[0]) {
        return firstGroup[0]
      }
    }

    return apiError.data?.message ??
      apiError.message ??
      'Unable to complete the request.'
  }

  const fetchEntries = async (): Promise<void> => {
    loading.value = true
    fetchError.value = null

    try {
      const response = await $api<
        ApiResponse<ManualTimeApiRecord[]>
      >('/admin/manual-time-entries', {
        method: 'GET',
      })

      entries.value = Array.isArray(response.data)
        ? response.data.map(mapRecord)
        : []
    } catch (err: unknown) {
      fetchError.value = getApiMessage(err)
      entries.value = []
    } finally {
      loading.value = false
    }
  }

  const saveManualAttendance = async (
    payload: SaveManualAttendancePayload,
  ): Promise<ManualTimeEntry> => {
    const response = await $api<
      ApiResponse<ManualTimeApiRecord>
    >('/admin/manual-time-entries', {
      method: 'POST',
      body: payload,
    })

    if (!response.success || !response.data) {
      throw new Error(
        response.message ?? 'Unable to save manual attendance.',
      )
    }

    const saved = mapRecord(response.data)

    const existingIndex = entries.value.findIndex(
      item => item.id === saved.id,
    )

    if (existingIndex >= 0) {
      entries.value.splice(existingIndex, 1, saved)
    } else {
      entries.value.unshift(saved)
    }

    return saved
  }

  
const getManualEntry = async (
  id: number,
): Promise<ManualTimeEntry> => {
  const response = await $api<
    ApiResponse<ManualTimeApiRecord>
  >(`/admin/manual-time-entries/${id}`, {
    method: 'GET',
  })

  if (!response.success || !response.data) {
    throw new Error(
      response.message ?? 'Manual attendance not found.',
    )
  }

  const entry = mapRecord(response.data)

  const index = entries.value.findIndex(
    item => item.id === entry.id,
  )

  if (index >= 0) {
    entries.value.splice(index, 1, entry)
  } else {
    entries.value.push(entry)
  }

  return entry
}

const updateManualAttendance = async (
  id: number,
  payload: {
    time_in: string | null
    time_out: string | null
    remarks?: string | null
  },
): Promise<ManualTimeEntry> => {
  const response = await $api<
    ApiResponse<ManualTimeApiRecord>
  >(`/admin/manual-time-entries/${id}`, {
    method: 'PATCH',
    body: payload,
  })

  if (!response.success || !response.data) {
    throw new Error(
      response.message ?? 'Unable to update manual attendance.',
    )
  }

  const updated = mapRecord(response.data)

  const index = entries.value.findIndex(
    item => item.id === updated.id,
  )

  if (index >= 0) {
    entries.value.splice(index, 1, updated)
  } else {
    entries.value.push(updated)
  }

  return updated
}

  const validateEntry = (_id: number): boolean => false
  const cancelEntry = (_id: number): boolean => false

  const filteredEntries = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return entries.value.filter(entry => {
      const matchesSearch =
        !keyword ||
        [
          entry.employeeName,
          entry.employeeNumber,
          entry.entryNumber,
        ].some(item =>
          item.toLowerCase().includes(keyword),
        )

      const matchesDepartment =
        !department.value ||
        entry.department === department.value

      const matchesType =
        !entryType.value ||
        entry.entryType === entryType.value

      const matchesStatus =
        !status.value ||
        entry.status === status.value

      const matchesDateFrom =
        !dateFrom.value ||
        entry.attendanceDate >= dateFrom.value

      const matchesDateTo =
        !dateTo.value ||
        entry.attendanceDate <= dateTo.value

      return matchesSearch &&
        matchesDepartment &&
        matchesType &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
    })
  })

  const departments = computed(() =>
    [...new Set(
      entries.value
        .map(entry => entry.department)
        .filter(Boolean),
    )].sort(),
  )

  const entryTypeOptions: ManualTimeEntryType[] = [
    'Time In',
    'Time Out',
  ]

  const statusOptions: ManualTimeEntryStatus[] = [
    'Completed',
  ]

  const stats = computed(() => {
    const today = new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000,
    ).toISOString().slice(0, 10)

    return {
      today: entries.value.filter(
        entry => entry.attendanceDate === today,
      ).length,

      pending: 0,

      completed: entries.value.filter(
        entry => entry.status === 'Completed',
      ).length,

      // Actual missing time logs belong to Time Logs.
      // This listing contains manually saved records only.
      missingLogs: 0,
    }
  })

  const totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(filteredEntries.value.length / perPage.value),
    ),
  )

  const paginatedEntries = computed(() => {
    const start = (currentPage.value - 1) * perPage.value

    return filteredEntries.value.slice(
      start,
      start + perPage.value,
    )
  })

  const showingFrom = computed(() =>
    filteredEntries.value.length === 0
      ? 0
      : (currentPage.value - 1) * perPage.value + 1,
  )

  const showingTo = computed(() =>
    Math.min(
      currentPage.value * perPage.value,
      filteredEntries.value.length,
    ),
  )

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    entryType.value = ''
    status.value = ''
    dateFrom.value = ''
    dateTo.value = ''
    currentPage.value = 1
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
      currentPage.value = 1
    },
  )

  watch(totalPages, pages => {
    if (currentPage.value > pages) {
      currentPage.value = pages
    }
  })

  
return {
  entries,
  loading,
  error: fetchError,

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

  fetchEntries,
  getManualEntry,
  saveManualAttendance,
  updateManualAttendance,
  validateEntry,
  cancelEntry,
  resetFilters,
 }
}
