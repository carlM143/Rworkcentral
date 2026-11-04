import { computed, reactive, ref } from 'vue'

import type {
  EmployeeLoanTransaction,
  EmployeeLoanTransactionFilters,
} from '~/types/loans/employee-loan-transactions/employeeLoan'

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? value as UnknownRecord : {}

const firstValue = (...values: unknown[]) =>
  values.find(value => value !== undefined && value !== null && value !== '')

const asNullableNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const humanize = (value: unknown, fallback = '—') => {
  if (value === undefined || value === null || value === '') return fallback

  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

const normalizeTransaction = (item: unknown): EmployeeLoanTransaction => {
  const row = asRecord(item)
  const loan = asRecord(row.employee_loan)
  const employee = asRecord(firstValue(row.employee, loan.employee))
  const loanType = asRecord(firstValue(row.loan_type, loan.loan_type))
  const creator = asRecord(firstValue(row.created_by, row.creator))

  const firstName = String(firstValue(employee.first_name, '') ?? '')
  const middleName = String(firstValue(employee.middle_name, '') ?? '')
  const lastName = String(firstValue(employee.last_name, '') ?? '')
  const assembledName = [firstName, middleName, lastName].filter(Boolean).join(' ')

  return {
    id: Number(firstValue(row.id, 0)),
    referenceNo: String(firstValue(
      row.transaction_reference_no,
      row.transaction_no,
      row.reference_no,
      row.reference,
      `TXN-${row.id ?? ''}`,
    )),
    employeeId: asNullableNumber(firstValue(row.employee_id, employee.id, loan.employee_id)),
    employeeName: String(firstValue(
      employee.name,
      employee.full_name,
      row.employee_name,
      assembledName,
      'Unknown Employee',
    )),
    employeeNumber: String(firstValue(
      employee.emp_id,
      employee.employee_no,
      employee.employee_number,
      row.employee_number,
      '—',
    )),
    employeeLoanId: asNullableNumber(firstValue(row.employee_loan_id, loan.id)),
    loanReferenceNo: String(firstValue(
      loan.loan_reference_no,
      row.loan_reference_no,
      '—',
    )),
    loanTypeId: asNullableNumber(firstValue(row.loan_type_id, loanType.id, loan.loan_type_id)),
    loanTypeName: String(firstValue(
      loanType.loan_name,
      loanType.name,
      row.loan_type_name,
      '—',
    )),
    transactionType: humanize(firstValue(row.transaction_type, row.type)),
    transactionDate: firstValue(
      row.transaction_date,
      row.date,
      row.posted_at,
      row.created_at,
    ) as string | null ?? null,
    amount: firstValue(row.amount, row.transaction_amount, row.payment_amount, 0) as string | number,
    balanceBefore: firstValue(row.balance_before, row.previous_balance) as string | number | null ?? null,
    balanceAfter: firstValue(row.balance_after, row.remaining_balance) as string | number | null ?? null,
    status: humanize(firstValue(row.status, '—')),
    remarks: firstValue(row.remarks, row.description, row.notes) as string | null ?? null,
    createdBy: firstValue(creator.name, row.created_by_name) as string | null ?? null,
  }
}

const defaultFilters = (): EmployeeLoanTransactionFilters => ({
  employee_id: '',
  employee_loan_id: '',
  loan_type_id: '',
  transaction_type: '',
  from_date: '',
  to_date: '',
  status: '',
  per_page: 15,
})

export const useEmployeeLoanTransactions = () => {
  const { $api } = useNuxtApp()

  const transactions = ref<EmployeeLoanTransaction[]>([])
  const loading = ref(false)
  const loadError = ref('')
  const currentPage = ref(1)
  const total = ref(0)
  const lastPage = ref(1)
  const from = ref(0)
  const to = ref(0)
  const filters = reactive<EmployeeLoanTransactionFilters>(defaultFilters())

  const fetchTransactions = async () => {
    loading.value = true
    loadError.value = ''

    const query = Object.fromEntries(
      Object.entries({ ...filters, page: currentPage.value })
        .filter(([, value]) => value !== '' && value !== null && value !== undefined),
    )

    try {
      const response = await $api<unknown>('/admin/employee-loan-transactions', {
        method: 'GET',
        query,
      })
      const envelope = asRecord(response)

      if (envelope.success === false) {
        throw new Error(String(envelope.message || 'Unable to load loan transactions.'))
      }

      const payload = envelope.data
      const paginator = asRecord(payload)
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(paginator.data)
          ? paginator.data
          : Array.isArray(paginator.transactions)
            ? paginator.transactions
            : []
      const meta = asRecord(firstValue(paginator.meta, envelope.meta, paginator))

      transactions.value = rows.map(normalizeTransaction)
      total.value = Number(firstValue(meta.total, paginator.total, rows.length)) || 0
      currentPage.value = Number(firstValue(meta.current_page, paginator.current_page, currentPage.value)) || 1
      lastPage.value = Math.max(1, Number(firstValue(meta.last_page, paginator.last_page, 1)) || 1)
      from.value = Number(firstValue(meta.from, paginator.from, rows.length ? 1 : 0)) || 0
      to.value = Number(firstValue(meta.to, paginator.to, rows.length)) || 0
    } catch (error: unknown) {
      const problem = error as {
        data?: { message?: string }
        response?: { _data?: { message?: string } }
        message?: string
      }

      loadError.value =
        problem.data?.message ||
        problem.response?._data?.message ||
        problem.message ||
        'Unable to load employee loan transactions.'
      transactions.value = []
      total.value = 0
      from.value = 0
      to.value = 0
    } finally {
      loading.value = false
    }
  }

  const stats = computed(() => ({
    total: total.value,
    totalAmount: transactions.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    completed: transactions.value.filter(item =>
      ['completed', 'posted', 'approved', 'paid'].includes(item.status.toLowerCase()),
    ).length,
    pending: transactions.value.filter(item => item.status.toLowerCase() === 'pending').length,
  }))

  const applyFilters = () => {
    if (currentPage.value !== 1) {
      currentPage.value = 1
      return
    }

    return fetchTransactions()
  }

  const resetFilters = () => {
    Object.assign(filters, defaultFilters())
    if (currentPage.value !== 1) {
      currentPage.value = 1
      return
    }

    return fetchTransactions()
  }

  return {
    transactions,
    loading,
    loadError,
    filters,
    currentPage,
    total,
    lastPage,
    from,
    to,
    stats,
    fetchTransactions,
    applyFilters,
    resetFilters,
  }
}
