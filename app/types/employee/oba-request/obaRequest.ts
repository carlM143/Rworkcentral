export type ObaRequestStatus = 'pending' | 'dept_head_approved' | 'approved' | 'rejected' | 'cancelled'

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
  /** The employee who FILED the form. */
  employee_id: number
  approved_by: number | null
  dept_head_id?: number | null
  dept_head_acted_at?: string | null
  rejection_reason?: string | null
  reason: string
  destination: string
  time_from: string
  time_to: string
  date_request: string
  status: ObaRequestStatus
  created_at?: string
  updated_at?: string
  /** True when the logged-in employee is the one who filed it. */
  is_filer?: boolean
  filer?: { id: number; firstname: string; lastname: string } | null
  /** Relations (Laravel serializes relation names in snake_case). */
  oba_employees?: ObaEmployee[]
  images?: ObaImage[]
}

/** Standard envelope used by the employee API controllers. */
export interface ObaApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

/** Laravel paginator shape returned by GET /employee/oba-requests. */
export interface ObaPaginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type ObaRequestListResponse = ObaApiResponse<ObaPaginated<ObaRequestRecord>>
export type ObaRequestDetailResponse = ObaApiResponse<ObaRequestRecord>
export type ObaRequestActionResponse = ObaApiResponse<ObaRequestRecord | null>
export type ObaApprovalsResponse = ObaApiResponse<ObaRequestRecord[]> & { is_department_head: boolean }

export interface ObaRequestListParams {
  page?: number
  per_page?: number
  status?: ObaRequestStatus | ''
}

/** Data the employee submits. Sent as multipart/form-data. */
export interface ObaRequestPayload {
  destination: string
  reason: string
  /** Date of the OBA, 'YYYY-MM-DD' (saved in date_request). */
  date_request: string
  /** Departure time, 'HH:mm' (saved in time_from together with date_request). */
  time_from: string
  /** Return time, 'HH:mm' (saved in time_to together with date_request). */
  time_to: string
  images?: File[]
  /** Employees covered by the OBA (at least one). */
  employee_ids?: number[]
}

export interface ObaApiErrorData {
  message?: string
  errors?: Record<string, string[]>
}

export interface ObaAvailableEmployee {
  id: number
  name: string
}

export type ObaAvailableEmployeesResponse = ObaApiResponse<ObaAvailableEmployee[]>

export interface ObaDepartment {
  id: number
  name: string
}

export type ObaDepartmentsResponse = ObaApiResponse<ObaDepartment[]>