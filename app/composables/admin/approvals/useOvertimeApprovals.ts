import type {
  OvertimeApproval,
  OvertimeApprovalApiRecord,
  OvertimeApprovalStatus,
} from '~/types/overtimeApproval'
import { hasActiveFilter, resolveExportRecords } from '~/utils/approvalExport'
import { useOvertimeApprovalApi } from './useOvertimeApprovalApi'

const statusLabel = (status: string): OvertimeApprovalStatus => {
  const value = status.toLowerCase()
  if (value === 'approved') return 'Approved'
  if (value === 'rejected') return 'Rejected'
  if (value === 'cancelled') return 'Cancelled'
  return 'Pending'
}

const mapRequest = (record: OvertimeApprovalApiRecord): OvertimeApproval => {
  const requestedHours = Math.max(
    0,
    Math.round(((new Date(record.end_at).getTime() - new Date(record.start_at).getTime()) / 3_600_000) * 100) / 100,
  )
  const status = statusLabel(record.status)
  const employments = [...(record.employee?.employments ?? [])].sort((a, b) => a.id - b.id)
  const latestEmployment = employments[employments.length - 1]
  const department = latestEmployment?.department?.department_name
    ?? record.employee?.department?.department_name
    ?? '—'
  const position = latestEmployment?.position?.position
    ?? record.work_schedule?.schedule_name
    ?? '—'

  return {
    id: record.id,
    requestNumber: record.request_no,
    employeeId: record.employee_id,
    employeeNumber: record.employee?.emp_id ? String(record.employee.emp_id) : `EMP-${record.employee_id}`,
    employeeName: record.employee
      ? [record.employee.firstname, record.employee.middlename, record.employee.lastname].filter(Boolean).join(' ')
      : 'Unknown employee',
    department,
    position,
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
  const { getOvertimeApprovals, approveOvertimeRequest, rejectOvertimeRequest, revertOvertimeRequest } = useOvertimeApprovalApi()
  const requests = ref<OvertimeApproval[]>([])
  const loading = ref(false)
  const loadError = ref('')
  const approvingId = ref<number | null>(null)
  const search = ref('')
  const department = ref('')
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

  const rejectRequest = async (requestId: number) => {
    approvingId.value = requestId
    try {
      const response = await rejectOvertimeRequest(requestId)
      if (response.success === false) throw new Error(response.message)
      const index = requests.value.findIndex(item => item.id === requestId)
      if (index >= 0) requests.value[index] = mapRequest(response.data)
      return response.message
    } finally {
      approvingId.value = null
    }
  }

  const revertRequest = async (requestId: number) => {
    approvingId.value = requestId
    try {
      const response = await revertOvertimeRequest(requestId)
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
  const statusOptions: OvertimeApprovalStatus[] = ['Pending', 'Approved', 'Rejected', 'Cancelled']
  const filteredRequests = computed(() => {
    const keyword = search.value.trim().toLowerCase()
    return requests.value.filter(item => (
      (!keyword
        || item.requestNumber.toLowerCase().includes(keyword)
        || item.employeeName.toLowerCase().includes(keyword)
        || item.employeeNumber.toLowerCase().includes(keyword)
        || item.reason.toLowerCase().includes(keyword))
      && (!department.value || item.department === department.value)
      && (!status.value || item.status === status.value)
      && (!dateFrom.value || item.overtimeDate >= dateFrom.value)
      && (!dateTo.value || item.overtimeDate <= dateTo.value)
    ))
  })
  const hasFilters = computed(() => hasActiveFilter([
    search.value,
    department.value,
    status.value,
    dateFrom.value,
    dateTo.value,
  ]))

  const exportRecords = computed(() => resolveExportRecords(
    requests.value,
    filteredRequests.value,
    hasFilters.value,
  ))

  const stats = computed(() => ({
    totalRequests: filteredRequests.value.length,
    pending: filteredRequests.value.filter(item => item.status === 'Pending').length,
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
    search.value = ''; department.value = ''; status.value = ''
    dateFrom.value = ''; dateTo.value = ''; currentPage.value = 1
  }

  watch([search, department, status, dateFrom, dateTo], () => { currentPage.value = 1 })
  watch(totalPages, value => { if (currentPage.value > value) currentPage.value = value })

  return {
    requests, loading, loadError, approvingId, loadRequests, approveRequest, rejectRequest, revertRequest,
    search, department, status, dateFrom, dateTo, currentPage,
    filteredRequests, paginatedRequests, totalPages, showingFrom, showingTo, stats,
    departmentOptions, statusOptions, hasFilters, exportRecords, resetFilters,
  }
}
