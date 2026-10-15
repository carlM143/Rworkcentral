export type ExpiringDocumentStatus =
  | 'Expired'
  | 'Critical'
  | 'Expiring Soon'
  | 'Monitor'

export interface ExpiringDocument {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  category: string

  documentName: string
  documentNumber?: string

  issuedDate?: string
  expiryDate: string

  issuingAuthority?: string

  uploadedAt: string

  remarks?: string
}