export type DocumentRecordStatus =
  | 'Verified'
  | 'Pending'
  | 'Expiring Soon'
  | 'Expired'

export type DocumentCategory =
  | 'Government'
  | 'Employment'
  | 'Medical'
  | 'Payroll'
  | 'Other'

export interface DocumentRecord {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string

  documentType: string
  fileName: string

  category: DocumentCategory

  uploadedAt: string

  expiresAt?: string

  status: DocumentRecordStatus

  fileUrl?: string
}

export interface MissingDocumentRequirement {
  id: number

  employeeId: number
  employeeName: string
  employeeNumber: string

  documentType: string
}

export interface DocumentActivity {
  id: number

  employeeName: string

  action: string
  description: string

  date: string
}