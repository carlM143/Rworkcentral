/**
 * Drivers API (drivers_info + availability).
 *
 * DEMO MODE: data lives in this file and resets on reload.
 * Shapes and function names match the planned Laravel endpoint
 *   GET /admin/drivers/availability?date=YYYY-MM-DD
 * so connecting the backend later only replaces the function bodies.
 *
 * Availability rules (same as the backend will use):
 *   1. License expired on that date      -> license_expired
 *   2. Approved leave on that date        -> on_leave
 *   3. Rest day in the work schedule      -> rest_day
 *   4. Inside a trip window right now     -> on_trip
 *   5. Otherwise                          -> available (with busy blocks)
 */

import { demoTripTickets, type TripTicketStatus } from './demoTripStore'

export type DriverAvailabilityStatus =
  | 'available'
  | 'on_trip'
  | 'rest_day'
  | 'on_leave'
  | 'license_expired'

export interface DriverBusyBlock {
  ticket_no: string
  destination: string
  start: string // HH:mm (actual departure if already left, otherwise plan)
  end: string // HH:mm (actual return if back, otherwise expected)
  status: TripTicketStatus
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
    available_from: string | null // HH:mm, when an on-trip driver is free again
    busy: DriverBusyBlock[]
  }
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
const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + days)
  return toDateString(d)
}

export const driverTodayLocal = () => toDateString(new Date())

export const driverTimeText = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h ?? 0, m ?? 0, 0, 0)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// =====================================================
// DEMO DATA
// =====================================================

const TODAY = driverTodayLocal()
const TOMORROW = addDays(TODAY, 1)
const weekdayOf = (date: string) => new Date(`${date}T00:00:00`).getDay() // 0 = Sun

interface DemoDriver extends Omit<DriverRecord, 'availability'> {
  rest_days: number[]
  leave_dates: string[]
}

const DEMO_DRIVERS: DemoDriver[] = [
  { id: 1, drivers_code: 'DRV-001', licence_no: 'N03-2023-18407', expire_date: '2027-07-15', image_path: null, employee: { id: 11, emp_id: '1011', name: 'Mark Santos', department: 'Operations', position: 'Driver' }, rest_days: [0], leave_dates: [] },
  { id: 2, drivers_code: 'DRV-002', licence_no: 'N03-2024-22411', expire_date: '2028-01-09', image_path: null, employee: { id: 12, emp_id: '1012', name: 'Ramon Cruz', department: 'Operations', position: 'Driver' }, rest_days: [0], leave_dates: [] },
  { id: 3, drivers_code: 'DRV-003', licence_no: 'N03-2022-11184', expire_date: addDays(TODAY, 20), image_path: null, employee: { id: 13, emp_id: '1013', name: 'Jerome Dela Cruz', department: 'Operations', position: 'Driver' }, rest_days: [0], leave_dates: [TODAY] },
  { id: 4, drivers_code: 'DRV-004', licence_no: 'N03-2021-00991', expire_date: '2026-01-18', image_path: null, employee: { id: 14, emp_id: '1014', name: 'Aldrin Baguio', department: 'Operations', position: 'Driver' }, rest_days: [0], leave_dates: [] },
  { id: 5, drivers_code: 'DRV-005', licence_no: 'N03-2025-00318', expire_date: '2028-06-29', image_path: null, employee: { id: 15, emp_id: '1015', name: 'Neil Ferrer', department: 'Logistics', position: 'Driver' }, rest_days: [0], leave_dates: [] },
  { id: 6, drivers_code: 'DRV-006', licence_no: 'N03-2023-77120', expire_date: '2027-02-12', image_path: null, employee: { id: 16, emp_id: '1016', name: 'Joshua Rivera', department: 'Logistics', position: 'Driver' }, rest_days: [weekdayOf(TOMORROW)], leave_dates: [] },
]

// Trips come from the shared demo store, so new trip tickets
// immediately affect driver availability.
const tripBlocksFor = (driverId: number, date: string): DriverBusyBlock[] =>
  demoTripTickets
    .filter(t => t.driver_id === driverId && t.trip_date === date && t.status !== 'cancelled')
    .sort((a, b) => a.scheduled_departure.localeCompare(b.scheduled_departure))
    .map(t => ({
      ticket_no: t.ticket_no,
      destination: t.destination,
      start: t.departed_at ?? t.scheduled_departure,
      end: t.returned_at ?? t.expected_return,
      status: t.status,
    }))

