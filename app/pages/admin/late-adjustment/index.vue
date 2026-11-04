
<script setup lang="ts">
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Download,
  Clock3,
  Timer,
  CheckCircle2,
  TrendingDown,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Check,
  X,
  UserRound,
  AlertCircle,
  LoaderCircle,
} from 'lucide-vue-next'

import {
  useLateAdjustments,
  type LateAdjustmentRecord,
  type EligibleLateLog,
  type AdjustmentType,
  type AdjustmentPayload,
} from '~/composables/admin/useLateAdjustments'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()

const {
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
} = useLateAdjustments()

const {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
} = useToast()

type ModalMode =
  | 'create'
  | 'edit'
  | 'view'
  | 'approve'
  | 'reject'

const modal = ref<ModalMode | null>(null)
const selected = ref<LateAdjustmentRecord | null>(null)
const selectedLogId = ref<number | null>(null)

const employeeSearch = ref('')
const showEmployeeOptions = ref(false)
const employeeComboRef = ref<HTMLElement | null>(null)

const modalError = ref('')
const detailsLoading = ref(false)
const reviewRemarks = ref('')

const form = reactive({
  adjustment_type: 'late' as AdjustmentType,
  requested_time_in: '',
  requested_time_out: '',
  requested_minutes: 0,
  reason: '',
})

const refresh = async () => {
  await fetchAdjustments()

  if (error.value) {
    toastError('Unable to Load Adjustments', error.value)
  }
}

onMounted(() => {
  fetchAdjustments()
})

// ============================================
// FILTERS
// ============================================

let filterTimer: ReturnType<typeof setTimeout> | null = null

const applyFilters = () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1
  } else {
    fetchAdjustments()
  }
}

watch(
  [search, department, status, dateFrom, dateTo],
  () => {
    if (filterTimer) clearTimeout(filterTimer)

    filterTimer = setTimeout(() => {
      applyFilters()
    }, 350)
  },
)

watch(currentPage, () => {
  fetchAdjustments()
})

onBeforeUnmount(() => {
  if (filterTimer) clearTimeout(filterTimer)
})

const handleReset = () => {
  resetFilters()
  applyFilters()
}

// ============================================
// ELIGIBLE ATTENDANCE SELECTION
// ============================================

const filteredEligibleLogs = computed(() => {
  const query = employeeSearch.value.trim().toLowerCase()

  if (!query) return eligibleLogs.value

  return eligibleLogs.value.filter(row =>
    [
      row.employee_name,
      row.employee_number,
      row.department,
      row.work_date,
    ].some(value =>
      String(value ?? '').toLowerCase().includes(query),
    ),
  )
})

const chooseEmployeeLog = (log: EligibleLateLog) => {
  selectedLogId.value = log.time_log_id

  employeeSearch.value =
    `${log.employee_name} — ${log.work_date}`

  showEmployeeOptions.value = false

  selectLog()
}

const handleEmployeeSearch = () => {
  selectedLogId.value = null

  form.requested_time_in = ''
  form.requested_time_out = ''
  form.requested_minutes = 0

  showEmployeeOptions.value = true
}

const handleEmployeeComboClick = (event: MouseEvent) => {
  const target = event.target as Node

  if (
    employeeComboRef.value &&
    !employeeComboRef.value.contains(target)
  ) {
    showEmployeeOptions.value = false
  }
}

onMounted(() => {
  document.addEventListener(
    'click',
    handleEmployeeComboClick,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'click',
    handleEmployeeComboClick,
  )
})

const selectedEligibleLog = computed<EligibleLateLog | null>(
  () => eligibleLogs.value.find(
    row => row.time_log_id === selectedLogId.value,
  ) ?? null,
)

const attendanceSummary = computed(() => {
  if (modal.value === 'create') {
    return selectedEligibleLog.value
  }

  return selected.value
})

const currentOriginalMinutes = computed(() => {
  if (modal.value === 'create') {
    return form.adjustment_type === 'late'
      ? selectedEligibleLog.value?.chargeable_late_minutes ?? 0
      : selectedEligibleLog.value?.undertime_minutes ?? 0
  }

  return selected.value?.original_minutes ?? 0
})

const estimatedRemaining = computed(() =>
  Math.max(
    0,
    currentOriginalMinutes.value -
      (Number(form.requested_minutes) || 0),
  ),
)

