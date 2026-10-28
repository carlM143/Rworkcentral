
import type {
  ApiResponse,
  LeavePolicyApiRecord,
  LeavePolicyPayload,
} from '~/types/leavePolicy'

import type { LeaveTypeApiRecord } from '~/types/leaveType'

interface EmploymentTypeApiRecord {
  id: number
  name: string
}

export const useLeavePolicyApi = () => {
  const { $api } = useNuxtApp()
  const base = '/admin/leave-policies'

  const getLeavePolicies = () =>
    $api<ApiResponse<LeavePolicyApiRecord[]>>(base, { method: 'GET' })

  const getLeavePolicy = (id: number) =>
    $api<ApiResponse<LeavePolicyApiRecord>>(`${base}/${id}`, { method: 'GET' })

  const createLeavePolicy = (body: LeavePolicyPayload) =>
    $api<ApiResponse<LeavePolicyApiRecord>>(base, { method: 'POST', body })

  const updateLeavePolicy = (id: number, body: LeavePolicyPayload) =>
    $api<ApiResponse<LeavePolicyApiRecord>>(`${base}/${id}`, { method: 'PATCH', body })

  const deleteLeavePolicy = (id: number) =>
    $api<ApiResponse<null>>(`${base}/${id}`, { method: 'DELETE' })

  const getLeaveTypes = () =>
    $api<ApiResponse<LeaveTypeApiRecord[]>>('/admin/leave-types', { method: 'GET' })

  const getEmploymentTypes = () =>
    $api<ApiResponse<EmploymentTypeApiRecord[]>>('/admin/employment-types', { method: 'GET' })

  return {
    getLeavePolicies,
    getLeavePolicy,
    createLeavePolicy,
    updateLeavePolicy,
    deleteLeavePolicy,
    getLeaveTypes,
    getEmploymentTypes,
  }
}
