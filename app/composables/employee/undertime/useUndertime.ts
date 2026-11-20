import type {
  UndertimeApiResponse,
  UndertimePayload,
  UndertimeRequestRecord,
} from '~/types/employee/undertime/undertime'

const BASE = '/employee/undertime-requests'

export const useUndertime = () => {
  const { $api } = useNuxtApp()

  /** GET /employee/undertime-requests — newest first. */
  const list = async () => {
    const res = await $api<UndertimeApiResponse<UndertimeRequestRecord[]>>(BASE)
    return Array.isArray(res.data) ? res.data : []
  }

  /** POST /employee/undertime-requests */
  const create = (payload: UndertimePayload) =>
    $api<UndertimeApiResponse<UndertimeRequestRecord>>(BASE, { method: 'POST', body: payload })

  /** PUT /employee/undertime-requests/{id} — pending requests only. */
  const update = (rawId: number, payload: UndertimePayload) =>
    $api<UndertimeApiResponse<UndertimeRequestRecord>>(`${BASE}/${rawId}`, { method: 'PUT', body: payload })

  /** PATCH /employee/undertime-requests/{id}/cancel — pending requests only. */
  const cancel = (rawId: number) =>
    $api<UndertimeApiResponse<unknown>>(`${BASE}/${rawId}/cancel`, { method: 'PATCH' })

  return { list, create, update, cancel }
}
