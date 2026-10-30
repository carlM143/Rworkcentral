export interface ContributionTypeSummary {
  id: number
  contribution_code: string
  contribution_name: string
  provider: string
  is_status: boolean
}

export interface ContributionRateScheduleRecord {
  id: number
  contribution_type_id: number
  calculation_method: 'percentage' | 'bracket' | 'fixed'
  salary_basis: string
  employee_rate: string | number | null
  employer_rate: string | number | null
  minimum_salary_base: string | number | null
  maximum_salary_base: string | number | null
  effective_from: string
  effective_to: string | null
  is_status: boolean
  contribution_type?: ContributionTypeSummary
  created_at?: string
  updated_at?: string
}

export interface ContributionRateSchedulePayload {
  contribution_type_id: number
  calculation_method: string
  salary_basis: string
  employee_rate: number | null
  employer_rate: number | null
  minimum_salary_base: number | null
  maximum_salary_base: number | null
  effective_from: string
  effective_to: string | null
  is_status: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useContributionRateScheduleApi = () => {
  const { $api } = useNuxtApp()

  const getContributionRateSchedules = () =>
    $api<ApiResponse<ContributionRateScheduleRecord[]>>('/admin/contribution-rate-schedules')

  const createContributionRateSchedule = (data: ContributionRateSchedulePayload) =>
    $api<ApiResponse<ContributionRateScheduleRecord>>('/admin/contribution-rate-schedules', {
      method: 'POST',
      body: data,
    })

  const updateContributionRateSchedule = (id: number, data: ContributionRateSchedulePayload) =>
    $api<ApiResponse<ContributionRateScheduleRecord>>(`/admin/contribution-rate-schedules/${id}`, {
      method: 'PUT',
      body: data,
    })

  const deleteContributionRateSchedule = (id: number) =>
    $api<{ success: boolean, message: string }>(`/admin/contribution-rate-schedules/${id}`, {
      method: 'DELETE',
    })

  return {
    getContributionRateSchedules,
    createContributionRateSchedule,
    updateContributionRateSchedule,
    deleteContributionRateSchedule,
  }
}
