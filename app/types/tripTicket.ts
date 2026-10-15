export type TripTicketStatus =
  | 'Pending'
  | 'Issued'
  | 'In Use'
  | 'Completed'
  | 'Cancelled'

export type TripTicketAction =
  | 'issue'
  | 'inUse'
  | 'complete'
  | 'cancel'

export interface TripTicket {
  id: number

  ticketNumber: string

  tripId: number
  tripNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  client: string

  origin: string
  destination: string

  tripDate: string
  purpose: string

  vehicle: string
  plateNumber: string

  expectedDeparture: string
  actualDeparture?: string

  expectedReturn: string
  actualReturn?: string

  status:
    TripTicketStatus

  notes?: string

  createdBy: string
  createdAt: string

  issuedBy?: string
  issuedAt?: string

  inUseBy?: string
  inUseAt?: string

  completedBy?: string
  completedAt?: string

  cancelledBy?: string
  cancelledAt?: string
  cancellationReason?: string
}

export interface TripTicketFormData {
  tripId: number | null

  vehicle: string
  plateNumber: string

  notes: string
}

export interface TripTicketStatusFormData {
  ticketId: number

  action:
    TripTicketAction

  time?: string

  notes: string
}