export interface ScheduleTypeRecord {
  id: number
  type_name: string
}

export interface WorkScheduleRecord {
  id: number
  schedule_code: string
  schedule_name: string
  schedule_type_id: number
  schedule_type: ScheduleTypeRecord | null
  time_in: string
  time_out: string
  break_start: string | null
  break_end: string | null
  required_work_hours: string | number
  grace_period: number
  status: boolean | number
  employments_count?: number
}

export interface WorkSchedulePayload {
  schedule_type_id: number
  schedule_code: string
  schedule_name: string
  time_in: string
  time_out: string
  break_start: string | null
  break_end: string | null
  required_work_hours: number
  grace_period: number
  status: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useWorkScheduleApi = () => {
  const { $api } = useNuxtApp()

  const getScheduleTypes = () =>
    $api<ApiResponse<ScheduleTypeRecord[]>>('/admin/schedule-types')

  const getSchedules = () =>
    $api<ApiResponse<WorkScheduleRecord[]>>('/admin/work-schedules')

  const createSchedule = (data: WorkSchedulePayload) =>
    $api<ApiResponse<WorkScheduleRecord>>('/admin/work-schedules', {
      method: 'POST',
      body: data,
    })

  const updateSchedule = (id: number, data: WorkSchedulePayload) =>
    $api<ApiResponse<WorkScheduleRecord>>(`/admin/work-schedules/${id}`, {
      method: 'PUT',
      body: data,
    })

  const deleteSchedule = (id: number) =>
    $api<{ success: boolean; message: string }>(`/admin/work-schedules/${id}`, {
      method: 'DELETE',
    })

  return {
    getScheduleTypes,
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
}