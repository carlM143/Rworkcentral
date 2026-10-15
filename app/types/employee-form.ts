export interface EmployeeDocument {
  id: string
  type: string
  name: string
  file: File | null
}

export interface EmployeeForm {
  // PERSONAL INFORMATION
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

  // EMPLOYMENT INFORMATION
  employeeNumber: string
  dateHired: string
  department: string
  position: string
  supervisor: string
  employmentType: string
  employmentStatus: string
  branch: string
  workSchedule: string
  restDay: string

  // GOVERNMENT INFORMATION
  sssNumber: string
  philHealthNumber: string
  pagIbigNumber: string
  tinNumber: string

  // PAYROLL INFORMATION
  salaryType: string
  basicSalary: string
  dailyRate: string
  hourlyRate: string
  allowance: string
  bankName: string
  accountName: string
  accountNumber: string
  payrollGroup: string

  // EMERGENCY CONTACT
  emergencyContactName: string
  emergencyRelationship: string
  emergencyMobileNumber: string
  emergencyAddress: string

  // DOCUMENTS
  documents: EmployeeDocument[]
}