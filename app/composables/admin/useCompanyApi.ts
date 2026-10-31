export interface CompanyRecord {
  id: number
  company_name: string
  location?: string
  status?: boolean
}

export const useCompanyApi = () => {
  const { $api } = useNuxtApp()

  const getCompanies = () =>
    $api<{ success: boolean; data: CompanyRecord[] }>('/admin/companies')

  return {
    getCompanies,
  }
}
