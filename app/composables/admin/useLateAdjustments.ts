
export type LateStatus = 'pending' | 'approved' | 'rejected'
export type AdjustmentType = 'late' | 'undertime'

export interface LateAdjustmentRecord {
  id: number
  adjustment_id: number
  time_log_id: number
  employee_id: number
  employee_number: string
  employee_name: string
  department_id: number | null
  department: string
  work_date: string | null
  schedule: string | null
  adjustment_type: AdjustmentType
  original_time_in: string | null
  original_time_out: string | null
  requested_time_in: string | null
  requested_time_out: string | null
  original_minutes: number
  requested_minutes: number
  approved_minutes: number
  raw_late_minutes: number
  grace_period_minutes: number
  chargeable_late_minutes: number
  approved_waiver_minutes: number
  final_late_minutes: number | null
  final_undertime_minutes: number | null
  status: LateStatus
  reason: string | null
  review_remarks: string | null
  requested_by: number | null
  requested_by_name: string | null
  reviewed_by_name: string | null
  requested_at: string | null
  reviewed_at: string | null
}

export type LateAdjustmentDetail = LateAdjustmentRecord

export interface EligibleLateLog {
  time_log_id: number
  employee_id: number
  employee_name: string
  employee_number: string
  department: string
  work_date: string
  schedule: string
  time_in: string
  time_out: string
  raw_late_minutes: number
  grace_period_minutes: number
  chargeable_late_minutes: number
  undertime_minutes: number
}

export interface AdjustmentPayload {
  time_log_id: number
  adjustment_type: AdjustmentType
  requested_time_in: string
  requested_time_out: string
  requested_minutes: number
  reason: string
}

interface LateStats {
  late_records: number
  pending_adjustments: number
  approved_adjustments: number
  rejected_adjustments: number
  minutes_adjusted: number
}

interface LateMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

interface ListResponse extends ApiResponse<LateAdjustmentRecord[]> {
  stats: LateStats
  meta: LateMeta
}

