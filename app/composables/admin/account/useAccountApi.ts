/**
 * The signed-in user's own account.
 *   GET    /admin/account
 *   PUT    /admin/account
 *   PUT    /admin/account/password
 *   DELETE /admin/account/sessions
 */

export interface AccountRecord {
  id: number
  name: string
  email: string
  role: string | null
  member_since: string | null
  updated_at: string | null
  employee: {
    id: number
    emp_id: string | number | null
    name: string
    position: string | null
    department: string | null
    date_hired: string | null
  } | null
  sessions: { active: number, current_last_used_at: string | null }
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

/** Laravel validation errors → { field: [messages] } and a readable message. */
export const accountApiError = (error: unknown, fallback: string) => {
  const e = error as { data?: { message?: string, errors?: Record<string, string[]> }, response?: { _data?: { message?: string, errors?: Record<string, string[]> } } }
  const body = e?.data ?? e?.response?._data
  const errors = body?.errors ?? {}
  const first = Object.values(errors)[0]?.[0]
  return { message: first ?? body?.message ?? fallback, errors }
}

export const useAccountApi = () => {
  const { $api } = useNuxtApp()

  const show = () =>
    $api<ApiResponse<AccountRecord>>('/admin/account', { method: 'GET' })

  const update = (payload: { name: string, email: string }) =>
    $api<ApiResponse<AccountRecord>>('/admin/account', { method: 'PUT', body: payload })

  const updatePassword = (payload: {
    current_password: string
    password: string
    password_confirmation: string
    sign_out_other_devices: boolean
  }) =>
    $api<ApiResponse<AccountRecord>>('/admin/account/password', { method: 'PUT', body: payload })

  const signOutOtherDevices = () =>
    $api<ApiResponse<AccountRecord>>('/admin/account/sessions', { method: 'DELETE' })

  return { show, update, updatePassword, signOutOtherDevices }
}