
import type {
  EmployeeLeaveType,
} from '~/types/employeeLeaveType'

import {
  useEmployeeLeaveTypesApi,
} from './useEmployeeLeaveTypesApi'

export const useEmployeeLeaveTypes = () => {
  const { getLeaveTypes } = useEmployeeLeaveTypesApi()

  const leaveTypes = ref<EmployeeLeaveType[]>([])
  const loading = ref(false)
  const errorMessage = ref('')

  const loadLeaveTypes = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await getLeaveTypes()

      if (!response.success || !Array.isArray(response.data)) {
        throw new Error(
          response.message || 'Unable to load leave types.'
        )
      }

      leaveTypes.value = response.data
    } catch (problem: unknown) {
      const err = problem as {
        data?: { message?: string }
        message?: string
      }

      leaveTypes.value = []
      errorMessage.value =
        err?.data?.message ||
        err?.message ||
        'Unable to load leave types.'
    } finally {
      loading.value = false
    }
  }

  return {
    leaveTypes,
    loading,
    errorMessage,
    loadLeaveTypes,
  }
}
