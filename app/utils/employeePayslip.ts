export interface PayslipLine {
  label: string
  amount: number
}

export interface EmployeePayslip {
  id: string
  period: string
  payrollScope: string
  batch: string
  releasedAt: string
  daysWorked: number
  dailyRate: number
  bankName: string
  bankAccountNumber: string
  earnings: PayslipLine[]
  benefits: PayslipLine[]
  deductions: PayslipLine[]
  loans: PayslipLine[]
  remarks: string
}

const cents = (value: number) => Math.round(value * 100)
const sum = (rows: PayslipLine[]) => rows.reduce((total, row) => total + cents(row.amount), 0)
export const payslipTotals = (slip: EmployeePayslip) => {
  const gross = sum(slip.earnings)
  const benefits = sum(slip.benefits)
  const deductions = sum(slip.deductions)
  const loans = sum(slip.loans)
  return { gross: gross / 100, benefits: benefits / 100, deductions: deductions / 100, loans: loans / 100, totalDeductions: (benefits + deductions + loans) / 100, net: (gross - benefits - deductions - loans) / 100 }
}

export const payslipBank = (slip: EmployeePayslip) => {
  return `${slip.bankName || 'Bank not provided'} · ${slip.bankAccountNumber.trim() || 'Account not provided'}`
}

// Fictional, self-contained payroll records, not imported/verified HR payroll.
// Contributions are illustrative amounts, not statutory contribution formulas.
export const createEmployeePayslips = (): EmployeePayslip[] => [
  { id: 'PAY-2026-10-A', period: 'October 1–15, 2026', batch: 'EMP-202610-A', releasedAt: '2026-10-16', overtime: 750, holiday: 500 },
  { id: 'PAY-2026-09-B', period: 'September 16–30, 2026', batch: 'EMP-202609-B', releasedAt: '2026-10-01', overtime: 500, holiday: 0 },
  { id: 'PAY-2026-09-A', period: 'September 1–15, 2026', batch: 'EMP-202609-A', releasedAt: '2026-09-16', overtime: 0, holiday: 0 },
].map(record => ({
  id: record.id, period: record.period, payrollScope: record.period, batch: record.batch, releasedAt: record.releasedAt,
  daysWorked: 13, dailyRate: 545, bankName: 'BPI', bankAccountNumber: '0000-0000-4826',
  earnings: [
    { label: 'Basic Salary · 13 days', amount: 13 * 545 },
    ...(record.overtime ? [{ label: 'Overtime Pay', amount: record.overtime }] : []),
    ...(record.holiday ? [{ label: 'Holiday Pay', amount: record.holiday }] : []),
  ],
  benefits: [{ label: 'SSS', amount: 375 }, { label: 'Pag-IBIG', amount: 150 }, { label: 'PhilHealth', amount: 250 }],
  deductions: [{ label: 'Other Deductions', amount: 1050 }],
  loans: [],
  remarks: `Payroll summary ${record.id}: 13 days at PHP 545 per day. Frontend record only; not an official payroll statement.`,
}))
