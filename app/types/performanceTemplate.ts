export interface PerformanceTemplate {
  id: number
  company: string
  department: string
  position: string
  documentName: string
  documentType: string
  documentSize: number
  documentUrl?: string
  createdAt: string
  updatedAt: string
}

export type TemplatePayload = Omit<PerformanceTemplate, 'id' | 'createdAt' | 'updatedAt'>
