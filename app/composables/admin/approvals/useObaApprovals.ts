import { getObaApprovalApiError, useObaApprovalApi } from '~/composables/admin/approvals/UseObaApprovalApi'
import type { ObaRequestRecord, ObaRequestStatus, ObaSummary } from '~/types/oba-request/obaRequest'

const PER_PAGE = 15

export const useObaApprovals = () => {
  const api = useObaApprovalApi()
  const { can, user, roleName } = useAuth()
  const { $api } = useNuxtApp()
  const canFinalApprove = computed(() => roleName.value !== 'supervisor' && can('approvals', 'oba.approve'))
  const isPendingDepartmentApprover = (item: ObaRequestRecord | null | undefined) => {
    if (!item || item.status !== 'pending') return false
    return can('approvals', 'oba.edit')
      && Boolean(item.department_approvals?.some(a => a.user_id === user.value?.id && a.status === 'pending'))
  }

  const requests = ref<ObaRequestRecord[]>([])
  const summary = ref<ObaSummary>({})
  const search = ref('')
  const statusFilter = ref<ObaRequestStatus | ''>('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const currentPage = ref(1)
  const totalPages = ref(1)
  const total = ref(0)
  const loading = ref(false)
  const loadError = ref('')

  const showingFrom = computed(() => (total.value ? (currentPage.value - 1) * PER_PAGE + 1 : 0))
  const showingTo = computed(() => Math.min(currentPage.value * PER_PAGE, total.value))

  const loadRequests = async () => {
    if (dateFrom.value && dateTo.value && dateTo.value < dateFrom.value) {
      loadError.value = 'The end date must be on or after the start date.'
      return
    }
    loading.value = true
    loadError.value = ''
    try {
      const res = await api.list({
        page: currentPage.value,
        per_page: PER_PAGE,
        status: statusFilter.value,
        search: search.value.trim(),
        date_from: dateFrom.value,
        date_to: dateTo.value,
      })
      if (!res.success) throw new Error(res.message || 'Unable to load OBA requests.')
      requests.value = res.data.data
      totalPages.value = Math.max(1, res.data.last_page)
      total.value = res.data.total
      summary.value = res.summary ?? {}
    } catch (cause: unknown) {
      requests.value = []
      loadError.value = getObaApprovalApiError(cause, 'Unable to load OBA requests.')
    } finally {
      loading.value = false
    }
  }

  // A filter change goes back to page 1; the page watcher then does the reload.
  const applyFilters = () => {
    if (currentPage.value !== 1) currentPage.value = 1
    else void loadRequests()
  }

  watch(currentPage, () => { void loadRequests() })
  watch([statusFilter, dateFrom, dateTo], applyFilters)

  let searchTimer: ReturnType<typeof setTimeout> | undefined
  watch(search, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(applyFilters, 350)
  })
  onBeforeUnmount(() => clearTimeout(searchTimer))

  const resetFilters = () => {
    search.value = ''
    statusFilter.value = ''
    dateFrom.value = ''
    dateTo.value = ''
  }

  /* ---------------- HR actions ---------------- */

  const actingId = ref<number | null>(null)
  const actionError = ref('')

  // Runs approve/reject, then reloads the list so the row and stat cards
  // reflect the new status. Returns the updated record, or null on failure.
  const runAction = async (
    id: number,
    call: () => Promise<{ success: boolean, message?: string, data: ObaRequestRecord }>,
    fallback: string,
  ) => {
    if (actingId.value) return null
    actingId.value = id
    actionError.value = ''
    try {
      const res = await call()
      if (!res.success) throw new Error(res.message || fallback)
      void loadRequests()
      return res
    } catch (cause: unknown) {
      actionError.value = getObaApprovalApiError(cause, fallback)
      return null
    } finally {
      actingId.value = null
    }
  }

  const approveRequest = (id: number) => {
    const target = requests.value.find(item => item.id === id)
    if (isPendingDepartmentApprover(target)) {
      return runAction(id, async () => {
        const res = await $api<{ success: boolean, message?: string }>(`/admin/oba-requests/${id}/department-approve`, { method: 'PATCH', body: { remarks: '' } })
        if (!res.success) throw new Error(res.message || 'Unable to approve this OBA request.')
        const refreshed = await api.show(id)
        return { success: true, message: res.message || 'OBA request approved as department approver.', data: refreshed.data }
      }, 'Unable to approve this OBA request.')
    }
    if (!canFinalApprove.value) {
      actionError.value = 'Supervisors can only perform department approval.'
      return Promise.resolve(null)
    }
    return runAction(id, () => api.approve(id), 'Unable to approve this OBA request.')
  }

  const rejectRequest = (id: number, reason: string) => {
    const target = requests.value.find(item => item.id === id)
    if (isPendingDepartmentApprover(target)) {
      return runAction(id, async () => {
        const res = await $api<{ success: boolean, message?: string }>(`/admin/oba-requests/${id}/department-reject`, { method: 'PATCH', body: { remarks: reason.trim() } })
        if (!res.success) throw new Error(res.message || 'Unable to reject this OBA request.')
        const refreshed = await api.show(id)
        return { success: true, message: res.message || 'OBA request rejected as department approver.', data: refreshed.data }
      }, 'Unable to reject this OBA request.')
    }
    if (!canFinalApprove.value) {
      actionError.value = 'Supervisors can only perform department approval.'
      return Promise.resolve(null)
    }
    return runAction(id, () => api.reject(id, reason.trim()), 'Unable to reject this OBA request.')
  }

  return {
    requests, summary, search, statusFilter, dateFrom, dateTo,
    currentPage, totalPages, total, showingFrom, showingTo,
    loading, loadError, loadRequests, resetFilters,
    actingId, actionError, approveRequest, rejectRequest, isPendingDepartmentApprover, canFinalApprove,
  }
}
