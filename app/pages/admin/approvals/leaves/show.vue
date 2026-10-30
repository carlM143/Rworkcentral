<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { AlertTriangle, ArrowLeft, CalendarDays, Check, ClipboardList, RefreshCw, RotateCcw, ShieldCheck, X } from 'lucide-vue-next'
import { useLeaveApprovals } from '~/composables/admin/approvals/useLeaveApprovals'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Leave Request Details | RWorkCentral' })

const route = useRoute()
const router = useRouter()
const {
  requests, selectedRequest, loading, loadError, approving, approvalProblem,
  loadRequests, openApproval, handleApprove, handleReject, handleRevert,
} = useLeaveApprovals()

const requestId = computed(() => {
  const raw = route.query.id
  const value = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isSafeInteger(value) && value > 0 ? value : null
})

const request = computed(() => selectedRequest.value)
const leaveStart = ref('')
const leaveEnd = ref('')

const toDateKey = (date: string | null | undefined) => (date || '').slice(0, 10)

watch(request, (item) => {
  if (!item) {
    leaveStart.value = ''
    leaveEnd.value = ''
    return
  }
  const sorted = [...(item.dates ?? [])].sort((a, b) => a.leave_date.localeCompare(b.leave_date))
  leaveStart.value = toDateKey(item.start || sorted[0]?.leave_date || item.request_date)
  leaveEnd.value = toDateKey(item.end || sorted[sorted.length - 1]?.leave_date || leaveStart.value)
}, { immediate: true })

const loadDetail = async () => {
  selectedRequest.value = null
  if (!requestId.value) return

  await loadRequests()
  if (loadError.value) return

  const found = requests.value.find(item => item.id === requestId.value)
  if (found) openApproval(found)
}

onMounted(() => { void loadDetail() })
watch(() => route.query.id, () => { void loadDetail() })

const goBack = () => router.push('/admin/approvals/leaves')

const approve = async () => {
  if (!request.value || approving.value || approvalProblem.value) return
  await handleApprove()
  // Existing composable clears selectedRequest only after a successful API call.
  if (!selectedRequest.value) await goBack()
}

const reject = async () => {
  if (!request.value || approving.value) return
  await handleReject()
  if (!selectedRequest.value) await goBack()
}

const revert = async () => {
  if (!request.value || approving.value) return
  if (!window.confirm('Undo this leave decision? Paid leave credits will be restored to the original credit cycle.')) return
  await handleRevert(request.value)
  if (!selectedRequest.value) await goBack()
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
      }).format(date)
}

const getDayName = (value: string | null | undefined) => {
  if (!value) return ''
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('en-PH', { weekday: 'long' }).format(date)
}

const payLabel = (value: string | null | undefined) => {
  if (value === 'paid') return 'Paid Leave'
  if (value === 'unpaid') return 'Unpaid Leave'
  if (value === 'mixed') return 'Mixed Leave'
  return 'Not specified'
}

const scheduledDates = computed(() => {
  const item = request.value
  if (!item) return []
  if (item.dates?.length) {
    return [...item.dates].sort((a, b) => a.leave_date.localeCompare(b.leave_date))
  }
  if (!leaveStart.value) return []
  return [{ id: 0, leave_date: leaveStart.value, day_type: 'whole_day', day_value: 1 }]
})

const totalScheduledDays = computed(() => {
  if (request.value?.total_days != null && Number(request.value.total_days) > 0) {
    return Number(request.value.total_days)
  }
  return scheduledDates.value.reduce((sum, d) => {
    const duration = Number(d.day_value)
    return sum + (duration > 0 ? duration : d.day_type === 'half_day' ? 0.5 : 1)
  }, 0)
})

</script>

