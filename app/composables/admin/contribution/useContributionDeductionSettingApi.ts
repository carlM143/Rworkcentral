export interface ContributionDeductionSettingRecord {
  id: number
  company_id: number
  department_id: number | null
  salary_type_id: number | null
  contribution_type_id: number
  deduction_schedule: string | null
  first_cutoff_percent: string | number
  second_cutoff_percent: string | number
  week_1_percent?: string | number | null
  week_2_percent?: string | number | null
  week_3_percent?: string | number | null
  week_4_percent?: string | number | null
  effective_from: string
  effective_to: string | null
  is_status: boolean
  created_at?: string
  updated_at?: string
  company?: {
    id: number
    company_name: string
  }
  department?: {
    id: number
    company_id: number
    department_code: string
    department_name: string
  } | null
  salary_type?: {
    id: number
    type_name: string
  } | null
  contribution_type?: {
    id: number
    contribution_code: string
    contribution_name: string
    provider: string
  }
}

export interface ContributionDeductionSettingPayload {
  company_id: number
  department_id?: number | null
  salary_type_id?: number | null
  contribution_type_id: number
  deduction_schedule?: string | null
  first_cutoff_percent: number
  second_cutoff_percent: number
  week_1_percent?: number | null
  week_2_percent?: number | null
  week_3_percent?: number | null
  week_4_percent?: number | null
  effective_from: string
  effective_to: string | null
  is_status: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useContributionDeductionSettingApi = () => {
  const { $api } = useNuxtApp()

  const getContributionDeductionSettings = () =>
    $api<ApiResponse<ContributionDeductionSettingRecord[]>>('/admin/contribution-deduction-settings')

  const createContributionDeductionSetting = (data: ContributionDeductionSettingPayload) =>
    $api<ApiResponse<ContributionDeductionSettingRecord>>('/admin/contribution-deduction-settings', {
      method: 'POST',
      body: data,
    })

  const updateContributionDeductionSetting = (id: number, data: ContributionDeductionSettingPayload) =>
    $api<ApiResponse<ContributionDeductionSettingRecord>>(`/admin/contribution-deduction-settings/${id}`, {
      method: 'PUT',
      body: data,
    })

  const deleteContributionDeductionSetting = (id: number) =>
    $api<{ success: boolean; message: string }>(`/admin/contribution-deduction-settings/${id}`, {
      method: 'DELETE',
    })

  return {
    getContributionDeductionSettings,
    createContributionDeductionSetting,
    updateContributionDeductionSetting,
    deleteContributionDeductionSetting,
  }
}
