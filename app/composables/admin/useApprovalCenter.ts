import type {
  ApprovalPriority,
  ApprovalRequest,
  ApprovalRequestStatus,
} from '~/types/approval'
import type { LeaveApproval } from '~/types/leaveApproval'
import type { OvertimeApprovalApiRecord } from '~/types/overtimeApproval'
import type { UndertimeApprovalApiRecord } from '~/types/undertimeRequest'
import { useLeaveApprovalApi } from '~/composables/admin/approvals/useLeaveApprovalApi'
import { useOvertimeApprovalApi } from '~/composables/admin/approvals/useOvertimeApprovalApi'
import { useUndertimeApprovalApi } from '~/composables/admin/approvals/useUndertimeApprovalApi'
import { hasActiveFilter, resolveExportRecords } from '~/utils/approvalExport'

const resolvePriority = (dateValue?: string | null): ApprovalPriority => {
  if (!dateValue) return 'Normal'
  const dateOnly = dateValue.slice(0, 10)
  const target = new Date(`${dateOnly}T00:00:00`)
  if (Number.isNaN(target.getTime())) return 'Normal'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = (target.getTime() - today.getTime()) / 86_400_000
  return diffDays <= 2 ? 'Urgent' : 'Normal'
}

const normalizeStatus = (raw?: string | null): ApprovalRequestStatus => {
  const s = String(raw ?? 'pending').toLowerCase()
  if (s === 'approved') return 'Approved'
  if (s === 'rejected') return 'Rejected'
  return 'Pending'
}

const resolveEmployeeMeta = (
  employee?: {
    department?: { department_name?: string | null } | null
    employments?: Array<{
      id: number
      department?: { department_name?: string | null } | null
      position?: { position?: string | null } | null
    }>
  } | null,
  fallbackPosition = 'Not assigned',
) => {
  const employments = [...(employee?.employments ?? [])].sort((a, b) => a.id - b.id)
  const latestEmployment = employments[employments.length - 1]

  const department = latestEmployment?.department?.department_name
    ?? employee?.department?.department_name
    ?? 'Not assigned'

  const position = latestEmployment?.position?.position
    ?? fallbackPosition

  return { department, position }
}

const mapLeaveToApprovalRequest = (record: LeaveApproval, index: number): ApprovalRequest => {
  const requestDate = record.request_date?.slice(0, 10)
    || record.created_at?.slice(0, 10)
    || ''

  return {
    id: index,
    sourceId: record.id,
    sourceType: 'leave',
    reference: record.request_no,
    employeeId: record.employee?.id ?? 0,
    employeeNumber: record.employee?.emp_id ? String(record.employee.emp_id) : '—',
    employeeName: record.employee?.name || 'Unknown Employee',
    department: record.employee?.department || 'Not assigned',
    position: record.employee?.position || 'Not assigned',
    type: 'Leave',
    title: record.leave_type || 'Leave Request',
    description: record.reason || `${record.leave_type} (${record.requested_pay_type})`,
    requestDate,
    submittedAt: record.created_at || requestDate,
    status: normalizeStatus(record.status),
    priority: resolvePriority(requestDate),
    approver: record.approver_name || 'HR Administrator',
    start: record.start || record.dates?.[0]?.leave_date || requestDate,
    end: record.end || record.dates?.[record.dates.length - 1]?.leave_date || record.start || requestDate,
    totalDays: record.total_days ?? 1,
    dates: record.dates ?? [],
    requestedPayType: record.requested_pay_type,
    leavePolicyId: record.leave_policy_id,
    policyStatus: record.policy_status,
  }
}

