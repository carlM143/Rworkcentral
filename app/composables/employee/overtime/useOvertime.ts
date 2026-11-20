import type {
  OvertimeApiResponse,
  OvertimePayload,
  OvertimeRequestRecord,
} from '~/types/employee/overtime/overtime'

const BASE = '/employee/overtime-requests'

export const useOvertime = () => {
  const { $api } = useNuxtApp()

  /** GET /employee/overtime-requests — newest first. */
  const list = async () => {
    const res = await $api<OvertimeApiResponse<OvertimeRequestRecord[]>>(BASE)
    return Array.isArray(res.data) ? res.data : []
  }

  /** POST /employee/overtime-requests */
  const create = (payload: OvertimePayload) =>
    $api<OvertimeApiResponse<OvertimeRequestRecord>>(BASE, { method: 'POST', body: payload })

  /** PUT /employee/overtime-requests/{id} — pending requests only. */
  const update = (rawId: number, payload: OvertimePayload) =>
    $api<OvertimeApiResponse<OvertimeRequestRecord>>(`${BASE}/${rawId}`, { method: 'PUT', body: payload })

  /** PATCH /employee/overtime-requests/{id}/cancel — pending requests only. */
  const cancel = (rawId: number) =>
    $api<OvertimeApiResponse<unknown>>(`${BASE}/${rawId}/cancel`, { method: 'PATCH' })

  return { list, create, update, cancel }
}
