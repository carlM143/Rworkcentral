
<script setup lang="ts">
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Clock3,
  Timer,
  CheckCircle2,
  TrendingDown,
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
  type LateAdjustmentDetail,
} from '~/composables/admin/useLateAdjustments'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()

const {
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
} = useLateAdjustments()

const selected = ref<LateAdjustmentRecord | null>(null)

const modal = ref<
  'view' | 'request' | 'approve' | 'reject' | null
>(null)

const details = ref<LateAdjustmentDetail | null>(null)
const detailsLoading = ref(false)
const modalError = ref('')

const waiverMinutes = ref<number | null>(null)
const reason = ref('')
const reviewRemarks = ref('')

const notice = ref('')

// =====================================================
// DATA LOADING
// =====================================================

const refresh = async () => {
  await fetchAdjustments()
}

const applyFilters = async () => {
  if (currentPage.value === 1) {
    await refresh()
  } else {
    currentPage.value = 1
  }
}

const handleReset = async () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }

  const wasOnFirstPage = currentPage.value === 1

  resetFilters()

  if (wasOnFirstPage) {
    await refresh()
  }
}

watch(currentPage, refresh)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(search, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 350)
})

onMounted(refresh)

onBeforeUnmount(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})

// =====================================================
// FLOATING ACTION MENU
// =====================================================

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

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()

  const width = 205
  const height = row.status === 'pending' ? 212 : 155

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

const handleEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return

  closeMenu()

  if (!saving.value) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenu)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', closeMenu, true)
  window.removeEventListener('resize', closeMenu)
})

// =====================================================
// MODALS
// =====================================================

const closeModal = () => {
  if (saving.value) return

  selected.value = null
  modal.value = null
  details.value = null
  modalError.value = ''
  reason.value = ''
  reviewRemarks.value = ''
  waiverMinutes.value = null
}

const openModal = async (
  mode: 'view' | 'request' | 'approve' | 'reject',
  row: LateAdjustmentRecord,
) => {
  closeMenu()

  if (
    mode === 'request' &&
    !['unadjusted', 'rejected'].includes(row.status)
  ) {
    return
  }

  if (
    (mode === 'approve' || mode === 'reject') &&
    (row.status !== 'pending' || !row.adjustment_id)
  ) {
    return
  }

  selected.value = row
  modal.value = mode
  details.value = null
  modalError.value = ''
  waiverMinutes.value = null
  reason.value = ''
  reviewRemarks.value = ''

  if (row.adjustment_id && mode !== 'request') {
    detailsLoading.value = true

    try {
      details.value = await getAdjustmentDetails(
        row.adjustment_id,
      )
    } catch (err: unknown) {
      modalError.value = getErrorMessage(err)
    } finally {
      detailsLoading.value = false
    }
  }
}

const submitRequest = async () => {
  if (!selected.value || saving.value) return

  modalError.value = ''

  const minutes = Number(waiverMinutes.value)

  if (
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > selected.value.chargeable_late_minutes
  ) {
    modalError.value =
      `Waiver must be between 1 and ${selected.value.chargeable_late_minutes} minutes.`
    return
  }

  if (reason.value.trim().length < 5) {
    modalError.value =
      'Reason must contain at least 5 characters.'
    return
  }

  const ok = await createAdjustment({
    time_log_id: selected.value.time_log_id,
    requested_waiver_minutes: minutes,
    reason: reason.value.trim(),
  })

  if (!ok) {
    modalError.value = error.value || 'Request failed.'
    return
  }

  notice.value = 'Late adjustment submitted for review.'
  closeModal()
}

