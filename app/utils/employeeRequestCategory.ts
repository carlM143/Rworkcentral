export type EmployeeRequestCategory = 'Leave' | 'Undertime' | 'Overtime' | 'Attendance Report'

export const employeeRequestCategory = (type: string): EmployeeRequestCategory | null => {
  if (!type) return null
  if (type === 'Undertime' || type.toLowerCase() === 'undertime') return 'Undertime'
  if (type === 'Overtime' || type.toLowerCase() === 'overtime') return 'Overtime'
  if (type === 'Attendance Report' || type === 'Time Log Correction') return 'Attendance Report'
  if (type.toLowerCase().includes('leave') || ['Vacation Leave', 'Sick Leave', 'Emergency Leave', 'Leave Without Pay', 'Maternity Leave', 'Paternity Leave', 'Solo Parent Leave', 'Special Leave', 'Bereavement Leave', 'Unpaid Leave'].includes(type)) return 'Leave'
  return 'Leave'
}
