<script setup lang="ts">
import {
  RefreshCw,
  Check,
  X,
  Eye,
  LoaderCircle,
  Clock3,
  CheckCircle2,
  XCircle,
  CalendarDays,
  MoreHorizontal,
} from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const { $api } = useNuxtApp()

interface Correction {
  id: number
  time_log_id: number
  status: 'pending' | 'approved' | 'applied' | 'rejected' | 'cancelled'
  correction_type: 'time_in' | 'time_out'
  requested_time: string | null
  original_time_in: string | null
  original_time_out: string | null
  reason: string
  attachment_path?: string | null
  review_remarks: string | null
  reviewed_at?: string | null
  created_at: string
  employee?: {
    id: number
    emp_id?: string | null
    firstname?: string | null
    lastname?: string | null
    department?: { name?: string | null } | null
    position?: { name?: string | null } | null
  } | null
  requester?: { name?: string | null } | null
  reviewer?: { name?: string | null } | null
  time_log?: { work_date?: string | null } | null

  applied_by?: number | null
    applied_at?: string | null
    applier?: {
      id?: number
      name?: string | null
  } | null
}

interface ApiListResponse {
  success: boolean
  message?: string
  data: {
    data: ApiCorrection[]
    current_page: number
    last_page: number
    total: number
  }
  stats: {
    pending: number
    approved: number
    rejected: number
    this_month: number
    applied: number
  }
}

const { $api } = useNuxtApp()
const router = useRouter()

const loading = ref(false)
const processing = ref(false)
const error = ref('')
const message = ref('')

const statusFilter = ref('pending')
const page = ref(1)
const lastPage = ref(1)
const totalRecords = ref(0)
const search = ref('')
const statusFilter = ref('pending')
const selected = ref<TimeLogCorrectionRequest | null>(null)
const action = ref<'approve' | 'reject' | 'apply' | null>(null)
const reviewRemarks = ref('')

const stats = ref({
  pending: 0,
  approved: 0,
  applied: 0,
  rejected: 0,
  thisMonth: 0,
})

const selected = ref<Correction | null>(null)
const action = ref<'view' | 'approve' | 'reject' | null>(null)
const reviewRemarks = ref('')

// ============================================
// THREE DOTS ACTION MENU
// ============================================

const activeMenuId = ref<number | null>(null)

const menuPosition = ref({
  top: '0px',
  left: '0px',
})

const menuRef = ref<HTMLElement | null>(null)

const closeMenu = () => {
  activeMenuId.value = null
}

const toggleMenu = async (
  event: MouseEvent,
  id: number,
) => {
  if (activeMenuId.value === id) {
    closeMenu()
    return
  }

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()

  activeMenuId.value = id

  await nextTick()

  const menuWidth = menuRef.value?.offsetWidth ?? 190
  const menuHeight = menuRef.value?.offsetHeight ?? 150
  const gap = 6

  const left = Math.max(
    8,
    Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 8,
    ),
  )

  const top =
    window.innerHeight - rect.bottom >= menuHeight + gap
      ? rect.bottom + gap
      : Math.max(
          8,
          rect.top - menuHeight - gap,
        )

  menuPosition.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement

  if (
    target.closest('.correction-menu-trigger') ||
    menuRef.value?.contains(target)
  ) {
    return
  }

  closeMenu()
}

const handleScroll = () => {
  closeMenu()
}

const fetchRecords = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $api<ApiListResponse>('/admin/time-log-corrections', {
      query: {
        search: search.value.trim() || undefined,
        status: statusFilter.value || undefined,
        page: page.value,
      },
    })

    records.value = response.data.data || []
    lastPage.value = response.data.last_page || 1
    totalRecords.value = response.data.total || 0
    stats.value = {
      pending: response.stats?.pending ?? 0,
      approved: response.stats?.approved ?? 0,
      applied: response.stats?.applied ?? 0,
      rejected: response.stats?.rejected ?? 0,
      thisMonth: response.stats?.this_month ?? 0,
    }
  } catch (err: any) {
    error.value =
      err?.data?.message || err?.message || 'Unable to load correction requests.'
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  search.value = ''
  statusFilter.value = 'pending'
  page.value = 1
  fetchRecords()
}

