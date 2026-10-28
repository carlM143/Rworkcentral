export type ClientStatus =
  | 'Active'
  | 'For Review'
  | 'Inactive'

export type ContractStatus =
  | 'Active'
  | 'Expiring Soon'
  | 'Expired'

export interface Client {
  id: number

  code: string
  name: string

  industry?: string

  contactPerson: string
  email?: string
  phone?: string

  address?: string

  branches: number
  assignedEmployees: number

  contractStart: string
  contractEnd: string

  contractStatus: ContractStatus
  status: ClientStatus

  billingRateStatus:
    | 'Configured'
    | 'Incomplete'

  currentBilling: number
}

export interface ClientActivity {
  id: number

  clientName: string

  action: string
  description: string

  date: string
}