const nowHHmm = () => {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const computeAvailability = (driver: DemoDriver, date: string): DriverRecord['availability'] => {
  const busy = tripBlocksFor(driver.id, date)

  if (driver.expire_date < date) {
    return { status: 'license_expired', note: `License expired ${driver.expire_date}`, available_from: null, busy }
  }
  if (driver.leave_dates.includes(date)) {
    return { status: 'on_leave', note: 'Approved leave for the whole day', available_from: null, busy }
  }
  if (driver.rest_days.includes(weekdayOf(date))) {
    return { status: 'rest_day', note: 'Rest day in work schedule', available_from: null, busy }
  }

  if (date === TODAY) {
    const now = nowHHmm()
    // Already departed and not yet back = on trip, even if running late.
    const current = busy.find(b => b.status === 'ongoing')
      ?? busy.find(b => b.status === 'scheduled' && now >= b.start && now < b.end)
    if (current) {
      const late = current.status === 'ongoing' && now >= current.end
      return {
        status: 'on_trip',
        note: late
          ? `${current.ticket_no} · running late (expected ${driverTimeText(current.end)})`
          : `${current.ticket_no} · back by ${driverTimeText(current.end)}`,
        available_from: late ? null : current.end,
        busy,
      }
    }
    const next = busy.find(b => b.status === 'scheduled' && b.start > now)
    return {
      status: 'available',
      note: next ? `Next trip at ${driverTimeText(next.start)}` : 'Free for the rest of the day',
      available_from: null,
      busy,
    }
  }

  return {
    status: 'available',
    note: busy.length
      ? `${busy.length} trip${busy.length > 1 ? 's' : ''} scheduled · ${busy.map(b => `${driverTimeText(b.start)}–${driverTimeText(b.end)}`).join(', ')}`
      : 'Free all day',
    available_from: null,
    busy,
  }
}

const delay = () => new Promise(resolve => setTimeout(resolve, 200))

/** Throws the same shape as a Laravel 422 so error helpers work unchanged. */
const fail = (field: string, message: string): never => {
  throw { statusCode: 422, data: { message, errors: { [field]: [message] } } }
}

// Employees with an employment record (mirrors the employees table).
// Only employees who are not yet drivers can be added.
export interface DriverEmployeeOption {
  id: number
  emp_id: string
  name: string
  department: string | null
  position: string | null
}

const DEMO_EMPLOYEES: DriverEmployeeOption[] = [
  { id: 1, emp_id: '1001', name: 'Roger Perez Jr.', department: 'R Web Solutions', position: 'Web Developer' },
  { id: 2, emp_id: '1002', name: 'Maria Lopez Santos', department: 'R Web Solutions', position: 'Project Coordinator' },
  { id: 3, emp_id: '1003', name: 'Carlo Reyes Mendoza', department: 'Technicians', position: 'Lead Technician' },
  { id: 4, emp_id: '1004', name: 'Angela Mae Flores', department: 'Technicians', position: 'Field Technician' },
  ...DEMO_DRIVERS.map(d => d.employee as DriverEmployeeOption),
]

export interface StoreDriverPayload {
  employee_id: number
  drivers_code: string
  licence_no: string
  expire_date: string
  image?: File | null
}

// =====================================================
// COMPOSABLE
// =====================================================

export const useDriverApi = () => {
  // GET /admin/drivers/availability?date=YYYY-MM-DD
  const availability = async (date: string): Promise<ApiResponse<DriverRecord[]>> => {
    await delay()
    const data = DEMO_DRIVERS.map(({ rest_days: _r, leave_dates: _l, ...driver }) => ({
      ...driver,
      availability: computeAvailability(DEMO_DRIVERS.find(d => d.id === driver.id)!, date),
    }))
    return { success: true, message: 'Driver availability retrieved.', data }
  }

  // GET /admin/drivers/eligible-employees
  const eligibleEmployees = async (): Promise<ApiResponse<DriverEmployeeOption[]>> => {
    await delay()
    const taken = new Set(DEMO_DRIVERS.map(d => d.employee.id))
    return {
      success: true,
      message: 'Eligible employees retrieved.',
      data: DEMO_EMPLOYEES.filter(e => !taken.has(e.id)),
    }
  }

  // Suggested next code, e.g. DRV-007 (backend will generate the same way)
  const nextDriverCode = (): string => {
    const max = Math.max(0, ...DEMO_DRIVERS.map(d => Number(d.drivers_code.replace(/\D/g, '')) || 0))
    return `DRV-${String(max + 1).padStart(3, '0')}`
  }

  // Latest drivers for the side panel
  const recent = (limit = 3) =>
    [...DEMO_DRIVERS]
      .sort((a, b) => b.id - a.id)
      .slice(0, limit)
      .map(d => ({ id: d.id, name: d.employee.name, drivers_code: d.drivers_code, department: d.employee.department }))

  // POST /admin/drivers  (multipart: employee_id, drivers_code, licence_no, expire_date, image)
  const store = async (payload: StoreDriverPayload): Promise<ApiResponse<{ id: number }>> => {
    await delay()
    const employee = DEMO_EMPLOYEES.find(e => e.id === payload.employee_id)
    if (!employee) fail('employee_id', 'Select an employee.')
    if (DEMO_DRIVERS.some(d => d.employee.id === payload.employee_id)) fail('employee_id', 'This employee is already a driver.')

    const code = payload.drivers_code.trim().toUpperCase()
    if (!code) fail('drivers_code', 'Enter a driver code.')
    if (DEMO_DRIVERS.some(d => d.drivers_code === code)) fail('drivers_code', 'This driver code is already used.')

    const licence = payload.licence_no.trim().toUpperCase()
    if (!licence) fail('licence_no', 'Enter the license number.')
    if (DEMO_DRIVERS.some(d => d.licence_no === licence)) fail('licence_no', 'This license number is already registered.')

    if (!payload.expire_date) fail('expire_date', 'Enter the license expiry date.')
    if (payload.expire_date <= TODAY) fail('expire_date', 'The license is already expired.')

    const id = Math.max(0, ...DEMO_DRIVERS.map(d => d.id)) + 1
    DEMO_DRIVERS.push({
      id,
      drivers_code: code,
      licence_no: licence,
      expire_date: payload.expire_date,
      image_path: payload.image ? URL.createObjectURL(payload.image) : null,
      employee: employee!,
      rest_days: [0],
      leave_dates: [],
    })

    return { success: true, message: 'Driver added successfully.', data: { id } }
  }

  return { availability, eligibleEmployees, nextDriverCode, recent, store }
}

/** Readable message from a Laravel-style error response. */
export const driverErrorMessage = (error: unknown, fallback: string): string => {
  const data = (error as { data?: { message?: string, errors?: Record<string, string[]> } })?.data
  const firstFieldError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined
  return firstFieldError || data?.message || fallback
}