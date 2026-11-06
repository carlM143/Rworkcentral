import type {
  SwitchRestDayFormData,
  SwitchRestDayRecord,
  SwitchRestDayStatus,
} from '~/types/switchRestDay'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

interface ApiError {
  data?: {
    message?: string
    errors?: Record<string, string[]>
  }
  response?: {
    _data?: {
      message?: string
      errors?: Record<string, string[]>
    }
  }
  message?: string
}

const API_URL = '/admin/switch-rest-day-requests'

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday',
]

const normalizeDay = (value?: string | null): string => {
  if (!value) return ''

  const key = value.trim().toLowerCase().slice(0, 3)
  return DAYS.find(day => day.toLowerCase().slice(0, 3) === key) ?? ''
}

const dateOnly = (value: string): string => value.slice(0, 10)


const getErrorMessage = (error: unknown): string => {
  const problem = error as {
    data?: {
      message?: string
      errors?: Record<string, string[]>
    }
    response?: {
      _data?: {
        message?: string
        errors?: Record<string, string[]>
      }
    }
    statusMessage?: string
    message?: string
  }

  const data = problem?.data ?? problem?.response?._data

  if (data?.errors) {
    const messages = Object.values(data.errors).flat().filter(Boolean)
    if (messages.length) return messages.join(' ')
  }

  return data?.message
    || problem?.statusMessage
    || problem?.message
    || 'Unable to process the request. Please try again.'
}

const cleanRecord = (record: SwitchRestDayRecord): SwitchRestDayRecord => ({
  ...record,
  employeeNumber: record.employeeNumber ?? '',
  employeeName: record.employeeName ?? '',
  department: record.department ?? '',
  position: record.position ?? '',
  currentSchedule: record.currentSchedule ?? '',
  currentRestDay: normalizeDay(record.currentRestDay) || record.currentRestDay,
  requestedRestDay: normalizeDay(record.requestedRestDay) || record.requestedRestDay,
  effectiveDate: dateOnly(record.effectiveDate ?? ''),
  effectiveWeek: record.effectiveWeek ?? '',
  requestedBy: record.requestedBy ?? '',
  requestedAt: record.requestedAt ?? '',
  reason: record.reason ?? '',
  approvedBy: record.approvedBy ?? undefined,
  approvedAt: record.approvedAt ?? undefined,
  approvalNotes: record.approvalNotes ?? undefined,
  rejectedBy: record.rejectedBy ?? undefined,
  rejectedAt: record.rejectedAt ?? undefined,
  rejectionReason: record.rejectionReason ?? undefined,
  cancelledBy: record.cancelledBy ?? undefined,
  cancelledAt: record.cancelledAt ?? undefined,
  cancellationReason: record.cancellationReason ?? undefined,
})

