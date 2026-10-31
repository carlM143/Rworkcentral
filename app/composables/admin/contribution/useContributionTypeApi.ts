export interface ContributionTypeRecord {
  id: number
  contribution_code: string
  contribution_name: string
  provider: string
  is_status: boolean
  created_at?: string
  updated_at?: string
}

export interface ContributionTypePayload {
  contribution_code: string
  contribution_name: string
  provider: string
  is_status?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useContributionTypeApi = () => {
  const { $api } = useNuxtApp()

  const getContributionTypes = () =>
    $api<ApiResponse<ContributionTypeRecord[]>>('/admin/contribution-types')

  const createContributionType = (data: ContributionTypePayload) =>
    $api<ApiResponse<ContributionTypeRecord>>('/admin/contribution-types', {
      method: 'POST',
      body: data,
    })

  const updateContributionType = (id: number, data: ContributionTypePayload) =>
    $api<ApiResponse<ContributionTypeRecord>>(`/admin/contribution-types/${id}`, {
      method: 'PUT',
      body: data,
    })

  const deleteContributionType = (id: number) =>
    $api<{ success: boolean, message: string }>(`/admin/contribution-types/${id}`, {
      method: 'DELETE',
    })

  return {
    getContributionTypes,
    createContributionType,
    updateContributionType,
    deleteContributionType,
  }
}
