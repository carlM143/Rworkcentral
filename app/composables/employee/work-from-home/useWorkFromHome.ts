import type {
  ScheduleData,
  WfhDayProofPayload,
  WfhPreviewData,
  WfhPreviewPayload,
  WfhRequest,
  WfhRequestPayload,
} from '~/types/employee/work-from-home/workFromHome'

const BASE = '/employee/wfh-requests'

/** First validation error, API message, or the fallback. */
export const employeeWfhError = (cause: unknown, fallback: string): string => {
  const problem = cause as {
    data?: { message?: string, errors?: Record<string, string[]> }
    response?: { _data?: { message?: string, errors?: Record<string, string[]> } }
    message?: string
  }
  const data = problem?.data ?? problem?.response?._data
  const validationError = Object.values(data?.errors ?? {}).flat()[0]
  return String(validationError || data?.message || fallback)
}

/**
 * Employee work-from-home request API.
 * (Dashboard WFH time in / time out stay in useEmployeePortal.)
 */
export const useWorkFromHome = () => {
  const { $api } = useNuxtApp()

  /** GET /employee/wfh-requests — the employee's own requests. */
  const list = async () =>
    (await $api<{ data: WfhRequest[] }>(BASE)).data

  /** GET /employee/wfh-requests/schedule — working and rest days. */
  const schedule = async () =>
    (await $api<{ success: boolean, data: ScheduleData }>(`${BASE}/schedule`)).data

  /** POST /employee/wfh-requests/preview — scheduled working days in a date range. */
  const preview = async (payload: WfhPreviewPayload) =>
    (await $api<{ data: WfhPreviewData }>(`${BASE}/preview`, { method: 'POST', body: payload })).data

  /** POST /employee/wfh-requests — submit a new request. */
  const create = (payload: WfhRequestPayload) =>
    $api<{ message?: string, data?: WfhRequest }>(BASE, { method: 'POST', body: payload })

  /**
   * PUT /employee/wfh-requests/{id} — edit a pending request.
   * NOTE: the backend does not have this route yet (see EmployeeWfhRequestController).
   */
  const update = (requestId: number, payload: WfhRequestPayload) =>
    $api<{ message?: string, data?: WfhRequest }>(`${BASE}/${requestId}`, { method: 'PUT', body: payload })

  /** POST /employee/wfh-requests/{id}/days — attach proof of work for one day. */
  const attachDayProof = (requestId: number, payload: WfhDayProofPayload) => {
    const body = new FormData()
    body.append('date_attendance', payload.date_attendance)
    payload.images.forEach(image => body.append('images[]', image))
    if (payload.document) body.append('document', payload.document)

    return $api<{ message?: string }>(`${BASE}/${requestId}/days`, { method: 'POST', body })
  }

  return { list, schedule, preview, create, update, attachDayProof }
}
