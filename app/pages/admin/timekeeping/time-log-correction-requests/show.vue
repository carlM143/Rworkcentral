
<script setup lang="ts">
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  UserRound,
  X,
  XCircle,
} from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

useHead({
  title: 'Time Log Correction Details | RWorkCentral',
})

type CorrectionStatus =
  | 'pending'
  | 'approved'
  | 'applied'
  | 'rejected'
  | 'cancelled'

type ActionMode = 'approve' | 'reject' | 'apply'

interface CorrectionRecord {
  id: number
  time_log_id: number
  employee_id: number
  requested_by: number
  reviewed_by: number | null
  applied_by: number | null
  correction_type: 'time_in' | 'time_out'
  status: CorrectionStatus
  original_time_in: string | null
  original_time_out: string | null
  requested_time: string | null
  reason: string
  attachment_path: string | null
  review_remarks: string | null
  reviewed_at: string | null
  applied_at: string | null
  created_at: string
  updated_at: string

  employee?: {
    id: number
    emp_id?: string | null
    firstname?: string | null
    lastname?: string | null
  } | null

  requester?: {
    id?: number
    name?: string | null
    email?: string | null
  } | null

  reviewer?: {
    id?: number
    name?: string | null
    email?: string | null
  } | null

  applier?: {
    id?: number
    name?: string | null
    email?: string | null
  } | null

  time_log?: {
    id: number
    work_date?: string | null
  } | null
}

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()

const loading = ref(false)
const processing = ref(false)

const loadError = ref('')
const actionError = ref('')
const successMessage = ref('')

const request = ref<CorrectionRecord | null>(null)

const action = ref<ActionMode | null>(null)
const reviewRemarks = ref('')

const requestId = computed(() => {
  const raw = route.query.id
  const value = Number(
    Array.isArray(raw) ? raw[0] : raw
  )

  return Number.isSafeInteger(value) && value > 0
    ? value
    : null
})

const employeeName = computed(() => {
  const employee = request.value?.employee

  const name = [
    employee?.firstname,
    employee?.lastname,
  ].filter(Boolean).join(' ')

  return name ||
    `Employee #${request.value?.employee_id ?? '—'}`
})

const correctionType = computed(() => {
  return request.value?.correction_type === 'time_in'
    ? 'Time In'
    : 'Time Out'
})

const requestNumber = computed(() => {
  return request.value
    ? `TCR-${String(request.value.id).padStart(4, '0')}`
    : '—'
})

const actionTitle = computed(() => {
  switch (action.value) {
    case 'approve':
      return 'Approve Correction'
    case 'reject':
      return 'Reject Correction'
    case 'apply':
      return 'Apply to Time Log'
    default:
      return ''
  }
})

const actionDescription = computed(() => {
  switch (action.value) {
    case 'approve':
      return 'Approve this request for application to the employee attendance record.'
    case 'reject':
      return 'Reject this correction request. A reason is required.'
    case 'apply':
      return 'Apply the approved correction to the employee actual attendance record.'
    default:
      return ''
  }
})

const formatDate = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(
    `${value.slice(0, 10)}T12:00:00`
  )

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(
    value.replace(' ', 'T')
  )

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

const formatTime = (value?: string | null) => {
  if (!value) return '—'

  const match = value.match(
    /(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/
  )

  if (!match) return value

  const hour = Number(match[1])
  const minute = match[2]

  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23
  ) {
    return value
  }

  const period = hour >= 12 ? 'PM' : 'AM'

  return `${hour % 12 || 12}:${minute} ${period}`
}

const originalTime = computed(() => {
  if (!request.value) return '—'

  return request.value.correction_type === 'time_in'
    ? formatTime(request.value.original_time_in)
    : formatTime(request.value.original_time_out)
})

