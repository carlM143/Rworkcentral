export interface EmploymentTypeRecord {
  id: number
  name: string
  description?: string
  status: string
  employments_count?: number
}

export interface EmploymentTypePayload {
  name: string
  description?: string
  status?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useEmploymentTypeApi = () => {
  const { $api } = useNuxtApp()

  const getEmploymentTypes = () =>
    $api<ApiResponse<EmploymentTypeRecord[]>>('/admin/employment-types')

  const createEmploymentType = (data: EmploymentTypePayload) =>
    $api<ApiResponse<EmploymentTypeRecord>>('/admin/employment-types', {
      method: 'POST',
      body: data,
    })

  const updateEmploymentType = (id: number, data: EmploymentTypePayload) =>
    $api<ApiResponse<EmploymentTypeRecord>>(`/admin/employment-types/${id}`, {
      method: 'PUT',
      body: data,
    })

  const deleteEmploymentType = (id: number) =>
    $api<{ success: boolean; message: string }>(`/admin/employment-types/${id}`, {
      method: 'DELETE',
    })

  return {
    getEmploymentTypes,
    createEmploymentType,
    updateEmploymentType,
    deleteEmploymentType,
  }
}
