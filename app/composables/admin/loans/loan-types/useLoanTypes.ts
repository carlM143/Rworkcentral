
import { computed, ref } from 'vue'

import type {
  LoanType,
  LoanTypesResponse,
  CreateLoanTypePayload,
  UpdateLoanTypePayload,
} from '~/types/loans/loan-types/loanType'

export const useLoanTypes = () => {
  const { $api } = useNuxtApp()

  // DATA
  const loanTypes = ref<LoanType[]>([])
  const loading = ref(false)
  const loadError = ref('')

  // FILTERS
  const search = ref('')
  const statusFilter = ref('')

  // GET ALL LOAN TYPES
  const getLoanTypes = async () => {
    loading.value = true
    loadError.value = ''

    try {
      const response = await $api<LoanTypesResponse>(
        '/admin/loan-types',
        {
          method: 'GET',
        },
      )

      if (response.success === false) {
        throw new Error(response.message)
      }

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid loan types response.')
      }

      loanTypes.value = response.data

    } catch (error: unknown) {
      const problem = error as {
        data?: { message?: string }
        message?: string
      }

      loadError.value =
        problem?.data?.message ||
        problem?.message ||
        'Unable to load loan types.'

      loanTypes.value = []

    } finally {
      loading.value = false
    }
  }

  // CREATE LOAN TYPE
  const createLoanType = async (
    payload: CreateLoanTypePayload,
  ): Promise<LoanType> => {

    const response = await $api<{
      success: boolean
      message: string
      data: LoanType
    }>('/admin/loan-types', {
      method: 'POST',
      body: payload,
    })

    if (response.success === false || !response.data) {
      throw new Error(
        response.message || 'Unable to create loan type.',
      )
    }

    return response.data
  }

  const updateLoanType = async (
    id: number,
    payload: UpdateLoanTypePayload,
  ): Promise<LoanType> => {
    const response = await $api<{
      success: boolean
      message: string
      data: LoanType
    }>(`/admin/loan-types/${id}`, {
      method: 'PUT',
      body: payload,
    })

    if (response.success === false || !response.data) {
      throw new Error(response.message || 'Unable to update loan type.')
    }

    return response.data
  }

  const deleteLoanType = async (id: number): Promise<void> => {
    const response = await $api<{
      success: boolean
      message: string
    }>(`/admin/loan-types/${id}`, {
      method: 'DELETE',
    })

    if (response.success === false) {
      throw new Error(response.message || 'Unable to delete loan type.')
    }
  }

  // SEARCH AND STATUS FILTER
  const filteredLoanTypes = computed(() => {
    const keyword = search.value.trim().toLowerCase()
    const selectedStatus = statusFilter.value.trim().toLowerCase()

    return loanTypes.value.filter(item => {

      const matchesSearch =
        !keyword ||
        item.loan_name.toLowerCase().includes(keyword) ||
        item.loan_code.toLowerCase().includes(keyword) ||
        (item.provider ?? '').toLowerCase().includes(keyword)

      const matchesStatus =
        !selectedStatus ||
        (item.status ? 'active' : 'inactive') === selectedStatus

      return matchesSearch && matchesStatus
    })
  })

  // STATISTICS
  const stats = computed(() => ({
    total: loanTypes.value.length,
    active: loanTypes.value.filter(item => item.status).length,
    inactive: loanTypes.value.filter(item => !item.status).length,
  }))

  // RESET FILTERS
  const resetFilters = () => {
    search.value = ''
    statusFilter.value = ''
  }

  // EXPOSE TO COMPONENTS
  return {
    loanTypes,
    filteredLoanTypes,
    loading,
    loadError,
    search,
    statusFilter,
    stats,
    getLoanTypes,
    createLoanType,
    updateLoanType,
    deleteLoanType,
    resetFilters,
  }
}