export const useLateAdjustments = () => {
  const { $api } = useNuxtApp()

  const records = ref<LateAdjustmentRecord[]>([])
  const eligibleLogs = ref<EligibleLateLog[]>([])

  const loading = ref(false)
  const loadingEligibleLogs = ref(false)
  const saving = ref(false)
  const exporting = ref(false)
  const error = ref<string | null>(null)

  const stats = ref<LateStats>({
    late_records: 0,
    pending_adjustments: 0,
    approved_adjustments: 0,
    rejected_adjustments: 0,
    minutes_adjusted: 0,
  })

  const meta = ref<LateMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 8,
    total: 0,
    from: 0,
    to: 0,
  })

  const search = ref('')
  const department = ref('')
  const status = ref('all')
  const dateFrom = ref('')
  const dateTo = ref('')
  const currentPage = ref(1)
  const perPage = ref(8)

  let requestId = 0

  const getErrorMessage = (err: unknown): string => {
    const e = err as {
      data?: {
        message?: string
        errors?: Record<string, string[]>
      }
      message?: string
    }

    const validation = Object.values(
      e?.data?.errors ?? {},
    ).flat()[0]

    return validation ||
      e?.data?.message ||
      e?.message ||
      'Something went wrong.'
  }

  const buildQuery = (page = currentPage.value) => ({
    page,
    per_page: perPage.value,
    ...(search.value.trim()
      ? { search: search.value.trim() }
      : {}),
    ...(department.value
      ? { department_id: Number(department.value) }
      : {}),
    ...(status.value !== 'all'
      ? { status: status.value }
      : {}),
    ...(dateFrom.value
      ? { date_from: dateFrom.value }
      : {}),
    ...(dateTo.value
      ? { date_to: dateTo.value }
      : {}),
  })

  const fetchAdjustments = async () => {
    const id = ++requestId
    loading.value = true
    error.value = null

    try {
      const response = await $api<ListResponse>(
        '/admin/late-adjustments',
        {
          method: 'GET',
          query: buildQuery(),
        },
      )

      if (id !== requestId) return

      if (!response.success) {
        throw new Error(
          response.message || 'Unable to load adjustment requests.',
        )
      }

      records.value = response.data ?? []
      stats.value = response.stats
      meta.value = response.meta

      if (currentPage.value > meta.value.last_page) {
        currentPage.value = Math.max(1, meta.value.last_page)
      }
    } catch (err: unknown) {
      if (id !== requestId) return

      error.value = getErrorMessage(err)
      records.value = []
    } finally {
      if (id === requestId) loading.value = false
    }
  }

  const fetchEligibleLogs = async () => {
    loadingEligibleLogs.value = true

    try {
      const response = await $api<ApiResponse<EligibleLateLog[]>>(
        '/admin/late-adjustments/eligible-logs',
        { method: 'GET' },
      )

      if (!response.success) {
        throw new Error(
          response.message || 'Unable to load eligible Time Logs.',
        )
      }

      eligibleLogs.value = response.data ?? []
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err)
      eligibleLogs.value = []
      return false
    } finally {
      loadingEligibleLogs.value = false
    }
  }

  const getAdjustmentDetails = async (id: number) => {
    const response = await $api<ApiResponse<LateAdjustmentDetail>>(
      `/admin/late-adjustments/${id}`,
      { method: 'GET' },
    )

    if (!response.success) {
      throw new Error(
        response.message || 'Unable to load adjustment.',
      )
    }

    return response.data
  }

  const performAction = async (
    url: string,
    method: 'POST' | 'PATCH',
    body: Record<string, unknown>,
  ) => {
    if (saving.value) return false

    saving.value = true
    error.value = null

    try {
      const response = await $api<ApiResponse<unknown>>(url, {
        method,
        body,
      })

      if (!response.success) {
        throw new Error(
          response.message || 'Unable to save adjustment.',
        )
      }

      await fetchAdjustments()
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err)
      return false
    } finally {
      saving.value = false
    }
  }

  const createAdjustment = (payload: AdjustmentPayload) =>
    performAction(
      '/admin/late-adjustments',
      'POST',
      { ...payload },
    )

  const updateAdjustment = (
    id: number,
    payload: AdjustmentPayload,
  ) => performAction(
    `/admin/late-adjustments/${id}`,
    'PATCH',
    { ...payload },
  )

  const approveAdjustment = (
    id: number,
    remarks = '',
  ) => performAction(
    `/admin/late-adjustments/${id}/approve`,
    'PATCH',
    { review_remarks: remarks || null },
  )

  const rejectAdjustment = (
    id: number,
    remarks: string,
  ) => performAction(
    `/admin/late-adjustments/${id}/reject`,
    'PATCH',
    { review_remarks: remarks },
  )

  const exportCsv = async () => {
    if (!import.meta.client || exporting.value) return false

    exporting.value = true
    error.value = null

    try {
      const all: LateAdjustmentRecord[] = []
      let page = 1
      let lastPage = 1

      do {
        const response = await $api<ListResponse>(
          '/admin/late-adjustments',
          {
            method: 'GET',
            query: {
              ...buildQuery(page),
              per_page: 100,
            },
          },
        )

        if (!response.success) {
          throw new Error(
            response.message || 'Export failed.',
          )
        }

        all.push(...response.data)
        lastPage = response.meta.last_page
        page++
      } while (page <= lastPage)

      const rows: Array<Array<string | number | null>> = [
        [
          'Employee ID',
          'Employee Name',
          'Department',
          'Work Date',
          'Adjustment Type',
          'Original Time In',
          'Original Time Out',
          'Requested Time In',
          'Requested Time Out',
          'Original Minutes',
          'Requested Waiver',
          'Approved Waiver',
          'Status',
          'Reason',
          'Review Remarks',
        ],
        ...all.map(row => [
          row.employee_number,
          row.employee_name,
          row.department,
          row.work_date,
          row.adjustment_type,
          row.original_time_in,
          row.original_time_out,
          row.requested_time_in,
          row.requested_time_out,
          row.original_minutes,
          row.requested_minutes,
          row.approved_minutes,
          row.status,
          row.reason,
          row.review_remarks,
        ]),
      ]

      const escapeCsv = (value: unknown) => {
        let text = String(value ?? '')

        if (/^\s*[=+\-@]/.test(text)) text = `'${text}`

        return `"${text.replace(/"/g, '""')}"`
      }

      const csv = rows.map(row =>
        row.map(escapeCsv).join(','),
      ).join('\r\n')

      const blob = new Blob(
        ['\uFEFF', csv],
        { type: 'text/csv;charset=utf-8' },
      )

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = 'late-adjustment-requests.csv'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()

      window.setTimeout(() => URL.revokeObjectURL(url), 1000)

      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err)
      return false
    } finally {
      exporting.value = false
    }
  }

  const departments = computed(() => {
    const items = new Map<number, string>()

    records.value.forEach(row => {
      if (row.department_id != null) {
        items.set(row.department_id, row.department)
      }
    })

    return Array.from(items, ([id, name]) => ({
      id,
      name,
    }))
  })

  const totalPages = computed(() =>
    Math.max(1, meta.value.last_page),
  )

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    status.value = 'all'
    dateFrom.value = ''
    dateTo.value = ''
    currentPage.value = 1
  }

  return {
    records,
    eligibleLogs,
    loading,
    loadingEligibleLogs,
    saving,
    exporting,
    error,
    stats,
    meta,
    search,
    department,
    status,
    dateFrom,
    dateTo,
    currentPage,
    perPage,
    departments,
    totalPages,
    fetchAdjustments,
    fetchEligibleLogs,
    getAdjustmentDetails,
    createAdjustment,
    updateAdjustment,
    approveAdjustment,
    rejectAdjustment,
    exportCsv,
    resetFilters,
    getErrorMessage,
  }
}