const loadRequest = async () => {
  if (!requestId.value) {
    request.value = null
    loadError.value = 'Invalid correction request ID.'
    return
  }

  loading.value = true
  loadError.value = ''

  try {
    const response = await $api<{
      success: boolean
      message?: string
      data: CorrectionRecord
    }>(
      `/admin/time-log-corrections/${requestId.value}`
    )

    request.value = response.data
  } catch (error: any) {
    request.value = null

    loadError.value =
      error?.data?.message ||
      error?.response?._data?.message ||
      error?.message ||
      'Unable to load correction request.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push(
    '/admin/timekeeping/time-log-correction-requests'
  )
}

const openAction = (mode: ActionMode) => {
  if (!request.value || processing.value) return

  const status = request.value.status

  if (mode === 'apply') {
    if (status !== 'approved') return
  } else {
    if (status !== 'pending') return
  }

  action.value = mode
  reviewRemarks.value = ''
  actionError.value = ''
  successMessage.value = ''
}

const closeAction = () => {
  if (processing.value) return

  action.value = null
  reviewRemarks.value = ''
  actionError.value = ''
}

const submitAction = async () => {
  if (
    !request.value ||
    !action.value ||
    processing.value
  ) {
    return
  }

  const mode = action.value

  if (
    mode === 'reject' &&
    reviewRemarks.value.trim().length < 5
  ) {
    actionError.value =
      'Please provide at least 5 characters for the rejection reason.'
    return
  }

  if (
    mode === 'apply'
      ? request.value.status !== 'approved'
      : request.value.status !== 'pending'
  ) {
    actionError.value =
      'This action is no longer available for the current status.'
    return
  }

  processing.value = true
  actionError.value = ''

  try {
    const endpoint =
      `/admin/time-log-corrections/${request.value.id}/${mode}`

    const response = await $api<{
      success: boolean
      message?: string
    }>(endpoint, {
      method: mode === 'apply' ? 'POST' : 'PATCH',

      ...(mode !== 'apply'
        ? {
            body: {
              review_remarks:
                reviewRemarks.value.trim() || undefined,
            },
          }
        : {}),
    })

    if (!response.success) {
      throw new Error(
        response.message ||
        'Unable to process correction request.'
      )
    }

    successMessage.value =
      response.message ||
      (
        mode === 'approve'
          ? 'Request approved. Waiting to be applied.'
          : mode === 'reject'
            ? 'Correction request rejected.'
            : 'Correction successfully applied to employee time log.'
      )

    action.value = null
    reviewRemarks.value = ''

    await loadRequest()
  } catch (error: any) {
    const validationErrors = error?.data?.errors

    actionError.value = validationErrors
      ? Object.values(validationErrors).flat().join(' ')
      : error?.data?.message ||
        error?.response?._data?.message ||
        error?.message ||
        'Unable to process correction request.'
  } finally {
    processing.value = false
  }
}

onMounted(loadRequest)

watch(
  () => route.query.id,
  () => {
    closeAction()
    successMessage.value = ''
    loadRequest()
  }
)
</script>

