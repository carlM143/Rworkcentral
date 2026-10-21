
export interface AttendanceImportRow {
  rowNumber: number

  employeeNumber: string
  employeeId?: number
  employeeName?: string

  date: string

  timeIn?: string
  breakOut?: string
  breakIn?: string
  timeOut?: string

  status: 'Valid' | 'Duplicate' | 'Invalid'

  message: string
}

export interface AttendanceImportSummary {
  total: number
  imported: number
  duplicates: number
  invalid: number

  earliestDate?: string
  latestDate?: string
}
