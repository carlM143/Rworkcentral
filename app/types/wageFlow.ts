import type { WageOrder, WageAdjustmentResult } from './wageManagement'
export type ProposalStatus = 'Draft' | 'For Review' | 'Approved' | 'Scheduled' | 'Applied'
export interface WorkedDay { date: string; days: number }
export interface WageEmployee {
  employeeId: number; employeeNumber: string; employeeName: string
  department: string; position: string; positionLevel: number; region: string; classification: string
  employmentType: 'daily' | 'monthly'; dailyRate: number; monthlyRate?: number
  daysWorkedSinceEffectivity: number; workedDays: WorkedDay[]
}
export interface WageRetro { retroFrom: string | null; retroTo: string | null; daysCovered: number; retroAmount: number }
export interface WageProposal extends WageRetro {
  id: number; evaluationId: number; employeeId: number; employeeNumber: string; employeeName: string
  department: string; position: string; region: string; classification: string
  employmentType: 'daily' | 'monthly'; monthlyRate?: number; conversionFactor: number
  currentRate: number; newMinimumRate: number; requiredIncrease: number; proposedRate: number
  result: WageAdjustmentResult; distortionRisk: boolean; status: ProposalStatus
  wageOrderCode: string; effectiveDate: string; remarks: string
  distortionDecision?: 'Approved' | 'Dismissed'; approvedBy?: string; appliedAt?: string
}
export interface WageEvaluation { id: number; orderCode: string; at: string; annualFactor: number; distortionThreshold: number }
export interface WageBatch {
  id: number; evaluationId: number; orderCode: string; status: 'Draft' | 'For Review' | 'Approved' | 'Rejected' | 'Applied'
  proposalIds: number[]; remarks: string; submittedBy?: string; decidedBy?: string; appliedAt?: string
}
export interface WageAuditEntry {
  id: number; actor: string; action: string; at: string; remarks: string
  orderCode: string; proposalId?: number; batchId?: number; employee?: string
}
export interface RetroEarning extends WageRetro {
  id: number; proposalId: number; employeeId: number; employeeName: string; orderCode: string
  label: 'Wage Order Retro Pay'; payrollRun: 'Next payroll run (preview)'; amount: number; includeIn13thMonthBasic: true
}
export interface WageFlowState {
  employees: WageEmployee[]; proposals: WageProposal[]; evaluations: WageEvaluation[]; batches: WageBatch[]
  events: WageAuditEntry[]; earnings: RetroEarning[]
  config: { annualFactor: number; distortionThreshold: number; paidDays: number }; nextId: number
}
export type OrderForm = Omit<WageOrder, 'id' | 'increaseAmount'>
