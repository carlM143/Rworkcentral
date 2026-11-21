import type {
  EmployeeLoanApiResponse,
  EmployeeLoanDetail,
  EmployeeLoanListData,
} from '~/types/employee/loans/loans'

const BASE = '/employee/loans'

/** First validation error, API message, or the fallback. */
export const employeeLoanError = (cause: unknown, fallback: string): string => {
  const problem = cause as {
    data?: { message?: string, errors?: Record<string, string[]> }
    response?: { _data?: { message?: string, errors?: Record<string, string[]> } }
  }
  const data = problem?.data ?? problem?.response?._data
  const validationError = Object.values(data?.errors ?? {}).flat()[0]
  return String(validationError || data?.message || fallback)
}

/** "semi_monthly" → "Semi-monthly"; null → "Per payroll". */
export const loanFrequencyLabel = (frequency: string | null) => ({
  weekly: 'Weekly',
  bi_weekly: 'Bi-weekly',
  semi_monthly: 'Semi-monthly',
  monthly: 'Monthly',
}[frequency ?? ''] ?? (frequency ? frequency.replace(/_/g, ' ') : 'Per payroll'))

// Named useEmployeePortalLoans because admin already has useLoans (composables are auto-imported)
export const useEmployeePortalLoans = () => {
  const { $api } = useNuxtApp()

  /** GET /employee/loans — the employee's loans (newest first) and totals. */
  const list = async () =>
    (await $api<EmployeeLoanApiResponse<EmployeeLoanListData>>(BASE)).data

  /** GET /employee/loans/{id} — one loan with its payment history (oldest first). */
  const show = async (loanId: number) =>
    (await $api<EmployeeLoanApiResponse<EmployeeLoanDetail>>(`${BASE}/${loanId}`)).data

  return { list, show }
}
