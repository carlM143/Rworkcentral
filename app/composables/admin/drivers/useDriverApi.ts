export type DriverAvailabilityStatus =
  | 'available'
  | 'on_trip'
  | 'rest_day'
  | 'on_leave'
  | 'license_expired'

export interface DriverBusyBlock {
  ticket_no: string
  destination: string
  start: string // HH:mm
  end: string // HH:mm
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
}

export interface DriverRecord {
  id: number
  drivers_code: string
  licence_no: string
  expire_date: string
  image_path: string | null
  employee: {
    id: number
    emp_id: string
    name: string
    department: string | null
    position: string | null
  }
  availability: {
    status: DriverAvailabilityStatus
    note: string
    available_from: string | null
    busy: DriverBusyBlock[]
  }
}

export interface DriverEmployeeOption {
  id: number
  emp_id: string
  name: string
  department: string | null
  position: string | null
}

export interface StoreDriverPayload {
  employee_id: number
  drivers_code: string
  licence_no: string
  expire_date: string
  image?: File | null
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// =====================================================
// DATE HELPERS
// =====================================================

const pad = (n: number) => String(n).padStart(2, '0')
const toDateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const driverTodayLocal = () => toDateString(new Date())

export const driverTimeText = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h ?? 0, m ?? 0, 0, 0)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// =====================================================
// COMPOSABLE
// =====================================================

export const useDriverApi = () => {
  const { $api } = useNuxtApp()
  const { token } = useAuth()

  const headers = (): Record<string, string> =>
    token.value ? { Authorization: `Bearer ${token.value}` } : {}

  // GET /admin/drivers/availability?date=YYYY-MM-DD
  const availability = (date: string) =>
    $api<ApiResponse<DriverRecord[]>>('/admin/drivers/availability', {
      method: 'GET',
      query: { date },
      headers: headers(),
    })

  // GET /admin/drivers/eligible-employees
  const eligibleEmployees = () =>
    $api<ApiResponse<DriverEmployeeOption[]>>('/admin/drivers/eligible-employees', {
      method: 'GET',
      headers: headers(),
    })

  // GET /admin/drivers/next-code
  const nextDriverCode = async (): Promise<string> => {
    const response = await $api<ApiResponse<{ drivers_code: string }>>('/admin/drivers/next-code', {
      method: 'GET',
      headers: headers(),
    })
    return response.data.drivers_code
  }

  // Latest drivers for the Add Driver side panel
  const recent = async (limit = 3) => {
    const response = await availability(driverTodayLocal())
    return [...response.data]
      .sort((a, b) => b.id - a.id)
      .slice(0, limit)
      .map(d => ({ id: d.id, name: d.employee.name, drivers_code: d.drivers_code, department: d.employee.department }))
  }

  // POST /admin/drivers (multipart)
  const store = (payload: StoreDriverPayload) => {
    const form = new FormData()
    form.append('employee_id', String(payload.employee_id))
    if (payload.drivers_code.trim()) form.append('drivers_code', payload.drivers_code.trim())
    form.append('licence_no', payload.licence_no.trim())
    form.append('expire_date', payload.expire_date)
    if (payload.image) form.append('image', payload.image)

    return $api<ApiResponse<DriverRecord>>('/admin/drivers', {
      method: 'POST',
      body: form,
      headers: headers(),
    })
  }

  // GET /admin/drivers/{id}
  const show = (id: number) =>
    $api<ApiResponse<DriverRecord>>(`/admin/drivers/${id}`, {
      method: 'GET',
      headers: headers(),
    })

  return { availability, eligibleEmployees, nextDriverCode, recent, store, show }
}

/** Readable message from a Laravel error response. */
export const driverErrorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { data?: { message?: string, errors?: Record<string, string[]> } })?.data
  const firstFieldError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined
  return firstFieldError || data?.message || fallback
}