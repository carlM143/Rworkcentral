export type WfhRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface WfhEmployeeOption {
  id: number
  emp_id: string
  name: string
  department: string | null
  position: string | null
}

export interface WfhDateBreakdownItem {
  date: string
  day_name: string
  is_working_day: boolean
  schedule_time?: string | null
}

export interface WfhRequestRecord {
  id: number
  request_no: string
  employee: WfhEmployeeOption
  start_date: string
  end_date: string
  number_of_days: number
  calendar_days?: number
  working_dates?: string[]
  breakdown?: WfhDateBreakdownItem[]
  schedule_name?: string | null
  schedule_code?: string | null
  working_days?: string[]
  rest_days?: string[]
  reason: string
  supervisor_name: string
  request_date: string
  remarks: string | null
  status: WfhRequestStatus
  approved_by: string | null // user who approved OR rejected
  approved_at: string | null
  has_data?: boolean
  counts?: {
    attachments: number
    accepted: number
    submitted: number
    time_logs?: number
  }
}

export interface StoreWfhRequestPayload {
  employee_id: number
  start_date: string
  end_date: string
  reason: string
  supervisor_name: string
  request_date: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const todayLocal = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export const useWfhRequestApi = () => {
  const { $api } = useNuxtApp()
  const { token } = useAuth()

  const headers = (): Record<string, string> =>
    token.value ? { Authorization: `Bearer ${token.value}` } : {}

  const list = () =>
    $api<ApiResponse<WfhRequestRecord[]>>('/admin/wfh-requests', {
      method: 'GET',
      headers: headers(),
    })

  const employees = () =>
    $api<ApiResponse<WfhEmployeeOption[]>>('/admin/wfh-requests/employees', {
      method: 'GET',
      headers: headers(),
    })

  const preview = (payload: { employee_id: number, start_date: string, end_date: string }) =>
    $api<ApiResponse<{ number_of_days: number }>>('/admin/wfh-requests/preview', {
      method: 'POST',
      body: payload,
      headers: headers(),
    })

  const store = (payload: StoreWfhRequestPayload) =>
    $api<ApiResponse<WfhRequestRecord>>('/admin/wfh-requests', {
      method: 'POST',
      body: payload,
      headers: headers(),
    })

  const approve = (id: number, remarks?: string) =>
    $api<ApiResponse<WfhRequestRecord>>(`/admin/wfh-requests/${id}/approve`, {
      method: 'PATCH',
      body: { remarks: remarks || null },
      headers: headers(),
    })

  const reject = (id: number, remarks: string) =>
    $api<ApiResponse<WfhRequestRecord>>(`/admin/wfh-requests/${id}/reject`, {
      method: 'PATCH',
      body: { remarks },
      headers: headers(),
    })

  const remove = (id: number) =>
    $api<ApiResponse<{ message: string }>>(`/admin/wfh-requests/${id}`, {
      method: 'DELETE',
      headers: headers(),
    })

  return { list, employees, preview, store, approve, reject, remove, todayLocal }
}
