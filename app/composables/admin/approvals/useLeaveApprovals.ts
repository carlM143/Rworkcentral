import type { LeaveApproval } from '~/types/leaveApproval'
import { hasActiveFilter, resolveExportRecords } from '~/utils/approvalExport'
import { useLeaveApprovalApi } from './useLeaveApprovalApi'

export const useLeaveApprovals = () => {
  const { getLeaveApprovals, approveLeaveRequest, rejectLeaveRequest, revertLeaveRequest } = useLeaveApprovalApi()
  const { success, error: showError } = useToast()

  const requests = ref<LeaveApproval[]>([])
  const loading = ref(false)
  const loadError = ref('')
  const approving = ref(false)
  const selectedRequest = ref<LeaveApproval | null>(null)

  const search = ref('')
  const statusFilter = ref('')
  const department = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const currentPage = ref(1)
  const perPage = 6

  const getErrorMessage = (problem: any): string => {
    const data = problem?.data ?? problem?.response?._data ?? {}
    const firstError = Object.values(data.errors ?? {}).flat()[0]
    return String(firstError || data.message || problem?.message || 'Request failed.')
  }

  const loadRequests = async () => {
    loading.value = true
    loadError.value = ''

    try {
      const response = await getLeaveApprovals()
      if (response.success === false) throw new Error(response.message)
      if (!Array.isArray(response.data)) throw new Error('Invalid leave requests response.')
      requests.value = response.data
    } catch (problem) {
      loadError.value = getErrorMessage(problem)
    } finally {
      loading.value = false
    }
  }

  const stats = computed(() => ({
    total: requests.value.length,
    pending: requests.value.filter(item => item.status === 'pending').length,
    approved: requests.value.filter(item => item.status === 'approved').length,
    rejected: requests.value.filter(item => item.status === 'rejected').length,
  }))

  const filteredRequests = computed(() => {
    const term = search.value.trim().toLowerCase()

    return requests.value.filter(item => {
      const matchSearch = !term
        || item.request_no.toLowerCase().includes(term)
        || item.employee.name.toLowerCase().includes(term)
        || String(item.employee.emp_id ?? '').includes(term)
        || item.leave_type.toLowerCase().includes(term)

      const matchStatus = !statusFilter.value || item.status === statusFilter.value

      const itemDepartment = item.employee?.department ?? ''
      const matchDepartment = !department.value || itemDepartment === department.value

      const requestDate = (item.request_date ?? '').slice(0, 10)
      const matchDate = (!dateFrom.value || requestDate >= dateFrom.value)
        && (!dateTo.value || requestDate <= dateTo.value)

      return matchSearch && matchStatus && matchDepartment && matchDate
    })
  })

  const hasFilters = computed(() => hasActiveFilter([
    search.value,
    department.value,
    dateFrom.value,
    dateTo.value,
    statusFilter.value,
  ]))

  const exportRecords = computed(() => resolveExportRecords(
    requests.value,
    filteredRequests.value,
    hasFilters.value,
  ).map(item => {
    const datesStr = Array.isArray(item.dates) && item.dates.length > 0
      ? item.dates.map(d => {
        const type = d.day_type ? ` (${d.day_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())})` : ''
        return `${d.leave_date}${type}`
      }).join('; ')
      : (item.start ? (item.end && item.end !== item.start ? `${item.start} to ${item.end}` : item.start) : '—')

    return {
      request_no: item.request_no,
      employee: item.employee ? `${item.employee.name}${item.employee.emp_id ? ` (${item.employee.emp_id})` : ''}` : '—',
      department: item.employee?.department || '—',
      position: item.employee?.position || '—',
      leave_type: item.leave_type,
      leave_code: item.leave_code || '—',
      leave_policy_id: item.leave_policy_id,
      policy_status: item.policy_status || '—',
      policy_eligible: item.policy_eligible ? 'Yes' : 'No',
      policy_paid: item.policy_paid ? 'Yes' : 'No',
      request_date: item.request_date || '—',
      start: item.start || '—',
      end: item.end || '—',
      dates: datesStr,
      requested_pay_type: item.requested_pay_type,
      approved_pay_type: item.approved_pay_type || '—',
      total_days: item.total_days ?? 1,
      reason: item.reason || '—',
      status: item.status,
      approved_by: item.approver_name || (item.approved_by ? `Approver #${item.approved_by}` : '—'),
      approved_at: item.approved_at || '—',
      created_at: item.created_at || '—',
    }
  }))

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredRequests.value.length / perPage)))
  const showingFrom = computed(() => filteredRequests.value.length ? (currentPage.value - 1) * perPage + 1 : 0)
  const showingTo = computed(() => Math.min(currentPage.value * perPage, filteredRequests.value.length))
  const paginatedRequests = computed(() => filteredRequests.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

  watch([search, statusFilter, department, dateFrom, dateTo], () => { currentPage.value = 1 })
  watch(totalPages, pages => { if (currentPage.value > pages) currentPage.value = pages })

  const departmentOptions = computed(() => [
    ...new Set(
      requests.value
        .map(item => item.employee?.department ?? '')
        .filter(value => value !== ''),
    ),
  ].sort())

  const resetFilters = () => {
    search.value = ''
    statusFilter.value = ''
    department.value = ''
    dateFrom.value = ''
    dateTo.value = ''
    currentPage.value = 1
  }

  const openApproval = (request: LeaveApproval) => {
    selectedRequest.value = request
  }

  const closeApproval = () => {
    if (!approving.value) selectedRequest.value = null
  }

  const approvalProblem = computed(() => {
    const item = selectedRequest.value
    if (!item) return ''
    if (item.policy_status !== 'approved') return 'The assigned Leave Policy must be approved.'
    if (!item.policy_eligible) return 'The selected Leave Policy is not eligible.'
    if (item.policy_paid === null) return 'The assigned Leave Policy was not found.'
    if ((item.policy_paid ? 'paid' : 'unpaid') !== item.requested_pay_type) {
      return 'The requested payment type does not match the assigned Leave Policy.'
    }
    return ''
  })

  const handleApprove = async () => {
    if (!selectedRequest.value || approving.value || approvalProblem.value) return

    approving.value = true

    try {
      const response = await approveLeaveRequest(selectedRequest.value.id)
      if (response.success === false) throw new Error(response.message)

      selectedRequest.value = null
      success('Leave Request Approved', response.message || 'Leave request approved successfully.')
      await loadRequests()
    } catch (problem) {
      showError('Unable to Approve Leave', getErrorMessage(problem))
    } finally {
      approving.value = false
    }
  }

  const handleReject = async () => {
    if (!selectedRequest.value || approving.value) return

    approving.value = true

    try {
      const response = await rejectLeaveRequest(selectedRequest.value.id)
      if (response.success === false) throw new Error(response.message)

      selectedRequest.value = null
      success('Leave Request Rejected', response.message || 'Leave request rejected successfully.')
      await loadRequests()
    } catch (problem) {
      showError('Unable to Reject Leave', getErrorMessage(problem))
    } finally {
      approving.value = false
    }
  }

  const handleRevert = async (target?: LeaveApproval) => {
    const item = target ?? selectedRequest.value
    if (!item || approving.value) return

    approving.value = true

    try {
      const response = await revertLeaveRequest(item.id)
      if (response.success === false) throw new Error(response.message)

      if (selectedRequest.value?.id === item.id) {
        selectedRequest.value = null
      }
      success('Leave Request Reverted', response.message || 'Leave request reverted to pending successfully.')
      await loadRequests()
    } catch (problem) {
      showError('Unable to Revert Leave', getErrorMessage(problem))
    } finally {
      approving.value = false
    }
  }

  return {
    requests, loading, loadError, approving, selectedRequest,
    search, statusFilter, department, dateFrom, dateTo, currentPage,
    stats, filteredRequests, paginatedRequests,
    totalPages, showingFrom, showingTo, approvalProblem,
    departmentOptions, hasFilters, exportRecords,
    loadRequests, resetFilters, openApproval, closeApproval, handleApprove, handleReject, handleRevert,
  }
}
