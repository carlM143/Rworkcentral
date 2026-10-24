// useDepartmentApi.ts

export interface DepartmentApiRecord {
  id: number
  admin_id: number
  company_id: number
  department_name: string
  department_code: string
  status: boolean | number
  positions_count?: number
  employments_count?: number
}

export interface DepartmentPayload {
  department_name: string
  department_code: string
  status: boolean
}

export interface DepartmentApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useDepartmentApi = () => {
  const { $api } = useNuxtApp()

  const getDepartments = () => {
    return $api<DepartmentApiResponse<DepartmentApiRecord[]>>(
      '/admin/departments',
      {
        method: 'GET',
      },
    )
  }

  const getDepartment = (id: number) => {
    return $api<DepartmentApiResponse<DepartmentApiRecord>>(
      `/admin/departments/${id}`,
      {
        method: 'GET',
      },
    )
  }

  const createDepartment = (payload: DepartmentPayload) => {
    return $api<DepartmentApiResponse<DepartmentApiRecord>>(
      '/admin/departments',
      {
        method: 'POST',
        body: payload,
      },
    )
  }

  const updateDepartment = (
    id: number,
    payload: DepartmentPayload,
  ) => {
    return $api<DepartmentApiResponse<DepartmentApiRecord>>(
      `/admin/departments/${id}`,
      {
        method: 'PUT',
        body: payload,
      },
    )
  }

  const deleteDepartment = (id: number) => {
    return $api<{
      success: boolean
      message: string
    }>(
      `/admin/departments/${id}`,
      {
        method: 'DELETE',
      },
    )
  }

  return {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  }
}