const selectLog = () => {
  const log = selectedEligibleLog.value

  if (!log) {
    form.requested_time_in = ''
    form.requested_time_out = ''
    return
  }

  form.requested_time_in = log.time_in
  form.requested_time_out = log.time_out
  form.adjustment_type = log.chargeable_late_minutes > 0
    ? 'late'
    : 'undertime'
  form.requested_minutes = 0
}

// ============================================
// MODALS
// ============================================

const resetForm = () => {
  form.adjustment_type = 'late'
  form.requested_time_in = ''
  form.requested_time_out = ''
  form.requested_minutes = 0
  form.reason = ''

  modalError.value = ''
  reviewRemarks.value = ''
  employeeSearch.value = ''
  selectedLogId.value = null
}

const closeModal = () => {
  if (saving.value) return

  modal.value = null
  selected.value = null
  resetForm()
}

const openCreate = async () => {
  resetForm()
  selected.value = null
  modal.value = 'create'
  showEmployeeOptions.value = false

  const ok = await fetchEligibleLogs()

  if (!ok) {
    modalError.value = error.value ||
      'Unable to load eligible attendance records.'

    toastError('Unable to Load Time Logs', modalError.value)
  }
}

const openRecord = async (
  mode: Exclude<ModalMode, 'create'>,
  row: LateAdjustmentRecord,
) => {
  closeMenu()

  selected.value = row
  modal.value = mode
  modalError.value = ''
  detailsLoading.value = true

  try {
    const item = await getAdjustmentDetails(row.id)

    selected.value = item
    form.adjustment_type = item.adjustment_type
    form.requested_time_in =
      item.requested_time_in || item.original_time_in || ''
    form.requested_time_out =
      item.requested_time_out || item.original_time_out || ''
    form.requested_minutes = item.requested_minutes
    form.reason = item.reason || ''
    reviewRemarks.value = item.review_remarks || ''
  } catch (err: unknown) {
    modalError.value = getErrorMessage(err)
    toastError('Unable to Load Request', modalError.value)
  } finally {
    detailsLoading.value = false
  }
}

// ============================================
// REQUEST CREATE / EDIT
// ============================================

const submitRequest = async () => {
  if (saving.value) return

  modalError.value = ''

  const timeLogId = modal.value === 'create'
    ? selectedLogId.value
    : selected.value?.time_log_id

  if (!timeLogId) {
    modalError.value = 'Please select an attendance record.'
    return
  }

  if (
    !form.requested_time_in ||
    !form.requested_time_out
  ) {
    modalError.value = 'Time In and Time Out are required.'
    return
  }

  if (
    !Number.isInteger(Number(form.requested_minutes)) ||
    Number(form.requested_minutes) < 0
  ) {
    modalError.value = 'Waiver must be a non-negative whole number.'
    return
  }

  if (form.reason.trim().length < 5) {
    modalError.value = 'Reason must contain at least 5 characters.'
    return
  }

  const payload: AdjustmentPayload = {
    time_log_id: timeLogId,
    adjustment_type: form.adjustment_type,
    requested_time_in: form.requested_time_in,
    requested_time_out: form.requested_time_out,
    requested_minutes: Number(form.requested_minutes),
    reason: form.reason.trim(),
  }

  const editing = modal.value === 'edit'

  const ok = editing && selected.value
    ? await updateAdjustment(selected.value.id, payload)
    : await createAdjustment(payload)

  if (!ok) {
    modalError.value = error.value || 'Unable to save request.'
    toastError('Adjustment Failed', modalError.value)
    return
  }

  closeModal()

  toastSuccess(
    editing ? 'Adjustment Updated' : 'Adjustment Submitted',
    editing
      ? 'Pending adjustment updated successfully.'
      : 'The adjustment request is now pending review.',
  )
}

// ============================================
// APPROVE / REJECT
// ============================================

const submitReview = async () => {
  if (
    !selected.value ||
    saving.value ||
    detailsLoading.value
  ) return

  const approving = modal.value === 'approve'

  if (
    !approving &&
    reviewRemarks.value.trim().length < 5
  ) {
    modalError.value =
      'Rejection reason must contain at least 5 characters.'
    return
  }

  const ok = approving
    ? await approveAdjustment(
        selected.value.id,
        reviewRemarks.value.trim(),
      )
    : await rejectAdjustment(
        selected.value.id,
        reviewRemarks.value.trim(),
      )

  if (!ok) {
    modalError.value = error.value || 'Unable to review adjustment.'
    toastError('Review Failed', modalError.value)
    return
  }

  closeModal()

  toastSuccess(
    approving ? 'Adjustment Approved' : 'Adjustment Rejected',
    approving
      ? 'The approved adjustment has been recorded.'
      : 'The adjustment request has been rejected.',
  )
}

