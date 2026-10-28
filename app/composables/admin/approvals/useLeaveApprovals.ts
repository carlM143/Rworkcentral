
import type { LeaveApproval } from '~/types/leaveApproval'
import { useLeaveApprovalApi } from './useLeaveApprovalApi'

export const useLeaveApprovals = () => {
  const { getLeaveApprovals, approveLeaveRequest } = useLeaveApprovalApi()
  const { success, error: showError } = useToast()

  const requests = ref<LeaveApproval[]>([])
  const loading = ref(false)
  const loadError = ref('')
  const approving = ref(false)
  const selectedRequest = ref<LeaveApproval | null>(null)

  const search = ref('')
  const statusFilter = ref('pending')
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
      return matchSearch && matchStatus
    })
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredRequests.value.length / perPage)))
  const showingFrom = computed(() => filteredRequests.value.length ? (currentPage.value - 1) * perPage + 1 : 0)
  const showingTo = computed(() => Math.min(currentPage.value * perPage, filteredRequests.value.length))
  const paginatedRequests = computed(() => filteredRequests.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

  watch([search, statusFilter], () => { currentPage.value = 1 })
  watch(totalPages, pages => { if (currentPage.value > pages) currentPage.value = pages })

  const resetFilters = () => {
    search.value = ''
    statusFilter.value = 'pending'
    currentPage.value = 1
  }

  const openApproval = (request: LeaveApproval) => {
    if (request.status !== 'pending') return
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

  return {
    requests, loading, loadError, approving, selectedRequest,
    search, statusFilter, currentPage,
    stats, filteredRequests, paginatedRequests,
    totalPages, showingFrom, showingTo, approvalProblem,
    loadRequests, resetFilters, openApproval, closeApproval, handleApprove,
  }
}
