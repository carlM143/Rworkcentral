export interface CompanyRecord {
  id: number
  company_name: string
  location?: string
  status?: boolean
  created_at?: string
  updated_at?: string
  admin?: {
    id: number
    name: string
    email: string
  }
  departments_count?: number
  payroll_periods_count?: number
  contribution_deduction_settings_count?: number
  employees_count?: number
}

export interface CompanyPayload {
  company_name: string
  location: string
  status?: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useCompanyApi = () => {
  const { $api } = useNuxtApp()

  const getCompanies = (params?: { search?: string; status?: string }) => {
    const query = new URLSearchParams()
    if (params?.search) query.append('search', params.search)
    if (params?.status) query.append('status', params.status)
    const queryString = query.toString() ? `?${query.toString()}` : ''
    return $api<ApiResponse<CompanyRecord[]>>(`/admin/companies${queryString}`)
  }

  const getCurrentCompany = () =>
    $api<ApiResponse<CompanyRecord>>('/admin/company/current')

  const getCompany = (id: number) =>
    $api<ApiResponse<CompanyRecord>>(`/admin/companies/${id}`)

  const createCompany = (data: CompanyPayload) =>
    $api<ApiResponse<CompanyRecord>>('/admin/companies', {
      method: 'POST',
      body: data,
    })

  const updateCompany = (id: number, data: CompanyPayload) =>
    $api<ApiResponse<CompanyRecord>>(`/admin/companies/${id}`, {
      method: 'PUT',
      body: data,
    })

  const deleteCompany = (id: number) =>
    $api<{ success: boolean; message: string }>(`/admin/companies/${id}`, {
      method: 'DELETE',
    })

  return {
    getCompanies,
    getCurrentCompany,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
  }
}
