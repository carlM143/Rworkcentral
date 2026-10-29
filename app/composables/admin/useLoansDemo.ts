export type LoanStatus = 'Active' | 'Paid' | 'Pending' | 'Rejected'
export type LoanType = { id: number; name: string; code: string; description: string; active: boolean }
export type EmployeeLoan = { id: number; reference: string; employee: string; employeeId: string; department: string; typeId: number; principal: number; term: number; deduction: number; balance: number; startDate: string; status: LoanStatus; notes: string }
export type LoanTransaction = { id: number; loanId: number; date: string; type: 'Disbursement' | 'Payroll Deduction' | 'Manual Payment'; amount: number; reference: string; remarks: string }
const initialTypes: LoanType[] = [
  { id: 1, name: 'Company Loan', code: 'COMP', description: 'Employee loan provided by the company', active: true },
  { id: 2, name: 'Salary Loan', code: 'SAL', description: 'Salary advance repaid by payroll deductions', active: true },
  { id: 3, name: 'SSS Salary Loan', code: 'SSS', description: 'Government loan recorded for payroll monitoring', active: true },
  { id: 4, name: 'Pag-IBIG Multi-Purpose Loan', code: 'HDMF', description: 'Government loan recorded for payroll monitoring', active: true },
]
const initialLoans: EmployeeLoan[] = [
  { id: 1, reference: 'LN-2026-001', employee: 'Juan Dela Cruz', employeeId: 'EMP-001', department: 'Operations', typeId: 1, principal: 12000, term: 12, deduction: 1000, balance: 9000, startDate: '2026-09-15', status: 'Active', notes: 'Company loan, no interest' },
  { id: 2, reference: 'LN-2026-002', employee: 'Maria Santos', employeeId: 'EMP-002', department: 'Human Resources', typeId: 2, principal: 6000, term: 6, deduction: 1000, balance: 3000, startDate: '2026-09-30', status: 'Active', notes: '' },
  { id: 3, reference: 'LN-2026-003', employee: 'Pedro Reyes', employeeId: 'EMP-003', department: 'Finance', typeId: 3, principal: 10000, term: 10, deduction: 1000, balance: 0, startDate: '2026-06-15', status: 'Paid', notes: 'Sample paid loan' },
  { id: 4, reference: 'LN-2026-004', employee: 'Ana Garcia', employeeId: 'EMP-004', department: 'Operations', typeId: 4, principal: 15000, term: 15, deduction: 1000, balance: 15000, startDate: '2026-11-15', status: 'Pending', notes: 'Awaiting approval' },
]
const initialTransactions: LoanTransaction[] = [
  { id: 1, loanId: 1, date: '2026-09-15', type: 'Disbursement', amount: 12000, reference: 'DIS-001', remarks: 'Initial release' },
  { id: 2, loanId: 1, date: '2026-09-30', type: 'Payroll Deduction', amount: 1000, reference: 'PAY-0930', remarks: 'Payroll cutoff deduction' },
  { id: 3, loanId: 1, date: '2026-10-15', type: 'Payroll Deduction', amount: 1000, reference: 'PAY-1015', remarks: 'Payroll cutoff deduction' },
  { id: 4, loanId: 1, date: '2026-10-25', type: 'Manual Payment', amount: 1000, reference: 'OR-0007', remarks: 'Voluntary payment' },
  { id: 5, loanId: 2, date: '2026-09-30', type: 'Disbursement', amount: 6000, reference: 'DIS-002', remarks: 'Initial release' },
  { id: 6, loanId: 2, date: '2026-10-15', type: 'Payroll Deduction', amount: 1000, reference: 'PAY-1015-M', remarks: 'Sample payment; balance reflects other demo transactions' },
]
export const useLoansDemo = () => {
  const types = useState<LoanType[]>('rwc-loan-types-demo', () => initialTypes.map(x => ({ ...x })))
  const loans = useState<EmployeeLoan[]>('rwc-employee-loans-demo', () => initialLoans.map(x => ({ ...x })))
  const transactions = useState<LoanTransaction[]>('rwc-loan-transactions-demo', () => initialTransactions.map(x => ({ ...x })))
  const employees = [
    { id: 'EMP-001', name: 'Juan Dela Cruz', department: 'Operations' },
    { id: 'EMP-002', name: 'Maria Santos', department: 'Human Resources' },
    { id: 'EMP-003', name: 'Pedro Reyes', department: 'Finance' },
    { id: 'EMP-004', name: 'Ana Garcia', department: 'Operations' },
    { id: 'EMP-005', name: 'Carlo Mendoza', department: 'Information Technology' },
  ]
  const peso = (amount: number) => '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const typeName = (id: number) => types.value.find(t => t.id === id)?.name ?? 'Unknown loan type'
  const stats = computed(() => ({ total: loans.value.length, active: loans.value.filter(l => l.status === 'Active').length, outstanding: loans.value.reduce((n, l) => n + l.balance, 0), paid: loans.value.filter(l => l.status === 'Paid').length }))
  const addType = (name: string, code: string, description: string) => {
    if (!name.trim() || !code.trim()) return 'Loan type name and code are required.'
    if (types.value.some(t => t.code.toLowerCase() === code.trim().toLowerCase())) return 'Loan type code already exists.'
    types.value.push({ id: Math.max(0, ...types.value.map(t => t.id)) + 1, name: name.trim(), code: code.trim().toUpperCase(), description: description.trim(), active: true })
    return ''
  }
  const addLoan = (input: { employeeId: string; typeId: number; principal: number; term: number; startDate: string; notes: string }) => {
    const employee = employees.find(e => e.id === input.employeeId)
    if (!employee) return 'Select an employee.'
    if (!types.value.some(t => t.id === input.typeId && t.active)) return 'Select an active loan type.'
    if (!(input.principal > 0) || !(Number.isInteger(input.term) && input.term > 0) || !input.startDate) return 'Enter a valid amount, number of cutoffs and start date.'
    const id = Math.max(0, ...loans.value.map(l => l.id)) + 1
    loans.value.unshift({ id, reference: `LN-2026-${String(id).padStart(3, '0')}`, employee: employee.name, employeeId: employee.id, department: employee.department, typeId: input.typeId, principal: input.principal, term: input.term, deduction: Math.round((input.principal / input.term) * 100) / 100, balance: input.principal, startDate: input.startDate, status: 'Pending', notes: input.notes })
    return ''
  }
  const recordPayment = (loanId: number, amount: number, date: string, reference: string) => {
    const loan = loans.value.find(l => l.id === loanId)
    if (!loan || loan.status !== 'Active' || amount <= 0 || amount > loan.balance || !date || !reference.trim()) return 'Select an active loan and provide a valid payment.'
    loan.balance = Math.round((loan.balance - amount) * 100) / 100
    if (loan.balance === 0) loan.status = 'Paid'
    transactions.value.unshift({ id: Math.max(0, ...transactions.value.map(t => t.id)) + 1, loanId, date, type: 'Manual Payment', amount, reference: reference.trim(), remarks: 'Frontend demonstration payment' })
    return ''
  }
  return { types, loans, transactions, employees, stats, peso, typeName, addType, addLoan, recordPayment }
}
