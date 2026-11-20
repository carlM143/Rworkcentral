import type {
  ObaApiErrorData,
  ObaApprovalsResponse,
  ObaAvailableEmployeesResponse,
  ObaDepartmentsResponse,
  ObaRequestActionResponse,
  ObaRequestDetailResponse,
  ObaRequestListParams,
  ObaRequestListResponse,
  ObaRequestPayload,
} from '~/types/employee/oba-request/obaRequest'

const BASE = '/employee/oba-requests'

/** Returns the first validation error, API message, or the fallback. */
export const getObaApiError = (cause: unknown, fallback: string): string => {
  const problem = cause as {
    data?: ObaApiErrorData
    response?: { _data?: ObaApiErrorData }
    message?: string
  }
  const data = problem?.data ?? problem?.response?._data
  const validationError = Object.values(data?.errors ?? {}).flat()[0]
  return String(validationError || data?.message || problem?.message || fallback)
}

const toFormData = (payload: ObaRequestPayload): FormData => {
  const body = new FormData()
  body.append('destination', payload.destination)
  body.append('reason', payload.reason)
  body.append('date_request', payload.date_request)
  body.append('time_from', payload.time_from)
  body.append('time_to', payload.time_to)
  payload.employee_ids?.forEach(id => body.append('employee_ids[]', String(id)))
  payload.images?.forEach(file => body.append('images[]', file))
  return body
}

export const useObaRequest = () => {
  const { $api } = useNuxtApp()

  const list = (params: ObaRequestListParams = {}) =>
    $api<ObaRequestListResponse>(BASE, { method: 'GET', query: params })

  const show = (id: number | string) =>
    $api<ObaRequestDetailResponse>(`${BASE}/${id}`, { method: 'GET' })

  const create = (payload: ObaRequestPayload) =>
    $api<ObaRequestDetailResponse>(BASE, { method: 'POST', body: toFormData(payload) })

  const cancel = (id: number | string) =>
    $api<ObaRequestActionResponse>(`${BASE}/${id}/cancel`, { method: 'PATCH' })

  const departments = () =>
    $api<ObaDepartmentsResponse>(`${BASE}/departments`, { method: 'GET' })

  const availableEmployees = (params: { department_id: number | string }) =>
    $api<ObaAvailableEmployeesResponse>(`${BASE}/available-employees`, { method: 'GET', query: params })

  const addEmployees = (id: number | string, employeeIds: number[]) =>
    $api<ObaRequestDetailResponse>(`${BASE}/${id}/employees`, {
      method: 'POST',
      body: { employee_ids: employeeIds },
    })

  const removeEmployee = (id: number | string, obaEmployeeId: number) =>
    $api<ObaRequestDetailResponse>(`${BASE}/${id}/employees/${obaEmployeeId}`, { method: 'DELETE' })

  const approvals = (params: { status?: string } = {}) =>
    $api<ObaApprovalsResponse>(`${BASE}/approvals`, { method: 'GET', query: params })

  const approveAsHead = (id: number | string) =>
    $api<ObaRequestActionResponse>(`${BASE}/${id}/dept-head/approve`, { method: 'PATCH' })

  const rejectAsHead = (id: number | string, reason: string) =>
    $api<ObaRequestActionResponse>(`${BASE}/${id}/dept-head/reject`, { method: 'PATCH', body: { reason } })

  return {
    list,
    show,
    create,
    cancel,
    departments,
    availableEmployees,
    addEmployees,
    removeEmployee,
    approvals,
    approveAsHead,
    rejectAsHead,
  }
}