import type { OvertimeApprovalApiRecord, OvertimeApprovalApiResponse } from '~/types/overtimeApproval'

export const useOvertimeApprovalApi = () => {
  const { $api } = useNuxtApp()
  const endpoint = '/admin/overtime-requests'

  const getOvertimeApprovals = () =>
    $api<OvertimeApprovalApiResponse<OvertimeApprovalApiRecord[]>>(endpoint, {
      method: 'GET',
    })

  const approveOvertimeRequest = (id: number) =>
    $api<OvertimeApprovalApiResponse<OvertimeApprovalApiRecord>>(`${endpoint}/${id}/approve`, {
      method: 'PATCH',
    })

  return { getOvertimeApprovals, approveOvertimeRequest }
}
