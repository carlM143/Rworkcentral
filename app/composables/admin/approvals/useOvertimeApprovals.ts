import type {
  OvertimeApproval,
  OvertimeApprovalApiRecord,
  OvertimeApprovalStatus,
  OvertimeApprovalType,
} from '~/types/overtimeApproval'
import { useOvertimeApprovalApi } from './useOvertimeApprovalApi'

const statusLabel = (status: string): OvertimeApprovalStatus => {
  const value = status.toLowerCase()
  if (value === 'approved') return 'Approved'
  if (value === 'rejected') return 'Rejected'
  if (value === 'cancelled') return 'Cancelled'
  if (value === 'for_review') return 'For Review'
  return 'Pending'
}

const mapRequest = (record: OvertimeApprovalApiRecord): OvertimeApproval => {
  const requestedHours = Math.max(
    0,
    Math.round(((new Date(record.end_at).getTime() - new Date(record.start_at).getTime()) / 3_600_000) * 100) / 100,
  )
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
    overtimeDate: record.ot_date?.slice(0, 10) ?? '',
    startTime: record.start_at?.slice(11, 16) || '00:00',
    endTime: record.end_at?.slice(11, 16) || '00:00',
    requestedHours,
    approvedHours: status === 'Approved' ? requestedHours : undefined,
    overtimeType: 'Regular OT',
    reason: record.reason,
    filedAt: record.created_at,
    status,
    immediateSupervisor: '—',
    reviewedBy: record.approver?.name,
    reviewedAt: record.approved_at ?? undefined,
  }
}

export const useOvertimeApprovals = () => {
  const { getOvertimeApprovals, approveOvertimeRequest } = useOvertimeApprovalApi()
  const requests = ref<OvertimeApproval[]>([])
  const loading = ref(false)
  const loadError = ref('')
  const approvingId = ref<number | null>(null)
  const search = ref('')
  const department = ref('')
  const overtimeType = ref('')
  const status = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const currentPage = ref(1)
  const perPage = ref(6)

  const loadRequests = async () => {
    loading.value = true
    loadError.value = ''
    try {
      const response = await getOvertimeApprovals()
      if (response.success === false) throw new Error(response.message)
      if (!Array.isArray(response.data)) throw new Error('Invalid overtime requests response.')
      requests.value = response.data.map(mapRequest)
    } catch (problem: any) {
      requests.value = []
      loadError.value = problem?.data?.message ?? problem?.message ?? 'Unable to load overtime approvals.'
    } finally {
      loading.value = false
    }
  }

  const approveRequest = async (requestId: number) => {
    approvingId.value = requestId
    try {
      const response = await approveOvertimeRequest(requestId)
      if (response.success === false) throw new Error(response.message)
      const index = requests.value.findIndex(item => item.id === requestId)
      if (index >= 0) requests.value[index] = mapRequest(response.data)
      return response.message
    } finally {
      approvingId.value = null
    }
  }

  const departmentOptions = computed(() => [
    ...new Set(requests.value.map(item => item.department).filter(value => value !== '—')),
  ].sort())
  const overtimeTypeOptions: OvertimeApprovalType[] = ['Regular OT', 'Rest Day OT', 'Holiday OT']
  const statusOptions: OvertimeApprovalStatus[] = ['Pending', 'For Review', 'Approved', 'Rejected', 'Cancelled']
  const filteredRequests = computed(() => {
    const keyword = search.value.trim().toLowerCase()
    return requests.value.filter(item => (
      (!keyword
        || item.requestNumber.toLowerCase().includes(keyword)
        || item.employeeName.toLowerCase().includes(keyword)
        || item.employeeNumber.toLowerCase().includes(keyword)
        || item.reason.toLowerCase().includes(keyword))
      && (!department.value || item.department === department.value)
      && (!overtimeType.value || item.overtimeType === overtimeType.value)
      && (!status.value || item.status === status.value)
      && (!dateFrom.value || item.overtimeDate >= dateFrom.value)
      && (!dateTo.value || item.overtimeDate <= dateTo.value)
    ))
  })
  const stats = computed(() => ({
    totalRequests: filteredRequests.value.length,
    pending: filteredRequests.value.filter(item => ['Pending', 'For Review'].includes(item.status)).length,
    approved: filteredRequests.value.filter(item => item.status === 'Approved').length,
    approvedHours: filteredRequests.value.reduce((sum, item) => sum + (item.approvedHours ?? 0), 0),
  }))
  const totalPages = computed(() => Math.max(1, Math.ceil(filteredRequests.value.length / perPage.value)))
  const paginatedRequests = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredRequests.value.slice(start, start + perPage.value)
  })
  const showingFrom = computed(() => filteredRequests.value.length ? (currentPage.value - 1) * perPage.value + 1 : 0)
  const showingTo = computed(() => Math.min(currentPage.value * perPage.value, filteredRequests.value.length))
  const resetFilters = () => {
    search.value = ''; department.value = ''; overtimeType.value = ''; status.value = ''
    dateFrom.value = ''; dateTo.value = ''; currentPage.value = 1
  }

  watch([search, department, overtimeType, status, dateFrom, dateTo], () => { currentPage.value = 1 })
  watch(totalPages, value => { if (currentPage.value > value) currentPage.value = value })

  return {
    requests, loading, loadError, approvingId, loadRequests, approveRequest,
    search, department, overtimeType, status, dateFrom, dateTo, currentPage,
    filteredRequests, paginatedRequests, totalPages, showingFrom, showingTo, stats,
    departmentOptions, overtimeTypeOptions, statusOptions, resetFilters,
  }
}
