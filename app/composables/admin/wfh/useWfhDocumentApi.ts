export interface WfhFile {
  id?: number
  path: string
  url: string
  public_url?: string
  name: string
  mime: 'application/pdf' | 'image'
}

export type WfhDayStatus =
  | 'not_submitted'
  | 'draft'
  | 'submitted'
  | 'accepted'
  | 'returned'

export type WfhDocumentStatus =
  | 'for_review'
  | 'returned'
  | 'completed'
  | 'incomplete'

export interface WfhDay {
  date: string
  tracker_id: number | null
  status: WfhDayStatus
  remarks: string | null
  submitted_at: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  document: WfhFile | null
  images: WfhFile[]
}

export interface WfhDocumentRecord {
  id: number
  request_no: string
  employee: {
    id: number | null
    emp_id: string | number | null
    name: string
    department: string | null
    position: string | null
    work_schedule: string | null
  }
  start_date: string
  end_date: string
  number_of_days: number
  reason: string
  supervisor_name: string
  request_date: string | null
  remarks: string | null
  status: string
  approved_by: string | null
  approved_at: string | null
  has_schedule: boolean
  document_status: WfhDocumentStatus
  counts: {
    expected: number
    not_submitted: number
    submitted: number
    accepted: number
    returned: number
    attachments: number
  }
  days?: WfhDay[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useWfhDocumentApi = () => {
  const { $api } = useNuxtApp()
  const { token } = useAuth()

  const headers = (): Record<string, string> =>
    token.value ? { Authorization: `Bearer ${token.value}` } : {}

  const list = () =>
    $api<ApiResponse<WfhDocumentRecord[]>>('/admin/wfh-documents', {
      method: 'GET',
      headers: headers(),
    })

  const show = (id: number) =>
    $api<ApiResponse<WfhDocumentRecord>>(`/admin/wfh-documents/${id}`, {
      method: 'GET',
      headers: headers(),
    })

  const attach = (
    id: number,
    payload: { date: string, images: File[], document?: File | null },
  ) => {
    const form = new FormData()
    form.append('date_attendance', payload.date)
    payload.images.forEach(file => form.append('images[]', file))
    if (payload.document) form.append('document', payload.document)

    return $api<ApiResponse<WfhDocumentRecord>>(`/admin/wfh-documents/${id}/days`, {
      method: 'POST',
      body: form,
      headers: headers(),
    })
  }

  const accept = (trackerId: number, remarks?: string) =>
    $api<ApiResponse<WfhDocumentRecord>>(`/admin/wfh-trackers/${trackerId}/accept`, {
      method: 'PATCH',
      body: { remarks: remarks || null },
      headers: headers(),
    })

  const returnDay = (trackerId: number, remarks: string) =>
    $api<ApiResponse<WfhDocumentRecord>>(`/admin/wfh-trackers/${trackerId}/return`, {
      method: 'PATCH',
      body: { remarks },
      headers: headers(),
    })

  return { list, show, attach, accept, returnDay }
}

/** Readable message from a Laravel error response. */
export const wfhErrorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { data?: { message?: string, errors?: Record<string, string[]> } })?.data
  const firstFieldError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined

  return firstFieldError || data?.message || fallback
}