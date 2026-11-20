import type {
  EmployeePayslipApiResponse,
  EmployeePayslipDetail,
  EmployeePayslipListData,
} from '~/types/employee/payslip/employeePayslip'

const BASE = '/employee/payslips'

/** First validation error, API message, or the fallback. */
export const employeePayslipError = (cause: unknown, fallback: string): string => {
  const problem = cause as {
    data?: { message?: string, errors?: Record<string, string[]> }
    response?: { _data?: { message?: string, errors?: Record<string, string[]> } }
    message?: string
  }
  const data = problem?.data ?? problem?.response?._data
  const validationError = Object.values(data?.errors ?? {}).flat()[0]
  return String(validationError || data?.message || problem?.message || fallback)
}

export const useEmployeePayslips = () => {
  const { $api } = useNuxtApp()

  const list = async (year?: number | null) => {
    const res = await $api<EmployeePayslipApiResponse<EmployeePayslipListData>>(BASE, {
      method: 'GET',
      query: year ? { year } : {},
    })
    return res.data
  }

  const show = async (payrollId: number) => {
    const res = await $api<EmployeePayslipApiResponse<EmployeePayslipDetail>>(`${BASE}/${payrollId}`, {
      method: 'GET',
    })
    return res.data
  }

  return { list, show }
}
