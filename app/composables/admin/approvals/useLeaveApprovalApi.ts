import type { LeaveApproval, LeaveApprovalApiResponse } from '~/types/leaveApproval'

export const useLeaveApprovalApi = () => {
  const { $api } = useNuxtApp()
  const endpoint = '/admin/leave-approvals'

  const getLeaveApprovals = () =>
    $api<LeaveApprovalApiResponse<LeaveApproval[]>>(endpoint, {
      method: 'GET',
    })

  const approveLeaveRequest = (id: number) =>
    $api<LeaveApprovalApiResponse<LeaveApproval>>(`${endpoint}/${id}/approve`, {
      method: 'PATCH',
    })

  const rejectLeaveRequest = (id: number) =>
    $api<LeaveApprovalApiResponse<LeaveApproval>>(`${endpoint}/${id}/reject`, {
      method: 'PATCH',
    })

  const revertLeaveRequest = (id: number) =>
    $api<LeaveApprovalApiResponse<LeaveApproval>>(`${endpoint}/${id}/revert`, {
      method: 'PATCH',
    })

  return { getLeaveApprovals, approveLeaveRequest, rejectLeaveRequest, revertLeaveRequest }
}
