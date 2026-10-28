import { useNuxtApp } from '#imports'
import type {
  LeaveBalance,
  LeaveBalanceApiResponse,
  AdjustLeaveCreditPayload,
} from '~/types/leaveBalance'

export const useLeaveBalanceApi = () => {
  const { $api } = useNuxtApp()

  const getLeaveBalances = () =>
    $api<LeaveBalanceApiResponse<LeaveBalance[]>>(
      '/admin/leave-credit-balances',
      { method: 'GET' },
    )

  const adjustLeaveCredits = (payload: AdjustLeaveCreditPayload) =>
    $api<LeaveBalanceApiResponse<unknown>>(
      '/admin/leave-credit-transactions/adjust',
      { method: 'POST', body: payload },
    )

  return {
    getLeaveBalances,
    adjustLeaveCredits,
  }
}
