export interface EmployeeLoanPayment {
  id: string
  date: string
  amount: number
  method: string
  reference: string
  remarks: string
}

export interface EmployeeLoan {
  id: string
  type: string
  principal: number
  interest: number
  installment: number
  frequency: string
  grantedAt: string
  firstPaymentAt: string
  nextDueAt: string | null
  method: string
  remarks: string
  payments: EmployeeLoanPayment[]
}

export const loanSummary = (loan: EmployeeLoan) => {
  const totalDue = Math.round((loan.principal + loan.interest) * 100)
  const paid = loan.payments.reduce((sum, payment) => sum + Math.round(payment.amount * 100), 0)
  const outstanding = Math.max(0, totalDue - paid)
  return { totalDue: totalDue / 100, paid: paid / 100, outstanding: outstanding / 100, status: outstanding === 0 ? 'Fully Paid' : 'Active', progress: totalDue > 0 ? Math.min(100, paid / totalDue * 100) : 100 }
}

export const loanRepayments = (loan: EmployeeLoan) => {
  let balance = Math.round((loan.principal + loan.interest) * 100)
  return [...loan.payments].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)).map(payment => {
    balance -= Math.round(payment.amount * 100)
    return { ...payment, balanceAfter: Math.max(0, balance) / 100 }
  }).reverse()
}

// Fictional employee-only loan data, not official lending or payroll records.
// These examples use bank transfers; they are not deductions from payslips.
export const createEmployeeLoans = (): EmployeeLoan[] => [
  {
    id: 'LN-2026-001', type: 'Salary Loan', principal: 30000, interest: 0, installment: 2500, frequency: 'Monthly',
    grantedAt: '2026-06-25', firstPaymentAt: '2026-07-01', nextDueAt: '2026-11-01', method: 'Bank transfer',
    remarks: 'Monthly bank-transfer installments. No payroll deduction is linked to this frontend record.',
    payments: ['2026-07-01', '2026-08-01', '2026-09-01', '2026-10-01'].map((date, index) => ({ id: `SAL-PAY-${index + 1}`, date, amount: 2500, method: 'Bank transfer', reference: `SAL-2026-${String(index + 1).padStart(3, '0')}`, remarks: 'Monthly installment recorded.' })),
  },
  {
    id: 'LN-2026-002', type: 'Emergency Loan', principal: 10000, interest: 0, installment: 2500, frequency: 'Monthly',
    grantedAt: '2026-05-20', firstPaymentAt: '2026-06-01', nextDueAt: null, method: 'Bank transfer',
    remarks: 'All four installments have been recorded. No further payment is scheduled.',
    payments: ['2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01'].map((date, index) => ({ id: `EMG-PAY-${index + 1}`, date, amount: 2500, method: 'Bank transfer', reference: `EMG-2026-${String(index + 1).padStart(3, '0')}`, remarks: index === 3 ? 'Final installment; loan fully paid.' : 'Monthly installment recorded.' })),
  },
]