const mapOvertimeToApprovalRequest = (record: OvertimeApprovalApiRecord, index: number): ApprovalRequest => {
  const hours = Math.max(
    0,
    Math.round(((new Date(record.end_at).getTime() - new Date(record.start_at).getTime()) / 3_600_000) * 100) / 100,
  )
  const requestDate = record.ot_date?.slice(0, 10) || ''
  const { department, position } = resolveEmployeeMeta(
    record.employee,
    record.work_schedule?.schedule_name || 'Not assigned',
  )

  return {
    id: index,
    sourceId: record.id,
    sourceType: 'overtime',
    reference: record.request_no,
    employeeId: record.employee_id,
    employeeNumber: record.employee?.emp_id ? String(record.employee.emp_id) : `EMP-${record.employee_id}`,
    employeeName: record.employee
      ? [record.employee.firstname, record.employee.middlename, record.employee.lastname].filter(Boolean).join(' ')
      : 'Unknown Employee',
    department,
    position,
    type: 'Overtime',
    title: `${hours || 0} ${hours === 1 ? 'Hour' : 'Hours'} Overtime`,
    description: record.reason || 'Overtime request',
    requestDate,
    submittedAt: record.created_at || requestDate,
    status: normalizeStatus(record.status),
    priority: resolvePriority(requestDate),
    approver: record.approver?.name || 'HR Administrator',
    startTime: record.start_at?.slice(11, 16) || '18:00',
    endTime: record.end_at?.slice(11, 16) || '21:00',
    requestedHours: hours,
  }
}

const mapUndertimeToApprovalRequest = (record: UndertimeApprovalApiRecord, index: number): ApprovalRequest => {
  const requestDate = record.undertime_date?.slice(0, 10) || ''
  const { department, position } = resolveEmployeeMeta(
    record.employee,
    record.work_schedule?.schedule_name || 'Not assigned',
  )

  return {
    id: index,
    sourceId: record.id,
    sourceType: 'undertime',
    reference: record.request_no,
    employeeId: record.employee_id,
    employeeNumber: record.employee?.emp_id ? String(record.employee.emp_id) : `EMP-${record.employee_id}`,
    employeeName: record.employee
      ? [record.employee.firstname, record.employee.middlename, record.employee.lastname].filter(Boolean).join(' ')
      : 'Unknown Employee',
    department,
    position,
    type: 'Undertime',
    title: `${Number(record.requested_minutes) || 0} Mins Undertime`,
    description: record.reason || 'Undertime request',
    requestDate,
    submittedAt: record.created_at || requestDate,
    status: normalizeStatus(record.status),
    priority: resolvePriority(requestDate),
    approver: record.approver?.name || 'HR Administrator',
    requestedTimeOut: record.requested_time_out,
    scheduledTimeOut: record.scheduled_time_out,
    requestedMinutes: Number(record.requested_minutes) || 0,
  }
}

