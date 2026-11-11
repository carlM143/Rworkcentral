export type ContributionChangeAction =
  | 'created'
  | 'updated'
  | 'deactivated'
  | 'versioned'
  | 'deleted'

export type ContributionEntityType =
  | 'contribution_type'
  | 'rate_schedule'
  | 'rate_bracket'
  | 'deduction_setting'
  | string

export interface ContributionChangeLogRecord {
  id: number
  contribution_type_id: number
  contribution_rate_schedule_id: number | null
  company_id: number | null
  entity_type: ContributionEntityType
  entity_id: number
  action: ContributionChangeAction
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  reason: string | null
  changed_by: number
  actor_name: string
  created_at: string
  contribution_type?: {
    id: number
    contribution_code: string
    contribution_name: string
    provider: string
    is_status: boolean
  }
  rate_schedule?: {
    id: number
    contribution_type_id: number
    calculation_method: string
    salary_basis: string | null
    effective_from: string
    effective_to: string | null
    is_status: boolean
  } | null
  company?: {
    id: number
    company_name: string
  } | null
  changed_by_user?: {
    id: number
    name: string
    email: string
  } | null
}

export interface ContributionChangeLogFilter {
  contribution_type_id?: number | string
  contribution_rate_schedule_id?: number | string
  company_id?: number | string
  entity_type?: string
  action?: string
  changed_by?: number | string
  date_from?: string
  date_to?: string
  search?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useContributionChangeLogApi = () => {
  const { $api } = useNuxtApp()

  const getContributionChangeLogs = (params?: ContributionChangeLogFilter) =>
    $api<ApiResponse<ContributionChangeLogRecord[]>>('/admin/contribution-change-logs', {
      params,
    })

  const getContributionChangeLog = (id: number) =>
    $api<ApiResponse<ContributionChangeLogRecord>>(`/admin/contribution-change-logs/${id}`)

  return {
    getContributionChangeLogs,
    getContributionChangeLog,
  }
}
