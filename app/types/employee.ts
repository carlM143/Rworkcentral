export type EmploymentType =
  | 'Regular'
  | 'Probationary'
  | 'Contractual'
  | 'Project-Based'

export type EmployeeStatus =
  | 'Active'
  | 'Inactive'
  | 'On Leave'

export type SalaryType =
  | 'Monthly'
  | 'Semi-Monthly'
  | 'Daily'
  | 'Hourly'

export type DocumentStatus =
  | 'Verified'
  | 'Pending'
  | 'Expiring Soon'
  | 'Expired'

export interface EmployeeDocument {
  id: number | string
  type: string
  name: string

  status?: DocumentStatus
  uploadedAt?: string
  expiresAt?: string
  fileUrl?: string
}

export interface Employee {
  id: number

  // BASIC
  employeeNumber: string
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phone?: string
  avatar?: string

  // PERSONAL
  birthDate?: string
  gender?: string
  civilStatus?: string
  address?: string

  // EMPLOYMENT
  department: string
  position: string
  employmentType: EmploymentType
  status: EmployeeStatus
  dateHired: string

  supervisor?: string
  branch?: string
  workSchedule?: string
  restDay?: string

  inactiveDate?: string
  inactiveReason?: string

  // GOVERNMENT
  sssNumber?: string
  philHealthNumber?: string
  pagIbigNumber?: string
  tinNumber?: string

  // PAYROLL
  salaryType?: SalaryType
  basicSalary?: number
  dailyRate?: number
  hourlyRate?: number
  allowance?: number
  payrollGroup?: string

  bankName?: string
  accountName?: string
  accountNumber?: string

  // EMERGENCY CONTACT
  emergencyContactName?: string
  emergencyRelationship?: string
  emergencyMobileNumber?: string
  emergencyAddress?: string

  // DOCUMENTS
  documents?: EmployeeDocument[]
}
