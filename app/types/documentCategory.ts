export type DocumentCategoryScope =
  | 'Employee'
  | 'Company'
  | 'Both'

export type DocumentCategoryStatus =
  | 'Active'
  | 'Inactive'

export interface DocumentCategory {
  id: number

  code: string
  name: string

  description: string

  scope: DocumentCategoryScope

  documentCount: number

  requiresExpiryDate: boolean
  requiresDocumentNumber: boolean
  isRequired: boolean

  status: DocumentCategoryStatus

  createdBy: string
  createdAt: string

  updatedAt: string
}