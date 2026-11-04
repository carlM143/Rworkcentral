import { computed, ref, watch } from 'vue'
import type {
  ApprovalAction,
  ApiErrorDetails,
  CreateSalaryAdjustmentPayload,
  SalaryAdjustment,
  SalaryAdjustmentResponse,
  SalaryAdjustmentsResponse,
  SalarySetupChoice,
  SalarySetupChoicesResponse,
} from '~/types/salaryAdjustments/salaryAdjustment'

export const getSalaryAdjustmentApiError = (error: unknown): ApiErrorDetails => {
  const problem = error as {
    data?: { message?: string; errors?: Record<string, string[]> }
    response?: { _data?: { message?: string; errors?: Record<string, string[]> } }
    message?: string
  }
  const data = problem?.data ?? problem?.response?._data
  const errors = data?.errors ?? {}
  const firstError = Object.values(errors).flat()[0]

  return {
    message: String(firstError || data?.message || problem?.message || 'Request failed.'),
    errors,
  }
}

const isActive = (value: SalarySetupChoice['status']): boolean =>
  value === true || value === 1 || value === '1'
  || value === 'true' || value === 'Active' || value === 'active'

export const useSalaryAdjustments = () => {
  const { $api } = useNuxtApp()

  const adjustments = ref<SalaryAdjustment[]>([])
  const choices = ref<SalarySetupChoice[]>([])
  const loading = ref(false)
  const choicesLoading = ref(false)
  const loadError = ref('')
  const choicesError = ref('')

  const saving = ref(false)
  const mutating = ref(false)
  const mutationError = ref('')
  const fieldErrors = ref<Record<string, string[]>>({})

  const search = ref('')
  const status = ref('')
  const adjustmentType = ref('')
  const dateFrom = ref('')
  const dateTo = ref('')
  const currentPage = ref(1)
  const perPage = 6

  const getAdjustments = async (): Promise<void> => {
    loading.value = true
    loadError.value = ''
    try {
      const response = await $api<SalaryAdjustmentsResponse>('/admin/salary-adjustments', {
        method: 'GET',
      })
      if (response.success === false || !Array.isArray(response.data)) {
        throw new Error(response.message || 'Invalid salary adjustments response.')
      }
      adjustments.value = response.data
    } catch (error: unknown) {
      adjustments.value = []
      loadError.value = getSalaryAdjustmentApiError(error).message
    } finally {
      loading.value = false
    }
  }

  const getSalaryChoices = async (): Promise<void> => {
    choicesLoading.value = true
    choicesError.value = ''
    try {
      // This existing Salary Rates API returns ALL employees, with salary_setup id or null.
      const response = await $api<SalarySetupChoicesResponse>('/admin/employee-salary-rates', {
        method: 'GET',
      })
      if (response.success === false || !Array.isArray(response.data)) {
        throw new Error(response.message || 'Invalid employee salary rates response.')
      }
      choices.value = response.data.filter(item =>
        item.is_configured === true && Number.isInteger(item.id) && Number(item.id) > 0
        && isActive(item.status),
      )
    } catch (error: unknown) {
      choices.value = []
      choicesError.value = getSalaryAdjustmentApiError(error).message
    } finally {
      choicesLoading.value = false
    }
  }

  const stats = computed(() => ({
    total: adjustments.value.length,
    pending: adjustments.value.filter(item => item.status === 'pending').length,
    approved: adjustments.value.filter(item => item.status === 'approved').length,
    applied: adjustments.value.filter(item => item.status === 'applied').length,
  }))

  const filteredAdjustments = computed(() => {
    const keyword = search.value.trim().toLowerCase()
    const currentStatus = status.value.trim().toLowerCase()
    const currentType = adjustmentType.value.trim().toLowerCase()

    return adjustments.value.filter(item => {
      const searchable = [item.employee_name, item.emp_id, item.salary_type, item.reason, item.id]
        .filter(value => value != null)
        .join(' ').toLowerCase()
      const matchSearch = !keyword || searchable.includes(keyword)
      const matchStatus = !currentStatus || item.status === currentStatus
      const matchType = !currentType || item.adjustment_type === currentType
      const effective = item.effective_date?.slice(0, 10) ?? ''
      const matchDate = (!dateFrom.value || effective >= dateFrom.value)
        && (!dateTo.value || effective <= dateTo.value)
      return matchSearch && matchStatus && matchType && matchDate
    })
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredAdjustments.value.length / perPage)))
  const paginatedAdjustments = computed(() => {
    const start = (currentPage.value - 1) * perPage
    return filteredAdjustments.value.slice(start, start + perPage)
  })
  const showingFrom = computed(() =>
    filteredAdjustments.value.length ? (currentPage.value - 1) * perPage + 1 : 0,
  )
  const showingTo = computed(() => Math.min(currentPage.value * perPage, filteredAdjustments.value.length))

  watch([search, status, adjustmentType, dateFrom, dateTo], () => { currentPage.value = 1 })
  watch(totalPages, total => { if (currentPage.value > total) currentPage.value = total })

  const resetFilters = () => {
    search.value = ''
    status.value = ''
    adjustmentType.value = ''
    dateFrom.value = ''
    dateTo.value = ''
    currentPage.value = 1
  }

  const clearMutationError = () => {
    mutationError.value = ''
    fieldErrors.value = {}
  }

  const createAdjustment = async (
    payload: CreateSalaryAdjustmentPayload,
  ): Promise<SalaryAdjustment> => {
    if (saving.value || mutating.value) throw new Error('Another action is in progress.')
    saving.value = true
    clearMutationError()
    try {
      const response = await $api<SalaryAdjustmentResponse>('/admin/salary-adjustments', {
        method: 'POST',
        body: payload,
      })
      if (response.success === false || !response.data) {
        throw new Error(response.message || 'Could not create salary adjustment.')
      }
      return response.data
    } catch (error: unknown) {
      const details = getSalaryAdjustmentApiError(error)
      mutationError.value = details.message
      fieldErrors.value = details.errors
      throw error
    } finally {
      saving.value = false
    }
  }

  const changeStatus = async (
    item: SalaryAdjustment,
    action: ApprovalAction,
  ): Promise<SalaryAdjustment> => {
    if (mutating.value || saving.value) throw new Error('Another action is in progress.')
    if (action === 'apply' && item.status !== 'approved') throw new Error('Only approved adjustments can be applied.')
    if (action !== 'apply' && item.status !== 'pending') throw new Error('Only pending adjustments can be reviewed.')

    mutating.value = true
    clearMutationError()
    try {
      const response = await $api<SalaryAdjustmentResponse>(
        `/admin/salary-adjustments/${item.id}/${action}`,
        { method: 'PATCH' },
      )
      if (response.success === false || !response.data) {
        throw new Error(response.message || `Could not ${action} salary adjustment.`)
      }
      return response.data
    } catch (error: unknown) {
      mutationError.value = getSalaryAdjustmentApiError(error).message
      throw error
    } finally {
      mutating.value = false
    }
  }

  return {
    adjustments, choices, loading, choicesLoading, loadError, choicesError,
    saving, mutating, mutationError, fieldErrors,
    search, status, adjustmentType, dateFrom, dateTo,
    currentPage, totalPages, showingFrom, showingTo,
    stats, filteredAdjustments, paginatedAdjustments,
    getAdjustments, getSalaryChoices, resetFilters, clearMutationError,
    createAdjustment, changeStatus,
  }
}