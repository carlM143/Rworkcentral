export type ObaRequestStatus =
  | 'pending'
  | 'dept_head_approved'
  | 'approved'
  | 'rejected'
  | 'cancelled'

export interface ObaImage {
  id: number
  oba_request_id: number
  image_path: string | null
  /** Public URL, added by the ObaImage::url accessor on the backend. */
  url?: string | null
}

export interface ObaEmployee {
  id: number
  oba_request_id: number
  employee_id: number
  employee_name: string
}

export interface ObaRequestRecord {
  id: number
  /** Employee who filed the request. */
  employee_id: number
  approved_by: number | null
  dept_head_id: number | null
  dept_head_acted_at: string | null
  reason: string
  destination: string
  time_from: string
  time_to: string
  date_request: string
  status: ObaRequestStatus
  created_at?: string
  updated_at?: string
  /** Added by the admin ObaRequestcontroller. */
  filer_name: string | null
  department_name: string | null
  oba_employees?: ObaEmployee[]
  images?: ObaImage[]
}

export interface ObaApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

/** Laravel paginator shape. */
export interface ObaPaginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

/** Number of requests per status, returned beside the list. */
export type ObaSummary = Partial<Record<ObaRequestStatus, number>>

export interface ObaRequestListResponse extends ObaApiResponse<ObaPaginated<ObaRequestRecord>> {
  summary: ObaSummary
}

export type ObaRequestDetailResponse = ObaApiResponse<ObaRequestRecord>

export interface ObaRequestListParams {
  page?: number
  per_page?: number
  status?: ObaRequestStatus | ''
  department_id?: number | ''
  search?: string
  /** 'YYYY-MM-DD' */
  date_from?: string
  /** 'YYYY-MM-DD' */
  date_to?: string
}

export interface ObaApiErrorData {
  message?: string
  errors?: Record<string, string[]>
}