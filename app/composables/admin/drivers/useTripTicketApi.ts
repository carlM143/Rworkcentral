export type TripTicketStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled'

export interface TripVehicle {
  id: number
  plate_no: string
  description: string
  capacity: number
}

export interface TripPassenger {
  id: number
  emp_id: string
  name: string
  department: string | null
}

export interface TripTicketRecord {
  id: number
  ticket_no: string
  trip_date: string
  status: TripTicketStatus
  requesting_department: { id: number, name: string } | null
  requested_by: { id: number, name: string, position: string } | null
  driver: { id: number, name: string, drivers_code: string }
  vehicle: TripVehicle
  last_odometer: number | null // highest reading recorded for the vehicle
  destination: string
  purpose: string
  scheduled_departure: string // HH:mm
  expected_return: string // HH:mm
  departed_at: string | null
  returned_at: string | null
  odometer_out: number | null
  odometer_in: number | null
  distance_km: number | null
  duration_minutes: number | null
  passengers: TripPassenger[]
  remarks: string | null
}

export interface TripDriverOption {
  id: number
  name: string
  drivers_code: string
  department: string | null
  same_department: boolean
  available: boolean
  reason: string | null
}

export interface TripVehicleOption extends TripVehicle {
  available: boolean
  reason: string | null
}

export interface TripPassengerOption extends TripPassenger {
  available: boolean
  reason: string | null
}

export interface TripDepartmentOption {
  id: number
  name: string
}

export interface TripRequesterOption {
  id: number
  emp_id: string
  name: string
  position: string
  is_head: boolean
}

export interface StoreTripTicketPayload {
  requesting_department_id: number | null
  requested_by: number | null
  trip_date: string
  scheduled_departure: string
  expected_return: string
  driver_id: number | null
  vehicle_id: number | null
  destination: string
  purpose: string
  passenger_ids: number[]
  remarks?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const pad = (n: number) => String(n).padStart(2, '0')

export const tripNowHHmm = () => {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const useTripTicketApi = () => {
  const { $api } = useNuxtApp()
  const { token } = useAuth()

  const headers = (): Record<string, string> =>
    token.value ? { Authorization: `Bearer ${token.value}` } : {}

  // GET /admin/trip-tickets
  const list = () =>
    $api<ApiResponse<TripTicketRecord[]>>('/admin/trip-tickets', {
      method: 'GET',
      headers: headers(),
    })

  // GET /admin/trip-tickets/departments
  const departments = () =>
    $api<ApiResponse<TripDepartmentOption[]>>('/admin/trip-tickets/departments', {
      method: 'GET',
      headers: headers(),
    })

  // GET /admin/trip-tickets/requesters?department_id=
  const requesters = (departmentId: number) =>
    $api<ApiResponse<TripRequesterOption[]>>('/admin/trip-tickets/requesters', {
      method: 'GET',
      query: { department_id: departmentId },
      headers: headers(),
    })

  // GET /admin/trip-tickets/options?date=&start=&end=&department_id=
  const formOptions = async (date: string, start: string, end: string, departmentId?: number | null) => {
    const response = await $api<ApiResponse<{
      drivers: TripDriverOption[]
      vehicles: TripVehicleOption[]
      passengers: TripPassengerOption[]
    }>>('/admin/trip-tickets/options', {
      method: 'GET',
      query: { date, start, end, ...(departmentId ? { department_id: departmentId } : {}) },
      headers: headers(),
    })
    return response.data
  }

  // POST /admin/trip-tickets
  const store = (payload: StoreTripTicketPayload) =>
    $api<ApiResponse<TripTicketRecord>>('/admin/trip-tickets', {
      method: 'POST',
      body: {
        ...payload,
        destination: payload.destination.trim(),
        purpose: payload.purpose.trim(),
        remarks: payload.remarks?.trim() || null,
      },
      headers: headers(),
    })

  // PATCH /admin/trip-tickets/{id}/depart
  const depart = (id: number, payload: { departed_at: string, odometer_out: number | null }) =>
    $api<ApiResponse<TripTicketRecord>>(`/admin/trip-tickets/${id}/depart`, {
      method: 'PATCH',
      body: payload,
      headers: headers(),
    })

  // PATCH /admin/trip-tickets/{id}/return
  const returnTrip = (id: number, payload: { returned_at: string, odometer_in: number | null }) =>
    $api<ApiResponse<TripTicketRecord>>(`/admin/trip-tickets/${id}/return`, {
      method: 'PATCH',
      body: payload,
      headers: headers(),
    })

  // PATCH /admin/trip-tickets/{id}/cancel
  const cancel = (id: number, remarks: string) =>
    $api<ApiResponse<TripTicketRecord>>(`/admin/trip-tickets/${id}/cancel`, {
      method: 'PATCH',
      body: { remarks },
      headers: headers(),
    })

  return { list, departments, requesters, formOptions, store, depart, returnTrip, cancel }
}