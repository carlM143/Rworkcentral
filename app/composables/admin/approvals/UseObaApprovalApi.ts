import type {
  ObaApiErrorData,
  ObaRequestDetailResponse,
  ObaRequestListParams,
  ObaRequestListResponse,
} from '~/types/oba-request/obaRequest'

const BASE = '/admin/oba-requests'

/** Returns the first validation error, API message, or the fallback. */
export const getObaApprovalApiError = (cause: unknown, fallback: string): string => {
  const problem = cause as {
    data?: ObaApiErrorData
    response?: { _data?: ObaApiErrorData }
    message?: string
  }
  const data = problem?.data ?? problem?.response?._data
  const validationError = Object.values(data?.errors ?? {}).flat()[0]
  return String(validationError || data?.message || problem?.message || fallback)
}

export const useObaApprovalApi = () => {
  const { $api } = useNuxtApp()

  const list = (params: ObaRequestListParams = {}) => {
    // Drop empty filters so they are not sent as blank query values.
    const query = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null),
    )
    return $api<ObaRequestListResponse>(BASE, { method: 'GET', query })
  }

  const show = (id: number | string) =>
    $api<ObaRequestDetailResponse>(`${BASE}/${id}`, { method: 'GET' })

  return { list, show }
}