<template>
  <section class="correction-details-page">

    <!-- Back -->
    <button
      type="button"
      class="back-link"
      @click="goBack"
    >
      <ArrowLeft :size="17" />
      Back to Correction Requests
    </button>

    <!-- Header -->
    <header class="page-header">
      <div>
        <p class="eyebrow">
          <Clock3 :size="14" />
          Timekeeping / Request Details
        </p>

        <h1>Time Log Correction Details</h1>

        <p>
          Review submitted attendance values
          and manage correction requests.
        </p>
      </div>

      <StatusBadge
        v-if="request"
        :status="request.status"
      />
    </header>

    <!-- Success -->
    <div
      v-if="successMessage"
      class="feedback success-feedback"
      role="status"
    >
      <CheckCircle2 :size="17" />
      {{ successMessage }}
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="message-card"
      role="status"
    >
      <RefreshCw
        :size="18"
        class="spin"
      />
      Loading correction request...
    </div>

    <!-- Error -->
    <div
      v-else-if="loadError"
      class="message-card error-card"
      role="alert"
    >
      <AlertTriangle :size="18" />

      <span>{{ loadError }}</span>

      <button
        v-if="requestId"
        type="button"
        class="secondary-button"
        @click="loadRequest"
      >
        Retry
      </button>
    </div>

    <template v-else-if="request">

      <!-- Request Information -->
      <article class="details-card">
        <div class="card-heading">
          <UserRound :size="18" />

          <div>
            <h2>Request Information</h2>
            <p>Employee and filing details</p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span>Request Number</span>
            <strong>{{ requestNumber }}</strong>
          </div>

          <div class="info-item">
            <span>Request Record ID</span>
            <strong>{{ request.id }}</strong>
          </div>

          <div class="info-item">
            <span>Employee Name</span>
            <strong>{{ employeeName }}</strong>
          </div>

          <div class="info-item">
            <span>Employee ID</span>
            <strong>
              {{ request.employee?.emp_id || '—' }}
            </strong>
          </div>

          <div class="info-item">
            <span>Requested By</span>
            <strong>
              {{
                request.requester?.name ||
                `User #${request.requested_by}`
              }}
            </strong>
          </div>

          <div class="info-item">
            <span>Requester Email</span>
            <strong>
              {{ request.requester?.email || '—' }}
            </strong>
          </div>

          <div class="info-item">
            <span>Date Submitted</span>
            <strong>
              {{ formatDateTime(request.created_at) }}
            </strong>
          </div>

          <div class="info-item">
            <span>Status</span>
            <strong class="capitalize">
              {{ request.status }}
            </strong>
          </div>
        </div>
      </article>

      <!-- Attendance Correction -->
      <article class="details-card">
        <div class="card-heading">
          <CalendarDays :size="18" />

          <div>
            <h2>Attendance Correction</h2>
            <p>Original values and requested change</p>
          </div>
        </div>

        <div class="schedule-grid">
          <div class="schedule-item">
            <span>Attendance Date</span>
            <strong>
              {{ formatDate(request.time_log?.work_date) }}
            </strong>
          </div>

          <div class="schedule-item">
            <span>Correction Type</span>
            <strong>{{ correctionType }}</strong>
          </div>

          <div class="schedule-item">
            <span>Time Log ID</span>
            <strong>{{ request.time_log_id }}</strong>
          </div>

          <div class="schedule-item">
            <span>Original Time In</span>
            <strong>
              {{ formatTime(request.original_time_in) }}
            </strong>
          </div>

          <div class="schedule-item">
            <span>Original Time Out</span>
            <strong>
              {{ formatTime(request.original_time_out) }}
            </strong>
          </div>

          <div class="schedule-item emphasis">
            <span>Requested {{ correctionType }}</span>
            <strong>
              {{ formatTime(request.requested_time) }}
            </strong>
          </div>
        </div>

        <div class="correction-summary">
          <span>Correction Summary</span>

          <div class="summary-comparison">
            <strong>
              {{ originalTime }}
            </strong>

            <span class="summary-arrow">→</span>

            <strong class="new-time">
              {{ formatTime(request.requested_time) }}
            </strong>
          </div>

          <small>
            {{ correctionType }} correction for
            {{ formatDate(request.time_log?.work_date) }}
          </small>
        </div>
      </article>

      <!-- Reason -->
      <article class="details-card">
        <div class="card-heading">
          <FileText :size="18" />

          <div>
            <h2>Reason &amp; Attachment</h2>
            <p>Employee explanation and supporting record</p>
          </div>
        </div>

        <div class="text-section">
          <span>Reason</span>
          <p>{{ request.reason || '—' }}</p>
        </div>

        <div class="text-section">
          <span>Attachment</span>
          <p>{{ request.attachment_path || '—' }}</p>
        </div>
      </article>

      <!-- Review Information -->
      <article class="details-card">
        <div class="card-heading">
          <ShieldCheck :size="18" />

          <div>
            <h2>Review Information</h2>
            <p>Reviewer, decision date and remarks</p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span>Reviewed By</span>
            <strong>
              {{ request.reviewer?.name || '—' }}
            </strong>
          </div>

          <div class="info-item">
            <span>Reviewer Email</span>
            <strong>
              {{ request.reviewer?.email || '—' }}
            </strong>
          </div>

          <div class="info-item">
            <span>Reviewed At</span>
            <strong>
              {{ formatDateTime(request.reviewed_at) }}
            </strong>
          </div>

          <div class="info-item">
            <span>Last Updated</span>
            <strong>
              {{ formatDateTime(request.updated_at) }}
            </strong>
          </div>
        </div>

        <div class="text-section review-remarks">
          <span>Review Remarks</span>
          <p>{{ request.review_remarks || '—' }}</p>
        </div>
      </article>

      <!-- Application Information -->
      <article class="details-card">
        <div class="card-heading">
          <PlayCircle :size="18" />

          <div>
            <h2>Application Information</h2>
            <p>Attendance update tracking</p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span>Applied By</span>
            <strong>
              {{
                request.applier?.name ||
                (
                  request.applied_by
                    ? `User #${request.applied_by}`
                    : '—'
                )
              }}
            </strong>
          </div>

          <div class="info-item">
            <span>Applied At</span>
            <strong>
              {{ formatDateTime(request.applied_at) }}
            </strong>
          </div>

          <div class="info-item">
            <span>Application Status</span>

            <strong>
              {{
                request.status === 'applied'
                  ? 'Applied to Time Log'
                  : request.status === 'approved'
                    ? 'Waiting for Application'
                    : 'Not Applied'
              }}
            </strong>
          </div>

          <div class="info-item">
            <span>Time Log Reference</span>
            <strong>
              #{{ request.time_log_id }}
            </strong>
          </div>
        </div>
      </article>

      <!-- Action Footer -->
      <footer class="action-bar">
        <div class="action-note">
          <ShieldCheck :size="17" />

          <span v-if="request.status === 'pending'">
            This request is awaiting Admin review.
          </span>

          <span v-else-if="request.status === 'approved'">
            Approved request. Attendance has not yet been updated.
          </span>

          <span v-else-if="request.status === 'applied'">
            This correction has been applied to the employee's time log.
          </span>

          <span v-else>
            This request has been {{ request.status }}.
          </span>
        </div>

        <div class="action-buttons">
          <button
            type="button"
            class="secondary-button"
            @click="goBack"
          >
            <ArrowLeft :size="15" />
            Back to Requests
          </button>

          <template v-if="request.status === 'pending'">
            <button
              type="button"
              class="decision-button reject-button"
              @click="openAction('reject')"
            >
              <XCircle :size="16" />
              Reject
            </button>

            <button
              type="button"
              class="decision-button approve-button"
              @click="openAction('approve')"
            >
              <CheckCircle2 :size="16" />
              Approve
            </button>
          </template>

          <button
            v-if="request.status === 'approved'"
            type="button"
            class="decision-button apply-button"
            @click="openAction('apply')"
          >
            <PlayCircle :size="16" />
            Apply to Time Log
          </button>
        </div>
      </footer>
    </template>

    <!-- Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="action && request"
        class="action-overlay"
        @click.self="closeAction"
      >
        <article
          class="action-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="actionTitle"
        >
          <header class="modal-header">
            <div class="modal-title">
              <div
                class="modal-icon"
                :class="action"
              >
                <CheckCircle2
                  v-if="action === 'approve'"
                  :size="20"
                />

                <XCircle
                  v-else-if="action === 'reject'"
                  :size="20"
                />

                <PlayCircle
                  v-else
                  :size="20"
                />
              </div>

              <div>
                <h2>{{ actionTitle }}</h2>
                <p>{{ actionDescription }}</p>
              </div>
            </div>

            <button
              type="button"
              class="modal-close"
              :disabled="processing"
              @click="closeAction"
            >
              <X :size="18" />
            </button>
          </header>

          <div class="modal-body">

            <div class="modal-details">
              <div>
                <span>Employee</span>
                <strong>{{ employeeName }}</strong>
              </div>

              <div>
                <span>Request Number</span>
                <strong>{{ requestNumber }}</strong>
              </div>

              <div>
                <span>Attendance Date</span>
                <strong>
                  {{ formatDate(request.time_log?.work_date) }}
                </strong>
              </div>

              <div>
                <span>Correction Type</span>
                <strong>{{ correctionType }}</strong>
              </div>

              <div>
                <span>Original Time</span>
                <strong>{{ originalTime }}</strong>
              </div>

              <div>
                <span>Requested Time</span>
                <strong class="requested-time">
                  {{ formatTime(request.requested_time) }}
                </strong>
              </div>
            </div>

            <div
              v-if="action === 'apply'"
              class="modal-notice apply-notice"
            >
              <AlertTriangle :size="17" />

              <p>
                Applying this correction will update the
                employee's actual attendance record and
                recalculate applicable timekeeping values.
                This is separate from approval.
              </p>
            </div>

            <div
              v-else-if="action === 'approve'"
              class="modal-notice approve-notice"
            >
              <ShieldCheck :size="17" />

              <p>
                Approving this request will not update
                the employee's attendance yet. You must
                apply the correction separately.
              </p>
            </div>

            <label
              v-if="action !== 'apply'"
              class="remarks-field"
            >
              <span>
                Review Remarks
                <small>
                  {{
                    action === 'reject'
                      ? '(Required)'
                      : '(Optional)'
                  }}
                </small>
              </span>

              <textarea
                v-model="reviewRemarks"
                rows="4"
                :disabled="processing"
                :placeholder="
                  action === 'reject'
                    ? 'Enter the reason for rejecting this request...'
                    : 'Enter optional approval remarks...'
                "
              />
            </label>

            <div
              v-if="actionError"
              class="modal-error"
              role="alert"
            >
              <AlertTriangle :size="16" />
              <span>{{ actionError }}</span>
            </div>
          </div>

          <footer class="modal-footer">
            <button
              type="button"
              class="secondary-button"
              :disabled="processing"
              @click="closeAction"
            >
              Cancel
            </button>

            <button
              type="button"
              class="decision-button"
              :class="{
                'approve-button': action === 'approve',
                'reject-button': action === 'reject',
                'apply-button': action === 'apply',
              }"
              :disabled="
                processing ||
                (
                  action === 'reject' &&
                  reviewRemarks.trim().length < 5
                )
              "
              @click="submitAction"
            >
              <LoaderCircle
                v-if="processing"
                :size="16"
                class="spin"
              />

              <template v-else>
                <CheckCircle2
                  v-if="action === 'approve'"
                  :size="16"
                />

                <XCircle
                  v-else-if="action === 'reject'"
                  :size="16"
                />

                <PlayCircle
                  v-else
                  :size="16"
                />
              </template>

              {{
                processing
                  ? 'Processing...'
                  : action === 'approve'
                    ? 'Confirm Approval'
                    : action === 'reject'
                      ? 'Confirm Rejection'
                      : 'Confirm Apply'
              }}
            </button>
          </footer>
        </article>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.correction-details-page {
  max-width: 1280px;
  margin: 0 auto;
  padding-bottom: 26px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0;
  margin-bottom: 17px;
  border: 0;
  background: transparent;
  color: var(--primary);
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 19px;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 6px;
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.page-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
  line-height: 1.25;
}

