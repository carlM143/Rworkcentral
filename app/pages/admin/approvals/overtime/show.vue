<script setup lang="ts">
import { AlertTriangle, ArrowLeft, Check, Clock3, RefreshCw, RotateCcw, ShieldCheck, Timer, UserRound, X } from 'lucide-vue-next'
import { useOvertimeApprovals } from '~/composables/admin/approvals/useOvertimeApprovals'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Overtime Request Details | RWorkCentral' })

const route = useRoute()
const router = useRouter()
const { success, warning } = useToast()
const { requests, loading, loadError, approvingId, loadRequests, approveRequest, rejectRequest, revertRequest } = useOvertimeApprovals()

const requestId = computed(() => {
  const raw = route.query.id
  const value = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isSafeInteger(value) && value > 0 ? value : null
})
const request = computed(() => requests.value.find(item => item.id === requestId.value) ?? null)
const processing = computed(() => approvingId.value === requestId.value)
const loadDetail = async () => { if (requestId.value) await loadRequests() }
onMounted(() => { void loadDetail() })
watch(() => route.query.id, () => { void loadDetail() })

const goBack = () => router.push('/admin/approvals/overtime')
const apiError = (problem: any) => problem?.data?.errors?.status?.[0]
  ?? problem?.data?.errors?.end_at?.[0]
  ?? problem?.data?.message
  ?? problem?.response?._data?.message
  ?? problem?.message
  ?? 'Unable to process the overtime request.'

const approve = async () => {
  if (!request.value || processing.value) return
  try { success('Overtime Approved', await approveRequest(request.value.id)) }
  catch (problem: any) { warning('Approval Failed', apiError(problem)) }
}
const reject = async () => {
  if (!request.value || processing.value) return
  try { success('Overtime Rejected', await rejectRequest(request.value.id)) }
  catch (problem: any) { warning('Rejection Failed', apiError(problem)) }
}
const revert = async () => {
  if (!request.value || processing.value) return
  if (!window.confirm('Undo this overtime decision and return it to Pending?')) return
  try { success('Overtime Reverted', await revertRequest(request.value.id)) }
  catch (problem: any) { warning('Undo Failed', apiError(problem)) }
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}
const formatDateTime = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}
const formatTime = (value?: string) => {
  if (!value) return '—'
  const match = value.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/)
  if (!match) return value
  const hour = Number(match[1])
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return value
  return `${hour % 12 || 12}:${match[2]} ${hour >= 12 ? 'PM' : 'AM'}`
}
const durationLabel = (hours?: number) => {
  const totalMinutes = Math.round(Number(hours || 0) * 60)
  const wholeHours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return [wholeHours ? `${wholeHours} hour${wholeHours === 1 ? '' : 's'}` : '', minutes ? `${minutes} minute${minutes === 1 ? '' : 's'}` : ''].filter(Boolean).join(' ') || '0 minutes'
}
const durationMinutes = computed(() => Math.round(Number(request.value?.requestedHours || 0) * 60))
</script>