// ============================================
// EXPORT
// ============================================

const handleExport = async () => {
  const ok = await exportCsv()

  if (ok) {
    toastSuccess(
      'Export Completed',
      'Late adjustment requests exported successfully.',
    )
  } else {
    toastError(
      'Export Failed',
      error.value || 'Unable to export requests.',
    )
  }
}

// ============================================
// THREE DOTS
// ============================================

const activeMenu = ref<LateAdjustmentRecord | null>(null)

const menuPosition = ref({
  top: '0px',
  left: '0px',
})

const closeMenu = () => {
  activeMenu.value = null
}

const toggleMenu = (
  event: MouseEvent,
  row: LateAdjustmentRecord,
) => {
  event.stopPropagation()

  if (activeMenu.value?.id === row.id) {
    closeMenu()
    return
  }

  const rect = (event.currentTarget as HTMLElement)
    .getBoundingClientRect()

  const width = 195
  const height = row.status === 'pending' ? 220 : 95

  menuPosition.value = {
    left: `${Math.max(
      8,
      Math.min(rect.right - width, window.innerWidth - width - 8),
    )}px`,
    top: `${
      rect.bottom + height > window.innerHeight
        ? Math.max(8, rect.top - height - 5)
        : rect.bottom + 5
    }px`,
  }

  activeMenu.value = row
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMenu()
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenu)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', closeMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenu)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', closeMenu, true)
  window.removeEventListener('resize', closeMenu)
})

// ============================================
// DISPLAY
// ============================================

const displayDate = (date: string | null) => {
  if (!date) return '—'

  const parsed = new Date(`${date.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) return date

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

const displayTime = (time: string | null) => {
  if (!time) return '—'

  const match = /^(\d{2}):(\d{2})$/.exec(time)

  if (!match) return time

  const hour = Number(match[1])
  const minute = match[2]

  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`
}

const formatType = (value: AdjustmentType) =>
  value === 'late' ? 'Late' : 'Undertime'

const formatStatus = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)

const viewEmployee = (row: LateAdjustmentRecord) => {
  closeMenu()
  router.push(`/admin/employees/${row.employee_id}`)
}
</script>