const openAction = (
  request: TimeLogCorrectionRequest,
  mode: 'approve' | 'reject' | 'apply',
) => {
  const status = request.status.toLowerCase()

  if (mode === 'apply' && status !== 'approved') return
  if (mode !== 'apply' && status !== 'pending') return

  selected.value = request
  action.value = mode
  reviewRemarks.value = ''
  error.value = ''
  message.value = ''
}

const viewRequest = (request: TimeLogCorrectionRequest) =>
  router.push({
    path: '/admin/timekeeping/time-log-correction-requests/show',
    query: { id: request.id },
  })

const closeAction = () => {
  if (processing.value) return
  selected.value = null
  action.value = null
  reviewRemarks.value = ''
}


const submitDecision = async () => {
  if (!selected.value || !action.value || processing.value) return

  const decision = action.value
  processing.value = true
  error.value = ''

  try {
    const response = await $api<{
      success: boolean
      message?: string
    }>(
      `/admin/time-log-corrections/${selected.value.id}/${decision}`,
      {
        method: decision === 'apply' ? 'POST' : 'PATCH',

        ...(decision !== 'apply'
          ? {
              body: {
                review_remarks:
                  reviewRemarks.value.trim() || undefined,
              },
            }
          : {}),
      },
    )

    if (!response.success) {
      throw new Error(
        response.message || 'Unable to process correction request.'
      )
    }

    toastSuccess(
      decision === 'approve'
        ? 'Correction Approved'
        : 'Correction Rejected',
      response.message ||
      (decision === 'approve'
        ? 'Correction approved. Time log updated.'
        : 'Correction request rejected.')

    selected.value = null
    action.value = null
    reviewRemarks.value = ''

    await fetchRecords()
  } catch (err: any) {
    const validationErrors = err?.data?.errors

    error.value = validationErrors
      ? Object.values(validationErrors).flat().join(' ')
      : err?.data?.message ||
        err?.message ||
        'Unable to process correction request.'
  } finally {
    processing.value = false
  }
}


watch(statusFilter, () => {
  if (page.value !== 1) page.value = 1
  else fetchRecords()
})

watch(page, fetchRecords)

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (page.value !== 1) page.value = 1
    else fetchRecords()
  }, 300)
})

onMounted(fetchRecords)
onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <section class="correction-review-page">
    <PageHeader
  title="Time Log Correction Requests"
  description="Review requested attendance adjustments before updating time logs."
>
  <AppButton
    variant="secondary"
    :icon="RefreshCw"
    :disabled="loading"
    @click="fetchRecords"
  >
    Refresh
  </AppButton>
</PageHeader>
    <CorrectionStats :stats="stats" />
    <!-- END DYNAMIC STATISTICS -->
    <div class="review-filters">
    <div class="filter-search">
      <Search :size="16" />

      <input
        v-model="search"
        type="search"
        placeholder="Search employee or employee ID..."
        autocomplete="off"
      />
    </div>

    <label>
      Status

      <select v-model="statusFilter">
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="">All Requests</option>
      </select>
    </label>
  </div>

    <p v-if="message" class="review-success">{{ message }}</p>
    <p v-if="error && !action" class="review-error">{{ error }}</p>

    <div v-if="loading && !records.length" class="loading-state">
      <LoaderCircle :size="22" class="spinner" />
      Loading correction requests...
    </div>

    <TimeCorrectionTable
      v-else
      :requests="displayRequests"
      @view="viewRequest"
      @approve="openAction($event, 'approve')"
      @reject="openAction($event, 'reject')"
      @apply="openAction($event, 'apply')"
    />

    <BaseTableFooter
      v-model="page"
      :showing-from="showingFrom"
      :showing-to="showingTo"
      :total-items="totalRecords"
      :total-pages="lastPage"
      item-label="correction requests"
    />

    <Teleport to="body">
      <div
        v-if="selected && action"
        class="review-overlay"
        @click.self="closeAction"
      >
        <article class="review-modal">
          <header class="review-modal-heading">
            <h2>
              {{
                action === 'approve'
                  ? 'Approve Correction'
                  : action === 'apply'
                    ? 'Apply to Time Log'
                    : 'Reject Correction'
              }}
            </h2>
            <button type="button" @click="closeAction"><X :size="18" /></button>
          </header>

          <div class="review-modal-body">
            <p><strong>Employee Name:</strong> {{ selected.employeeName }}</p>
            <p><strong>Time In:</strong> {{ selected.originalTimeIn ?? '—' }}</p>
            <p><strong>Time Out:</strong> {{ selected.originalTimeOut ?? '—' }}</p>
            <p><strong>Requested Time:</strong> {{ selected.requestedTime ?? '—' }}</p>
            <p><strong>Status:</strong> {{ selected.status }}</p>
            <p><strong>Reason:</strong> {{ selected.reason }}</p>

            <p v-if="action === 'apply'" class="apply-warning">
              This action will update the employee's actual Time Log.
              The attendance values and calculated worked minutes may change.
              Confirm that the approved correction is accurate.
            </p>
            <label v-if="action !== 'apply'">
              Review Remarks
              <textarea
                v-model="reviewRemarks"
                rows="4"
                :placeholder="
                  action === 'reject'
                    ? 'Explain why the request is rejected...'
                    : 'Optional approval remarks...'
                "
              />
            </label>

            <p v-if="error" class="review-error">{{ error }}</p>
          </div>

          <footer class="review-modal-footer">
            <AppButton variant="secondary" :disabled="processing" @click="closeAction">
              Cancel
            </AppButton>
            <AppButton
              :disabled="
                processing || (action === 'reject' && reviewRemarks.trim().length < 5)
              "
              @click="submitDecision"
            >
              <LoaderCircle v-if="processing" :size="15" class="spinner" />
              {{ processing ? 'Saving...' : `Confirm ${action}` }}
            </AppButton>
          </footer>
        </article>
      </div>
    </Teleport>
    
    
