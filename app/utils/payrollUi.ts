export type PayrollUiRecord = Record<string, any>
export const payrollMoney = (value: unknown) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value) || 0)
export const payrollNumber = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0
export const payrollUiTotals = (records: PayrollUiRecord[]) => records.reduce((totals, row) => {
  totals.basicPay += payrollNumber(row.basicPay)
  totals.grossPay += row.grossPay == null ? payrollNumber(row.basicPay) + payrollNumber(row.overtimePay) + payrollNumber(row.allowance ?? row.allowances) : payrollNumber(row.grossPay)
  totals.totalDeductions += payrollNumber(row.totalDeductions ?? row.deductions)
  totals.netPay += payrollNumber(row.netPay)
  return totals
}, { basicPay: 0, grossPay: 0, totalDeductions: 0, netPay: 0 })

export const payrollAmountChecks = (row: PayrollUiRecord) => {
  const problems: string[] = []
  const totals = payrollUiTotals([row])
  if (Math.abs(totals.grossPay - totals.totalDeductions - totals.netPay) > 0.011) problems.push('Gross pay minus deductions does not match the recorded net pay.')
  if ('otherEarnings' in row) {
    const earnings = ['basicPay', 'overtimePay', 'holidayPay', 'nightDifferential', 'allowances', 'otherEarnings'].reduce((sum, key) => sum + payrollNumber(row[key]), 0)
    if (Math.abs(earnings - totals.grossPay) > 0.011) problems.push('Earning line items do not match recorded gross pay.')
  }
  if ('sss' in row) {
    const deductions = ['sss', 'philHealth', 'pagIbig', 'loanDeduction', 'lateDeduction', 'undertimeDeduction', 'absenceDeduction', 'otherDeductions'].reduce((sum, key) => sum + payrollNumber(row[key]), 0)
    if (Math.abs(deductions - totals.totalDeductions) > 0.011) problems.push('Deduction line items do not match recorded total deductions.')
  }
  return problems
}
export const payrollSummaryRows = (records: PayrollUiRecord[], by: 'periodName' | 'department') => {
  const groups = new Map<string, PayrollUiRecord[]>()
  records.forEach(row => { const key = String(row[by] || (by === 'periodName' ? row.periodCode : '') || 'Not specified'); groups.set(key, [...(groups.get(key) ?? []), row]) })
  return [...groups].map(([name, rows]) => ({ name, employees: new Set(rows.map(row => row.employeeId ?? row.employeeNumber)).size, records: rows.length, ...payrollUiTotals(rows) }))
}
