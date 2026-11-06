
import { ref } from 'vue'
import type {
  EmployeeTransfer,
  EmployeeTransferStatsData,
  EmployeeOption,
  TransferDepartment,
  CreateTransferPayload,
  UpdateTransferPayload,
} from '~/types/employeeTransfer'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

interface TransferListResponse extends ApiResponse<Paginated<EmployeeTransfer>> {
  stats: EmployeeTransferStatsData
}

const endpoint = '/admin/employee-department-transfers'

export const useEmployeeTransfers = () => {
  const { $api } = useNuxtApp()

  const transfers = ref<EmployeeTransfer[]>([])
  const departments = ref<TransferDepartment[]>([])
  const employees = ref<EmployeeOption[]>([])

  const loading = ref(false)
  const optionsLoading = ref(false)
  const error = ref('')

  const stats = ref<EmployeeTransferStatsData>({
    total: 0, pending: 0, approved: 0,
    scheduled: 0, applied: 0, rejected: 0, cancelled: 0,
  })

  // Supports standard Laravel paginator and simple array responses.
  const extractRows = (response: any, key: string): any[] => {
    if (Array.isArray(response)) return response
    if (Array.isArray(response?.data?.data)) return response.data.data
    if (Array.isArray(response?.data?.[key])) return response.data[key]
    if (Array.isArray(response?.data)) return response.data
    if (Array.isArray(response?.[key])) return response[key]
    return []
  }

  const getLastPage = (response: any) =>
    Number(response?.data?.last_page ?? response?.meta?.last_page ?? 1)

  // Load all pages so the existing client-side filters and CSV
  // export operate on the full fetched dataset.
  const fetchTransfers = async () => {
    loading.value = true
    error.value = ''

    try {
      const rows: EmployeeTransfer[] = []
      let page = 1
      let lastPage = 1

      do {
        const response = await $api<TransferListResponse>(endpoint, {
          query: { page, per_page: 100 },
        })

        if (!response?.data || !Array.isArray(response.data.data)) {
          throw new Error('Unexpected transfer API response.')
        }

        rows.push(...response.data.data)
        lastPage = Number(response.data.last_page) || 1

        if (page === 1 && response.stats) {
          stats.value = {
            total: response.stats.total ?? 0,
            pending: response.stats.pending ?? 0,
            approved: response.stats.approved ?? 0,
            scheduled: response.stats.scheduled ?? 0,
            applied: response.stats.applied ?? 0,
            rejected: response.stats.rejected ?? 0,
            cancelled: response.stats.cancelled ?? 0,
          }
        }

        page++
      } while (page <= lastPage)

      transfers.value = rows
    } catch (err: any) {
      error.value =
        err?.data?.message ||
        err?.message ||
        'Failed to load employee transfers.'

      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch employees and departments using existing Admin APIs.
  // Handles paginated and non-paginated Laravel responses.
  const fetchAllOptions = async (url: string, key: string) => {
    const results: any[] = []
    let page = 1
    let lastPage = 1

    do {
      const response = await $api<any>(url, {
        query: { page, per_page: 100 },
      })

      const rows = extractRows(response, key)

      if (page === 1 && !rows.length && getLastPage(response) === 1) {
        return []
      }

      results.push(...rows)
      lastPage = getLastPage(response)
      page++
    } while (page <= lastPage)

    return results
  }

  const fetchOptions = async () => {
    optionsLoading.value = true

    try {
      const [employeeRows, departmentRows] = await Promise.all([
        fetchAllOptions('/admin/employees', 'employees'),
        fetchAllOptions('/admin/departments', 'departments'),
      ])

      departments.value = departmentRows.map((item: any) => ({
        id: Number(item.id),
        department_name: item.department_name ?? item.name ?? '',
        department_code: item.department_code ?? null,
        company_id: item.company_id ?? null,
      })).filter(item => Number.isInteger(item.id) && item.id > 0)

      employees.value = employeeRows.map((item: any) => {
        const name = [
          item.firstname,
          item.lastname,
        ].filter(Boolean).join(' ')

        const employeeNumber = String(item.emp_id ?? item.id)

        // Different Employee APIs may expose the current employment
        // under different relation names.
        const employment =
          item.current_employment ??
          item.latest_employment ??
          item.employment ??
          item.employments?.[0] ??
          null

        const rawDepartmentId =
          employment?.department_id ??
          item.department_id ??
          item.department?.id ??
          null

        return {
          id: Number(item.id),
          label: `${name || 'Employee'} (${employeeNumber})`,
          employeeNumber,
          currentDepartmentId: rawDepartmentId == null
            ? null
            : Number(rawDepartmentId),
        }
      }).filter((item: EmployeeOption) =>
        Number.isInteger(item.id) && item.id > 0
      )
    } finally {
      optionsLoading.value = false
    }
  }

  const getDepartmentName = (id?: number | null) => {
    if (!id) return 'Not assigned'

    const department = departments.value.find(item => item.id === id)

    return department?.department_name ||
      department?.name ||
      `Department #${id}`
  }

  const createTransfer = (payload: CreateTransferPayload) =>
    $api<ApiResponse<EmployeeTransfer>>(endpoint, {
      method: 'POST',
      body: payload,
    })

  const updateTransfer = (id: number, payload: UpdateTransferPayload) =>
    $api<ApiResponse<EmployeeTransfer>>(`${endpoint}/${id}`, {
      method: 'PATCH',
      body: payload,
    })

  const deleteTransfer = (id: number) =>
    $api<ApiResponse<unknown>>(`${endpoint}/${id}`, {
      method: 'DELETE',
    })

  const approveTransfer = (id: number, review_remarks = '') =>
    $api<ApiResponse<EmployeeTransfer>>(`${endpoint}/${id}/approve`, {
      method: 'PATCH',
      body: { review_remarks: review_remarks || undefined },
    })

  const rejectTransfer = (id: number, review_remarks: string) =>
    $api<ApiResponse<EmployeeTransfer>>(`${endpoint}/${id}/reject`, {
      method: 'PATCH',
      body: { review_remarks },
    })

  const applyTransfer = (id: number) =>
    $api<ApiResponse<EmployeeTransfer>>(`${endpoint}/${id}/apply`, {
      method: 'POST',
    })

  const cancelTransfer = (id: number) =>
    $api<ApiResponse<EmployeeTransfer>>(`${endpoint}/${id}/cancel`, {
      method: 'PATCH',
    })

  return {
    transfers, departments, employees,
    loading, optionsLoading, error, stats,
    fetchTransfers, fetchOptions, getDepartmentName,
    createTransfer, updateTransfer, deleteTransfer,
    approveTransfer, rejectTransfer, applyTransfer, cancelTransfer,
  }
}
