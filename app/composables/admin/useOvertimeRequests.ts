import type { OvertimeRequest, OvertimeRequestStatus, OvertimeType } from '~/types/overtimeRequest'

interface OvertimeApiRecord {
  id: number
  employee_id: number
  request_no: string
  ot_date: string
  start_at: string
  end_at: string
  reason: string
  status: string
  approved_at: string | null
  created_at: string
  employee?: { id: number; emp_id: string; firstname: string; lastname: string } | null
  work_schedule?: { schedule_name?: string } | null
  approver?: { name: string } | null
}

interface OvertimeApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const statusLabel = (status: string): OvertimeRequestStatus => {
  const normalized = status.toLowerCase()
  if (normalized === 'approved') return 'Approved'
  if (normalized === 'rejected') return 'Rejected'
  if (normalized === 'cancelled') return 'Cancelled'
  if (normalized === 'for_review') return 'For Review'
  return 'Pending'
}

const datePart = (value: string) => value?.slice(0, 10) ?? ''
const timePart = (value: string) => value?.slice(11, 16) || '00:00'

const hoursBetween = (start: string, end: string) => {
  const difference = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(0, Math.round((difference / 3_600_000) * 100) / 100)
}

const mapOvertimeRequest = (record: OvertimeApiRecord): OvertimeRequest => {
  const requestedHours = hoursBetween(record.start_at, record.end_at)
  const status = statusLabel(record.status)

  return {
    id: record.id,
    requestNumber: record.request_no,
    employeeId: record.employee_id,
    employeeNumber: record.employee?.emp_id ?? `EMP-${record.employee_id}`,
    employeeName: record.employee
      ? `${record.employee.firstname} ${record.employee.lastname}`.trim()
      : 'Unknown employee',
    department: '—',
    position: record.work_schedule?.schedule_name ?? '—',
    overtimeDate: datePart(record.ot_date),
    startTime: timePart(record.start_at),
    endTime: timePart(record.end_at),
    requestedHours,
    approvedHours: status === 'Approved' ? requestedHours : undefined,
    overtimeType: 'Regular OT',
    reason: record.reason,
    status,
    requestedAt: record.created_at,
    reviewedBy: record.approver?.name,
    reviewedAt: record.approved_at ?? undefined,
  }
}

export const useOvertimeRequests = () => {
  const { $api } = useNuxtApp()
  const requests = useState<OvertimeRequest[]>('overtime-requests', () => [])
  const loading = ref(false)
  const loadError = ref('')
  const approvingId = ref<number | null>(null)

  const loadRequests = async () => {
    loading.value = true
    loadError.value = ''
    try {
      const response = await $api<OvertimeApiResponse<OvertimeApiRecord[]>>(
        '/admin/overtime-requests',
        { method: 'GET' },
      )
      requests.value = response.data.map(mapOvertimeRequest)
    } catch (problem: any) {
      requests.value = []
      loadError.value = problem?.data?.message
        ?? problem?.response?._data?.message
        ?? problem?.message
        ?? 'Unable to load overtime requests.'
    } finally {
      loading.value = false
    }
  }

  const approveRequest = async (requestId: number) => {
    approvingId.value = requestId
    try {
      const response = await $api<OvertimeApiResponse<OvertimeApiRecord>>(
        `/admin/overtime-requests/${requestId}/approve`,
        { method: 'PATCH' },
      )
      const index = requests.value.findIndex(request => request.id === requestId)
      if (index >= 0) requests.value[index] = mapOvertimeRequest(response.data)
      return response.message
    } finally {
      approvingId.value = null
    }
  }

  onMounted(() => { void loadRequests() })

  const search = ref('')
  const department = ref('')
  const overtimeType = ref('')
  const status = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const currentPage = ref(1)
  const perPage = ref(6)

  const departmentOptions = computed(() => [
    ...new Set(requests.value.map(item => item.department).filter(value => value !== '—')),
  ].sort())
  const overtimeTypeOptions: OvertimeType[] = ['Regular OT', 'Rest Day OT', 'Holiday OT']
  const statusOptions: OvertimeRequestStatus[] = ['Pending', 'For Review', 'Approved', 'Rejected', 'Cancelled']

  const filteredRequests = computed(() => {
    const keyword = search.value.trim().toLowerCase()
    return requests.value.filter((item) => {
      const matchesSearch = !keyword
        || item.requestNumber.toLowerCase().includes(keyword)
        || item.employeeNumber.toLowerCase().includes(keyword)
        || item.employeeName.toLowerCase().includes(keyword)
        || item.reason.toLowerCase().includes(keyword)
      return matchesSearch
        && (!department.value || item.department === department.value)
        && (!overtimeType.value || item.overtimeType === overtimeType.value)
        && (!status.value || item.status === status.value)
        && (!dateFrom.value || item.overtimeDate >= dateFrom.value)
        && (!dateTo.value || item.overtimeDate <= dateTo.value)
    })
  })

  const stats = computed(() => ({
    totalRequests: filteredRequests.value.length,
    pending: filteredRequests.value.filter(item => item.status === 'Pending' || item.status === 'For Review').length,
    approved: filteredRequests.value.filter(item => item.status === 'Approved').length,
    approvedHours: filteredRequests.value.reduce((total, item) => total + (item.approvedHours ?? 0), 0),
  }))

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredRequests.value.length / perPage.value)))
  const paginatedRequests = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredRequests.value.slice(start, start + perPage.value)
  })
  const showingFrom = computed(() => filteredRequests.value.length ? (currentPage.value - 1) * perPage.value + 1 : 0)
  const showingTo = computed(() => Math.min(currentPage.value * perPage.value, filteredRequests.value.length))

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    overtimeType.value = ''
    status.value = ''
    dateFrom.value = ''
    dateTo.value = ''
    currentPage.value = 1
  }

  watch([search, department, overtimeType, status, dateFrom, dateTo], () => { currentPage.value = 1 })
  watch(totalPages, value => { if (currentPage.value > value) currentPage.value = value })

  return {
    requests,
    loading,
    loadError,
    approvingId,
    loadRequests,
    approveRequest,
    search,
    department,
    overtimeType,
    status,
    dateFrom,
    dateTo,
    currentPage,
    filteredRequests,
    paginatedRequests,
    totalPages,
    showingFrom,
    showingTo,
    stats,
    departmentOptions,
    overtimeTypeOptions,
    statusOptions,
    resetFilters,
  }
}
