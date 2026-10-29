import type {
  EmployeeLeaveCreditData,
} from '~/types/employeeLeaveCredit'

import { useEmployeeLeaveCreditApi } from './useEmployeeLeaveCreditApi'

export const useEmployeeLeaveCredits = () => {
  const { getLeaveCredits } = useEmployeeLeaveCreditApi()

  const creditData = ref<EmployeeLeaveCreditData | null>(null)
  const loading = ref(false)
  const errorMessage = ref('')

  const leaveTypes = computed(() =>
    creditData.value?.leave_types ?? []
  )

  const employmentType = computed(() =>
    creditData.value?.employment_type ?? 'Not available'
  )

  const monthsOfService = computed(() =>
    creditData.value?.months_of_service ?? 0
  )

  const loadCredits = async () => {
    if (loading.value) return

    loading.value = true
    errorMessage.value = ''

    try {
      const response = await getLeaveCredits()

      if (!response.success || !response.data) {
        throw new Error(
          response.message || 'Unable to load leave credits.'
        )
      }

      if (!Array.isArray(response.data.leave_types)) {
        throw new Error('Invalid leave credits API response.')
      }

      creditData.value = response.data
    } catch (problem: unknown) {
      const err = problem as {
        data?: { message?: string }
        response?: { _data?: { message?: string } }
        message?: string
      }

      creditData.value = null

      errorMessage.value =
        err?.data?.message ||
        err?.response?._data?.message ||
        err?.message ||
        'Unable to load your leave credits.'
    } finally {
      loading.value = false
    }
  }

  return {
    creditData,
    leaveTypes,
    employmentType,
    monthsOfService,
    loading,
    errorMessage,
    loadCredits,
  }
}
