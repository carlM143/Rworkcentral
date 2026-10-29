
import type {
  EmployeeLeaveTypesResponse,
} from '~/types/employeeLeaveType'

export const useEmployeeLeaveTypesApi = () => {
  const { $api } = useNuxtApp()

  const endpoint = '/employee/leave-types'

  const getLeaveTypes = () =>
    $api<EmployeeLeaveTypesResponse>(endpoint, {
      method: 'GET',
    })

  return {
    getLeaveTypes,
  }
}