<!-- NEW CORRECTION REQUEST MODAL -->
<Teleport to="body">
  <div
    v-if="showCreateModal"
    class="review-overlay"
    @click.self="!creating && (showCreateModal = false)"
  >
    <div
      class="review-modal correction-create-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-correction-title"
    >
      <!-- HEADER -->
      <div class="correction-create-header">
        <div class="correction-create-heading">
          <div class="correction-create-icon">
            <Clock3 :size="20" />
          </div>

          <div>
            <h2 id="create-correction-title">
              New Correction Request
            </h2>
            <p>
              Submit an attendance correction for review.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="correction-close-button"
          :disabled="creating"
          aria-label="Close correction form"
          @click="showCreateModal = false"
        >
          <X :size="18" />
        </button>
      </div>

      <form @submit.prevent="submitNewCorrection">
        <div class="correction-create-body">

          <!-- ATTENDANCE DETAILS -->
          <div class="correction-form-section">
            <div class="correction-section-heading">
              <span class="correction-section-number">01</span>

              <div>
                <h3>Attendance Record</h3>
                <p>Select the attendance record to correct.</p>
              </div>
            </div>

            <div class="correction-field">
              <label for="correction-log-id">
                Time Log ID
                <span class="required-mark">*</span>
              </label>

              <input
                id="correction-log-id"
                v-model.number="newCorrection.time_log_id"
                type="number"
                min="1"
                step="1"
                required
                placeholder="Enter existing Time Log ID"
                class="correction-input"
              >

              <p class="correction-field-hint">
                Use the database ID of an existing attendance record.
              </p>
            </div>
          </div>

          <div class="correction-section-divider" />

          <!-- CORRECTION DETAILS -->
          <div class="correction-form-section">
            <div class="correction-section-heading">
              <span class="correction-section-number">02</span>

              <div>
                <h3>Correction Details</h3>
                <p>Specify the attendance changes.</p>
              </div>
            </div>

            <div class="correction-form-grid">
              <div class="correction-field">
                <label for="correction-type">
                  Correction Type
                  <span class="required-mark">*</span>
                </label>

                <select
                  id="correction-type"
                  v-model="newCorrection.correction_type"
                  class="correction-input correction-select"
                >
                  <option value="time_in">
                    Time In
                  </option>

                  <option value="time_out">
                    Time Out
                  </option>

                  <option value="time_in_out">
                    Time In and Out
                  </option>

                  <option value="break_times">
                    Break Times
                  </option>
                </select>
              </div>

              <div class="correction-field">
                <label for="correction-priority">
                  Priority
                  <span class="required-mark">*</span>
                </label>

                <select
                  id="correction-priority"
                  v-model="newCorrection.priority"
                  class="correction-input correction-select"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <!-- REQUESTED TIMES -->
            <div class="correction-form-grid correction-time-grid">
              <div
                v-if="['time_in', 'time_in_out'].includes(newCorrection.correction_type)"
                class="correction-field"
              >
                <label for="correction-time-in">
                  Requested Time In
                  <span class="required-mark">*</span>
                </label>

                <input
                  id="correction-time-in"
                  v-model="newCorrection.requested_time_in"
                  type="time"
                  required
                  class="correction-input correction-time-input"
                >
              </div>

              <div
                v-if="['time_out', 'time_in_out'].includes(newCorrection.correction_type)"
                class="correction-field"
              >
                <label for="correction-time-out">
                  Requested Time Out
                  <span class="required-mark">*</span>
                </label>

                <input
                  id="correction-time-out"
                  v-model="newCorrection.requested_time_out"
                  type="time"
                  required
                  class="correction-input correction-time-input"
                >
              </div>

              <template v-if="newCorrection.correction_type === 'break_times'">
                <div class="correction-field">
                  <label for="correction-break-out">
                    Requested Break Out
                    <span class="required-mark">*</span>
                  </label>

                  <input
                    id="correction-break-out"
                    v-model="newCorrection.requested_break_out"
                    type="time"
                    required
                    class="correction-input correction-time-input"
                  >
                </div>

                <div class="correction-field">
                  <label for="correction-break-in">
                    Requested Break In
                    <span class="required-mark">*</span>
                  </label>

                  <input
                    id="correction-break-in"
                    v-model="newCorrection.requested_break_in"
                    type="time"
                    required
                    class="correction-input correction-time-input"
                  >
                </div>
              </template>
            </div>
          </div>

          <div class="correction-section-divider" />

          <!-- REASON -->
          <div class="correction-form-section">
            <div class="correction-section-heading">
              <span class="correction-section-number">03</span>

              <div>
                <h3>Reason for Correction</h3>
                <p>Explain why this correction is necessary.</p>
              </div>
            </div>

            <div class="correction-field">
              <label for="correction-reason">
                Reason
                <span class="required-mark">*</span>
              </label>

              <textarea
                id="correction-reason"
                v-model="newCorrection.reason"
                rows="4"
                minlength="10"
                maxlength="2000"
                required
                placeholder="Describe the attendance issue and provide the reason for requesting this correction..."
                class="correction-input correction-textarea"
              />

              <div class="correction-field-bottom">
                <span>Minimum 10 characters</span>
                <span>{{ newCorrection.reason.length }} / 2000</span>
              </div>
            </div>
          </div>

          <!-- ERROR -->
          <div
            v-if="createError"
            class="correction-create-error"
            role="alert"
          >
            <XCircle :size="16" />
            <span>{{ createError }}</span>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="correction-create-footer">
          <p class="correction-footer-note">
            <Clock3 :size="14" />
            Subject to authorized review and approval
          </p>

          <div class="correction-footer-actions">
            <button
              type="button"
              class="correction-cancel-button"
              :disabled="creating"
              @click="showCreateModal = false"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="correction-submit-button"
              :disabled="creating"
            >
              <LoaderCircle
                v-if="creating"
                :size="16"
                class="spinner"
              />

              <Check
                v-else
                :size="16"
              />

              {{ creating ? 'Submitting...' : 'Submit Request' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</Teleport>

  </section>
</template>

<style scoped>
.correction-review-page {
  max-width: 1660px;
  margin: 0 auto;
  color: var(--text-primary);
}

.loading-state {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 11px;
}

.review-error,
.review-success {
  margin-bottom: 12px;
  padding: 11px 12px;
  border-radius: 8px;
  font-size: 11px;
}

.review-error {
  background: var(--red-soft);
  color: var(--red);
}

.review-success {
  background: var(--green-soft);
  color: var(--green);
}

.spinner {
  animation: review-spin 1s linear infinite;
}

@keyframes review-spin {
  to { transform: rotate(360deg); }
}
</style>

<style>
.review-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(3, 11, 28, 0.72);
  backdrop-filter: blur(5px);
}

.review-modal {
  width: min(560px, 100%);
  max-height: 90vh;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
}

.review-modal-heading,
.review-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 15px 17px;
  border-bottom: 1px solid var(--border);
}

