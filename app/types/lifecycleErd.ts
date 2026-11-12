export interface LifecyclePolicy {
  id: number
  name: string
  description: string
  employmentTypeId: number | null
  employmentTypeName: string
  userId: number
  creatorName: string
  status: boolean
  stagesCount: number
  createdAt: string
  updatedAt: string
}

export interface LifecycleStage {
  requiresAttachment?: boolean
  id: number
  lifecyclePolicyId: number
  policyName: string
  stageName: string
  stageCode: string
  monthsAfterHire: number
  sortOrder: number
  status: boolean
  milestonesCount: number
}

export interface EmployeeMilestone {
  requiresAttachment?: boolean
  id: number
  employeeId: number
  employeeNumber: string
  employeeName: string
  department: string
  position: string
  employmentType: string
  dateHired: string
  lifecycleStageId: number
  stageName: string
  stageCode: string
  policyName: string
  dueDate: string // Displayed as "Target Date" in UI
  status: 'pending' | 'completed'
  remarks: string | null
  attachmentName?: string | null
  evaluationDocumentId?: number | null
  attachmentSize?: string | null
  attachedAt?: string | null
}
