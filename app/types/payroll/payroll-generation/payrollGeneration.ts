export interface GeneratedPayrollLine {
  payroll_id: number
  employee_id: number
  name: string
  gross_pay: number
  total_deductions: number
  net_pay: number
}

export interface SkippedPayrollLine {
  employee_id: number
  name: string
  reason: string
}

export interface PayrollGenerationResult {
  generated: GeneratedPayrollLine[]
  skipped: SkippedPayrollLine[]
}