<template>
  <section class="late-page">
    <button
      type="button"
      class="late-back-link"
      @click="router.push('/admin/time-logs')"
    >
      <ArrowLeft :size="15" />
      Back to Time Logs
    </button>

    <PageHeader
      title="Late Adjustment"
      description="Create, review and manage employee attendance adjustment requests."
    >
      <div class="late-header-actions">
        <button
          type="button"
          class="late-btn"
          :disabled="loading"
          @click="refresh"
        >
          <RefreshCw :size="15" :class="{ spinning: loading }" />
          Refresh
        </button>

        <button
          type="button"
          class="late-btn"
          :disabled="exporting"
          @click="handleExport"
        >
          <Download :size="15" />
          {{ exporting ? 'Exporting...' : 'Export' }}
        </button>

        <button
          type="button"
          class="late-btn late-btn-primary"
          @click="openCreate"
        >
          <Plus :size="15" />
          Add Late Adjustment
        </button>
      </div>
    </PageHeader>

    <!-- STATS -->
    <div class="late-stats">
      <StatCard
        label="Total Requests"
        :value="stats.late_records"
        description="Recorded adjustment requests"
        :icon="Clock3"
        tone="blue"
      />
      <StatCard
        label="Pending"
        :value="stats.pending_adjustments"
        description="Waiting for review"
        :icon="Timer"
        tone="orange"
      />
      <StatCard
        label="Approved"
        :value="stats.approved_adjustments"
        description="Reviewed and approved"
        :icon="CheckCircle2"
        tone="green"
      />
      <StatCard
        label="Minutes Waived"
        :value="stats.minutes_adjusted"
        description="Approved adjustment minutes"
        :icon="TrendingDown"
        tone="purple"
      />
    </div>

    <!-- FILTERS -->
    <div class="late-filter-card">
      <div class="late-filter-grid">
        <div class="late-search">
          <Search :size="15" />
          <input
            v-model="search"
            placeholder="Search employee or employee ID..."
          >
        </div>

        <select v-model="department" class="late-field">
          <option value="">All Departments</option>
          <option
            v-for="item in departments"
            :key="item.id"
            :value="String(item.id)"
          >
            {{ item.name }}
          </option>
        </select>

        <select v-model="status" class="late-field">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div class="late-date-filters">
        <label>
          <span>Date From</span>
          <input v-model="dateFrom" type="date" class="late-field">
        </label>

        <label>
          <span>Date To</span>
          <input v-model="dateTo" type="date" class="late-field">
        </label>

        <button type="button" class="late-btn" @click="handleReset">
          <RefreshCw :size="14" />
          Reset Filters
        </button>
      </div>
    </div>

    <!-- API ERROR -->
    <div v-if="error && !modal" class="late-error">
      <AlertCircle :size="16" />
      {{ error }}
    </div>

    <!-- REQUEST TABLE -->
    <div class="late-table-card">
      <div class="late-table-header">
        <h3>Adjustment Requests</h3>
        <p>
          View original attendance, requested changes and approval status.
        </p>
      </div>

      <div class="late-table-scroll">
        <table class="late-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Type</th>
              <th>Original Time</th>
              <th>Requested Time</th>
              <th>Original Minutes</th>
              <th>Waiver</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="loading">
              <td colspan="10" class="late-empty">
                <LoaderCircle :size="19" class="spinning" />
                Loading adjustment requests...
              </td>
            </tr>

            <tr v-else-if="records.length === 0">
              <td colspan="10" class="late-empty">
                No adjustment requests found.
              </td>
            </tr>

            <tr
              v-for="row in loading ? [] : records"
              :key="row.id"
            >
              <td>
                <div class="late-employee">
                  <div class="late-employee-icon">
                    <UserRound :size="16" />
                  </div>
                  <div>
                    <strong>{{ row.employee_name }}</strong>
                    <small>
                      {{ row.employee_number }} · {{ row.department }}
                    </small>
                  </div>
                </div>
              </td>

              <td class="nowrap">
                {{ displayDate(row.work_date) }}
              </td>

              <td>
                <span class="late-type">
                  {{ formatType(row.adjustment_type) }}
                </span>
              </td>

              <td class="nowrap">
                {{ displayTime(row.original_time_in) }}
                <br>
                {{ displayTime(row.original_time_out) }}
              </td>

              <td class="nowrap late-blue">
                {{ displayTime(row.requested_time_in) }}
                <br>
                {{ displayTime(row.requested_time_out) }}
              </td>

              <td class="nowrap">
                {{ row.original_minutes }} min
              </td>

              <td class="nowrap late-green">
                {{ row.status === 'approved'
                    ? row.approved_minutes
                    : row.requested_minutes }} min
              </td>

              <td>
                <span
                  class="late-reason"
                  :title="row.reason || ''"
                >
                  {{ row.reason || '—' }}
                </span>
              </td>

              <td>
                <span
                  class="late-status"
                  :class="`late-status-${row.status}`"
                >
                  {{ formatStatus(row.status) }}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  class="late-dots"
                  aria-label="Adjustment actions"
                  @click="toggleMenu($event, row)"
                >
                  <MoreHorizontal :size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="late-footer">
      <p>
        Showing
        <strong>{{ meta.from }}–{{ meta.to }}</strong>
        of <strong>{{ meta.total }}</strong>
        adjustment requests
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- FLOATING THREE DOTS -->
    <Teleport to="body">
      <div
        v-if="activeMenu"
        class="late-action-menu"
        :style="menuPosition"
        @click.stop
      >
        <button
          type="button"
          @click="openRecord('view', activeMenu)"
        >
          <Eye :size="15" />
          View Details
        </button>

        <template v-if="activeMenu.status === 'pending'">
          <button
            type="button"
            class="blue"
            @click="openRecord('edit', activeMenu)"
          >
            <Pencil :size="15" />
            Edit Pending Request
          </button>

          <button
            type="button"
            class="green"
            @click="openRecord('approve', activeMenu)"
          >
            <Check :size="15" />
            Approve
          </button>

          <button
            type="button"
            class="red"
            @click="openRecord('reject', activeMenu)"
          >
            <X :size="15" />
            Reject
          </button>
        </template>

        <div class="late-menu-divider" />

        <button
          type="button"
          @click="viewEmployee(activeMenu)"
        >
          <UserRound :size="15" />
          View Employee
        </button>
      </div>
    </Teleport>

    <!-- ADD / EDIT / VIEW / REVIEW MODAL -->
    <Teleport to="body">
      <div
        v-if="modal"
        class="late-modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="late-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Attendance adjustment"
        >
          <div class="late-dialog-header">
            <div class="late-dialog-title">
              <div class="late-dialog-icon">
                <Clock3 :size="20" />
              </div>

              <div>
                <h3>
                  {{
                    modal === 'create' ? 'Add Late Adjustment'
                    : modal === 'edit' ? 'Edit Pending Adjustment'
                    : modal === 'approve' ? 'Approve Adjustment'
                    : modal === 'reject' ? 'Reject Adjustment'
                    : 'Adjustment Details'
                  }}
                </h3>
                <p>Employee attendance adjustment management</p>
              </div>
            </div>

            <button
              type="button"
              class="late-close"
              :disabled="saving"
              @click="closeModal"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="late-dialog-body">
            <div v-if="detailsLoading" class="late-loading">
              <LoaderCircle :size="19" class="spinning" />
              Loading request details...
            </div>

            <template v-else>
              <!-- EMPLOYEE PICKER -->
              <div class="late-section">
                <h4>01 · Employee & Attendance</h4>

              <template v-if="modal === 'create'">
                <div
                  ref="employeeComboRef"
                  class="late-form-field"
                >
                  <span>Employee Attendance Record *</span>

                  <div class="late-combobox">
                    <div
                      class="late-combobox-input"
                      :class="{
                        'late-combobox-active': showEmployeeOptions,
                      }"
                    >
                      <Search
                        :size="16"
                        class="late-combobox-search-icon"
                      />

                      <input
                        v-model="employeeSearch"
                        type="text"
                        autocomplete="off"
                        placeholder="Search employee name, ID or attendance date..."
                        :disabled="loadingEligibleLogs"
                        @focus="showEmployeeOptions = true"
                        @input="handleEmployeeSearch"
                        @keydown.esc="showEmployeeOptions = false"
                      >

                      <button
                        v-if="employeeSearch"
                        type="button"
                        class="late-combobox-clear"
                        aria-label="Clear selected employee"
                        @click="
                          employeeSearch = '';
                          handleEmployeeSearch()
                        "
                      >
                        <X :size="15" />
                      </button>
                    </div>

                    <!-- SEARCH RESULTS -->
                    <div
                      v-if="showEmployeeOptions"
                      class="late-combobox-dropdown"
                    >
                      <div
                        v-if="loadingEligibleLogs"
                        class="late-combobox-state"
                      >
                        <LoaderCircle
                          :size="15"
                          class="spinning"
                        />
                        Loading attendance records...
                      </div>

                      <div
                        v-else-if="filteredEligibleLogs.length === 0"
                        class="late-combobox-state"
                      >
                        No matching attendance records found.
                      </div>

                      <div
                        v-else
                        class="late-combobox-list"
                      >
                        <button
                          v-for="log in filteredEligibleLogs"
                          :key="log.time_log_id"
                          type="button"
                          class="late-combobox-option"
                          :class="{
                            'late-combobox-selected':
                              selectedLogId === log.time_log_id,
                          }"
                          @click="chooseEmployeeLog(log)"
                        >
                          <div class="late-combobox-avatar">
                            <UserRound :size="16" />
                          </div>

                          <div class="late-combobox-option-info">
                            <strong>{{ log.employee_name }}</strong>

                            <span>
                              {{ log.employee_number }}
                              · {{ log.department }}
                            </span>

                            <small>
                              {{ displayDate(log.work_date) }}
                              · {{ log.schedule }}
                            </small>
                          </div>

                          <div class="late-combobox-minutes">
                            <span v-if="log.chargeable_late_minutes > 0">
                              {{ log.chargeable_late_minutes }}m Late
                            </span>

                            <span v-if="log.undertime_minutes > 0">
                              {{ log.undertime_minutes }}m UT
                            </span>
                          </div>

                          <Check
                            v-if="selectedLogId === log.time_log_id"
                            :size="15"
                            class="late-combobox-check"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                <p class="late-helper">
                  <template v-if="loadingEligibleLogs">
                    Loading eligible attendance records...
                  </template>

                  <template v-else>
                    {{ filteredEligibleLogs.length }}
                    eligible attendance record(s) found.

                    Search by employee name, employee ID,
                    department, or attendance date.
                  </template>
                </p>
                </div>
              </template>

                <div
                  v-if="attendanceSummary"
                  class="late-summary-grid"
                >
                  <div>
                    <span>Employee</span>
                    <strong>{{ attendanceSummary.employee_name }}</strong>
                  </div>

                  <div>
                    <span>Attendance Date</span>
                    <strong>
                      {{ displayDate(attendanceSummary.work_date) }}
                    </strong>
                  </div>

                  <div>
                    <span>Work Schedule</span>
                    <strong>{{ attendanceSummary.schedule || '—' }}</strong>
                  </div>

                  <div>
                    <span>Employee ID</span>
                    <strong>{{ attendanceSummary.employee_number }}</strong>
                  </div>
                </div>
              </div>

              <!-- ADJUSTMENT DETAILS -->
              <div
                v-if="attendanceSummary"
                class="late-section"
              >
                <h4>02 · Adjustment Details</h4>

                <div class="late-form-grid">
                  <label class="late-form-field">
                    <span>Adjustment Type *</span>
                    <select
                      v-model="form.adjustment_type"
                      class="late-field"
                      :disabled="!['create', 'edit'].includes(modal)"
                    >
                      <option value="late">Late</option>
                      <option value="undertime">Undertime</option>
                    </select>
                  </label>

                  <div class="late-form-field">
                    <span>Original Minutes</span>
                    <div class="late-readonly-field">
                      {{ currentOriginalMinutes }} min
                    </div>
                  </div>

                  <label class="late-form-field">
                    <span>Requested Time In *</span>
                    <input
                      v-model="form.requested_time_in"
                      class="late-field"
                      type="time"
                      :disabled="!['create', 'edit'].includes(modal)"
                    >
                  </label>

                  <label class="late-form-field">
                    <span>Requested Time Out *</span>
                    <input
                      v-model="form.requested_time_out"
                      class="late-field"
                      type="time"
                      :disabled="!['create', 'edit'].includes(modal)"
                    >
                  </label>

                  <label class="late-form-field">
                    <span>Requested Waiver (minutes)</span>
                    <input
                      v-model.number="form.requested_minutes"
                      class="late-field"
                      type="number"
                      min="0"
                      step="1"
                      :disabled="!['create', 'edit'].includes(modal)"
                    >
                  </label>

                  <div class="late-form-field">
                    <span>Estimated Remaining Minutes</span>
                    <div class="late-readonly-field late-blue">
                      {{ estimatedRemaining }} min
                    </div>
                  </div>
                </div>

                <p class="late-helper">
                  Preview only. The backend recalculates actual
                  late and undertime minutes when the request is reviewed.
                </p>
              </div>

              <!-- REASON -->
              <div
                v-if="attendanceSummary"
                class="late-section"
              >
                <h4>03 · Reason & Review</h4>

                <label class="late-form-field">
                  <span>Reason for Adjustment *</span>
                  <textarea
                    v-model="form.reason"
                    rows="3"
                    class="late-field"
                    :disabled="!['create', 'edit'].includes(modal)"
                    placeholder="Explain the requested attendance adjustment..."
                  />
                </label>

                <label
                  v-if="modal === 'approve' || modal === 'reject'"
                  class="late-form-field"
                >
                  <span>
                    Review Remarks
                    {{ modal === 'reject' ? '*' : '(Optional)' }}
                  </span>
                  <textarea
                    v-model="reviewRemarks"
                    rows="3"
                    class="late-field"
                    placeholder="Enter review remarks..."
                  />
                </label>

                <div
                  v-if="modal === 'view' && selected"
                  class="late-review-info"
                >
                  <p>
                    <strong>Status:</strong>
                    {{ formatStatus(selected.status) }}
                  </p>

                  <p>
                    <strong>Requested By:</strong>
                    {{ selected.requested_by_name || '—' }}
                  </p>

                  <p>
                    <strong>Reviewed By:</strong>
                    {{ selected.reviewed_by_name || '—' }}
                  </p>

                  <p>
                    <strong>Review Remarks:</strong>
                    {{ selected.review_remarks || '—' }}
                  </p>
                </div>
              </div>
            </template>

            <div v-if="modalError" class="late-error">
              <AlertCircle :size="16" />
              {{ modalError }}
            </div>
          </div>

          <div class="late-dialog-footer">
            <span class="late-helper">
              Changes apply only after approval.
            </span>

            <div class="late-dialog-actions">
              <button
                type="button"
                class="late-btn"
                :disabled="saving"
                @click="closeModal"
              >
                {{ modal === 'view' ? 'Close' : 'Cancel' }}
              </button>

              <button
                v-if="modal === 'create' || modal === 'edit'"
                type="button"
                class="late-btn late-btn-primary"
                :disabled="
                  saving ||
                  detailsLoading ||
                  (modal === 'create' && !selectedLogId)
                "
                @click="submitRequest"
              >
                <LoaderCircle
                  v-if="saving"
                  :size="15"
                  class="spinning"
                />
                <Check v-else :size="15" />
                {{ modal === 'edit' ? 'Save Changes' : 'Submit Request' }}
              </button>

              <button
                v-if="modal === 'approve' || modal === 'reject'"
                type="button"
                class="late-btn"
                :class="
                  modal === 'approve'
                    ? 'late-btn-success'
                    : 'late-btn-danger'
                "
                :disabled="saving || detailsLoading"
                @click="submitReview"
              >
                {{ modal === 'approve'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.late-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.late-back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.late-header-actions,
.late-date-filters,
.late-dialog-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.late-btn {
  display: inline-flex;
  min-height: 37px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 13px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.late-btn:hover:not(:disabled) {
  border-color: var(--primary);
}

.late-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.late-btn-primary {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.late-btn-success {
  background: var(--green);
  border-color: var(--green);
  color: white;
}

.late-btn-danger {
  background: #dc2626;
  border-color: #dc2626;
  color: white;
}

.late-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 13px;
}

.late-filter-card {
  padding: 12px;
  margin-bottom: 13px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.late-filter-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 190px 160px;
  gap: 9px;
}

.late-search {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 38px;
  padding: 0 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.late-search input {
  flex: 1;
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
}

.late-field {
  width: 100%;
  min-height: 38px;
  padding: 9px 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 11px;
}

.late-field:focus {
  border-color: var(--primary);
}

.late-field:disabled {
  opacity: 0.7;
}

.late-date-filters {
  margin-top: 10px;
}

.late-date-filters label {
  display: grid;
  gap: 5px;
}

.late-date-filters label span {
  font-size: 10px;
  color: var(--text-muted);
}

.late-table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.late-table-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-soft);
}

.late-table-header h3 {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary);
}

.late-table-header p {
  margin: 5px 0 0;
  font-size: 10px;
  color: var(--text-muted);
}

.late-table-scroll {
  width: 100%;
  overflow-x: auto;
}

.late-table {
  width: 100%;
  min-width: 1260px;
  border-collapse: collapse;
}

.late-table th {
  padding: 12px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  text-align: left;
  font-size: 10px;
  text-transform: uppercase;
  white-space: nowrap;
}

.late-table td {
  padding: 12px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 11px;
  vertical-align: middle;
}

.late-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.late-employee {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 175px;
}

.late-employee-icon {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.late-employee strong,
.late-employee small {
  display: block;
}

.late-employee strong {
  color: var(--text-primary);
  font-size: 11px;
}

.late-employee small {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
}

.late-type {
  color: var(--primary);
  font-weight: 600;
}

.late-blue {
  color: var(--primary) !important;
  font-weight: 600;
}

.late-green {
  color: var(--green) !important;
  font-weight: 600;
}

.nowrap {
  white-space: nowrap;
}

.late-reason {
  display: block;
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.late-status {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
}

.late-status-pending {
  color: var(--orange);
  background: var(--orange-soft);
}

.late-status-approved {
  color: var(--green);
  background: var(--green-soft);
}

.late-status-rejected {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}

.late-dots {
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.late-dots:hover {
  border-color: var(--border);
  color: var(--primary);
}

.late-empty {
  height: 150px;
  text-align: center;
  color: var(--text-muted);
}

.late-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 14px 3px 0;
}

.late-footer p {
  color: var(--text-muted);
  font-size: 11px;
}

.late-footer strong {
  color: var(--text-primary);
}

.late-error {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 12px 0;
  padding: 11px;
  border: 1px solid #ef4444;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 11px;
}

.spinning {
  animation: late-spin 0.8s linear infinite;
}

@keyframes late-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1100px) {
  .late-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .late-filter-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 650px) {
  .late-stats,
  .late-filter-grid {
    grid-template-columns: 1fr;
  }

  .late-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<style>
/* Teleported menu and modal */

.late-action-menu {
  position: fixed;
  z-index: 10020;
  width: 195px;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.late-action-menu button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  padding: 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  text-align: left;
  font-size: 11px;
  cursor: pointer;
}

.late-action-menu button:hover {
  background: var(--bg-card-soft);
}

.late-action-menu button.blue {
  color: var(--primary);
}

.late-action-menu button.green {
  color: var(--green);
}

.late-action-menu button.red {
  color: #ef4444;
}

.late-menu-divider {
  height: 1px;
  margin: 5px;
  background: var(--border-soft);
}

.late-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(5px);
}

.late-dialog {
  display: flex;
  width: 100%;
  max-width: 690px;
  max-height: 90vh;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--bg-card);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.late-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 17px;
  border-bottom: 1px solid var(--border);
}

.late-dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.late-dialog-icon {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
}

.late-dialog-title h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
}

