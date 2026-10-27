import type { ApprovalDecisionPreview, ApprovalUiKind, ApprovalUiRecord } from '~/utils/approvalUi'
import { approvalDecisionProblem, approvalReference } from '~/utils/approvalUi'

export const useApprovalUi = () => {
  // UI drafts are deliberately separate from every approval table/data source.
  const decisions = useState<ApprovalDecisionPreview[]>('approval-ui-decision-previews', () => [])
  const auth = useAuth()
  const prepare = (kind: ApprovalUiKind, record: ApprovalUiRecord, decision: 'approve' | 'reject', remarks: string, approvedHours?: number) => {
    const problem = approvalDecisionProblem(record, kind, decision, remarks, approvedHours)
    if (problem) throw new Error(problem)
    const preview: ApprovalDecisionPreview = {
      id: Math.max(0, ...decisions.value.map(item => item.id)) + 1,
      requestId: record.id, reference: approvalReference(record), kind, decision, remarks: remarks.trim(),
      approvedHours: kind === 'Overtime' && decision === 'approve' ? approvedHours : undefined,
      sourceStatus: record.status, preparedBy: auth.user.value?.name || 'Current reviewer', preparedAt: new Date().toISOString(), state: 'Prepared',
    }
    decisions.value.unshift(preview)
    return preview
  }
  const forRequest = (kind: ApprovalUiKind, record: ApprovalUiRecord) => decisions.value.filter(item => item.kind === kind && item.reference === approvalReference(record))
  return { decisions, prepare, forRequest }
}
