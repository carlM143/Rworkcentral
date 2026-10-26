import type { PayrollUiRecord } from '~/utils/payrollUi'
import { payrollUiTotals } from '~/utils/payrollUi'

export interface PayrollUiGroup {
  id: number; name: string; frequency: 'Weekly' | 'Semi-Monthly' | 'Monthly'; status: 'Active' | 'Inactive'
  memberIds: number[]; description: string; updatedAt: string
}
export interface PayrollUiDraft {
  id: number; code: string; name: string; periodCode: string; periodName: string; paymentDate: string
  groupId: number | null; groupName: string; status: 'Draft'; createdAt: string
  records: PayrollUiRecord[]; totals: ReturnType<typeof payrollUiTotals>
}
export const usePayrollWorkspace = () => {
  const { employees } = useEmployees()
  const groups = useState<PayrollUiGroup[]>('payroll-ui-groups', () => [
    { id: 1, name: 'Regular Employees', frequency: 'Semi-Monthly', status: 'Active', memberIds: employees.value.filter(employee => employee.employmentType === 'Regular').map(employee => employee.id), description: 'Sample regular-employee payroll group.', updatedAt: new Date().toISOString() },
    { id: 2, name: 'Contractual Employees', frequency: 'Monthly', status: 'Active', memberIds: employees.value.filter(employee => employee.employmentType === 'Contractual').map(employee => employee.id), description: 'Sample contractual-employee payroll group.', updatedAt: new Date().toISOString() },
  ])
  const drafts = useState<PayrollUiDraft[]>('payroll-ui-drafts', () => [])
  const saveGroup = (form: Omit<PayrollUiGroup, 'id' | 'updatedAt'>, id?: number) => {
    if (!form.name.trim()) throw new Error('Enter a payroll group name.')
    if (groups.value.some(group => group.id !== id && group.name.trim().toLowerCase() === form.name.trim().toLowerCase())) throw new Error('A payroll group with this name already exists.')
    if (!form.memberIds.length) throw new Error('Select at least one employee.')
    if (form.memberIds.some(memberId => !employees.value.some(employee => employee.id === memberId))) throw new Error('One or more selected employees are unavailable.')
    if (form.status === 'Active' && groups.value.some(group => group.id !== id && group.status === 'Active' && group.memberIds.some(memberId => form.memberIds.includes(memberId)))) throw new Error('An employee can belong to only one active payroll group. Remove the employee from the other group first.')
    const existing = groups.value.find(group => group.id === id)
    if (id && !existing) throw new Error('This payroll group no longer exists.')
    const group: PayrollUiGroup = { ...form, name: form.name.trim(), memberIds: [...new Set(form.memberIds)], id: id ?? Math.max(0, ...groups.value.map(group => group.id)) + 1, updatedAt: new Date().toISOString() }
    if (existing) Object.assign(existing, group); else groups.value.push(group)
    return group
  }
  const groupInUse = (id: number) => drafts.value.some(draft => draft.groupId === id)
  const deleteGroup = (id: number) => {
    if (groupInUse(id)) throw new Error('This group is referenced by a saved payroll draft. Keep the group or edit its status instead.')
    groups.value = groups.value.filter(group => group.id !== id)
  }
  const createDraft = (form: { name: string; periodCode: string; periodName: string; paymentDate: string; groupId: number | null; records: PayrollUiRecord[] }) => {
    if (!form.name.trim()) throw new Error('Enter a draft name.')
    if (!form.records.length) throw new Error('Select at least one employee.')
    const group = form.groupId == null ? null : groups.value.find(group => group.id === form.groupId && group.status === 'Active')
    if (form.groupId != null && !group) throw new Error('Choose an active payroll group.')
    if (group && form.records.some(record => !group.memberIds.includes(record.employeeId))) throw new Error('The selection includes an employee outside this group.')
    if (drafts.value.some(draft => draft.periodCode === form.periodCode && draft.records.some(record => form.records.some(selected => selected.employeeId === record.employeeId)))) throw new Error('A saved draft already includes a selected employee for this period.')
    const id = Math.max(0, ...drafts.value.map(draft => draft.id)) + 1
    const draft: PayrollUiDraft = { ...form, id, code: 'PAY-DRAFT-' + String(id).padStart(4, '0'), name: form.name.trim(), groupName: group?.name || 'Selected employees', status: 'Draft', createdAt: new Date().toISOString(),
      records: JSON.parse(JSON.stringify(form.records)), totals: payrollUiTotals(form.records) }
    drafts.value.unshift(draft)
    return draft
  }
  return { employees, groups, drafts, saveGroup, groupInUse, deleteGroup, createDraft }
}