.late-dialog-title p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.late-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.late-dialog-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 17px;
}

.late-section {
  margin-bottom: 13px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.late-section h4 {
  margin: 0 0 14px;
  color: var(--text-primary);
  font-size: 12px;
}

.late-form-grid,
.late-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.late-form-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 12px;
}

.late-form-field > span {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.late-form-field .late-field,
.late-form-field textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font: inherit;
  font-size: 11px;
}

.late-form-field .late-field:focus,
.late-form-field textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.late-summary-grid > div,
.late-readonly-field {
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
}

.late-summary-grid span {
  display: block;
  margin-bottom: 5px;
  color: var(--text-muted);
  font-size: 10px;
}

.late-summary-grid strong {
  color: var(--text-primary);
  font-size: 11px;
}

.late-readonly-field {
  min-height: 39px;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
}

.late-helper {
  margin: 7px 0 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.6;
}

.late-review-info p {
  color: var(--text-secondary);
  font-size: 11px;
}

.late-loading {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 18px;
  color: var(--text-muted);
  font-size: 11px;
}

.late-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 15px 17px;
  border-top: 1px solid var(--border);
}

@media (max-width: 650px) {
  .late-form-grid,
  .late-summary-grid {
    grid-template-columns: 1fr;
  }

  .late-dialog-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .late-dialog-actions {
    justify-content: flex-end;
  }
}

