import { getObaApprovalApiError, useObaApprovalApi } from '~/composables/admin/approvals/UseObaApprovalApi'
import type { ObaRequestRecord, ObaRequestStatus, ObaSummary } from '~/types/oba-request/obaRequest'

const PER_PAGE = 15

export const useObaApprovals = () => {
  const api = useObaApprovalApi()

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

  return {
    requests, summary, search, statusFilter, dateFrom, dateTo,
    currentPage, totalPages, total, showingFrom, showingTo,
    loading, loadError, loadRequests, resetFilters,
  }
}
