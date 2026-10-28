
import type {
  LeavePolicy,
  LeavePolicyApiRecord,
  LeaveTypeOption,
  EmploymentTypeOption,
} from '~/types/leavePolicy'

import { useLeavePolicyApi } from './useLeavePolicyApi'

export const useLeavePolicies = () => {
  const { getLeavePolicies, getLeaveTypes, getEmploymentTypes } = useLeavePolicyApi()

  const policies = ref<LeavePolicy[]>([])
  const leaveTypeOptions = ref<LeaveTypeOption[]>([])
  const employmentTypeOptions = ref<EmploymentTypeOption[]>([])

  const loading = ref(false)
  const optionsLoading = ref(false)
  const loadError = ref('')
  const optionsError = ref('')

  const search = ref('')
  const status = ref('')
  const leaveTypeId = ref(0)
  const employmentTypeId = ref(0)
  const currentPage = ref(1)
  const perPage = 6

  const asBoolean = (value: boolean | number) =>
    value === true || value === 1

  const dateOnly = (value?: string | null) =>
    value ? value.slice(0, 10) : ''

  const mapPolicy = (item: LeavePolicyApiRecord): LeavePolicy => ({
    id: Number(item.id),
    leaveTypeId: Number(item.leave_type_id),
    employmentTypeId: Number(item.employment_type_id),
    leaveTypeName: item.leave_type?.leave_name ?? `Leave Type #${item.leave_type_id}`,
    leaveTypeCode: item.leave_type?.leave_code ?? '',
    employmentTypeName: item.employment_type?.name ?? `Employment Type #${item.employment_type_id}`,
    isEligible: asBoolean(item.is_eligible),
    isPaid: asBoolean(item.is_paid),
    annualCredits: Number(item.annual_credits ?? 0),
    minServiceMonths: Number(item.min_service_months ?? 0),
    allowCarryOver: asBoolean(item.allow_carry_over),
    maxCarryOverDays: Number(item.max_carry_over_days ?? 0),
    requiresApproval: asBoolean(item.requires_approval),
    usageWindow: item.usage_window ?? '',
    validityPeriod: item.validity_period ?? '',
    effectiveFrom: dateOnly(item.effective_from),
    effectiveTo: dateOnly(item.effective_to),
    status: item.status === 'approved' ? 'approved' : 'pending',
  })

  const errorMessage = (problem: any) =>
    problem?.data?.message
    || problem?.response?._data?.message
    || problem?.message
    || 'Request failed.'

  const loadPolicies = async () => {
    loading.value = true
    loadError.value = ''

    try {
      const response = await getLeavePolicies()

      if (response.success === false) throw new Error(response.message)
      if (!Array.isArray(response.data)) throw new Error('Invalid leave policies response.')

      policies.value = response.data.map(mapPolicy)
    } catch (problem: any) {
      loadError.value = errorMessage(problem)
    } finally {
      loading.value = false
    }
  }

  const loadOptions = async () => {
    optionsLoading.value = true
    optionsError.value = ''

    try {
      const [typesResponse, employmentResponse] = await Promise.all([
        getLeaveTypes(),
        getEmploymentTypes(),
      ])

      if (!Array.isArray(typesResponse.data) || !Array.isArray(employmentResponse.data)) {
        throw new Error('Invalid dropdown options response.')
      }

      leaveTypeOptions.value = typesResponse.data.map(item => ({
        id: Number(item.id),
        code: item.leave_code,
        name: item.leave_name,
        status: String(item.status ?? ''),
      }))

      employmentTypeOptions.value = employmentResponse.data.map(item => ({
        id: Number(item.id),
        name: item.name,
      }))
    } catch (problem: any) {
      optionsError.value = errorMessage(problem)
    } finally {
      optionsLoading.value = false
    }
  }

  const stats = computed(() => ({
    total: policies.value.length,
    approved: policies.value.filter(item => item.status === 'approved').length,
    pending: policies.value.filter(item => item.status === 'pending').length,
    paid: policies.value.filter(item => item.isPaid).length,
  }))

  const filteredPolicies = computed(() => {
    const term = search.value.trim().toLowerCase()

    return policies.value.filter(item => {
      const matchesSearch = !term
        || item.leaveTypeName.toLowerCase().includes(term)
        || item.leaveTypeCode.toLowerCase().includes(term)
        || item.employmentTypeName.toLowerCase().includes(term)

      const matchesStatus = !status.value || item.status === status.value
      const matchesLeaveType = !leaveTypeId.value || item.leaveTypeId === leaveTypeId.value
      const matchesEmploymentType = !employmentTypeId.value || item.employmentTypeId === employmentTypeId.value

      return matchesSearch && matchesStatus && matchesLeaveType && matchesEmploymentType
    })
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredPolicies.value.length / perPage))
  )

  const paginatedPolicies = computed(() =>
    filteredPolicies.value.slice(
      (currentPage.value - 1) * perPage,
      currentPage.value * perPage,
    )
  )

  const showingFrom = computed(() =>
    filteredPolicies.value.length ? (currentPage.value - 1) * perPage + 1 : 0
  )

  const showingTo = computed(() =>
    Math.min(currentPage.value * perPage, filteredPolicies.value.length)
  )

  watch([search, status, leaveTypeId, employmentTypeId], () => {
    currentPage.value = 1
  })

  watch(totalPages, pages => {
    if (currentPage.value > pages) currentPage.value = pages
  })

  const resetFilters = () => {
    search.value = ''
    status.value = ''
    leaveTypeId.value = 0
    employmentTypeId.value = 0
    currentPage.value = 1
  }

  return {
    policies,
    leaveTypeOptions,
    employmentTypeOptions,
    loading,
    optionsLoading,
    loadError,
    optionsError,
    search,
    status,
    leaveTypeId,
    employmentTypeId,
    currentPage,
    stats,
    filteredPolicies,
    paginatedPolicies,
    totalPages,
    showingFrom,
    showingTo,
    resetFilters,
    loadPolicies,
    loadOptions,
  }
}
