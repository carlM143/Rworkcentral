/**
 * Regional minimum wage orders and rates (no tranches: one effective date
 * per order), and applying an order to employees.
 * Endpoints: WageOrderController, WageOrderEmployeeController, RegionalRateController.
 */

export type WageOrderStatus = 'draft' | 'scheduled' | 'active' | 'superseded' | 'cancelled'

export interface WageOrderSummary {
  id: number
  region_code: string
  region_name: string
  order_no: string
  title: string
  effective_date: string | null
  status: 'draft' | 'published' | 'cancelled'
  display_status: WageOrderStatus
  classification_names: string[]
  headline: { classification: string, previous_rate: number | null, new_rate: number, increase: number | null } | null
  adjustments_created: number
  has_document: boolean
  source: string | null
}

export interface WageOrderRate {
  id?: number
  classification: string
  classification_name?: string
  daily_rate: number
  cola: number
  minimum?: number
  previous_rate: number | null
  increase?: number | null
  notes: string | null
  in_force?: boolean
}

export interface WageOrderDetail extends WageOrderSummary {
  issued_date: string | null
  published_date: string | null
  remarks: string | null
  document_url: string | null
  document_name: string | null
  created_by: string | null
  created_at: string | null
  rates: WageOrderRate[]
}

export interface WageOrderPayload {
  region_code: string
  order_no: string
  title: string
  effective_date: string
  issued_date: string | null
  published_date: string | null
  source: string | null
  remarks: string | null
  rates: { classification: string, daily_rate: number, cola: number, previous_rate: number | null, notes: string | null }[]
}

export type WageEmployeeStatus = 'below' | 'at' | 'above' | 'unknown'

export interface WageEmployee {
  employee_id: number
  emp_id: string
  name: string
  department_id: number | null
  department: string | null
  position: string | null
  location_id: number
  location: string
  classification: string
  classification_name: string
  salary_setup_id: number | null
  salary_type: string
  current_salary: number | null
  current_daily: number | null
  new_minimum: number | null
  cola: number
  status: WageEmployeeStatus
  priority: boolean
  shortfall_daily: number
  suggested_salary: number | null
  included: number | null
  blocked_reason: string | null
  blocking: {
    id: number
    status: 'pending' | 'approved'
    type: string
    source: 'wage_order' | 'manual'
    order_no: string | null
    this_order: boolean
    previous_salary: number
    new_salary: number
    effective_date: string
  } | null
}

export interface WageEmployeesResponse {
  success: boolean
  message: string
  data: WageEmployee[]
  stats: { employees: number, below_minimum: number, already_included: number, blocked: number }
  departments: { id: number, name: string }[]
  locations: { id: number, name: string }[]
}

export interface WageMeta {
  default_region: string
  working_days_per_year: number
  regions: { code: string, name: string }[]
  classifications: { key: string, name: string }[]
}

export interface RateRow {
  wage_order_id: number
  order_no: string
  effective_date: string
  daily_rate: number
  cola: number
  total: number
  previous_rate: number | null
}

export interface RegionalRates {
  as_of: string
  rates: {
    region_code: string
    region_name: string
    classification: string
    classification_name: string
    current: RateRow | null
    next: RateRow | null
    history: RateRow[]
  }[]
  locations: {
    id: number
    name: string
    city: string
    province: string | null
    active: boolean
    region_code: string | null
    region_name: string | null
    wage_classification: string | null
    classification_name: string | null
    employees: number
    minimum_daily: number | null
    minimum_order_no: string | null
  }[]
}

export type WageAdjustmentStatus = 'pending' | 'approved' | 'applied' | 'rejected'

export interface WageAdjustment {
  id: number
  status: WageAdjustmentStatus
  employee_id: number
  emp_id: string
  name: string
  department_id: number | null
  department: string | null
  position: string | null
  salary_type: string
  previous_salary: number
  new_salary: number
  increase: number
  effective_date: string
  can_apply_now: boolean
  approved_by: string | null
  approved_at: string | null
  applied_at: string | null
  wage_order_id: number
  order_no: string
}

export interface WageAdjustmentsResponse {
  success: boolean
  message: string
  data: WageAdjustment[]
  stats: Record<WageAdjustmentStatus, number>
  wage_orders: { id: number, order_no: string, title: string }[]
  departments: { id: number, name: string }[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const WAGE_STATUS_LABELS: Record<WageOrderStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  active: 'Active',
  superseded: 'Superseded',
  cancelled: 'Cancelled',
}

export const peso = (value: number | null | undefined) =>
  value === null || value === undefined
    ? '—'
    : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)

