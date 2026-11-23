/**
 * Approval Center › For My Approval (supervisors).
 *   GET   /admin/supervisor-approvals?type=&tab=
 *   PATCH /admin/supervisor-approvals/{type}/{id}/approve
 *   PATCH /admin/supervisor-approvals/{type}/{id}/reject
 */

export type TeamRequestType = 'leave' | 'overtime' | 'undertime' | 'wfh' | 'oba'

export interface TeamApprovalItem {
  type: TeamRequestType
  type_label: string
  id: number
  request_no: string
  employee: string
  emp_id: string | null
  summary: string
  reason: string | null
  filed_at: string
  status: string
  head_status: 'pending' | 'approved' | 'rejected' | 'overridden' | 'skipped'
  head_remarks: string | null
  head_by?: string | null
  acted_at: string | null
}

export interface TeamApprovalsResponse {
  success: boolean
  message: string
  data: TeamApprovalItem[]
  is_department_head: boolean
  departments: string[]
  counts: Record<TeamRequestType | 'total', number>
  sees_all?: boolean
}

export const supervisorApprovalError = (error: unknown, fallback: string) => {
  const e = error as { data?: { message?: string, errors?: Record<string, string[]> } }
  return Object.values(e?.data?.errors ?? {})[0]?.[0] ?? e?.data?.message ?? fallback
}

export const useSupervisorApprovals = () => {
  const { $api } = useNuxtApp()

  return {
    list: (params: { type?: string, tab?: 'pending' | 'history' } = {}) =>
      $api<TeamApprovalsResponse>('/admin/supervisor-approvals', {
        method: 'GET',
        query: Object.fromEntries(Object.entries(params).filter(([, v]) => v)),
      }),
    approve: (type: TeamRequestType, id: number, remarks?: string) =>
      $api<{ message: string }>(`/admin/supervisor-approvals/${type}/${id}/approve`, { method: 'PATCH', body: { remarks } }),
    reject: (type: TeamRequestType, id: number, remarks: string) =>
      $api<{ message: string }>(`/admin/supervisor-approvals/${type}/${id}/reject`, { method: 'PATCH', body: { remarks } }),
  }
}