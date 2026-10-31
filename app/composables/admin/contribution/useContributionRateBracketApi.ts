export interface ContributionRateBracketRecord {
  id: number
  contribution_rate_schedule_id: number
  salary_from: string | number
  salary_to: string | number | null
  monthly_salary_credit: string | number | null
  employee_rate: string | number | null
  employer_rate: string | number | null
  employee_amount: string | number | null
  employer_amount: string | number | null
  employer_ec_amount: string | number | null
  created_at?: string
  updated_at?: string
  rate_schedule?: {
    id: number
    contribution_type_id: number
    calculation_method: string
    salary_basis: string
    effective_from: string
    contribution_type?: {
      id: number
      contribution_code: string
      contribution_name: string
      provider: string
    }
  }
}

export interface ContributionRateBracketPayload {
  contribution_rate_schedule_id: number
  salary_from: number
  salary_to: number | null
  monthly_salary_credit: number | null
  employee_rate: number | null
  employer_rate: number | null
  employee_amount: number | null
  employer_amount: number | null
  employer_ec_amount: number | null
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useContributionRateBracketApi = () => {
  const { $api } = useNuxtApp()

  const getContributionRateBrackets = (scheduleId?: number) => {
    const query = scheduleId ? `?contribution_rate_schedule_id=${scheduleId}` : ''
    return $api<ApiResponse<ContributionRateBracketRecord[]>>(`/admin/contribution-rate-brackets${query}`)
  }

  const createContributionRateBracket = (data: ContributionRateBracketPayload) =>
    $api<ApiResponse<ContributionRateBracketRecord>>('/admin/contribution-rate-brackets', {
      method: 'POST',
      body: data,
    })

  const updateContributionRateBracket = (id: number, data: ContributionRateBracketPayload) =>
    $api<ApiResponse<ContributionRateBracketRecord>>(`/admin/contribution-rate-brackets/${id}`, {
      method: 'PUT',
      body: data,
    })

  const deleteContributionRateBracket = (id: number) =>
    $api<{ success: boolean; message: string }>(`/admin/contribution-rate-brackets/${id}`, {
      method: 'DELETE',
    })

  return {
    getContributionRateBrackets,
    createContributionRateBracket,
    updateContributionRateBracket,
    deleteContributionRateBracket,
  }
}
