import type {
  LeaveApiResponse,
  LeavePayload,
  LeaveRequestRecord,
} from '~/types/employee/leave/leave'

const BASE = '/employee/leave-requests'

/**
 * First validation error, API message, or the fallback.
 * Shared by the leave, overtime and undertime request pages.
 */
export const employeeRequestError = (cause: unknown, fallback: string): string => {
  const problem = cause as {
    data?: { message?: string, errors?: Record<string, string[]> }
    response?: { _data?: { message?: string, errors?: Record<string, string[]> } }
  }
  const data = problem?.data ?? problem?.response?._data
  const validationError = Object.values(data?.errors ?? {}).flat()[0]
  return String(validationError || data?.message || fallback)
}

export const useLeave = () => {
  const { $api } = useNuxtApp()

  /** GET /employee/leave-requests — newest first. */
  const list = async () => {
    const res = await $api<LeaveApiResponse<LeaveRequestRecord[]>>(BASE)
    return Array.isArray(res.data) ? res.data : []
  }

  /** There is no show endpoint, so the request is found in the list. */
  const find = async (rawId: number) =>
    (await list()).find(record => record.raw_id === rawId) ?? null

  /** POST /employee/leave-requests */
  const create = (payload: LeavePayload) =>
    $api<LeaveApiResponse<LeaveRequestRecord>>(BASE, { method: 'POST', body: payload })

  /** PUT /employee/leave-requests/{id} — pending requests only. */
  const update = (rawId: number, payload: LeavePayload) =>
    $api<LeaveApiResponse<LeaveRequestRecord>>(`${BASE}/${rawId}`, { method: 'PUT', body: payload })

  /** PATCH /employee/leave-requests/{id}/cancel — pending requests only. */
  const cancel = (rawId: number) =>
    $api<LeaveApiResponse<unknown>>(`${BASE}/${rawId}/cancel`, { method: 'PATCH' })

  return { list, find, create, update, cancel }
}