.review-modal-heading h2 {
  margin: 0;
  font-size: 15px;
}

.review-modal-heading button {
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.review-modal-body {
  padding: 17px;
  font-size: 11px;
  line-height: 1.65;
}

.review-modal-body label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 14px;
}

.review-modal-body textarea {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
}

.review-modal-footer {
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  border-bottom: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}


/* ============================================
   NEW CORRECTION REQUEST MODAL
============================================ */

.correction-create-modal {
  width: min(650px, 100%);
  max-height: min(90vh, 850px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
}

/* HEADER */

.correction-create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 19px 22px;
  border-bottom: 1px solid var(--border);
}

.correction-create-heading {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.correction-create-icon {
  display: flex;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: var(--primary-soft);
  color: var(--primary);
}

.correction-create-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.correction-create-heading p {
  margin: 5px 0 0;
  color: var(--text-secondary);
  font-size: 11px;
}

.correction-close-button {
  display: flex;
  width: 31px;
  height: 31px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  cursor: pointer;
}

.correction-close-button:hover {
  color: var(--text-primary);
  background: var(--primary-soft);
}

.correction-close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* FORM BODY */

.correction-create-modal form {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.correction-create-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 22px;
}

.correction-create-body::-webkit-scrollbar {
  width: 5px;
}

.correction-create-body::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: var(--border);
}