const submitReview = async () => {
  if (
    !selected.value?.adjustment_id ||
    !modal.value ||
    detailsLoading.value ||
    saving.value
  ) {
    return
  }

  modalError.value = ''

  if (modal.value === 'reject' && reviewRemarks.value.trim().length < 5) {
    modalError.value =
      'Rejection reason must contain at least 5 characters.'
    return
  }

  const approved = modal.value === 'approve'

  const ok = approved
    ? await approveAdjustment(
        selected.value.adjustment_id,
        reviewRemarks.value.trim(),
      )
    : await rejectAdjustment(
        selected.value.adjustment_id,
        reviewRemarks.value.trim(),
      )

  if (!ok) {
    modalError.value = error.value || 'Review failed.'
    return
  }

  notice.value = approved
    ? 'Late adjustment approved successfully.'
    : 'Late adjustment rejected.'

  closeModal()
}

const viewEmployee = (row: LateAdjustmentRecord) => {
  closeMenu()
  router.push(`/admin/employees/${row.employee_id}`)
}

// =====================================================
// DISPLAY HELPERS
// =====================================================

const displayDate = (date: string | null) => {
  if (!date) return '—'

  const value = new Date(`${date.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(value.getTime())) return date

  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)

const requestedWaiver = computed(
  () =>
    details.value?.requested_waiver_minutes ??
    selected.value?.requested_waiver_minutes ??
    0,
)

const expectedFinalLate = computed(() =>
  Math.max(
    0,
    (selected.value?.chargeable_late_minutes ?? 0) -
      requestedWaiver.value,
  ),
)
</script>

<template>
  <section class="late-page">
    <button
      type="button"
      class="back-link"
      @click="router.push('/admin/time-logs')"
    >
      <ArrowLeft :size="15" />
      Back to Time Logs
    </button>

    <!-- HEADER -->
    <PageHeader
      title="Late Adjustment"
      description="Review employee late attendance and manage approved late minute adjustments."
    >
      <button
        type="button"
        class="page-button"
        :disabled="loading"
        @click="refresh"
      >
        <RefreshCw
          :size="15"
          :class="{ spinning: loading }"
        />
        Refresh
      </button>

      <button
        type="button"
        class="page-button"
        :disabled="exporting"
        @click="exportCsv"
      >
        <LoaderCircle
          v-if="exporting"
          :size="15"
          class="spinning"
        />
        <Download v-else :size="15" />
        {{ exporting ? 'Exporting...' : 'Export' }}
      </button>
    </PageHeader>

    <!-- FOUR DYNAMIC CARDS -->
    <div class="stats-grid">
      <StatCard
        label="Late Records"
        :value="stats.late_records"
        description="Recorded late attendance"
        :icon="Clock3"
        tone="blue"
      />

      <StatCard
        label="Pending Adjustments"
        :value="stats.pending_adjustments"
        description="Waiting for review"
        :icon="Timer"
        tone="orange"
      />

      <StatCard
        label="Approved"
        :value="stats.approved_adjustments"
        description="Approved late adjustments"
        :icon="CheckCircle2"
        tone="green"
      />

      <StatCard
        label="Minutes Adjusted"
        :value="stats.minutes_adjusted"
        description="Approved minutes removed"
        :icon="TrendingDown"
        tone="purple"
      />
    </div>

    <!-- FILTERS -->
    <div class="filter-card">
      <div class="filter-top">
        <input
          v-model="search"
          class="field"
          type="search"
          placeholder="Search employee, employee ID or department..."
          autocomplete="off"
        />

        <select
          v-model="department"
          class="field"
          @change="applyFilters"
        >
          <option value="">All Departments</option>

          <option
            v-for="item in departments"
            :key="item.id"
            :value="String(item.id)"
          >
            {{ item.name }}
          </option>
        </select>

        <select
          v-model="status"
          class="field"
          @change="applyFilters"
        >
          <option value="all">All Status</option>
          <option value="unadjusted">Unadjusted</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div class="filter-bottom">
        <label class="date-field">
          <span>Date From</span>
          <input
            v-model="dateFrom"
            type="date"
            class="field"
            @change="applyFilters"
          />
        </label>

        <label class="date-field">
          <span>Date To</span>
          <input
            v-model="dateTo"
            type="date"
            class="field"
            @change="applyFilters"
          />
        </label>

        <button
          type="button"
          class="page-button"
          @click="handleReset"
        >
          <RefreshCw :size="14" />
          Reset Filters
        </button>

        <button
          type="button"
          class="page-button"
          @click="applyFilters"
        >
          Apply
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <AlertCircle :size="17" />
      {{ error }}
    </div>

    <div v-if="notice" class="success-message">
      <CheckCircle2 :size="16" />
      {{ notice }}

      <button type="button" @click="notice = ''">
        <X :size="15" />
      </button>
    </div>

    <!-- TABLE -->
    <div class="table-card">
      <div class="table-heading">
        <h3>Late Adjustment Records</h3>
        <p>
          Review actual late records, grace periods,
          requested waivers and approval status.
        </p>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Schedule</th>
              <th>Actual Time In</th>
              <th>Original Late</th>
              <th>Grace</th>
              <th>After Grace</th>
              <th>HR Waiver</th>
              <th>Final Late</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="loading">
              <td colspan="12" class="empty-cell">
                <LoaderCircle :size="23" class="spinning" />
                Loading attendance records...
              </td>
            </tr>

            <tr v-else-if="records.length === 0">
              <td colspan="12" class="empty-cell">
                <Clock3 :size="23" />
                No late adjustment records found.
              </td>
            </tr>

            <tr
              v-for="row in loading ? [] : records"
              :key="row.time_log_id"
            >
              <td>
                <div class="employee">
                  <div class="employee-icon">
                    <Clock3 :size="16" />
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

              <td class="nowrap">
                {{ row.schedule || 'Not recorded' }}
              </td>

              <td class="orange nowrap">
                {{ row.actual_time_in || '—' }}
              </td>

              <td class="red nowrap">
                {{ row.raw_late_minutes }} min
              </td>

              <td class="nowrap">
                {{ row.grace_period_minutes }} min
              </td>

              <td class="orange nowrap">
                {{ row.chargeable_late_minutes }} min
              </td>

              <td class="green nowrap">
                {{ row.approved_waiver_minutes }} min
              </td>

              <td class="nowrap final-late">
                {{ row.final_late_minutes }} min
              </td>

              <td>
                <span
                  class="reason-preview"
                  :title="row.reason || ''"
                >
                  {{ row.reason || '—' }}
                </span>
              </td>

              <td>
                <span
                  class="status-pill"
                  :class="`status-${row.status}`"
                >
                  {{ capitalize(row.status) }}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  class="dots-button"
                  aria-label="Record actions"
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
    <div class="table-footer">
      <p>
        Showing
        <strong>{{ meta.from }}–{{ meta.to }}</strong>
        of
        <strong>{{ meta.total }}</strong>
        late adjustment records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- THREE DOTS MENU -->
    <Teleport to="body">
      <div
        v-if="activeMenu"
        class="late-floating-menu"
        :style="menuPosition"
        @click.stop
      >
        <button
          type="button"
          @click="openModal('view', activeMenu)"
        >
          <Eye :size="15" />
          View Details
        </button>

        <button
          v-if="
            activeMenu.status === 'unadjusted' ||
            activeMenu.status === 'rejected'
          "
          type="button"
          class="menu-blue"
          @click="openModal('request', activeMenu)"
        >
          <Pencil :size="15" />
          Request Adjustment
        </button>

        <template v-if="activeMenu.status === 'pending'">
          <button
            type="button"
            class="menu-green"
            @click="openModal('approve', activeMenu)"
          >
            <Check :size="15" />
            Approve Request
          </button>

          <button
            type="button"
            class="menu-red"
            @click="openModal('reject', activeMenu)"
          >
            <X :size="15" />
            Reject Request
          </button>
        </template>

        <div class="menu-divider" />

        <button
          type="button"
          @click="viewEmployee(activeMenu)"
        >
          <UserRound :size="15" />
          View Employee
        </button>
      </div>
    </Teleport>

    <!-- MODAL -->
    <Teleport to="body">
      <div
        v-if="modal && selected"
        class="late-backdrop"
        @click.self="closeModal"
      >
        <div
          class="late-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Late adjustment details"
        >
          <div class="modal-header">
            <div>
              <h3>
                {{
                  modal === 'view'
                    ? 'Late Adjustment Details'
                    : modal === 'request'
                      ? 'Request Late Adjustment'
                      : modal === 'approve'
                        ? 'Approve Late Adjustment'
                        : 'Reject Late Adjustment'
                }}
              </h3>
              <p>Employee attendance and late-minute review</p>
            </div>

            <button
              class="close-button"
              type="button"
              :disabled="saving"
              @click="closeModal"
            >
              <X :size="18" />
            </button>
          </div>

          <div class="modal-content">
            <div v-if="detailsLoading" class="loading-details">
              <LoaderCircle :size="21" class="spinning" />
              Loading adjustment details...
            </div>

            <template v-else>
              <div class="modal-section">
                <h4>Employee Information</h4>

                <div class="detail-grid">
                  <div>
                    <span>Employee</span>
                    <strong>{{ selected.employee_name }}</strong>
                  </div>
                  <div>
                    <span>Employee ID</span>
                    <strong>{{ selected.employee_number }}</strong>
                  </div>
                  <div>
                    <span>Attendance Date</span>
                    <strong>{{ displayDate(selected.work_date) }}</strong>
                  </div>
                  <div>
                    <span>Department</span>
                    <strong>{{ selected.department }}</strong>
                  </div>
                  <div>
                    <span>Work Schedule</span>
                    <strong>{{ selected.schedule || 'Not recorded' }}</strong>
                  </div>
                  <div>
                    <span>Actual Time In</span>
                    <strong>{{ selected.actual_time_in || '—' }}</strong>
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <h4>Late Computation</h4>

                <div class="computation-grid">
                  <div>
                    <span>Raw Late</span>
                    <strong>{{ selected.raw_late_minutes }} min</strong>
                  </div>
                  <div>
                    <span>Grace Period</span>
                    <strong>{{ selected.grace_period_minutes }} min</strong>
                  </div>
                  <div>
                    <span>Chargeable Late</span>
                    <strong>{{ selected.chargeable_late_minutes }} min</strong>
                  </div>
                  <div>
                    <span>Approved Waiver</span>
                    <strong>{{ selected.approved_waiver_minutes }} min</strong>
                  </div>
                </div>

                <div class="final-summary">
                  <span>Final Chargeable Late</span>
                  <strong>
                    {{ selected.final_late_minutes }} min
                  </strong>
                </div>
              </div>

              <!-- VIEW -->
              <div v-if="modal === 'view'" class="modal-section">
                <h4>Adjustment Information</h4>

                <p>
                  <strong>Status:</strong>
                  {{ capitalize(selected.status) }}
                </p>

                <p>
                  <strong>Requested Waiver:</strong>
                  {{ requestedWaiver }} minutes
                </p>

                <p>
                  <strong>Reason:</strong>
                  {{ details?.reason || selected.reason || 'No request yet.' }}
                </p>

                <p v-if="details?.review_remarks || selected.review_remarks">
                  <strong>Review Remarks:</strong>
                  {{ details?.review_remarks || selected.review_remarks }}
                </p>
              </div>

              <!-- REQUEST -->
              <div v-if="modal === 'request'" class="modal-section">
                <h4>Request Details</h4>

                <label class="form-field">
                  <span>Waiver Minutes *</span>
                  <input
                    v-model.number="waiverMinutes"
                    type="number"
                    min="1"
                    step="1"
                    :max="selected.chargeable_late_minutes"
                    placeholder="Minutes to waive"
                  />
                  <small>
                    Maximum: {{ selected.chargeable_late_minutes }} minutes
                  </small>
                </label>

                <label class="form-field">
                  <span>Reason for Adjustment *</span>
                  <textarea
                    v-model="reason"
                    rows="4"
                    placeholder="Explain why the late minutes should be waived..."
                  />
                </label>

                <div class="modal-note">
                  This request will be marked Pending.
                  The waiver only takes effect after approval.
                </div>
              </div>

              <!-- APPROVE OR REJECT -->
              <div
                v-if="modal === 'approve' || modal === 'reject'"
                class="modal-section"
              >
                <h4>Review Request</h4>

                <p>
                  <strong>Requested Waiver:</strong>
                  {{ requestedWaiver }} minutes
                </p>

                <p>
                  <strong>Request Reason:</strong>
                  {{ details?.reason || selected.reason || '—' }}
                </p>

                <p>
                  <strong>
                    {{
                      modal === 'approve'
                        ? 'Final Late If Approved:'
                        : 'Final Late If Rejected:'
                    }}
                  </strong>
                  {{
                    modal === 'approve'
                      ? expectedFinalLate
                      : selected.chargeable_late_minutes
                  }}
                  minutes
                </p>

                <label class="form-field">
                  <span>
                    Review Remarks
                    {{ modal === 'reject' ? '*' : '(Optional)' }}
                  </span>

                  <textarea
                    v-model="reviewRemarks"
                    rows="4"
                    placeholder="Enter review remarks..."
                  />
                </label>
              </div>
            </template>

            <div v-if="modalError" class="modal-error">
              <AlertCircle :size="15" />
              {{ modalError }}
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="page-button"
              :disabled="saving"
              @click="closeModal"
            >
              {{ modal === 'view' ? 'Close' : 'Cancel' }}
            </button>

            <button
              v-if="modal === 'request'"
              type="button"
              class="page-button primary-button"
              :disabled="saving"
              @click="submitRequest"
            >
              <LoaderCircle
                v-if="saving"
                :size="15"
                class="spinning"
              />
              <Check v-else :size="15" />
              {{ saving ? 'Processing...' : 'Submit Request' }}
            </button>

            <button
              v-if="modal === 'approve' || modal === 'reject'"
              type="button"
              class="page-button"
              :class="
                modal === 'approve'
                  ? 'approve-button'
                  : 'reject-button'
              "
              :disabled="saving || detailsLoading || !details"
              @click="submitReview"
            >
              <LoaderCircle
                v-if="saving"
                :size="15"
                class="spinning"
              />
              <Check v-else-if="modal === 'approve'" :size="15" />
              <X v-else :size="15" />

              {{
                saving
                  ? 'Processing...'
                  : modal === 'approve'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection'
              }}
            </button>
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

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  margin-bottom: 12px;
  border: 0;
  background: transparent;
  color: var(--primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.page-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.page-button:hover:not(:disabled) {
  border-color: var(--primary);
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 13px;
}

.filter-card {
  padding: 12px;
  margin-bottom: 13px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.filter-top {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 190px 165px;
  gap: 9px;
}

.filter-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 9px;
  margin-top: 9px;
}

.field,
.form-field input,
.form-field textarea {
  width: 100%;
  min-height: 36px;
  padding: 9px 11px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  outline: none;
  font: inherit;
  font-size: 11px;
}

.field:focus,
.form-field input:focus,
.form-field textarea:focus {
  border-color: var(--primary);
}

.date-field {
  display: grid;
  gap: 4px;
  min-width: 155px;
}

.date-field span {
  color: var(--text-muted);
  font-size: 10px;
}

.table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.table-heading {
  padding: 16px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1450px;
  border-collapse: collapse;
}

th {
  padding: 12px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 12px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 11px;
  vertical-align: middle;
}

tbody tr:hover {
  background: var(--bg-card-soft);
}

.employee {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 180px;
}

.employee-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--orange-soft);
  color: var(--orange);
}

.employee strong,
.employee small {
  display: block;
}

.employee strong {
  color: var(--text-primary);
  font-size: 11px;
}

.employee small {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
}

.nowrap {
  white-space: nowrap;
}

.orange {
  color: var(--orange);
  font-weight: 700;
}

.green {
  color: var(--green);
  font-weight: 700;
}

.red {
  color: #ef4444;
  font-weight: 700;
}

.final-late {
  color: var(--text-primary);
  font-weight: 700;
}

.reason-preview {
  display: block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-pill {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 30px;
  font-size: 10px;
  font-weight: 700;
}

.status-unadjusted {
  background: var(--primary-soft);
  color: var(--primary);
}

.status-pending {
  background: var(--orange-soft);
  color: var(--orange);
}

.status-approved {
  background: var(--green-soft);
  color: var(--green);
}

.status-rejected {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.dots-button {
  display: inline-flex;
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

.dots-button:hover {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--primary);
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 3px 0;
}

.table-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 11px;
}

.table-footer strong {
  color: var(--text-primary);
}

.empty-cell {
  height: 150px;
  text-align: center;
  color: var(--text-muted);
}

.error-message,
.success-message {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px;
  margin-bottom: 12px;
  border-radius: 8px;
  font-size: 11px;
}

.error-message {
  border: 1px solid #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.success-message {
  border: 1px solid var(--green);
  color: var(--green);
  background: var(--green-soft);
}

.success-message button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.spinning {
  animation: late-spin 0.8s linear infinite;
}

@keyframes late-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-top {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 650px) {
  .stats-grid,
  .filter-top {
    grid-template-columns: 1fr;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<style>
/* Global styles for Teleport elements */

.late-floating-menu {
  position: fixed;
  z-index: 10020;
  width: 205px;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.late-floating-menu button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.late-floating-menu button:hover {
  background: var(--bg-card-soft);
}

.late-floating-menu .menu-blue {
  color: var(--primary);
}

.late-floating-menu .menu-green {
  color: var(--green);
}

.late-floating-menu .menu-red {
  color: #ef4444;
}

.menu-divider {
  height: 1px;
  margin: 5px;
  background: var(--border-soft);
}

.late-backdrop {
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

.late-modal {
  display: flex;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.3);
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
}

.modal-header {
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
}

.modal-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-content {
  overflow-y: auto;
  padding: 14px;
}

.modal-section {
  margin-bottom: 12px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.modal-section h4 {
  margin: 0 0 12px;
  color: var(--text-primary);
  font-size: 12px;
}

.modal-section p {
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.detail-grid,
.computation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.detail-grid > div,
.computation-grid > div {
  padding: 9px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
}

.detail-grid span,
.computation-grid span {
  display: block;
  margin-bottom: 5px;
  color: var(--text-muted);
  font-size: 10px;
}

.detail-grid strong,
.computation-grid strong {
  display: block;
  color: var(--text-primary);
  font-size: 12px;
}

.final-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 12px;
  border-radius: 7px;
  background: var(--primary-soft);
  color: var(--text-primary);
  font-size: 12px;
}

.final-summary strong {
  color: var(--primary);
  font-size: 15px;
}

.form-field {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
}

.form-field span {
  color: var(--text-secondary);
  font-size: 11px;
}

.form-field small {
  color: var(--text-muted);
  font-size: 10px;
}

.form-field input,
.form-field textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card);
  color: var(--text-primary);
  font: inherit;
  font-size: 11px;
}

.modal-note {
  padding: 10px;
  border: 1px solid var(--primary);
  border-radius: 7px;
  background: var(--primary-soft);
  color: var(--text-secondary);
  font-size: 10px;
}

.modal-error {
  display: flex;
  gap: 8px;
  padding: 10px;
  color: #ef4444;
  font-size: 11px;
}

.modal-footer {
  justify-content: flex-end;
  gap: 9px;
  border-top: 1px solid var(--border);
}

.modal-footer .page-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11px;
  cursor: pointer;
}

.modal-footer .page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-footer .primary-button {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.modal-footer .approve-button {
  border-color: var(--green);
  background: var(--green);
  color: white;
}

.modal-footer .reject-button {
  border-color: #ef4444;
  background: #ef4444;
  color: white;
}

.loading-details {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 15px;
  color: var(--text-muted);
  font-size: 11px;
}

@media (max-width: 600px) {
  .detail-grid,
  .computation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