<template>
  <section class="overtime-details-page">
    <button type="button" class="back-link" :disabled="processing" @click="goBack"><ArrowLeft :size="17" /> Back to Overtime Approvals</button>
    <header class="page-header">
      <div><p class="eyebrow"><Timer :size="14" /> Overtime Approvals / Request Details</p><h1>Overtime Request Details</h1><p>Review the employee overtime schedule, duration and justification.</p></div>
      <span v-if="request" class="status-pill" :class="request.status.toLowerCase().replace(/\s+/g, '-')"><span class="status-dot" />{{ request.status }}</span>
    </header>

    <div v-if="loading" class="message-card" role="status"><RefreshCw :size="18" class="spin" /> Loading overtime request...</div>
    <div v-else-if="loadError" class="message-card error-card" role="alert"><AlertTriangle :size="18" /><span>{{ loadError }}</span><button type="button" class="secondary-button" @click="loadDetail">Retry</button></div>
    <div v-else-if="!request" class="message-card"><AlertTriangle :size="18" />{{ requestId ? 'Overtime request not found.' : 'Invalid overtime request ID.' }}</div>

    <template v-else>
      <article class="details-card">
        <div class="card-heading"><UserRound :size="18" /><div><h2>Request Information</h2><p>Employee, filing and employment details</p></div></div>
        <div class="info-grid">
          <div class="info-item"><span>Request Number</span><strong>{{ request.requestNumber }}</strong></div>
          <div class="info-item"><span>Date Filed</span><strong>{{ formatDateTime(request.filedAt) }}</strong></div>
          <div class="info-item"><span>Employee Name</span><strong>{{ request.employeeName }}</strong></div>
          <div class="info-item"><span>Employee ID</span><strong>{{ request.employeeNumber || '—' }}</strong></div>
          <div class="info-item"><span>Department</span><strong>{{ request.department || '—' }}</strong></div>
          <div class="info-item"><span>Position / Designation</span><strong>{{ request.position || '—' }}</strong></div>
          <div class="info-item"><span>Overtime Date</span><strong>{{ formatDate(request.overtimeDate) }}</strong></div>
          <div class="info-item"><span>Approval Status</span><strong>{{ request.status }}</strong></div>
        </div>
      </article>

      <article class="details-card">
        <div class="card-heading"><Clock3 :size="18" /><div><h2>Overtime Schedule</h2><p>Requested start, end and total duration</p></div></div>
        <div class="schedule-grid">
          <div class="schedule-item"><span>Overtime From</span><strong>{{ formatTime(request.startTime) }}</strong></div>
          <div class="schedule-item"><span>Overtime To</span><strong>{{ formatTime(request.endTime) }}</strong></div>
          <div class="schedule-item emphasis"><span>Time Duration</span><strong>{{ durationLabel(request.requestedHours) }}</strong><small>{{ durationMinutes }} total minutes</small></div>
        </div>
      </article>

      <article class="details-card reason-card">
        <div class="card-heading"><Timer :size="18" /><div><h2>Reason &amp; Review</h2><p>Employee justification and approval information</p></div></div>
        <h3>Reason for Overtime</h3><p class="reason-text">{{ request.reason || 'No reason provided.' }}</p>
        <div v-if="request.reviewedBy || request.reviewedAt" class="review-details"><div><span>Reviewed By</span><strong>{{ request.reviewedBy || '—' }}</strong></div><div><span>Reviewed At</span><strong>{{ formatDateTime(request.reviewedAt) }}</strong></div></div>
        <div v-if="request.status !== 'Pending'" class="notice neutral"><ShieldCheck :size="18" /><div><strong>Request already processed</strong><p>This overtime request is currently {{ request.status.toLowerCase() }}.</p></div></div>
        <div v-else class="notice ready"><ShieldCheck :size="18" /><div><strong>Ready for Review</strong><p>Verify the overtime schedule and justification before approving or rejecting.</p></div></div>
      </article>

      <footer class="action-bar">
        <p>Approval decisions are submitted to the existing Laravel Overtime API.</p>
        <div class="footer-buttons">
          <button type="button" class="secondary-button" :disabled="processing" @click="goBack">Back</button>
          <button v-if="request.status === 'Approved' || request.status === 'Rejected'" type="button" class="revert-button" :disabled="processing" @click="revert"><RotateCcw :size="15" />{{ processing ? 'Processing...' : 'Undo / Revert' }}</button>
          <template v-if="request.status === 'Pending' || request.status === 'For Review'">
            <button type="button" class="reject-button" :disabled="processing" @click="reject"><X :size="16" />{{ processing ? 'Processing...' : 'Reject' }}</button>
            <button type="button" class="approve-button" :disabled="processing" @click="approve"><Check :size="16" />{{ processing ? 'Processing...' : 'Approve' }}</button>
          </template>
        </div>
      </footer>
    </template>
  </section>
</template>

