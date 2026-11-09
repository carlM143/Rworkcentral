import {
  demoPassengerEmployees,
  demoTripTickets,
  demoVehicles,
  type DemoTripTicket,
  type TripPassenger,
  type TripTicketStatus,
  type TripVehicle,
} from './demoTripStore'
import { driverTimeText, driverTodayLocal, useDriverApi, type DriverRecord } from './useDriverApi'

export type { TripPassenger, TripTicketStatus, TripVehicle }

export interface TripTicketRecord {
  id: number
  ticket_no: string
  trip_date: string
  status: TripTicketStatus
  driver: { id: number, name: string, drivers_code: string }
  vehicle: TripVehicle
  destination: string
  purpose: string
  scheduled_departure: string
  expected_return: string
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

export interface StoreTripTicketPayload {
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

// =====================================================
// HELPERS
// =====================================================

const delay = () => new Promise(resolve => setTimeout(resolve, 200))

const fail = (field: string, message: string): never => {
  throw { statusCode: 422, data: { message, errors: { [field]: [message] } } }
}

const pad = (n: number) => String(n).padStart(2, '0')

export const tripNowHHmm = () => {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** Time window a ticket occupies (actual times when known, otherwise plan). */
const windowOf = (t: DemoTripTicket): [string, string] => {
  const start = t.departed_at ?? t.scheduled_departure
  let end = t.returned_at ?? t.expected_return
  // Running late: still out, so busy for the rest of the day.
  if (t.status === 'ongoing' && t.trip_date === driverTodayLocal() && tripNowHHmm() >= end) end = '23:59'
  return [start, end]
}

const overlapping = (date: string, start: string, end: string, excludeId?: number) =>
  demoTripTickets.filter((t) => {
    if (t.trip_date !== date || t.status === 'cancelled' || t.id === excludeId) return false
    const [s, e] = windowOf(t)
    return start < e && s < end
  })

const lastOdometer = (vehicleId: number, excludeId?: number): number | null => {
  const readings = demoTripTickets
    .filter(t => t.vehicle_id === vehicleId && t.id !== excludeId)
    .flatMap(t => [t.odometer_out, t.odometer_in])
    .filter((n): n is number => n !== null)
  return readings.length ? Math.max(...readings) : null
}

const UNAVAILABLE: Record<string, string> = {
  rest_day: 'Rest day',
  on_leave: 'On leave',
  license_expired: 'License expired',
}

const format = (t: DemoTripTicket, drivers: DriverRecord[]): TripTicketRecord => {
  const driver = drivers.find(d => d.id === t.driver_id)
  return {
    id: t.id,
    ticket_no: t.ticket_no,
    trip_date: t.trip_date,
    status: t.status,
    driver: {
      id: t.driver_id,
      name: driver?.employee.name ?? 'Unknown driver',
      drivers_code: driver?.drivers_code ?? '—',
    },
    vehicle: demoVehicles.find(v => v.id === t.vehicle_id)!,
    destination: t.destination,
    purpose: t.purpose,
    scheduled_departure: t.scheduled_departure,
    expected_return: t.expected_return,
    departed_at: t.departed_at,
    returned_at: t.returned_at,
    odometer_out: t.odometer_out,
    odometer_in: t.odometer_in,
    distance_km: t.odometer_in !== null && t.odometer_out !== null ? t.odometer_in - t.odometer_out : null,
    duration_minutes: t.departed_at && t.returned_at ? toMinutes(t.returned_at) - toMinutes(t.departed_at) : null,
    passengers: t.passenger_ids
      .map(id => demoPassengerEmployees.find(p => p.id === id))
      .filter((p): p is TripPassenger => Boolean(p)),
    remarks: t.remarks,
  }
}

// =====================================================
// COMPOSABLE
// =====================================================

export const useTripTicketApi = () => {
  const driverApi = useDriverApi()

  const driversOn = async (date: string) => (await driverApi.availability(date)).data

  const findTicket = (id: number) => {
    const ticket = demoTripTickets.find(t => t.id === id)
    if (!ticket) fail('id', 'Trip ticket not found.')
    return ticket!
  }

  const respond = async (ticket: DemoTripTicket, message: string): Promise<ApiResponse<TripTicketRecord>> => {
    const drivers = await driversOn(driverTodayLocal())
    return { success: true, message, data: format(ticket, drivers) }
  }

  // GET /admin/trip-tickets
  const list = async (): Promise<ApiResponse<TripTicketRecord[]>> => {
    await delay()
    const drivers = await driversOn(driverTodayLocal())
    const data = [...demoTripTickets]
      .sort((a, b) => b.trip_date.localeCompare(a.trip_date) || b.scheduled_departure.localeCompare(a.scheduled_departure))
      .map(t => format(t, drivers))
    return { success: true, message: 'Trip tickets retrieved.', data }
  }

  // GET /admin/trip-tickets/options?date=&start=&end=
  // Drivers, vehicles and passengers for a time window, with the reason
  // when one cannot be selected.
  const formOptions = async (date: string, start: string, end: string) => {
    const drivers = await driversOn(date)
    const busy = overlapping(date, start, end)
    const window = `${driverTimeText(start)}–${driverTimeText(end)}`

    const driverOptions: TripDriverOption[] = drivers.map((d) => {
      const base = { id: d.id, name: d.employee.name, drivers_code: d.drivers_code }
      const status = d.availability.status
      if (UNAVAILABLE[status]) return { ...base, available: false, reason: UNAVAILABLE[status]! }
      const clash = busy.find(t => t.driver_id === d.id)
      if (clash) return { ...base, available: false, reason: `On ${clash.ticket_no} during ${window}` }
      return { ...base, available: true, reason: null }
    }).sort((a, b) => Number(b.available) - Number(a.available))

    const vehicleOptions: TripVehicleOption[] = demoVehicles.map((v) => {
      const clash = busy.find(t => t.vehicle_id === v.id)
      return clash
        ? { ...v, available: false, reason: `In use on ${clash.ticket_no}` }
        : { ...v, available: true, reason: null }
    }).sort((a, b) => Number(b.available) - Number(a.available))

    const passengerOptions: TripPassengerOption[] = demoPassengerEmployees.map((p) => {
      const clash = busy.find(t => t.passenger_ids.includes(p.id))
      return clash
        ? { ...p, available: false, reason: `On ${clash.ticket_no}` }
        : { ...p, available: true, reason: null }
    })

    return { drivers: driverOptions, vehicles: vehicleOptions, passengers: passengerOptions }
  }

  // POST /admin/trip-tickets
  const store = async (payload: StoreTripTicketPayload): Promise<ApiResponse<TripTicketRecord>> => {
    await delay()
    if (!payload.trip_date) fail('trip_date', 'Select the trip date.')
    if (payload.trip_date < driverTodayLocal()) fail('trip_date', 'The trip date cannot be in the past.')
    if (!payload.scheduled_departure || !payload.expected_return) fail('scheduled_departure', 'Enter the departure and return time.')
    if (payload.expected_return <= payload.scheduled_departure) fail('expected_return', 'Expected return must be after the departure time.')
    if (!payload.destination.trim()) fail('destination', 'Enter the destination.')
    if (!payload.purpose.trim()) fail('purpose', 'Enter the purpose of the trip.')
    if (!payload.driver_id) fail('driver_id', 'Select a driver.')
    if (!payload.vehicle_id) fail('vehicle_id', 'Select a vehicle.')

    const options = await formOptions(payload.trip_date, payload.scheduled_departure, payload.expected_return)

    const driver = options.drivers.find(d => d.id === payload.driver_id)
    if (!driver?.available) fail('driver_id', `Driver is not available: ${driver?.reason ?? 'not found'}.`)

    const vehicle = options.vehicles.find(v => v.id === payload.vehicle_id)
    if (!vehicle?.available) fail('vehicle_id', `Vehicle is not available: ${vehicle?.reason ?? 'not found'}.`)
    if (payload.passenger_ids.length > vehicle!.capacity) {
      fail('passenger_ids', `${vehicle!.plate_no} can carry up to ${vehicle!.capacity} passenger(s).`)
    }

    const busyPassenger = options.passengers.find(p => payload.passenger_ids.includes(p.id) && !p.available)
    if (busyPassenger) fail('passenger_ids', `${busyPassenger.name} is already ${busyPassenger.reason}.`)

    const prefix = `TT-${payload.trip_date.slice(0, 4)}-`
    const seq = Math.max(0, ...demoTripTickets
      .filter(t => t.ticket_no.startsWith(prefix))
      .map(t => Number(t.ticket_no.slice(prefix.length)) || 0)) + 1

    const ticket: DemoTripTicket = {
      id: Math.max(0, ...demoTripTickets.map(t => t.id)) + 1,
      ticket_no: `${prefix}${String(seq).padStart(4, '0')}`,
      trip_date: payload.trip_date,
      driver_id: payload.driver_id!,
      vehicle_id: payload.vehicle_id!,
      destination: payload.destination.trim(),
      purpose: payload.purpose.trim(),
      scheduled_departure: payload.scheduled_departure,
      expected_return: payload.expected_return,
      departed_at: null,
      returned_at: null,
      odometer_out: null,
      odometer_in: null,
      status: 'scheduled',
      passenger_ids: [...payload.passenger_ids],
      remarks: payload.remarks?.trim() || null,
    }

    demoTripTickets.push(ticket)
    return respond(ticket, `Trip ticket ${ticket.ticket_no} created.`)
  }

  // PATCH /admin/trip-tickets/{id}/depart
  const depart = async (id: number, payload: { departed_at: string, odometer_out: number | null }) => {
    await delay()
    const ticket = findTicket(id)
    if (ticket.status !== 'scheduled') fail('status', 'Only scheduled trips can depart.')
    if (!payload.departed_at) fail('departed_at', 'Enter the departure time.')
    if (payload.odometer_out === null || payload.odometer_out < 0) fail('odometer_out', 'Enter the odometer reading.')

    const last = lastOdometer(ticket.vehicle_id, ticket.id)
    if (last !== null && payload.odometer_out! < last) {
      fail('odometer_out', `Odometer cannot be lower than the last reading (${last.toLocaleString()} km).`)
    }

    const otherOngoing = demoTripTickets.find(t => t.id !== ticket.id && t.status === 'ongoing'
      && (t.driver_id === ticket.driver_id || t.vehicle_id === ticket.vehicle_id))
    if (otherOngoing) fail('status', `Driver or vehicle is still on ${otherOngoing.ticket_no}. Record its return first.`)

    Object.assign(ticket, { status: 'ongoing', departed_at: payload.departed_at, odometer_out: payload.odometer_out })
    return respond(ticket, `${ticket.ticket_no} departed.`)
  }

  // PATCH /admin/trip-tickets/{id}/return
  const returnTrip = async (id: number, payload: { returned_at: string, odometer_in: number | null }) => {
    await delay()
    const ticket = findTicket(id)
    if (ticket.status !== 'ongoing') fail('status', 'Only ongoing trips can be returned.')
    if (!payload.returned_at) fail('returned_at', 'Enter the return time.')
    if (payload.returned_at <= ticket.departed_at!) fail('returned_at', 'Return time must be after the departure time.')
    if (payload.odometer_in === null) fail('odometer_in', 'Enter the odometer reading.')
    if (payload.odometer_in! < ticket.odometer_out!) {
      fail('odometer_in', `Odometer cannot be lower than the reading at departure (${ticket.odometer_out!.toLocaleString()} km).`)
    }

    Object.assign(ticket, { status: 'completed', returned_at: payload.returned_at, odometer_in: payload.odometer_in })
    return respond(ticket, `${ticket.ticket_no} completed.`)
  }

  // PATCH /admin/trip-tickets/{id}/cancel
  const cancel = async (id: number, remarks: string) => {
    await delay()
    const ticket = findTicket(id)
    if (ticket.status !== 'scheduled') fail('status', 'Only scheduled trips can be cancelled.')
    if (!remarks.trim()) fail('remarks', 'Enter the reason for cancelling.')
    Object.assign(ticket, { status: 'cancelled', remarks: remarks.trim() })
    return respond(ticket, `${ticket.ticket_no} cancelled.`)
  }

  return {
    list,
    formOptions,
    store,
    depart,
    returnTrip,
    cancel,
    lastOdometer: (vehicleId: number, excludeId?: number) => lastOdometer(vehicleId, excludeId),
  }
}