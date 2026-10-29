import type {
  EmployeeLeaveCreditApiResponse,
} from '~/types/employeeLeaveCredit'

export const useEmployeeLeaveCreditApi = () => {
  const { $api } = useNuxtApp()

  const endpoint = '/employee/leave-credits'

  const getLeaveCredits = () =>
    $api<EmployeeLeaveCreditApiResponse>(endpoint, {
      method: 'GET',
    })

  return {
    getLeaveCredits,
  }
}
