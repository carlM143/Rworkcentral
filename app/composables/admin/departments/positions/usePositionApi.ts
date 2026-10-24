// position/usePositionApi.ts

export interface PositionApiRecord {
  id: number
  department_id: number | null
  position: string
  description: string
  status: boolean | number | string
  department: { id: number; department_name: string; department_code: string } | null
  created_at: string
  updated_at: string
}

export interface PositionPayload {
  department_id: number
  position: string
  description: string
  status: boolean
}

export interface PositionApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const usePositionApi = () => {
  const { $api } = useNuxtApp()

  const getPositions = () => $api<PositionApiResponse<PositionApiRecord[]>>('/admin/positions', { method: 'GET' })
  const getPosition = (id: number) => $api<PositionApiResponse<PositionApiRecord>>(`/admin/positions/${id}`, { method: 'GET' })
  const createPosition = (body: PositionPayload) => $api<PositionApiResponse<PositionApiRecord>>('/admin/positions', { method: 'POST', body })
  const updatePosition = (id: number, body: PositionPayload) => $api<PositionApiResponse<PositionApiRecord>>(`/admin/positions/${id}`, { method: 'PUT', body })
  const deletePosition = (id: number) => $api<{ success: boolean; message: string }>(`/admin/positions/${id}`, { method: 'DELETE' })

  return { getPositions, getPosition, createPosition, updatePosition, deletePosition }
}