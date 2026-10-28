import type { UndertimeApprovalApiRecord, UndertimeApprovalApiResponse } from '~/types/undertimeRequest'

export const useUndertimeApprovalApi = () => {
  const { $api } = useNuxtApp()
  const endpoint = '/admin/undertime-requests'

  const getUndertimeApprovals = () =>
    $api<UndertimeApprovalApiResponse<UndertimeApprovalApiRecord[]>>(endpoint, {
      method: 'GET',
    })

  const approveUndertimeRequest = (id: number) =>
    $api<UndertimeApprovalApiResponse<UndertimeApprovalApiRecord>>(`${endpoint}/${id}/approve`, {
      method: 'PATCH',
    })

  return { getUndertimeApprovals, approveUndertimeRequest }
}