.correction-form-section {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.correction-section-heading {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.correction-section-number {
  display: inline-flex;
  width: 27px;
  height: 27px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
  font-weight: 700;
}

.correction-section-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
}

.correction-section-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.correction-section-divider {
  height: 1px;
  margin: 22px 0;
  background: var(--border);
}

/* FIELD GRID */

.correction-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.correction-time-grid {
  margin-top: 2px;
}

.correction-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.correction-field label {
  display: block;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.required-mark {
  margin-left: 2px;
  color: var(--red);
}

.correction-field-hint {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.5;
}

/* INPUTS */

.correction-create-modal .correction-input {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  box-shadow: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.correction-create-modal .correction-input::placeholder {
  color: var(--text-muted);
  opacity: 1;
}

.correction-create-modal .correction-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(36, 107, 253, 0.1);
}

/* SELECT */

.correction-create-modal .correction-select {
  appearance: none;
  padding-right: 36px;
  cursor: pointer;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2398a2b3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.correction-create-modal .correction-select option {
  background: var(--bg-card);
  color: var(--text-primary);
}

/* TIME INPUT */

.correction-create-modal .correction-time-input {
  color-scheme: light;
}

html.dark .correction-create-modal .correction-time-input {
  color-scheme: dark;
}

.correction-create-modal input[type="time"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
}

html.dark .correction-create-modal input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

/* TEXTAREA */

.correction-create-modal .correction-textarea {
  min-height: 105px;
  resize: vertical;
}

.correction-field-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--text-muted);
  font-size: 10px;
}

/* ERROR */

.correction-create-error {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 18px;
  padding: 12px;
  border: 1px solid var(--red);
  border-radius: 9px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 11px;
  line-height: 1.5;
}

.correction-create-error svg {
  flex-shrink: 0;
}

/* FOOTER */

.correction-create-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 22px;
  border-top: 1px solid var(--border);
  background: var(--bg-card);
}

.correction-footer-note {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
}

.correction-footer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
}

.correction-create-footer button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 14px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.correction-cancel-button {
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-secondary);
}

.correction-cancel-button:hover {
  color: var(--text-primary);
  border-color: var(--primary);
}

.correction-submit-button {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #ffffff;
}

.correction-submit-button:hover:not(:disabled) {
  background: var(--primary-dark);
}

.correction-create-footer button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* RESPONSIVE */

@media (max-width: 650px) {
  .correction-create-modal {
    max-height: 94vh;
    border-radius: 12px;
  }

  .correction-create-header {
    padding: 15px;
  }

  .correction-create-body {
    padding: 16px;
  }

  .correction-form-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .correction-create-footer {
    flex-direction: column;
    align-items: stretch;
    padding: 14px 16px;
  }

  .correction-footer-note {
    justify-content: center;
  }

  .correction-footer-actions {
    width: 100%;
  }

  .correction-footer-actions button {
    flex: 1;
  }
}
</style>