export const wageDate = (value: string | null | undefined) =>
  value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value.slice(0, 10)}T00:00:00`)) : '—'

export const wageApiError = (error: unknown, fallback: string) => {
  const e = error as { data?: { message?: string, errors?: Record<string, string[]> }, response?: { _data?: { message?: string, errors?: Record<string, string[]> } } }
  const body = e?.data ?? e?.response?._data
  const errors = body?.errors ?? {}
  return { message: Object.values(errors)[0]?.[0] ?? body?.message ?? fallback, errors }
}

export const useWageOrders = () => {
  const { $api } = useNuxtApp()

  const meta = () => $api<ApiResponse<WageMeta>>('/admin/wage-orders/meta', { method: 'GET' })

  const list = (params: { search?: string, region?: string, status?: string } = {}) =>
    $api<ApiResponse<WageOrderSummary[]> & { stats: { total: number, active: number, scheduled: number, regions: number } }>(
      '/admin/wage-orders',
      { method: 'GET', query: Object.fromEntries(Object.entries(params).filter(([, v]) => v)) },
    )

  const show = (id: number) => $api<ApiResponse<WageOrderDetail>>(`/admin/wage-orders/${id}`, { method: 'GET' })
  const store = (payload: WageOrderPayload) => $api<ApiResponse<WageOrderDetail>>('/admin/wage-orders', { method: 'POST', body: payload })
  const update = (id: number, payload: WageOrderPayload) => $api<ApiResponse<WageOrderDetail>>(`/admin/wage-orders/${id}`, { method: 'PUT', body: payload })
  const destroy = (id: number) => $api<ApiResponse<null>>(`/admin/wage-orders/${id}`, { method: 'DELETE' })
  const publish = (id: number) => $api<ApiResponse<WageOrderDetail>>(`/admin/wage-orders/${id}/publish`, { method: 'PATCH' })
  const cancel = (id: number) => $api<ApiResponse<WageOrderDetail>>(`/admin/wage-orders/${id}/cancel`, { method: 'PATCH' })

  const uploadDocument = (id: number, file: File) => {
    const form = new FormData()
    form.append('document', file)
    return $api<ApiResponse<WageOrderDetail>>(`/admin/wage-orders/${id}/document`, { method: 'POST', body: form })
  }

  const deleteDocument = (id: number) => $api<ApiResponse<WageOrderDetail>>(`/admin/wage-orders/${id}/document`, { method: 'DELETE' })

  const employees = (id: number, params: { department_id?: number | '', location_id?: number | '', search?: string } = {}) =>
    $api<WageEmployeesResponse>(`/admin/wage-orders/${id}/employees`, {
      method: 'GET',
      query: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)),
    })

  const apply = (id: number, payload: { items: { employee_id: number, new_basic_salary: number }[], reason?: string }) =>
    $api<ApiResponse<{
      created: { employee_id: number, name: string, salary_adjustment_id: number }[]
      skipped: { employee_id: number, name: string | null, reason: string }[]
    }>>(`/admin/wage-orders/${id}/apply`, { method: 'POST', body: payload })

  // Compensation › Wage Adjustments
  const wageAdjustments = (params: { wage_order_id?: number | '', status?: string, department_id?: number | '', search?: string } = {}) =>
    $api<WageAdjustmentsResponse>('/admin/wage-adjustments', {
      method: 'GET',
      query: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)),
    })

  const bulkAdjustments = (action: 'approve' | 'reject' | 'apply', ids: number[]) =>
    $api<ApiResponse<{ done: { id: number, name: string }[], failed: { id: number, name: string, reason: string }[] }>>(
      '/admin/wage-adjustments/bulk',
      { method: 'PATCH', body: { action, ids } },
    )

  // Delete a salary adjustment that is not applied yet (wage order or manual).
  const deleteAdjustment = (adjustmentId: number) =>
    $api<ApiResponse<null>>(`/admin/salary-adjustments/${adjustmentId}`, { method: 'DELETE' })

  const regionalRates = () => $api<ApiResponse<RegionalRates>>('/admin/regional-rates', { method: 'GET' })

  const updateLocation = (id: number, payload: { region_code: string, wage_classification: string }) =>
    $api<ApiResponse<RegionalRates['locations'][number]>>(`/admin/regional-rates/locations/${id}`, { method: 'PATCH', body: payload })

  return { meta, list, show, store, update, destroy, publish, cancel, uploadDocument, deleteDocument, employees, apply, wageAdjustments, bulkAdjustments, deleteAdjustment, regionalRates, updateLocation }
}