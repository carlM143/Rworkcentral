import type { LeaveType, LeaveTypeApiRecord } from '~/types/leaveType'
import { useLeaveTypeApi } from './useLeaveTypeApi'

export const useLeaveTypes = () => {
  const { getLeaveTypes } = useLeaveTypeApi()

  const leaveTypes = ref<LeaveType[]>([])
  const loading = ref(false)
  const loadError = ref('')

  const search = ref('')
  const status = ref('')
  const currentPage = ref(1)
  const perPage = 6

  const mapLeaveType = (item: LeaveTypeApiRecord): LeaveType => ({
    id: Number(item.id),
    userId: Number(item.user_id),
    code: item.leave_code,
    name: item.leave_name,
    status: String(item.status || '').toLowerCase(),
    policiesCount: Number(item.leave_policies_count ?? 0),
    requestsCount: Number(item.leave_requests_count ?? 0),
  })

  const loadLeaveTypes = async () => {
    loading.value = true
    loadError.value = ''

    try {
      const response = await getLeaveTypes()

      if (response.success === false) throw new Error(response.message)
      if (!Array.isArray(response.data)) throw new Error('Invalid leave types response.')

      leaveTypes.value = response.data.map(mapLeaveType)
    } catch (problem: any) {
      loadError.value = problem?.data?.message
        || problem?.response?._data?.message
        || problem?.message
        || 'Unable to load leave types.'
    } finally {
      loading.value = false
    }
  }

  const stats = computed(() => ({
    total: leaveTypes.value.length,
    active: leaveTypes.value.filter(item => item.status === 'active').length,
    inactive: leaveTypes.value.filter(item => item.status === 'inactive').length,
    policies: leaveTypes.value.reduce((total, item) => total + item.policiesCount, 0),
  }))

  const statusOptions = computed(() =>
    [...new Set(leaveTypes.value.map(item => item.status).filter(Boolean))].sort()
  )

  const filteredLeaveTypes = computed(() => {
    const term = search.value.trim().toLowerCase()

    return leaveTypes.value.filter(item => {
      const matchSearch = !term
        || item.name.toLowerCase().includes(term)
        || item.code.toLowerCase().includes(term)

      const matchStatus = !status.value || item.status === status.value

      return matchSearch && matchStatus
    })
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredLeaveTypes.value.length / perPage))
  )

  const showingFrom = computed(() =>
    filteredLeaveTypes.value.length ? (currentPage.value - 1) * perPage + 1 : 0
  )

  const showingTo = computed(() =>
    Math.min(currentPage.value * perPage, filteredLeaveTypes.value.length)
  )

  const paginatedLeaveTypes = computed(() =>
    filteredLeaveTypes.value.slice(
      (currentPage.value - 1) * perPage,
      currentPage.value * perPage,
    )
  )

  watch([search, status], () => { currentPage.value = 1 })

  watch(totalPages, pages => {
    if (currentPage.value > pages) currentPage.value = pages
  })

  const resetFilters = () => {
    search.value = ''
    status.value = ''
    currentPage.value = 1
  }

  return {
    leaveTypes,
    loading,
    loadError,
    search,
    status,
    currentPage,
    stats,
    statusOptions,
    filteredLeaveTypes,
    paginatedLeaveTypes,
    totalPages,
    showingFrom,
    showingTo,
    resetFilters,
    loadLeaveTypes,
  }
}