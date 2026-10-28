import type {
  LeaveTypePayload,
  LeaveTypeApiRecord,
  LeaveTypeApiResponse,
} from '~/types/leaveType'

export const useLeaveTypeApi = () => {
  const { $api } = useNuxtApp()
  const base = '/admin/leave-types'

  const getLeaveTypes = () =>
    $api<LeaveTypeApiResponse<LeaveTypeApiRecord[]>>(base, { method: 'GET' })

  const getLeaveType = (id: number) =>
    $api<LeaveTypeApiResponse<LeaveTypeApiRecord>>(`${base}/${id}`, { method: 'GET' })

  const createLeaveType = (body: LeaveTypePayload) =>
    $api<LeaveTypeApiResponse<LeaveTypeApiRecord>>(base, { method: 'POST', body })

  const updateLeaveType = (id: number, body: LeaveTypePayload) =>
    $api<LeaveTypeApiResponse<LeaveTypeApiRecord>>(`${base}/${id}`, { method: 'PATCH', body })

  const deleteLeaveType = (id: number) =>
    $api<{ success: boolean; message: string }>(`${base}/${id}`, { method: 'DELETE' })

  return {
    getLeaveTypes,
    getLeaveType,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
  }
}