/**
 * Approval Workflow Settings.
 *
 * UI ONLY FOR NOW: values are kept in memory (useState) and reset on a full
 * page reload. Planned Laravel endpoints:
 *   GET /admin/settings/approval-workflow
 *   PUT /admin/settings/approval-workflow
 */

export type ApproverType =
  | 'department_head'
  | 'immediate_supervisor'
  | 'hr'
  | 'payroll_officer'
  | 'administrator'

export type RequestType =
  | 'leave'
  | 'overtime'
  | 'undertime'
  | 'wfh'
  | 'time_correction'
  | 'late_adjustment'
  | 'rest_day_switch'
  | 'trip_ticket'
  | 'salary_adjustment'
  | 'payroll_release'

export interface ApprovalFlow {
  type: RequestType
  label: string
  description: string
  module: string
  requires_approval: boolean
  levels: ApproverType[] // in order, 1 to 3 levels
  escalate_after_days: number // 0 = never
}

export interface ApprovalWorkflowSettings {
  general: {
    head_keywords: string[] // position titles containing these words are department heads
    fallback_approver: ApproverType // used when a department has no head
    allow_self_approval: boolean
    require_rejection_reason: boolean
    notify_requester: boolean
  }
  flows: ApprovalFlow[]
}

export const APPROVER_LABELS: Record<ApproverType, string> = {
  department_head: 'Department head',
  immediate_supervisor: 'Immediate supervisor',
  hr: 'Human Resources',
  payroll_officer: 'Payroll officer',
  administrator: 'Administrator',
}

export const defaultApprovalWorkflowSettings = (): ApprovalWorkflowSettings => ({
  general: {
    head_keywords: ['Head', 'Manager', 'Supervisor'],
    fallback_approver: 'hr',
    allow_self_approval: false,
    require_rejection_reason: true,
    notify_requester: true,
  },
  flows: [
    { type: 'leave', label: 'Leave requests', description: 'Vacation, sick and other leave', module: 'Approval Center', requires_approval: true, levels: ['department_head', 'hr'], escalate_after_days: 2 },
    { type: 'overtime', label: 'Overtime requests', description: 'Work beyond the schedule', module: 'Approval Center', requires_approval: true, levels: ['department_head'], escalate_after_days: 2 },
    { type: 'undertime', label: 'Undertime requests', description: 'Leaving before the shift ends', module: 'Approval Center', requires_approval: true, levels: ['department_head'], escalate_after_days: 2 },
    { type: 'wfh', label: 'Work from home', description: 'WFH requests and proof of work', module: 'Work From Home', requires_approval: true, levels: ['department_head', 'hr'], escalate_after_days: 2 },
    { type: 'time_correction', label: 'Time log corrections', description: 'Missing or wrong time in / out', module: 'Timekeeping', requires_approval: true, levels: ['hr'], escalate_after_days: 3 },
    { type: 'late_adjustment', label: 'Late adjustments', description: 'Waiving late or undertime minutes', module: 'Timekeeping', requires_approval: true, levels: ['hr'], escalate_after_days: 3 },
    { type: 'rest_day_switch', label: 'Rest day switch', description: 'Moving a rest day to another date', module: 'Schedules', requires_approval: true, levels: ['department_head'], escalate_after_days: 2 },
    { type: 'trip_ticket', label: 'Trip tickets', description: 'Use of company vehicles and drivers', module: 'All Drivers', requires_approval: false, levels: ['department_head'], escalate_after_days: 0 },
    { type: 'salary_adjustment', label: 'Salary adjustments', description: 'Changes to an employee\'s pay', module: 'Employees', requires_approval: true, levels: ['hr', 'administrator'], escalate_after_days: 0 },
    { type: 'payroll_release', label: 'Payroll release', description: 'Releasing a payroll run and payslips', module: 'Payroll', requires_approval: true, levels: ['payroll_officer', 'administrator'], escalate_after_days: 0 },
  ],
})

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const delay = () => new Promise(resolve => setTimeout(resolve, 250))

export const useApprovalWorkflowSettings = () => {
  const saved = useState<ApprovalWorkflowSettings>('settings-approval-workflow', defaultApprovalWorkflowSettings)

  // GET /admin/settings/approval-workflow
  const load = async (): Promise<ApiResponse<ApprovalWorkflowSettings>> => {
    await delay()
    return { success: true, message: 'Approval workflow retrieved.', data: clone(saved.value) }
  }

  // PUT /admin/settings/approval-workflow
  const save = async (payload: ApprovalWorkflowSettings): Promise<ApiResponse<ApprovalWorkflowSettings>> => {
    await delay()
    saved.value = clone(payload)
    return { success: true, message: 'Approval workflow saved.', data: clone(saved.value) }
  }

  return { load, save }
}