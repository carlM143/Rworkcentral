/**
 * Departments › Department Heads.
 *   GET   /admin/department-heads
 *   PATCH /admin/department-heads/{department}  { head_employee_id }
 */

export interface DepartmentHeadRow {
  id: number
  name: string
  active: boolean
  head: { employee_id: number, name: string, emp_id: string | null, has_account: boolean, role: string | null, pending: number } | null
  members: { employee_id: number, name: string, emp_id: string | null, position: string | null, has_account: boolean }[]
}

export const useDepartmentHeads = () => {
  const { $api } = useNuxtApp()

  return {
    list: () => $api<{ data: DepartmentHeadRow[] }>('/admin/department-heads', { method: 'GET' }),
    save: (departmentId: number, headEmployeeId: number | null) =>
      $api<{ message: string, warning: string | null }>(`/admin/department-heads/${departmentId}`, {
        method: 'PATCH',
        body: { head_employee_id: headEmployeeId },
      }),
  }
}