<style scoped>
.overtime-details-page{max-width:1280px;margin:0 auto;padding-bottom:26px}.back-link{display:inline-flex;align-items:center;gap:7px;padding:0;margin-bottom:17px;border:0;background:transparent;color:var(--primary);font-size:13px;font-weight:650;cursor:pointer}.page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:19px}.eyebrow{display:flex;align-items:center;gap:7px;margin:0 0 6px;color:var(--primary);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}.page-header h1{margin:0;color:var(--text-primary);font-size:24px}.page-header p:not(.eyebrow){margin:7px 0 0;color:var(--text-secondary);font-size:13px}.status-pill{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:100px;font-size:12px;font-weight:700}.status-dot{width:6px;height:6px;border-radius:50%;background:currentColor}.status-pill.approved{background:var(--green-soft);color:var(--green)}.status-pill.pending,.status-pill.for-review{background:var(--orange-soft);color:var(--orange)}.status-pill.rejected,.status-pill.cancelled{background:var(--red-soft);color:var(--red)}.details-card{min-width:0;margin-bottom:16px;overflow:hidden;border:1px solid var(--border);border-radius:12px;background:var(--bg-card)}.card-heading{display:flex;align-items:center;gap:11px;min-height:66px;padding:15px 18px;border-bottom:1px solid var(--border-soft);color:var(--primary)}.card-heading h2{margin:0;color:var(--text-primary);font-size:17px}.card-heading p{margin:4px 0 0;color:var(--text-secondary);font-size:12px}.info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 22px;padding:7px 18px 12px}.info-item{display:flex;flex-direction:column;gap:6px;padding:13px 0;border-bottom:1px solid var(--border-soft)}.info-item span,.schedule-item span,.review-details span{color:var(--text-muted);font-size:12px}.info-item strong,.schedule-item strong,.review-details strong{color:var(--text-primary);font-size:13px;font-weight:650}.schedule-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:18px}.schedule-item{display:flex;flex-direction:column;gap:7px;padding:15px;border:1px solid var(--border);border-radius:9px;background:var(--bg-card-soft)}.schedule-item strong{font-size:18px}.schedule-item small{color:var(--text-muted);font-size:11px}.schedule-item.emphasis{border-color:var(--primary);background:var(--primary-soft)}.reason-card{padding-bottom:16px}.reason-card>h3{margin:18px 18px 8px;color:var(--text-primary);font-size:13px}.reason-text{margin:0 18px 18px;white-space:pre-wrap;color:var(--text-secondary);font-size:13px;line-height:1.7}.review-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 18px 18px}.review-details div{display:flex;flex-direction:column;gap:6px;padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-card-soft)}.notice{display:flex;align-items:flex-start;gap:10px;padding:13px;margin:0 18px;border:1px solid var(--border);border-radius:9px}.notice strong{display:block;font-size:13px}.notice p{margin:5px 0 0;font-size:12px}.notice.ready{background:var(--green-soft);color:var(--green)}.notice.neutral{background:var(--bg-card-soft);color:var(--text-secondary)}.action-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:15px 18px;border:1px solid var(--border);border-radius:11px;background:var(--bg-card)}.action-bar p{margin:0;color:var(--text-muted);font-size:12px}.footer-buttons{display:flex;gap:9px;flex-wrap:wrap}.footer-buttons button,.secondary-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:39px;padding:0 14px;border:1px solid var(--border);border-radius:8px;font:inherit;font-size:12px;font-weight:700;cursor:pointer}.secondary-button{background:var(--bg-card-soft);color:var(--text-primary)}.approve-button{background:var(--green);border-color:var(--green)!important;color:#fff}.reject-button{background:var(--red-soft);border-color:var(--red)!important;color:var(--red)}.revert-button{background:var(--orange-soft);border-color:var(--orange)!important;color:var(--orange)}button:disabled{opacity:.55;cursor:not-allowed}.message-card{display:flex;align-items:center;justify-content:center;gap:10px;min-height:130px;padding:24px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);color:var(--text-secondary);font-size:13px}.error-card{color:var(--red)}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:760px){.page-header{flex-direction:column}.info-grid,.schedule-grid,.review-details{grid-template-columns:1fr}.footer-buttons{width:100%}.footer-buttons button{flex:1}}
@media(prefers-reduced-motion:reduce){.spin{animation:none}}
</style>
