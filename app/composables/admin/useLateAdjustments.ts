
export type LateStatus =
  | 'unadjusted'
  | 'pending'
  | 'approved'
  | 'rejected'

export interface LateAdjustmentRecord {
  id: number
  time_log_id: number
  employee_id: number
  employee_number: string
  employee_name: string
  department_id: number | null
  department: string
  work_date: string
  schedule: string | null
  actual_time_in: string | null
  raw_late_minutes: number
  grace_period_minutes: number
  chargeable_late_minutes: number
  requested_waiver_minutes: number
  approved_waiver_minutes: number
  final_late_minutes: number
  status: LateStatus
  adjustment_id: number | null
  reason: string | null
  review_remarks: string | null
  requested_at: string | null
  reviewed_at: string | null
}

export interface LateAdjustmentDetail {
  id: number
  time_log_id: number
  employee_id: number
  employee_name: string
  work_date: string | null
  actual_time_in: string | null
  scheduled_time_in: string | null
  raw_late_minutes: number
  grace_period_minutes: number
  chargeable_late_minutes: number
  requested_waiver_minutes: number
  approved_waiver_minutes: number | null
  final_late_minutes: number | null
  status: LateStatus
  reason: string
  review_remarks: string | null
  reviewed_at: string | null
  created_at: string | null
}

interface LateStats {
  late_records: number
  pending_adjustments: number
  approved_adjustments: number
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
  const loading = ref(false)
  const saving = ref(false)
  const exporting = ref(false)
  const error = ref<string | null>(null)

  const stats = ref<LateStats>({
    late_records: 0,
    pending_adjustments: 0,
    approved_adjustments: 0,
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

  let latestRequestId = 0

  const getErrorMessage = (err: unknown): string => {
    const e = err as {
      data?: {
        message?: string
        errors?: Record<string, string[]>
      }
      message?: string
    }

    const firstValidationError = Object.values(
      e?.data?.errors ?? {},
    ).flat()[0]

    return (
      firstValidationError ||
      e?.data?.message ||
      e?.message ||
      'Something went wrong. Please try again.'
    )
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
    const requestId = ++latestRequestId

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

      if (requestId !== latestRequestId) return

      if (!response.success) {
        throw new Error(
          response.message || 'Unable to load late adjustments.',
        )
      }

      records.value = response.data ?? []
      stats.value = response.stats
      meta.value = response.meta

      if (
        currentPage.value > meta.value.last_page &&
        currentPage.value > 1
      ) {
        currentPage.value = Math.max(1, meta.value.last_page)
      }
    } catch (err: unknown) {
      if (requestId !== latestRequestId) return

      error.value = getErrorMessage(err)
      records.value = []
    } finally {
      if (requestId === latestRequestId) {
        loading.value = false
      }
    }
  }

  const getAdjustmentDetails = async (id: number) => {
    const response = await $api<
      ApiResponse<LateAdjustmentDetail>
    >(`/admin/late-adjustments/${id}`, {
      method: 'GET',
    })

    if (!response.success) {
      throw new Error(
        response.message || 'Unable to load adjustment details.',
      )
    }

    return response.data
  }

  const createAdjustment = async (payload: {
    time_log_id: number
    requested_waiver_minutes: number
    reason: string
  }) => {
    if (saving.value) return false

    saving.value = true
    error.value = null

    try {
      await $api('/admin/late-adjustments', {
        method: 'POST',
        body: payload,
      })

      await fetchAdjustments()
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err)
      return false
    } finally {
      saving.value = false
    }
  }

  const approveAdjustment = async (
    adjustmentId: number,
    remarks = '',
  ) => {
    if (saving.value) return false

    saving.value = true
    error.value = null

    try {
      await $api(
        `/admin/late-adjustments/${adjustmentId}/approve`,
        {
          method: 'PATCH',
          body: {
            review_remarks: remarks || null,
          },
        },
      )

      await fetchAdjustments()
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err)
      return false
    } finally {
      saving.value = false
    }
  }

  const rejectAdjustment = async (
    adjustmentId: number,
    remarks: string,
  ) => {
    if (saving.value) return false

    saving.value = true
    error.value = null

    try {
      await $api(
        `/admin/late-adjustments/${adjustmentId}/reject`,
        {
          method: 'PATCH',
          body: {
            review_remarks: remarks,
          },
        },
      )

      await fetchAdjustments()
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err)
      return false
    } finally {
      saving.value = false
    }
  }

  const exportCsv = async () => {
    if (!import.meta.client || exporting.value) return false

    exporting.value = true
    error.value = null

    try {
      const all: LateAdjustmentRecord[] = []
      let exportPage = 1
      let lastPage = 1

      do {
        const response = await $api<ListResponse>(
          '/admin/late-adjustments',
          {
            method: 'GET',
            query: {
              ...buildQuery(exportPage),
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
        exportPage++
      } while (exportPage <= lastPage)

      const rows: Array<Array<string | number>> = [
        [
          'Employee ID',
          'Employee',
          'Department',
          'Date',
          'Schedule',
          'Time In',
          'Raw Late',
          'Grace Period',
          'After Grace',
          'Approved Waiver',
          'Final Late',
          'Status',
          'Reason',
          'Review Remarks',
        ],
        ...all.map((r) => [
          r.employee_number,
          r.employee_name,
          r.department,
          r.work_date,
          r.schedule ?? '',
          r.actual_time_in ?? '',
          r.raw_late_minutes,
          r.grace_period_minutes,
          r.chargeable_late_minutes,
          r.approved_waiver_minutes,
          r.final_late_minutes,
          r.status,
          r.reason ?? '',
          r.review_remarks ?? '',
        ]),
      ]

      const escapeCsv = (value: string | number) => {
        let text = String(value ?? '')

        if (/^\s*[=+\-@]/.test(text)) {
          text = `'${text}`
        }

        return `"${text.replace(/"/g, '""')}"`
      }

      const csv = rows
        .map((row) => row.map(escapeCsv).join(','))
        .join('\r\n')

      const blob = new Blob(
        ['\uFEFF', csv],
        { type: 'text/csv;charset=utf-8' },
      )

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')

      anchor.href = url
      anchor.download = 'late-adjustments.csv'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()

      setTimeout(() => URL.revokeObjectURL(url), 1000)

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

    records.value.forEach((row) => {
      if (row.department_id !== null) {
        items.set(row.department_id, row.department)
      }
    })

    return Array.from(items.entries()).map(([id, name]) => ({
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

  let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)

  searchTimer = setTimeout(() => {
    if (currentPage.value !== 1) {
      currentPage.value = 1
    } else {
      fetchAdjustments()
    }
  }, 300)
})

onScopeDispose(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

  return {
    records,
    loading,
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
    getAdjustmentDetails,
    createAdjustment,
    approveAdjustment,
    rejectAdjustment,
    exportCsv,
    resetFilters,
    getErrorMessage,
  }
}
