import type {
  UndertimeApprovalApiRecord,
  UndertimeRequest,
  UndertimeRequestStatus,
} from '~/types/undertimeRequest'
import { useUndertimeApprovalApi } from './useUndertimeApprovalApi'

const statusLabel = (status: string): UndertimeRequestStatus => {
  const normalized = status.toLowerCase()
  if (normalized === 'approved') return 'Approved'
  if (normalized === 'rejected') return 'Rejected'
  if (normalized === 'cancelled') return 'Cancelled'
  return 'Pending'
}

const mapRequest = (record: UndertimeApprovalApiRecord): UndertimeRequest => ({
  id: record.id,
  requestNumber: record.request_no,
  employeeId: record.employee_id,
  employeeNumber: record.employee?.emp_id ?? `EMP-${record.employee_id}`,
  employeeName: record.employee
    ? `${record.employee.firstname} ${record.employee.lastname}`.trim()
    : 'Unknown employee',
  undertimeDate: record.undertime_date?.slice(0, 10) ?? '',
  requestedTimeOut: record.requested_time_out,
  scheduledTimeOut: record.scheduled_time_out,
  requestedMinutes: Number(record.requested_minutes),
  reason: record.reason,
  status: statusLabel(record.status),
  requestedAt: record.created_at,
  reviewedBy: record.approver?.name,
  reviewedAt: record.approved_at ?? undefined,
})

export const useUndertimeApprovals = () => {
  const { getUndertimeApprovals, approveUndertimeRequest } = useUndertimeApprovalApi()
  const requests = ref<UndertimeRequest[]>([])
  const loading = ref(false)
  const loadError = ref('')
  const approvingId = ref<number | null>(null)
  const search = ref('')
  const status = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const currentPage = ref(1)
  const perPage = ref(8)

  const loadRequests = async () => {
    loading.value = true
    loadError.value = ''
    try {
      const response = await getUndertimeApprovals()
      if (response.success === false) throw new Error(response.message)
      if (!Array.isArray(response.data)) throw new Error('Invalid undertime requests response.')
      requests.value = response.data.map(mapRequest)
    } catch (problem: any) {
      requests.value = []
      loadError.value = problem?.data?.message
        ?? problem?.response?._data?.message
        ?? problem?.message
        ?? 'Unable to load undertime requests.'
    } finally {
      loading.value = false
    }
  }

  const approveRequest = async (requestId: number) => {
    approvingId.value = requestId
    try {
      const response = await approveUndertimeRequest(requestId)
      if (response.success === false) throw new Error(response.message)
      const index = requests.value.findIndex(request => request.id === requestId)
      if (index >= 0) requests.value[index] = mapRequest(response.data)
      return response.message
    } finally {
      approvingId.value = null
    }
  }

  const statusOptions: UndertimeRequestStatus[] = ['Pending', 'Approved', 'Rejected', 'Cancelled']
  const filteredRequests = computed(() => {
    const keyword = search.value.trim().toLowerCase()
    return requests.value.filter(item => (
      (!keyword
        || item.requestNumber.toLowerCase().includes(keyword)
        || item.employeeName.toLowerCase().includes(keyword)
        || item.employeeNumber.toLowerCase().includes(keyword)
        || item.reason.toLowerCase().includes(keyword))
      && (!status.value || item.status === status.value)
      && (!dateFrom.value || item.undertimeDate >= dateFrom.value)
      && (!dateTo.value || item.undertimeDate <= dateTo.value)
    ))
  })

  const stats = computed(() => ({
    total: filteredRequests.value.length,
    pending: filteredRequests.value.filter(item => item.status === 'Pending').length,
    approved: filteredRequests.value.filter(item => item.status === 'Approved').length,
    minutes: filteredRequests.value
      .filter(item => item.status === 'Approved')
      .reduce((sum, item) => sum + item.requestedMinutes, 0),
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
    status.value = ''
    dateFrom.value = ''
    dateTo.value = ''
    currentPage.value = 1
  }

  watch([search, status, dateFrom, dateTo], () => { currentPage.value = 1 })
  watch(totalPages, value => { if (currentPage.value > value) currentPage.value = value })

  return {
    requests,
    loading,
    loadError,
    approvingId,
    search,
    status,
    dateFrom,
    dateTo,
    currentPage,
    statusOptions,
    filteredRequests,
    paginatedRequests,
    stats,
    totalPages,
    showingFrom,
    showingTo,
    loadRequests,
    approveRequest,
    resetFilters,
  }
}
