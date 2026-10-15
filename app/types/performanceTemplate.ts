export type PerformanceTemplateType =
  | 'General Review'
  | 'Probationary Review'
  | 'Leadership Review'
  | 'Technical Review'
  | 'Driver Review'

export type PerformanceTemplateScope =
  | 'All Employees'
  | 'Rank and File'
  | 'Supervisory'
  | 'Managerial'
  | 'Technical'
  | 'Drivers'

export type PerformanceTemplateStatus =
  | 'Draft'
  | 'Active'
  | 'Inactive'
  | 'Archived'

export interface PerformanceTemplate {
  id: number

  templateCode: string
  name: string

  type: PerformanceTemplateType
  scope: PerformanceTemplateScope

  description: string

  sectionCount: number
  criteriaCount: number

  scoringScale: string
  passingScore: number

  totalWeight: number

  usageCount: number

  status: PerformanceTemplateStatus

  createdBy: string

  createdAt: string
  updatedAt: string

  remarks?: string
}