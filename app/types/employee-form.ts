
export interface EmployeeDocument {
  id: string
  type: string
  name: string
  file: File | null
}

export interface EmployeeForm {
  // PERSONAL
  firstName: string
  middleName: string
  lastName: string
  suffix: string
  birthDate: string
  gender: string
  civilStatus: string
  email: string
  mobileNumber: string
  address: string
  profilePhoto: File | null

  // EMPLOYMENT
  employeeNumber: string
  dateHired: string
  departmentId: number | null
  department: string
  positionId: number | null
  position: string
  employmentTypeId: number | null
  employmentType: string
  workScheduleId: number | null
  workSchedule: string
  restDayId: number | null
  restDay: string

  // GOVERNMENT
  sssNumber: string
  philHealthNumber: string
  pagIbigNumber: string
  tinNumber: string

  // PAYROLL
  salaryTypeId: number | null
  salaryType: string
  basicSalary: string
  dailyRate: string
  hourlyRate: string
  allowance: string
  bankName: string
  accountName: string
  accountNumber: string
  payrollGroupId: number | null
  payrollGroup: string
  payrollPeriodId: number | null

  // EMERGENCY CONTACT
  emergencyContactName: string
  emergencyRelationship: string
  emergencyMobileNumber: string
  emergencyAddress: string

  // DOCUMENTS
  documents: EmployeeDocument[]
}
