
import type {
  EmployeeTimeLog,
  TimeLogCorrectionRecord,
  CreateCorrectionPayload,
  UpdateCorrectionPayload,
} from '~/types/employee/timelogCorrectionRequest/timelogCorrectionRequest'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH'
  query?: Record<string, string>
  body?: CreateCorrectionPayload | UpdateCorrectionPayload
}

export function useTimeLogCorrectionApi() {
  const { $api } = useNuxtApp()
  const endpoint = '/employee/time-log-correction-requests'

  // Reusable API request function
  const request = async <T>(
    suffix = '',
    options: RequestOptions = {}
  ): Promise<T> => {
    return await $api<T>(`${endpoint}${suffix}`, {
      method: options.method ?? 'GET',
      query: options.query,
      body: options.body,
    })
  }

  // Get attendance log by selected date
  const lookup = (date: string) => {
    return request<{
      found: boolean
      data: EmployeeTimeLog | null
      message?: string
    }>('/time-log', {
      method: 'GET',
      query: { date },
    })
  }

  // Get all correction requests
  const list = () => {
    return request<{
      data: TimeLogCorrectionRecord[]
    }>()
  }

  // Get specific correction request
  const show = (id: number | string) => {
    return request<{
      data: TimeLogCorrectionRecord
    }>(`/${id}`)
  }

  // Submit new correction request
  const create = (payload: CreateCorrectionPayload) => {
    return request<{
      message: string
      data: TimeLogCorrectionRecord
    }>('', {
      method: 'POST',
      body: payload,
    })
  }

  // Update pending correction request
  const update = (
    id: number | string,
    payload: UpdateCorrectionPayload
  ) => {
    return request<{
      message: string
      data: TimeLogCorrectionRecord
    }>(`/${id}`, {
      method: 'PUT',
      body: payload,
    })
  }

  // Cancel pending correction request
  const cancel = (id: number | string) => {
    return request<{
      message: string
    }>(`/${id}/cancel`, {
      method: 'PATCH',
    })
  }

  return {
    lookup,
    list,
    show,
    create,
    update,
    cancel,
  }
}
