export type EmployeeRequestCategory = 'Leave' | 'Undertime' | 'Overtime' | 'Attendance Report'

export const employeeRequestCategory = (type: string): EmployeeRequestCategory | null => {
  if (type === 'Undertime' || type === 'Overtime') return type
  if (type === 'Attendance Report' || type === 'Time Log Correction') return 'Attendance Report'
  if (['Vacation Leave', 'Sick Leave', 'Emergency Leave', 'Leave Without Pay', 'Maternity Leave', 'Paternity Leave', 'Solo Parent Leave', 'Special Leave'].includes(type)) return 'Leave'
  return null
}
