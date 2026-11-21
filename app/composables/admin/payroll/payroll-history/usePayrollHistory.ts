import type {
  PayrollHistoryApiResponse,
  PayrollHistoryEmployeeData,
  PayrollHistoryListData,
  PayrollHistoryListFilters,
  PayrollHistoryPeriodDetail,
  PayrollHistoryPeriodFilters,
} from '~/types/payroll/payroll-history/payrollHistory'

const BASE = '/admin/payroll-history'

/** First validation error, API message, or the fallback. */
export const payrollHistoryError = (cause: unknown, fallback: string): string => {
  const problem = cause as {
    data?: { message?: string, errors?: Record<string, string[]> }
    response?: { _data?: { message?: string, errors?: Record<string, string[]> } }
  }
  const data = problem?.data ?? problem?.response?._data
  const validationError = Object.values(data?.errors ?? {}).flat()[0]
  return String(validationError || data?.message || fallback)
}

/** Drops empty filters so they are not sent as ?year=&status= */
const clean = (filters: object) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== null && value !== undefined && value !== ''))

export const usePayrollHistory = () => {
  const { $api } = useNuxtApp()

  /** GET /admin/payroll-history — generated periods (newest first) with totals. */
  const list = async (filters: PayrollHistoryListFilters = {}) =>
    (await $api<PayrollHistoryApiResponse<PayrollHistoryListData>>(BASE, { query: clean(filters) })).data

  /** GET /admin/payroll-history/{period} — totals, totals per group, every employee's payroll. */
  const period = async (periodId: number, filters: PayrollHistoryPeriodFilters = {}) =>
    (await $api<PayrollHistoryApiResponse<PayrollHistoryPeriodDetail>>(`${BASE}/${periodId}`, { query: clean(filters) })).data

  /** GET /admin/payroll-history/employees/{employee} — one employee's payrolls. */
  const employee = async (employeeId: number, year?: number | null) =>
    (await $api<PayrollHistoryApiResponse<PayrollHistoryEmployeeData>>(`${BASE}/employees/${employeeId}`, { query: clean({ year }) })).data

  return { list, period, employee }
}
