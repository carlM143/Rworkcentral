export type ApprovalUiKind = 'Overview' | 'Leave' | 'Overtime' | 'WFH'
export type ApprovalUiRecord = Record<string, any>
export interface ApprovalDecisionPreview {
  id: number; requestId: string | number; reference: string; kind: ApprovalUiKind
  decision: 'approve' | 'reject'; remarks: string; approvedHours?: number
  sourceStatus: string; preparedBy: string; preparedAt: string; state: 'Prepared'
}
export const approvalCanReview = (record: ApprovalUiRecord) => ['Pending', 'For Review'].includes(record.status)
export const approvalReference = (record: ApprovalUiRecord) => String(record.requestNumber || record.reference || record.id)
export const approvalDecisionProblem = (record: ApprovalUiRecord, kind: ApprovalUiKind, decision: 'approve' | 'reject', remarks: string, approvedHours?: number) => {
  if (!approvalCanReview(record)) return 'Only Pending or For Review requests can have a new decision prepared.'
  if (decision === 'reject' && !remarks.trim()) return 'A rejection reason is required.'
  if (kind === 'Overtime' && decision === 'approve' && (!Number.isFinite(Number(record.requestedHours)) || !Number.isFinite(approvedHours) || (approvedHours ?? 0) <= 0 || (approvedHours ?? 0) > Number(record.requestedHours))) return 'Approved hours must be greater than zero and cannot exceed the requested hours.'
  return ''
}
export const approvalDetailFields = (record: ApprovalUiRecord, kind: ApprovalUiKind): [string, unknown][] => {
  const fields: [string, unknown][] = [
    ['Reference', approvalReference(record)], ['Employee', record.employeeName], ['Employee Number', record.employeeNumber],
    ['Department', record.department], ['Position', record.position], ['Source Status', record.status],
  ]
  if (kind === 'Overview') fields.push(['Request Type', record.type], ['Request Title', record.title], ['Description', record.description], ['Request Date', record.requestDate], ['Submitted At', record.submittedAt], ['Priority', record.priority], ['Approver', record.approver])
  if (kind === 'Leave') fields.push(['Leave Type', record.leaveType], ['Start Date', record.startDate], ['End Date', record.endDate], ['Requested Days', record.totalDays], ['Recorded Available Balance', record.availableBalance], ['Reason', record.reason], ['Filed At', record.filedAt], ['Immediate Supervisor', record.immediateSupervisor])
  if (kind === 'Overtime') fields.push(['Overtime Type', record.overtimeType], ['Overtime Date', record.overtimeDate], ['Start Time', record.startTime], ['End Time', record.endTime], ['Requested Hours', record.requestedHours], ['Recorded Approved Hours', record.approvedHours], ['Reason', record.reason], ['Filed At', record.filedAt], ['Immediate Supervisor', record.immediateSupervisor])
  if (kind === 'WFH') fields.push(['WFH Type', record.requestType], ['Start Date', record.startDate], ['End Date', record.endDate], ['Requested Days', record.totalDays], ['Work Location', record.workLocation], ['Reason', record.reason], ['Work Plan', record.workPlan], ['Immediate Supervisor', record.immediateSupervisor])
  return fields
}