.late-combobox {
  position: relative;
  width: 100%;
}

.late-combobox-input {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 43px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  transition: border-color 0.2s ease;
}

.late-combobox-input:hover,
.late-combobox-active {
  border-color: var(--primary);
}

.late-combobox-search-icon {
  flex-shrink: 0;
  color: var(--text-muted);
}

.late-combobox-input input {
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 42px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 12px;
}

.late-combobox-input input::placeholder {
  color: var(--text-muted);
}

.late-combobox-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  flex-shrink: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.late-combobox-clear:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}


.late-combobox-dropdown {
  position: relative;
  top: auto;
  left: auto;
  right: auto;
  z-index: 1;
  width: 100%;
  margin-top: 6px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.late-combobox-list {
  max-height: 280px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 5px;
  scrollbar-width: thin;
}

.late-combobox-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.late-combobox-option:hover,
.late-combobox-selected {
  background: var(--primary-soft);
}

.late-combobox-list {
  max-height: 255px;
  overflow-y: auto;
  padding: 5px;
}

.late-combobox-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.late-combobox-option:hover,
.late-combobox-selected {
  background: var(--primary-soft);
}

.late-combobox-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.late-combobox-option-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.late-combobox-option-info strong {
  font-size: 12px;
  font-weight: 600;
}

.late-combobox-option-info span,
.late-combobox-option-info small {
  color: var(--text-muted);
  font-size: 10px;
}

.late-combobox-minutes {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  color: var(--orange, #f59e0b);
  font-size: 10px;
  font-weight: 600;
}

.late-combobox-check {
  color: var(--primary);
}

.late-combobox-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 75px;
  padding: 15px;
  color: var(--text-muted);
  font-size: 11px;
}
</style>
