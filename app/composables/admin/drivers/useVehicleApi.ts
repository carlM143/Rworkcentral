/**
 * Vehicles API.
 * Endpoints: routes/api/admin/carl/newAdminRoute.php → VehicleController
 */

export type VehicleStatus = 'active' | 'maintenance' | 'inactive'

export interface VehicleRecord {
  id: number
  plate_no: string
  description: string
  vehicle_type: string | null
  capacity: number
  status: VehicleStatus
  trips_count: number
  upcoming_trips: number
  current_trip: string | null // ticket no. while on an ongoing trip
  last_odometer: number | null
}

export interface VehiclePayload {
  plate_no: string
  description: string
  vehicle_type: string
  capacity: number | null
  status: VehicleStatus
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface VehicleListResponse extends ApiResponse<VehicleRecord[]> {
  stats: { total: number, active: number, maintenance: number, inactive: number, on_trip: number }
}

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  active: 'Active',
  maintenance: 'Under Maintenance',
  inactive: 'Inactive',
}

export const useVehicleApi = () => {
  const { $api } = useNuxtApp()
  const { token } = useAuth()

  const headers = (): Record<string, string> =>
    token.value ? { Authorization: `Bearer ${token.value}` } : {}

  const clean = (payload: VehiclePayload) => ({
    plate_no: payload.plate_no.trim().toUpperCase(),
    description: payload.description.trim(),
    vehicle_type: payload.vehicle_type.trim() || null,
    capacity: payload.capacity,
    status: payload.status,
  })

  // GET /admin/vehicles
  const list = (params: { search?: string, status?: VehicleStatus | '' } = {}) =>
    $api<VehicleListResponse>('/admin/vehicles', {
      method: 'GET',
      query: Object.fromEntries(Object.entries(params).filter(([, v]) => v)),
      headers: headers(),
    })

  // POST /admin/vehicles
  const store = (payload: VehiclePayload) =>
    $api<ApiResponse<VehicleRecord>>('/admin/vehicles', {
      method: 'POST',
      body: clean(payload),
      headers: headers(),
    })

  // PUT /admin/vehicles/{id}
  const update = (id: number, payload: VehiclePayload) =>
    $api<ApiResponse<VehicleRecord>>(`/admin/vehicles/${id}`, {
      method: 'PUT',
      body: clean(payload),
      headers: headers(),
    })

  // DELETE /admin/vehicles/{id} (only vehicles never used on a trip)
  const destroy = (id: number) =>
    $api<ApiResponse<null>>(`/admin/vehicles/${id}`, {
      method: 'DELETE',
      headers: headers(),
    })

  return { list, store, update, destroy }
}