.page-header p:not(.eyebrow) {
  margin: 7px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.details-card {
  min-width: 0;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 66px;
  padding: 15px 18px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--primary);
}

.card-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 17px;
}

.card-heading p {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 22px;
  padding: 7px 18px 12px;
}

.info-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  padding: 13px 0;
  border-bottom: 1px solid var(--border-soft);
}

.info-item span,
.schedule-item span,
.text-section span,
.correction-summary > span {
  color: var(--text-muted);
  font-size: 12px;
}

.info-item strong,
.schedule-item strong {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 650;
  overflow-wrap: anywhere;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 18px;
}

.schedule-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.schedule-item strong {
  font-size: 17px;
}

.schedule-item.emphasis {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.schedule-item.emphasis strong {
  color: var(--primary);
}

.correction-summary {
  margin: 0 18px 18px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.summary-comparison {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
  font-size: 17px;
}

.summary-comparison strong {
  color: var(--text-primary);
}

.summary-comparison .new-time {
  color: var(--primary);
}

.summary-arrow {
  color: var(--text-muted);
}

.correction-summary small {
  display: block;
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 11px;
}

.text-section {
  margin: 18px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.text-section p {
  margin: 7px 0 0;
  white-space: pre-wrap;
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.review-remarks {
  margin-top: 0;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.action-note {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--text-muted);
  font-size: 12px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
}

.secondary-button,
.decision-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 39px;
  padding: 0 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: .15s ease;
}

.secondary-button {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.secondary-button:hover {
  background: var(--border-soft);
}

.approve-button {
  border-color: #15803d;
  background: #15803d;
  color: white;
}

.approve-button:hover {
  background: #166534;
}

.reject-button {
  border-color: #dc2626;
  background: #dc2626;
  color: white;
}

.reject-button:hover {
  background: #b91c1c;
}

.apply-button {
  border-color: #2563eb;
  background: #2563eb;
  color: white;
}

.apply-button:hover {
  background: #1d4ed8;
}

.secondary-button:disabled,
.decision-button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.feedback {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 15px;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 12px;
}

.success-feedback {
  color: var(--green, #16a34a);
  background: var(--green-soft, #dcfce7);
}

.message-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 130px;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px;
}

.error-card {
  color: var(--red);
}

.capitalize {
  text-transform: capitalize;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .info-grid,
  .schedule-grid {
    grid-template-columns: 1fr;
  }

  .action-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .action-buttons {
    width: 100%;
  }

  .action-buttons > button {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none;
  }
}
</style>

<style>
.action-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(3, 11, 28, .72);
  backdrop-filter: blur(5px);
}

.action-modal {
  width: min(580px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 25px 70px rgba(0, 0, 0, .25);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 19px;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.modal-icon {
  display: flex;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.modal-icon.approve {
  background: #dcfce7;
  color: #15803d;
}

.modal-icon.reject {
  background: #fee2e2;
  color: #dc2626;
}

.modal-icon.apply {
  background: #dbeafe;
  color: #2563eb;
}

.modal-title h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
}

.modal-title p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-close:hover {
  background: var(--bg-card-soft);
}

.modal-body {
  padding: 19px;
}

.modal-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.modal-details > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.modal-details span {
  color: var(--text-muted);
  font-size: 10px;
}

.modal-details strong {
  color: var(--text-primary);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.modal-details .requested-time {
  color: var(--primary);
  font-size: 14px;
}

.modal-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 15px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
}

.modal-notice svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.modal-notice p {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
}

.apply-notice svg {
  color: #d97706;
}

.approve-notice svg {
  color: var(--primary);
}

.remarks-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 18px;
}

.remarks-field > span {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 650;
}

.remarks-field small {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 400;
}

.remarks-field textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
  resize: vertical;
}

.remarks-field textarea:focus {
  border-color: var(--primary);
}

.modal-error {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid #dc262640;
  border-radius: 8px;
  background: var(--red-soft, #fee2e2);
  color: var(--red, #dc2626);
  font-size: 12px;
  line-height: 1.6;
}

.modal-error svg {
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 19px;
  border-top: 1px solid var(--border);
}

@media (max-width: 540px) {
  .modal-details {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .modal-footer > button {
    width: 100%;
  }
}
</style>