export const useSwitchRestDays = () => {
  const { $api } = useNuxtApp()

  const {
    employees,
    loading: employeesLoading,
    loadError: employeesError,
    loadEmployees,
  } = useEmployees('Active', true)

  // Shared across Index, Create and Edit pages.
  const requests = useState<SwitchRestDayRecord[]>(
    'switch-rest-day-api-requests',
    () => [],
  )

  const loaded = useState<boolean>(
    'switch-rest-day-api-loaded',
    () => false,
  )

  const loading = useState<boolean>(
    'switch-rest-day-api-loading',
    () => false,
  )

  const saving = ref(false)
  const loadError = ref('')
  const actionError = ref('')

  // FILTERS
  const search = ref('')
  const department = ref('')
  const status = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')

  // PAGINATION
  const currentPage = ref(1)
  const perPage = ref(6)

  // OPTIONS
  const statusOptions: SwitchRestDayStatus[] = [
    'Pending',
    'Approved',
    'Rejected',
    'Cancelled',
  ]

  const restDayOptions = [...DAYS]

  const departmentOptions = computed(() =>
    [...new Set(
      requests.value
        .map(item => item.department)
        .filter(Boolean),
    )].sort(),
  )

  // LOAD REQUESTS
  const loadRequests = async (): Promise<void> => {
    if (loading.value) return

    loading.value = true
    loadError.value = ''

    try {
      const response = await $api<ApiResponse<SwitchRestDayRecord[]>>(
        API_URL,
        { method: 'GET' },
      )

      if (response.success === false || !Array.isArray(response.data)) {
        throw new Error(response.message || 'Invalid API response.')
      }

      requests.value = response.data.map(cleanRecord)
      loaded.value = true
    } catch (error: unknown) {
      loadError.value = getErrorMessage(error)
      console.error('Switch Rest Day Load Error:', error)
    } finally {
      loading.value = false
    }
  }

  // FIND REQUEST
  const getRequestById = (id: number | string) =>
    requests.value.find(item => item.id === Number(id)) ?? null

  // GET SINGLE REQUEST
  const fetchRequest = async (
    id: number | string,
  ): Promise<SwitchRestDayRecord | null> => {
    actionError.value = ''

    try {
      const response = await $api<ApiResponse<SwitchRestDayRecord>>(
        `${API_URL}/${id}`,
        { method: 'GET' },
      )

      if (response.success === false || !response.data) {
        throw new Error(response.message || 'Request not found.')
      }

      const record = cleanRecord(response.data)
      const index = requests.value.findIndex(item => item.id === record.id)

      if (index >= 0) requests.value[index] = record
      else requests.value.unshift(record)

      return record
    } catch (error: unknown) {
      actionError.value = getErrorMessage(error)
      console.error('Switch Rest Day Fetch Error:', error)
      return null
    }
  }

  // CURRENT EMPLOYEE SCHEDULE
  const getScheduleInfo = (employeeId: number) => {
    const employee = employees.value.find(
      item => item.id === Number(employeeId),
    )

    if (!employee) {
      return { schedule: '', restDay: '' }
    }

    const rawRestDays = (employee.restDay ?? '')
      .split(',')
      .map(day => normalizeDay(day))
      .filter(Boolean)

    return {
      schedule: employee.workSchedule ?? '',
      restDay: rawRestDays.length === 1 ? rawRestDays[0]! : '',
    }
  }

  // EFFECTIVE WEEK: SUNDAY TO SATURDAY
  const getEffectiveWeek = (value: string): string => {
    if (!value) return ''

    const date = new Date(`${dateOnly(value)}T00:00:00`)
    if (Number.isNaN(date.getTime())) return ''

    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())

    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    const shortDate = (day: Date) =>
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(day)

    return `${shortDate(start)} - ${shortDate(end)}, ${end.getFullYear()}`
  }

  // FILTERED REQUESTS
  const filteredRequests = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return requests.value.filter(item => {
      const matchesSearch = !keyword
        || item.requestNumber.toLowerCase().includes(keyword)
        || item.employeeName.toLowerCase().includes(keyword)
        || item.employeeNumber.toLowerCase().includes(keyword)

      const matchesDepartment = !department.value
        || item.department === department.value

      const matchesStatus = !status.value
        || item.status === status.value

      const matchesFrom = !dateFrom.value
        || item.effectiveDate >= dateFrom.value

      const matchesTo = !dateTo.value
        || item.effectiveDate <= dateTo.value

      return matchesSearch && matchesDepartment
        && matchesStatus && matchesFrom && matchesTo
    })
  })

  // STATISTICS
  const stats = computed(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    return {
      thisMonth: requests.value.filter(item => {
        if (!item.requestedAt) return false

        const date = new Date(item.requestedAt)
        return date.getMonth() === month
          && date.getFullYear() === year
      }).length,

      pending: requests.value.filter(
        item => item.status === 'Pending',
      ).length,

      approved: requests.value.filter(
        item => item.status === 'Approved',
      ).length,

      rejected: requests.value.filter(
        item => item.status === 'Rejected',
      ).length,
    }
  })

  // PAGINATION
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredRequests.value.length / perPage.value)),
  )

  const paginatedRequests = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredRequests.value.slice(start, start + perPage.value)
  })

  const showingFrom = computed(() =>
    filteredRequests.value.length
      ? (currentPage.value - 1) * perPage.value + 1
      : 0,
  )

  const showingTo = computed(() =>
    Math.min(
      currentPage.value * perPage.value,
      filteredRequests.value.length,
    ),
  )

  // CREATE REQUEST
  const createRequest = async (
    data: SwitchRestDayFormData,
  ): Promise<SwitchRestDayRecord | null> => {
    actionError.value = ''
    if (saving.value) return null

    if (!data.employeeId) {
      actionError.value = 'Please select an employee.'
      return null
    }

    saving.value = true

    try {
      const response = await $api<ApiResponse<SwitchRestDayRecord>>(
        API_URL,
        {
          method: 'POST',
          body: {
            employee_id: data.employeeId,
            requested_rest_day: normalizeDay(data.requestedRestDay),
            effective_date: dateOnly(data.effectiveDate),
            reason: data.reason.trim(),
          },
        },
      )

      if (response.success === false || !response.data) {
        throw new Error(response.message || 'Unable to create request.')
      }

      const record = cleanRecord(response.data)
      await loadRequests()

      return record
    
    } catch (error: unknown) {
      actionError.value = getErrorMessage(error)

      console.error('Switch Rest Day Create Error:', {
        message: actionError.value,
        error,
      })

      return null
    }
  }

  // UPDATE REQUEST
  const updateRequest = async (
    id: number,
    data: SwitchRestDayFormData,
  ): Promise<SwitchRestDayRecord | null> => {
    actionError.value = ''
    if (saving.value) return null

    saving.value = true

    try {
      const response = await $api<ApiResponse<SwitchRestDayRecord>>(
        `${API_URL}/${id}`,
        {
          method: 'PATCH',
          body: {
            employee_id: data.employeeId,
            requested_rest_day: normalizeDay(data.requestedRestDay),
            effective_date: dateOnly(data.effectiveDate),
            reason: data.reason.trim(),
          },
        },
      )

      if (response.success === false || !response.data) {
        throw new Error(response.message || 'Unable to update request.')
      }

      const record = cleanRecord(response.data)
      await loadRequests()

      return record
    } catch (error: unknown) {
      actionError.value = getErrorMessage(error)
      console.error('Switch Rest Day Update Error:', error)
      return null
    } finally {
      saving.value = false
    }
  }

  // APPROVE / REJECT / CANCEL
  const updateStatus = async (
    id: number,
    action: 'approve' | 'reject' | 'cancel',
    notes = '',
  ): Promise<SwitchRestDayRecord | null> => {
    actionError.value = ''
    if (saving.value) return null

    saving.value = true

    try {
      const response = await $api<ApiResponse<SwitchRestDayRecord>>(
        `${API_URL}/${id}/${action}`,
        {
          method: 'PATCH',
          body: { notes: notes.trim() },
        },
      )

      if (response.success === false || !response.data) {
        throw new Error(response.message || `Unable to ${action} request.`)
      }

      const record = cleanRecord(response.data)
      await loadRequests()

      return record
    } catch (error: unknown) {
      actionError.value = getErrorMessage(error)
      console.error(`Switch Rest Day ${action} Error:`, error)
      return null
    } finally {
      saving.value = false
    }
  }

  const approveRequest = (id: number, notes = '') =>
    updateStatus(id, 'approve', notes)

  const rejectRequest = (id: number, notes: string) =>
    updateStatus(id, 'reject', notes)

  const cancelRequest = (id: number, notes: string) =>
    updateStatus(id, 'cancel', notes)

  // RESET FILTERS
  const resetFilters = () => {
    search.value = ''
    department.value = ''
    status.value = ''
    dateFrom.value = ''
    dateTo.value = ''
    currentPage.value = 1
  }

  watch(
    [search, department, status, dateFrom, dateTo],
    () => { currentPage.value = 1 },
  )

  watch(totalPages, pages => {
    if (currentPage.value > pages) currentPage.value = pages
  })

  // FETCH REAL RECORDS WHEN PAGE IS OPENED
  onMounted(() => {
    if (!loaded.value) void loadRequests()
  })

  return {
    // DATA
    requests,
    employees,
    employeesLoading,
    employeesError,
    loadEmployees,
    loading,
    saving,
    loaded,
    loadError,
    actionError,

    // FILTERS
    search,
    department,
    status,
    dateFrom,
    dateTo,
    resetFilters,

    // PAGINATION
    currentPage,
    perPage,
    filteredRequests,
    paginatedRequests,
    totalPages,
    showingFrom,
    showingTo,

    // STATISTICS / OPTIONS
    stats,
    departmentOptions,
    statusOptions,
    restDayOptions,

    // HELPERS
    getScheduleInfo,
    getEffectiveWeek,
    getRequestById,

    // API METHODS
    loadRequests,
    fetchRequest,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    cancelRequest,
  }
}