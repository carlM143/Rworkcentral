export type TripStatus =
  | 'Pending'
  | 'Ongoing'
  | 'Completed'
  | 'Cancelled'

export type TripPurpose =
  | 'Client Service'
  | 'Delivery'
  | 'Pickup'
  | 'Official Business'
  | 'Site Visit'
  | 'Other'

export interface ManageTrip {
  id: number

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

  purpose:
    TripPurpose

  expectedDeparture: string
  actualDeparture?: string

  expectedReturn: string
  actualReturn?: string

  vehicle: string
  plateNumber: string

  tripTicketNumber?: string

  notes?: string

  status:
    TripStatus

  createdBy: string
  createdAt: string

  startedBy?: string
  startedAt?: string

  completedBy?: string
  completedAt?: string

  cancelledBy?: string
  cancelledAt?: string
  cancellationReason?: string
}

export interface ManageTripFormData {
  employeeId: number | null

  client: string

  origin: string
  destination: string

  tripDate: string

  purpose:
    TripPurpose

  expectedDeparture: string
  expectedReturn: string

  vehicle: string
  plateNumber: string

  tripTicketNumber: string

  notes: string
}

export type TripStatusAction =
  | 'start'
  | 'complete'
  | 'cancel'

export interface TripStatusFormData {
  tripId: number

  action:
    TripStatusAction

  time?: string

  notes: string
}