<template>
  <section class="leave-details-page">
    <button type="button" class="back-link" :disabled="approving" @click="goBack">
      <ArrowLeft :size="17" /> Back to Leave Approvals
    </button>

    <header class="page-header">
      <div>
        <p class="eyebrow"><ClipboardList :size="14" /> Leave Approvals / Request Details</p>
        <h1>Leave Request Details</h1>
        <p>Review the leave request, selected dates and policy before making a decision.</p>
      </div>
      <span v-if="request" class="status-pill" :class="request.status">
        <span class="status-dot" />{{ request.status }}
      </span>
    </header>

    <div v-if="loading" class="message-card" role="status">
      <RefreshCw :size="18" class="spin" /> Loading leave request...
    </div>
    <div v-else-if="loadError" class="message-card error-card" role="alert">
      <AlertTriangle :size="18" />
      <span>{{ loadError }}</span>
      <button type="button" class="secondary-button" @click="loadDetail">Retry</button>
    </div>
    <div v-else-if="!request" class="message-card" role="status">
      <AlertTriangle :size="18" />
      {{ requestId ? 'Leave request not found.' : 'Invalid leave request ID.' }}
    </div>

    <template v-else>
      <article class="details-card request-card">
        <div class="card-heading">
          <ClipboardList :size="18" />
          <div>
            <h2>Request Information</h2>
            <p>Employee, application and filing details</p>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item"><span>Request Number</span><strong>{{ request.request_no }}</strong></div>
          <div class="info-item"><span>Leave Type</span><strong>{{ request.leave_type }}</strong></div>
          <div class="info-item"><span>Employee Name</span><strong>{{ request.employee?.name || 'Unknown Employee' }}</strong></div>
          <div class="info-item"><span>Employee ID</span><strong>{{ request.employee?.emp_id ?? '—' }}</strong></div>
          <div class="info-item"><span>Date Filed</span><strong>{{ formatDate(request.request_date) }}</strong></div>
          <div class="info-item"><span>Requested Payment</span><strong>{{ payLabel(request.requested_pay_type) }}</strong></div>
          <div class="info-item"><span>Start Date</span><strong>{{ formatDate(leaveStart) }}</strong></div>
          <div class="info-item"><span>End Date</span><strong>{{ formatDate(leaveEnd) }}</strong></div>
          <div class="info-item"><span>Total Leave Days</span><strong>{{ totalScheduledDays }} day{{ totalScheduledDays === 1 ? '' : 's' }}</strong></div>
          <div class="info-item"><span>Approval Status</span><strong class="capitalize">{{ request.status }}</strong></div>
        </div>
      </article>

      <article class="details-card schedule-card">
        <div class="card-heading">
          <CalendarDays :size="18" />
          <div>
            <h2>Leave Schedule</h2>
            <p>Employee-selected dates and day breakdown</p>
          </div>
        </div>
        <div class="schedule-content">
          <div class="scheduled-list">
            <h3>Scheduled Leave Days ({{ totalScheduledDays }} total)</h3>
            <p v-if="!scheduledDates.length" class="no-dates">No leave-date breakdown was provided.</p>
            <div v-else class="scheduled-days-grid">
              <div v-for="(day, index) in scheduledDates" :key="day.id || day.leave_date" class="scheduled-day">
                <div class="scheduled-day-title">
                  <strong>Day {{ index + 1 }} · {{ getDayName(day.leave_date) }}</strong>
                  <span class="day-type" :class="day.day_type === 'half_day' ? 'half' : 'whole'">
                    {{ day.day_type === 'half_day' ? 'Half Day (0.5)' : 'Whole Day (1.0)' }}
                  </span>
                </div>
                <span>{{ formatDate(day.leave_date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="details-card reason-card">
        <div class="card-heading"><ClipboardList :size="18" /><div><h2>Reason &amp; Review</h2><p>Employee explanation and policy validation</p></div></div>
        <h3>Reason for Leave</h3>
        <p class="reason-text">{{ request.reason || 'No reason provided.' }}</p>

        <div v-if="request.status !== 'pending'" class="notice neutral">
          <ShieldCheck :size="18" /><div><strong>Request already processed</strong><p>This leave request is currently {{ request.status }}.</p></div>
        </div>
        <div v-else-if="approvalProblem" class="notice blocked">
          <AlertTriangle :size="18" /><div><strong>Approval Cannot Proceed</strong><p>{{ approvalProblem }}</p></div>
        </div>
        <div v-else class="notice ready">
          <ShieldCheck :size="18" /><div><strong>Initial Policy Check Passed</strong><p>The frontend policy check passed. Laravel must still enforce eligibility and credit validation.</p></div>
        </div>
      </article>

      <footer class="action-bar">
        <p>Approval decisions are submitted to the existing Laravel Leave Approval API.</p>
        <div class="footer-buttons">
          <button type="button" class="secondary-button" :disabled="approving" @click="goBack">Back</button>

          <button
            v-if="request.status === 'approved' || request.status === 'rejected'"
            type="button"
            class="revert-button"
            :disabled="approving"
            @click="revert"
          >
            <RotateCcw :size="15" /> Undo / Revert
          </button>

          <template v-if="request.status === 'pending'">
            <button type="button" class="reject-button" :disabled="approving" @click="reject">
              <X :size="16" /> {{ approving ? 'Processing...' : 'Reject' }}
            </button>
            <button type="button" class="approve-button" :disabled="approving || !!approvalProblem" @click="approve">
              <Check :size="16" /> {{ approving ? 'Processing...' : 'Approve' }}
            </button>
          </template>
        </div>
      </footer>
    </template>
  </section>
</template>

<style scoped>
.leave-details-page { max-width: 1280px; margin: 0 auto; padding-bottom: 26px; }
.back-link { display: inline-flex; align-items: center; gap: 7px; padding: 0; margin-bottom: 17px; border: 0; background: transparent; color: var(--primary); font-size: 13px; font-weight: 650; cursor: pointer; }
.back-link:disabled { opacity: .5; cursor: not-allowed; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 19px; }
.eyebrow { display: flex; align-items: center; gap: 7px; margin: 0 0 6px; color: var(--primary); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
.page-header h1 { margin: 0; color: var(--text-primary); font-size: 24px; line-height: 1.25; }
.page-header p:not(.eyebrow) { margin: 7px 0 0; color: var(--text-secondary); font-size: 13px; }
.status-pill { display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; padding: 7px 12px; border-radius: 100px; text-transform: capitalize; font-size: 12px; font-weight: 700; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status-pill.approved { background: var(--green-soft); color: var(--green); }
.status-pill.pending { background: var(--orange-soft); color: var(--orange); }
.status-pill.rejected { background: var(--red-soft); color: var(--red); }
.status-pill.cancelled { background: var(--bg-card-soft); color: var(--text-secondary); }
.request-card { margin-bottom: 16px; }
.details-card { min-width: 0; overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.card-heading { display: flex; align-items: center; gap: 11px; min-height: 66px; padding: 15px 18px; border-bottom: 1px solid var(--border-soft); color: var(--primary); }
.card-heading h2 { margin: 0; color: var(--text-primary); font-size: 17px; }
.card-heading p { margin: 4px 0 0; color: var(--text-secondary); font-size: 12px; }
.info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 22px; padding: 7px 18px 12px; }
.info-item { display: flex; flex-direction: column; gap: 6px; min-width: 0; padding: 13px 0; border-bottom: 1px solid var(--border-soft); }
.info-item span { color: var(--text-muted); font-size: 12px; }
.info-item strong { color: var(--text-primary); font-size: 13px; font-weight: 650; overflow-wrap: anywhere; }
.capitalize { text-transform: capitalize; }
.schedule-card { margin-bottom: 16px; }
.schedule-content { padding: 18px; }
.scheduled-days-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.scheduled-list h3 { margin: 0 0 14px; color: var(--text-primary); font-size: 14px; }
.scheduled-day { display: flex; flex-direction: column; gap: 6px; padding: 12px; background: var(--bg-card-soft); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); font-size: 12px; }
.scheduled-day-title { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.scheduled-day strong { color: var(--text-primary); font-size: 13px; }
.day-type { padding: 4px 7px; border-radius: 5px; font-size: 11px; font-weight: 650; }
.day-type.whole { background: var(--green-soft); color: var(--green); }
.day-type.half { background: var(--orange-soft); color: var(--orange); }
.day-pay { color: var(--text-secondary); font-weight: 600; }
.no-dates { margin: 0; color: var(--text-muted); font-size: 12px; }
.reason-card { margin-bottom: 16px; padding-bottom: 16px; }
.reason-card > h3 { margin: 18px 18px 8px; color: var(--text-primary); font-size: 13px; }
.reason-text { margin: 0 18px 18px; white-space: pre-wrap; color: var(--text-secondary); font-size: 13px; line-height: 1.7; overflow-wrap: anywhere; }
.notice { display: flex; align-items: flex-start; gap: 10px; padding: 13px; margin: 0 18px; border: 1px solid var(--border); border-radius: 9px; }
.notice svg { flex-shrink: 0; }
.notice strong { display: block; font-size: 13px; }
.notice p { margin: 5px 0 0; font-size: 12px; line-height: 1.55; }
.notice.blocked { background: var(--red-soft); color: var(--red); }
.notice.ready { background: var(--green-soft); color: var(--green); }
.notice.neutral { background: var(--bg-card-soft); color: var(--text-secondary); }
.action-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 15px 18px; border: 1px solid var(--border); border-radius: 11px; background: var(--bg-card); }
.action-bar p { margin: 0; color: var(--text-muted); font-size: 12px; }
.footer-buttons { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.footer-buttons button, .secondary-button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 39px; padding: 0 14px; border: 1px solid var(--border); border-radius: 8px; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.secondary-button { background: var(--bg-card-soft); color: var(--text-primary); }
.approve-button { background: var(--green); border-color: var(--green) !important; color: white; }
.reject-button { background: var(--red-soft); border-color: var(--red) !important; color: var(--red); }
.revert-button { background: var(--orange-soft); border-color: var(--orange) !important; color: var(--orange); }
button:disabled { opacity: .55; cursor: not-allowed; }
.message-card { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 24px; min-height: 130px; border: 1px solid var(--border); border-radius: 10px; color: var(--text-secondary); background: var(--bg-card); font-size: 13px; }
.error-card { color: var(--red); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 960px) { .scheduled-days-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .page-header { flex-direction: column; }.info-grid { grid-template-columns: 1fr; }.schedule-content { padding: 13px; }.scheduled-days-grid { grid-template-columns: 1fr; }.footer-buttons { width: 100%; }.footer-buttons button { flex: 1; } }
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
</style>