export const useApprovalCenter = () => {
  const { $api } = useNuxtApp()
  const { getLeaveApprovals, approveLeaveRequest, rejectLeaveRequest, revertLeaveRequest } = useLeaveApprovalApi()
  const { getOvertimeApprovals, approveOvertimeRequest, rejectOvertimeRequest, revertOvertimeRequest } = useOvertimeApprovalApi()
  const { getUndertimeApprovals, approveUndertimeRequest, rejectUndertimeRequest, revertUndertimeRequest } = useUndertimeApprovalApi()

  const requests = ref<ApprovalRequest[]>([])
  const departmentList = ref<string[]>([])
  const loading = ref(false)
  const loadError = ref('')
  const processingId = ref<number | null>(null)

  const getErrorMessage = (problem: any): string => {
    const data = problem?.data ?? problem?.response?._data ?? {}
    const firstError = Object.values(data.errors ?? {}).flat()[0]
    return String(firstError || data.message || problem?.message || 'Unable to process request.')
  }

  const loadRequests = async () => {
    loading.value = true
    loadError.value = ''

    try {
      const [leaveRes, overtimeRes, undertimeRes, deptRes] = await Promise.all([
        getLeaveApprovals(),
        getOvertimeApprovals(),
        getUndertimeApprovals(),
        $api<{ success?: boolean; data?: Array<{ department_name?: string }> }>('/admin/departments', {
          method: 'GET',
        }).catch(() => ({ data: [] })),
      ])

      if (leaveRes.success === false) throw new Error(leaveRes.message)
      if (overtimeRes.success === false) throw new Error(overtimeRes.message)
      if (undertimeRes.success === false) throw new Error(undertimeRes.message)

      const leaves = (Array.isArray(leaveRes.data) ? leaveRes.data : [])
        .filter(item => String(item.status).toLowerCase() !== 'cancelled')

      const overtimes = (Array.isArray(overtimeRes.data) ? overtimeRes.data : [])
        .filter(item => String(item.status).toLowerCase() !== 'cancelled')

      const undertimes = (Array.isArray(undertimeRes.data) ? undertimeRes.data : [])
        .filter(item => String(item.status).toLowerCase() !== 'cancelled')

      let nextId = 1
      const combined: ApprovalRequest[] = [
        ...leaves.map(item => mapLeaveToApprovalRequest(item, nextId++)),
        ...overtimes.map(item => mapOvertimeToApprovalRequest(item, nextId++)),
        ...undertimes.map(item => mapUndertimeToApprovalRequest(item, nextId++)),
      ]

      combined.sort((a, b) => {
        const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
        const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
        return timeB - timeA
      })

      requests.value = combined

      if (Array.isArray(deptRes?.data)) {
        departmentList.value = deptRes.data
          .map(d => d.department_name || '')
          .filter(Boolean)
      }
    } catch (problem: any) {
      requests.value = []
      loadError.value = getErrorMessage(problem)
    } finally {
      loading.value = false
    }
  }

  /* =========================================================
     FILTERS
  ========================================================= */

  const search = ref('')
  const type = ref('')
  const department = ref('')
  const status = ref('Pending')
  const dateFrom = ref('')
  const dateTo = ref('')

  const currentPage = ref(1)
  const perPage = ref(6)

  /* =========================================================
     FILTERED REQUESTS
  ========================================================= */

  const filteredRequests = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return requests.value.filter(request => {
      const matchesSearch =
        !keyword ||
        request.employeeName.toLowerCase().includes(keyword) ||
        request.employeeNumber.toLowerCase().includes(keyword) ||
        request.reference.toLowerCase().includes(keyword)

      const matchesType =
        !type.value || request.type === type.value

      const matchesDepartment =
        !department.value ||
        request.department === department.value

      const matchesStatus =
        !status.value ||
        request.status.toLowerCase() === status.value.toLowerCase()

      const requestDate = (request.requestDate || request.submittedAt || '').slice(0, 10)
      const matchesDate =
        (!dateFrom.value || requestDate >= dateFrom.value) &&
        (!dateTo.value || requestDate <= dateTo.value)

      return (
        matchesSearch &&
        matchesType &&
        matchesDepartment &&
        matchesStatus &&
        matchesDate
      )
    })
  })

  const hasFilters = computed(() => hasActiveFilter([
    search.value,
    type.value,
    department.value,
    dateFrom.value,
    dateTo.value,
  ]) || (status.value !== '' && status.value !== 'Pending'))

  const exportRecords = computed(() => resolveExportRecords(
    requests.value,
    filteredRequests.value,
    hasFilters.value,
  ).map(item => {
    const datesStr = Array.isArray(item.dates) && item.dates.length > 0
      ? item.dates.map(d => {
        const type = d.day_type ? ` (${d.day_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())})` : ''
        return `${d.leave_date}${type}`
      }).join('; ')
      : (item.start ? (item.end && item.end !== item.start ? `${item.start} to ${item.end}` : item.start) : '')

    return {
      sourceId: item.sourceId ?? item.id,
      sourceType: item.sourceType ?? item.type.toLowerCase(),
      reference: item.reference,
      employeeNumber: item.employeeNumber,
      employeeName: item.employeeName,
      department: item.department,
      position: item.position,
      type: item.type,
      title: item.title,
      description: item.description,
      requestDate: item.requestDate,
      submittedAt: item.submittedAt,
      status: item.status,
      priority: item.priority,
      approver: item.approver || '—',
      start: item.start || item.requestDate || '—',
      end: item.end || item.requestDate || '—',
      totalDays: item.totalDays ?? (item.type === 'Leave' ? 1 : '—'),
      dates: datesStr || '—',
      requestedPayType: item.requestedPayType || '—',
      leavePolicyId: item.leavePolicyId || '—',
      policyStatus: item.policyStatus || '—',
    }
  }))

  /* =========================================================
     STATS
  ========================================================= */

  const stats = computed(() => {
    const pendingList = requests.value.filter(request => request.status === 'Pending')
    return {
      total: pendingList.length,
      leaves: pendingList.filter(request => request.type === 'Leave').length,
      overtime: pendingList.filter(request => request.type === 'Overtime').length,
      undertime: pendingList.filter(request => request.type === 'Undertime').length,
    }
  })

  /* =========================================================
     OPTIONS
  ========================================================= */

  const typeOptions = [
    'Leave',
    'Overtime',
    'Undertime',
  ]

  const departments = computed(() => {
    const fromRequests = requests.value
      .map(request => request.department)
      .filter(value => value && value !== 'Not assigned')

    return [
      ...new Set([...departmentList.value, ...fromRequests]),
    ].sort()
  })

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = computed(() => {
    return Math.max(
      1,
      Math.ceil(filteredRequests.value.length / perPage.value),
    )
  })

  const paginatedRequests = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredRequests.value.slice(start, start + perPage.value)
  })

  const showingFrom = computed(() => {
    if (!filteredRequests.value.length) return 0
    return (currentPage.value - 1) * perPage.value + 1
  })

  const showingTo = computed(() => {
    return Math.min(
      currentPage.value * perPage.value,
      filteredRequests.value.length,
    )
  })

  /* =========================================================
     BACKEND APPROVE / REJECT / REVERT
  ========================================================= */

  const approveRequest = async (request: ApprovalRequest): Promise<string> => {
    const targetId = request.sourceId ?? request.id
    processingId.value = request.id

    try {
      let message = 'Request approved successfully.'

      if (request.sourceType === 'leave' || request.type === 'Leave') {
        const res = await approveLeaveRequest(targetId)
        if (res.success === false) throw new Error(res.message)
        message = res.message || message
      } else if (request.sourceType === 'overtime' || request.type === 'Overtime') {
        const res = await approveOvertimeRequest(targetId)
        if (res.success === false) throw new Error(res.message)
        message = res.message || message
      } else if (request.sourceType === 'undertime' || request.type === 'Undertime') {
        const res = await approveUndertimeRequest(targetId)
        if (res.success === false) throw new Error(res.message)
        message = res.message || message
      }

      await loadRequests()
      return message
    } finally {
      processingId.value = null
    }
  }

  const rejectRequest = async (request: ApprovalRequest): Promise<string> => {
    const targetId = request.sourceId ?? request.id
    processingId.value = request.id

    try {
      let message = 'Request rejected successfully.'

      if (request.sourceType === 'leave' || request.type === 'Leave') {
        const res = await rejectLeaveRequest(targetId)
        if (res.success === false) throw new Error(res.message)
        message = res.message || message
      } else if (request.sourceType === 'overtime' || request.type === 'Overtime') {
        const res = await rejectOvertimeRequest(targetId)
        if (res.success === false) throw new Error(res.message)
        message = res.message || message
      } else if (request.sourceType === 'undertime' || request.type === 'Undertime') {
        const res = await rejectUndertimeRequest(targetId)
        if (res.success === false) throw new Error(res.message)
        message = res.message || message
      }

      await loadRequests()
      return message
    } finally {
      processingId.value = null
    }
  }

  const revertRequest = async (request: ApprovalRequest): Promise<string> => {
    const targetId = request.sourceId ?? request.id
    processingId.value = request.id

    try {
      let message = 'Request reverted to pending successfully.'

      if (request.sourceType === 'leave' || request.type === 'Leave') {
        const res = await revertLeaveRequest(targetId)
        if (res.success === false) throw new Error(res.message)
        message = res.message || message
      } else if (request.sourceType === 'overtime' || request.type === 'Overtime') {
        const res = await revertOvertimeRequest(targetId)
        if (res.success === false) throw new Error(res.message)
        message = res.message || message
      } else if (request.sourceType === 'undertime' || request.type === 'Undertime') {
        const res = await revertUndertimeRequest(targetId)
        if (res.success === false) throw new Error(res.message)
        message = res.message || message
      }

      await loadRequests()
      return message
    } finally {
      processingId.value = null
    }
  }

  const resetFilters = () => {
    search.value = ''
    type.value = ''
    department.value = ''
    status.value = 'Pending'
    dateFrom.value = ''
    dateTo.value = ''
    currentPage.value = 1
  }

  watch([search, type, department, status, dateFrom, dateTo], () => {
    currentPage.value = 1
  })

  watch(totalPages, pages => {
    if (currentPage.value > pages) currentPage.value = pages
  })

  return {
    requests,
    loading,
    loadError,
    processingId,
    loadRequests,

    search,
    type,
    department,
    status,
    dateFrom,
    dateTo,

    currentPage,

    filteredRequests,
    paginatedRequests,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    typeOptions,
    departments,
    hasFilters,
    exportRecords,

    approveRequest,
    rejectRequest,
    revertRequest,
    getErrorMessage,

    resetFilters,
  }
}
