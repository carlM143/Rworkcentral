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

export interface DemoTripTicket {
  id: number
  ticket_no: string
  trip_date: string // YYYY-MM-DD
  driver_id: number
  vehicle_id: number
  destination: string
  purpose: string
  client: string | null
  scheduled_departure: string // HH:mm (plan)
  expected_return: string // HH:mm (plan)
  departed_at: string | null // HH:mm (actual)
  returned_at: string | null // HH:mm (actual)
  odometer_out: number | null
  odometer_in: number | null
  status: TripTicketStatus
  passenger_ids: number[]
  remarks: string | null
}

const pad = (n: number) => String(n).padStart(2, '0')
const toDateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const shift = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toDateString(d)
}

const YESTERDAY = shift(-1)
const TODAY = shift(0)
const TOMORROW = shift(1)

export const demoVehicles: TripVehicle[] = [
  { id: 1, plate_no: 'ABC-1234', description: 'Toyota Hiace', capacity: 12 },
  { id: 2, plate_no: 'XYZ-9988', description: 'Isuzu Elf', capacity: 3 },
  { id: 3, plate_no: 'LMN-7601', description: 'Ford Transit', capacity: 15 },
  { id: 4, plate_no: 'TUV-2345', description: 'Hino Van', capacity: 9 },
  { id: 5, plate_no: 'DEF-5441', description: 'Mercedes Sprinter', capacity: 14 },
  { id: 6, plate_no: 'MC-4410', description: 'Honda Click (motorcycle)', capacity: 1 },
]

// Employees who can ride as passengers (non-drivers).
export const demoPassengerEmployees: TripPassenger[] = [
  { id: 1, emp_id: '1001', name: 'Roger Perez Jr.', department: 'R Web Solutions' },
  { id: 2, emp_id: '1002', name: 'Maria Lopez Santos', department: 'R Web Solutions' },
  { id: 3, emp_id: '1003', name: 'Carlo Reyes Mendoza', department: 'Technicians' },
  { id: 4, emp_id: '1004', name: 'Angela Mae Flores', department: 'Technicians' },
  { id: 21, emp_id: '1021', name: 'Pedro Reyes', department: 'Finance' },
  { id: 22, emp_id: '1022', name: 'Ana Garcia', department: 'Operations' },
  { id: 23, emp_id: '1023', name: 'Leo Martinez', department: 'Operations' },
]

export const demoTripTickets: DemoTripTicket[] = [
  { id: 1, ticket_no: 'TT-2026-0009', trip_date: YESTERDAY, driver_id: 1, vehicle_id: 1, destination: 'Bajada Office', purpose: 'Pickup signed billing documents', client: 'Metro Supplies Inc.', scheduled_departure: '08:00', expected_return: '11:00', departed_at: '08:05', returned_at: '10:50', odometer_out: 12380, odometer_in: 12412, status: 'completed', passenger_ids: [1, 2], remarks: null },
  { id: 2, ticket_no: 'TT-2026-0010', trip_date: YESTERDAY, driver_id: 5, vehicle_id: 4, destination: 'Toril Client Site', purpose: 'Client service and document turnover', client: 'Southpoint Trading', scheduled_departure: '13:00', expected_return: '16:00', departed_at: '13:10', returned_at: '15:40', odometer_out: 30110, odometer_in: 30168, status: 'completed', passenger_ids: [3], remarks: null },
  { id: 3, ticket_no: 'TT-2026-0011', trip_date: TODAY, driver_id: 1, vehicle_id: 1, destination: 'Davao City Warehouse', purpose: 'Delivery coordination', client: 'ABC Logistics Corp.', scheduled_departure: '08:00', expected_return: '12:00', departed_at: '08:06', returned_at: '11:52', odometer_out: 12412, odometer_in: 12474, status: 'completed', passenger_ids: [3, 4], remarks: null },
  { id: 4, ticket_no: 'TT-2026-0012', trip_date: TODAY, driver_id: 2, vehicle_id: 2, destination: 'Toril Client Site', purpose: 'Equipment installation support', client: 'Southpoint Trading', scheduled_departure: '09:00', expected_return: '18:00', departed_at: '09:04', returned_at: null, odometer_out: 45210, odometer_in: null, status: 'ongoing', passenger_ids: [21, 22], remarks: null },
  { id: 5, ticket_no: 'TT-2026-0013', trip_date: TODAY, driver_id: 5, vehicle_id: 5, destination: 'Matina Office', purpose: 'Client billing meeting', client: 'Citywide Services', scheduled_departure: '14:00', expected_return: '16:00', departed_at: null, returned_at: null, odometer_out: null, odometer_in: null, status: 'cancelled', passenger_ids: [4], remarks: 'Client rescheduled the meeting.' },
  { id: 6, ticket_no: 'TT-2026-0014', trip_date: TODAY, driver_id: 1, vehicle_id: 1, destination: 'Bajada Office', purpose: 'Document submission', client: null, scheduled_departure: '13:30', expected_return: '15:30', departed_at: null, returned_at: null, odometer_out: null, odometer_in: null, status: 'scheduled', passenger_ids: [2], remarks: null },
  { id: 7, ticket_no: 'TT-2026-0016', trip_date: TOMORROW, driver_id: 2, vehicle_id: 2, destination: 'Panacan Facility', purpose: 'Operational inspection', client: 'Prime Industrial Solutions', scheduled_departure: '08:00', expected_return: '10:30', departed_at: null, returned_at: null, odometer_out: null, odometer_in: null, status: 'scheduled', passenger_ids: [23], remarks: null },
  { id: 8, ticket_no: 'TT-2026-0017', trip_date: TOMORROW, driver_id: 5, vehicle_id: 4, destination: 'Lanang Distribution Hub', purpose: 'Inventory count', client: 'Northgate Distribution', scheduled_departure: '13:00', expected_return: '16:00', departed_at: null, returned_at: null, odometer_out: null, odometer_in: null, status: 'scheduled', passenger_ids: [1, 3], remarks: null },
]