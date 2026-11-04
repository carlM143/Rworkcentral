<script setup lang="ts">
import { LoaderCircle, X } from 'lucide-vue-next'

import type {
  TimeCorrectionStatus,
  TimeLogCorrectionRequest,
} from '~/types/timeLogCorrection'

definePageMeta({ layout: 'admin' })

interface ApiCorrection {
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
const records = ref<ApiCorrection[]>([])
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

const employeeName = (item: ApiCorrection) => {
  const name = [item.employee?.firstname, item.employee?.lastname]
    .filter(Boolean)
    .join(' ')

  return name || `Employee #${item.employee?.id ?? '—'}`
}

const formatClock = (value?: string | null) => {
  if (!value) return undefined

  const match = value.match(/(?:T|\s)?(\d{2}):(\d{2})/)
  if (!match) return undefined

  const hour = Number(match[1])
  const minute = match[2]
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12

  return `${displayHour}:${minute} ${suffix}`
}

const statusLabel = (status: ApiCorrection['status']): TimeCorrectionStatus =>
  `${status.charAt(0).toUpperCase()}${status.slice(1)}` as TimeCorrectionStatus

const displayRequests = computed<TimeLogCorrectionRequest[]>(() =>
  records.value.map(item => ({
    id: item.id,
    timeLogId: item.time_log_id,
    requestNumber: `TCR-${String(item.id).padStart(4, '0')}`,
    employeeId: item.employee?.id ?? 0,
    employeeNumber: item.employee?.emp_id || '—',
    employeeName: employeeName(item),
    department: item.employee?.department?.name || '—',
    position: item.employee?.position?.name || '—',
    attendanceDate:
      item.time_log?.work_date?.slice(0, 10) ||
      item.original_time_in?.slice(0, 10) ||
      item.created_at.slice(0, 10),
    correctionType: item.correction_type === 'time_in' ? 'Time In' : 'Time Out',
    originalTimeIn: formatClock(item.original_time_in),
    originalTimeOut: formatClock(item.original_time_out),
    requestedTime: formatClock(item.requested_time),
    reason: item.reason,
    attachment: item.attachment_path
      ? { name: item.attachment_path.split('/').at(-1) || 'Attachment' }
      : undefined,
    status: statusLabel(item.status),
    requestedAt: item.created_at,
    requestedBy: item.requester?.name || employeeName(item),
    reviewedBy: item.reviewer?.name || undefined,
    reviewedAt: item.reviewed_at || undefined,
    reviewNotes: item.review_remarks || undefined,
    appliedAt: item.applied_at || undefined,
    appliedBy: item.applier?.name || undefined,
  })),
)

const showingFrom = computed(() =>
  totalRecords.value && records.value.length ? (page.value - 1) * 15 + 1 : 0,
)

const showingTo = computed(() =>
  Math.min(showingFrom.value + records.value.length - 1, totalRecords.value),
)

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

    message.value =
      response.message ||
      (decision === 'approve'
        ? 'Correction approved. Waiting to be applied.'
        : decision === 'apply'
          ? 'Correction applied to employee time log.'
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
    />

    <TimeCorrectionStats :stats="stats" />

    <TimeCorrectionFilters
      v-model:search="search"
      v-model:status="statusFilter"
      :loading="loading"
      @refresh="fetchRecords"
      @reset="resetFilters"
    />

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
</style>