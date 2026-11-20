import type {
  EmployeePayslipApiLine,
  EmployeePayslipDetail,
  EmployeePayslipPeriod,
} from '~/types/employee/payslip/employeePayslip'

export interface PayslipLine {
  label: string
  amount: number
}

/** Payslip as shown in the employee portal (breakdown dialog and PDF). */
export interface EmployeePayslip {
  payrollId: number
  id: string
  companyName: string
  employee: {
    name: string
    employeeId: string
    department: string
  }
  period: string
  payrollScope: string
  batch: string
  releasedAt: string
  daysWorked: number
  /** "Monthly Salary", "Daily Rate" or "Hourly Rate", from the salary type. */
  rateLabel: string
  rate: number
  bankName: string
  bankAccountNumber: string
  /** Earnings, then time deductions as negative lines (Less: Late …), adding up to gross pay. */
  earnings: PayslipLine[]
  /** Government contributions (employee share). */
  benefits: PayslipLine[]
  /** Withholding tax. */
  deductions: PayslipLine[]
  loans: PayslipLine[]
  remarks: string
  totals: {
    gross: number
    totalDeductions: number
    net: number
  }
}

const cents = (value: number) => Math.round(value * 100)
const sum = (rows: PayslipLine[]) => rows.reduce((total, row) => total + cents(row.amount), 0) / 100

/** Group totals from the lines; gross, deductions and net come from the payroll record. */
export const payslipTotals = (slip: EmployeePayslip) => ({
  gross: slip.totals.gross,
  benefits: sum(slip.benefits),
  deductions: sum(slip.deductions),
  loans: sum(slip.loans),
  totalDeductions: slip.totals.totalDeductions,
  net: slip.totals.net,
})

export const payslipBank = (slip: EmployeePayslip) =>
  `${slip.bankName || 'Bank not provided'} · ${slip.bankAccountNumber.trim() || 'Account not provided'}`

const formatDate = (value?: string | null, withYear = true) => {
  if (!value) return ''
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', withYear
    ? { month: 'short', day: 'numeric', year: 'numeric' }
    : { month: 'short', day: 'numeric' }).format(date)
}

/** "Nov 1 – Nov 15, 2026" from the pay period (falls back to the cut-off dates). */
export const payslipPeriodLabel = (period: EmployeePayslipPeriod) => {
  const start = period.pay_period_start ?? period.cutoff_start
  const end = period.pay_period_end ?? period.cutoff_end
  if (start && end) return `${formatDate(start, false)} – ${formatDate(end)}`
  return period.period_name || `Payroll Period #${period.id}`
}

export const payslipDate = (value?: string | null) => formatDate(value) || '—'

const withNote = (line: EmployeePayslipApiLine) =>
  line.note ? `${line.label} · ${line.note}` : line.label

const rateLabel = (salaryType: string | null) => {
  const type = (salaryType ?? '').toLowerCase()
  if (type.includes('daily')) return 'Daily Rate'
  if (type.includes('hour')) return 'Hourly Rate'
  return 'Monthly Salary'
}

/** Converts GET /employee/payslips/{payroll} into the portal payslip. */
export const toEmployeePayslip = (payrollId: number, data: EmployeePayslipDetail): EmployeePayslip => {
  // deductions = contributions…, Withholding Tax, loans…  (order set by the backend PayslipService)
  const taxIndex = data.deductions.findIndex(line => line.label === 'Withholding Tax')
  const contributions = taxIndex === -1 ? data.deductions : data.deductions.slice(0, taxIndex)
  const tax = taxIndex === -1 ? [] : [data.deductions[taxIndex]!]
  const loans = taxIndex === -1 ? [] : data.deductions.slice(taxIndex + 1)

  const days = data.days
  const remarks = [
    `${days.worked} day(s) worked`,
    days.paid_holidays ? `${days.paid_holidays} paid holiday(s)` : '',
    days.unpaid_leave ? `${days.unpaid_leave} day(s) unpaid leave` : '',
  ].filter(Boolean).join(' · ')
    + (data.period.payment_date ? `. Paid on ${formatDate(data.period.payment_date)}.` : '.')

  return {
    payrollId,
    id: data.payslip_no,
    companyName: data.company.name,
    employee: {
      name: data.employee.name,
      employeeId: data.employee.emp_id ?? '',
      department: data.employee.department ?? '',
    },
    period: payslipPeriodLabel(data.period),
    payrollScope: [data.period.period_name, data.employee.payroll_group].filter(Boolean).join(' · ') || '—',
    batch: data.payslip_no,
    releasedAt: payslipDate(data.sent_at),
    daysWorked: days.total_paid,
    rateLabel: rateLabel(data.employee.salary_type),
    rate: data.employee.basic_salary,
    bankName: data.bank.bank_name ?? '',
    bankAccountNumber: data.bank.account_number ?? '',
    earnings: [
      ...data.earnings.map(line => ({ label: withNote(line), amount: line.amount })),
      ...data.time_deductions.map(line => ({ label: `Less: ${withNote(line)}`, amount: -line.amount })),
    ],
    benefits: contributions.map(line => ({ label: withNote(line), amount: line.amount })),
    deductions: tax.map(line => ({ label: withNote(line), amount: line.amount })),
    loans: loans.map(line => ({ label: withNote(line), amount: line.amount })),
    remarks,
    totals: {
      gross: data.totals.gross_pay,
      totalDeductions: data.totals.total_deductions,
      net: data.totals.net_pay,
    },
  }
}
