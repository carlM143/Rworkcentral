<script setup lang="ts">
import { CheckCircle2, X, XCircle } from 'lucide-vue-next'
import type { ObaImage, ObaRequestRecord } from '~/types/oba-request/obaRequest'

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  dept_head_approved: 'Dept. Head Approved',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}
const statusLabel = (value: string) => statusLabels[value] ?? value
const statusClass = (value: string) =>
  value === 'approved' ? 'green'
    : value === 'pending' ? 'orange'
      : value === 'dept_head_approved' ? 'blue'
        : value === 'rejected' ? 'red' : 'neutral'
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
const employeeNames = (record: ObaRequestRecord) =>
  (record.oba_employees ?? []).map(employee => employee.employee_name)

const props = defineProps<{
  request: ObaRequestRecord | null
  /** True while approve/reject is running for this request. */
  busy?: boolean
  /** Error from the last approve/reject attempt. */
  error?: string
  /** Open straight on the reject form (from the table's Reject action). */
  startWithReject?: boolean
}>()
const emit = defineEmits<{
  close: []
  approve: [id: number]
  reject: [id: number, reason: string]
}>()

const dialog = ref<HTMLDialogElement | null>(null)

const images = computed(() =>
  (props.request?.images ?? []).filter((img): img is ObaImage & { url: string } => Boolean(img.url)),
)

/* ---------------- HR actions ----------------
   Mirrors the backend rules:
   - approve: only after the department head approved
   - reject:  while pending or after the department head approved */
type Step = 'view' | 'approve' | 'reject'
const step = ref<Step>('view')
const reason = ref('')
const reasonError = ref('')

const canApprove = computed(() =>
  props.request?.status === 'dept_head_approved',
)
const canReject = computed(() =>
  props.request?.status === 'pending' || props.request?.status === 'dept_head_approved',
)

const resetStep = () => {
  step.value = 'view'
  reason.value = ''
  reasonError.value = ''
}

const submitReject = () => {
  if (!props.request) return
  const text = reason.value.trim()
  if (!text) {
    reasonError.value = 'Enter a reason for rejecting this request.'
    return
  }
  reasonError.value = ''
  emit('reject', props.request.id, text)
}

// New request opened: details view, or the reject form if asked for.
watch(() => props.request?.id, () => {
  resetStep()
  if (props.startWithReject && canReject.value) step.value = 'reject'
}, { immediate: true })

// Status changed after approve/reject: back to the details view.
watch(() => props.request?.status, (now, before) => {
  if (before && now !== before) resetStep()
})

watch(() => props.request, async request => {
  await nextTick()
  if (request && !dialog.value?.open) dialog.value?.showModal()
  if (!request && dialog.value?.open) dialog.value.close()
})

const close = () => {
  if (props.busy) return
  dialog.value?.close()
}

// Esc fires "cancel"; don't close while an action is running.
const onCancel = (event: Event) => {
  if (props.busy) event.preventDefault()
}
</script>

<template>
  <dialog ref="dialog" class="details-dialog" aria-label="OBA request details" @close="emit('close')" @cancel="onCancel" @click="($event.target === dialog) && close()">
    <template v-if="request">
      <div class="dialog-head">
        <div>
          <h2>{{ request.destination }}</h2>
          <p>#{{ request.id }} · Filed by {{ request.filer_name || '—' }}</p>
        </div>
        <div class="dialog-head-right">
          <span class="badge" :class="statusClass(request.status)">{{ statusLabel(request.status) }}</span>
          <button type="button" class="close-icon" aria-label="Close details" @click="close"><X :size="18" /></button>
        </div>
      </div>

      <dl class="detail-grid">
        <div><dt>Department</dt><dd>{{ request.department_name || '—' }}</dd></div>
        <div><dt>Date</dt><dd>{{ formatDate(request.date_request) }}</dd></div>
        <div><dt>Departure</dt><dd>{{ formatDateTime(request.time_from) }}</dd></div>
        <div><dt>Return</dt><dd>{{ formatDateTime(request.time_to) }}</dd></div>
        <div v-if="request.dept_head_acted_at"><dt>Dept. Head Acted</dt><dd>{{ formatDateTime(request.dept_head_acted_at) }}</dd></div>
        <div v-if="request.approver"><dt>{{ request.status === 'rejected' ? 'Rejected By' : 'Approved By' }}</dt><dd>{{ request.approver.name }}</dd></div>
        <div v-if="request.status === 'rejected' && request.rejection_reason" class="wide">
          <dt>Rejection Reason</dt><dd class="reason rejection">{{ request.rejection_reason }}</dd>
        </div>
        <div class="wide"><dt>Reason / Details</dt><dd class="reason">{{ request.reason }}</dd></div>
        <div class="wide">
          <dt>Employees ({{ employeeNames(request).length }})</dt>
          <dd class="chips"><span v-for="emp in request.oba_employees" :key="emp.id" class="chip">{{ emp.employee_name }}</span></dd>
        </div>
      </dl>

      <div class="images">
        <h3>Supporting Images</h3>
        <div v-if="images.length" class="thumbs">
          <a v-for="img in images" :key="img.id" :href="img.url" target="_blank" rel="noopener" class="thumb">
            <img :src="img.url" :alt="`Supporting image ${img.id}`">
          </a>
        </div>
        <p v-else class="muted">No supporting images attached.</p>
      </div>

      <p v-if="error" class="action-error" role="alert">{{ error }}</p>

      <!-- Approve: confirm step -->
      <div v-if="step === 'approve'" class="action-panel">
        <p class="action-text">
          Approve this OBA request for <strong>{{ employeeNames(request).length }}</strong> employee(s)? This is the final HR approval.
        </p>
        <div class="dialog-actions">
          <button type="button" class="close-button" :disabled="busy" @click="resetStep">Back</button>
          <button type="button" class="approve-button" :disabled="busy" @click="emit('approve', request.id)">
            <CheckCircle2 :size="15" /> {{ busy ? 'Approving…' : 'Confirm Approval' }}
          </button>
        </div>
      </div>

      <!-- Reject: reason form -->
      <div v-else-if="step === 'reject'" class="action-panel">
        <label class="reason-field">
          <span>Reason for rejection <em>*</em></span>
          <textarea
            v-model="reason"
            rows="3"
            maxlength="1000"
            placeholder="Explain why this request is rejected. The employee will see this."
            :disabled="busy"
          />
          <small>{{ reason.length }}/1000</small>
        </label>
        <p v-if="reasonError" class="action-error" role="alert">{{ reasonError }}</p>
        <div class="dialog-actions">
          <button type="button" class="close-button" :disabled="busy" @click="resetStep">Back</button>
          <button type="button" class="reject-button" :disabled="busy" @click="submitReject">
            <XCircle :size="15" /> {{ busy ? 'Rejecting…' : 'Confirm Rejection' }}
          </button>
        </div>
      </div>

      <!-- Default footer -->
      <div v-else class="dialog-actions">
        <p v-if="request.status === 'pending'" class="footer-note">
          Waiting for department approval in Approval Center › For My Approval.
        </p>
        <button type="button" class="close-button" @click="close">Close</button>
        <button v-if="canReject" type="button" class="reject-button" @click="step = 'reject'">
          <XCircle :size="15" /> Reject
        </button>
        <button
          v-if="canReject"
          type="button"
          class="approve-button"
          :disabled="!canApprove"
          :title="canApprove ? '' : 'Department approval must be completed first'"
          @click="step = 'approve'"
        >
          <CheckCircle2 :size="15" /> Approve
        </button>
      </div>
    </template>
  </dialog>
</template>

<style scoped>
.details-dialog { width: min(640px, calc(100% - 24px)); max-height: calc(100dvh - 32px); padding: 0; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); color: var(--text-primary); box-shadow: 0 15px 60px #0003; overflow: hidden; }
.details-dialog::backdrop { background: #04152d80; backdrop-filter: blur(2px); }
.details-dialog[open] { display: flex; flex-direction: column; }
h2 { margin: 0; font-size: 15px; }
h3 { margin: 0 0 10px; font-size: 12px; }
p { margin: 4px 0 0; color: var(--text-secondary); font-size: 12px; }
.dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border-soft); }
.dialog-head-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.close-icon { display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: 8px; background: var(--bg-card-soft); color: var(--text-secondary); }
.badge { display: inline-block; padding: 5px 9px; border-radius: 5px; font-size: 10px; font-weight: 600; white-space: nowrap; }
.green { background: var(--green-soft); color: var(--green); }
.orange { background: var(--orange-soft); color: var(--orange); }
.blue { background: var(--primary-soft); color: var(--primary); }
.red { background: var(--red-soft); color: var(--red); }
.neutral { background: var(--bg-card-soft); color: var(--text-secondary); }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin: 0; padding: 20px; overflow-y: auto; }
.detail-grid dt { margin-bottom: 6px; color: var(--text-secondary); font-size: 10px; }
.detail-grid dd { margin: 0; font-size: 12px; overflow-wrap: anywhere; }
.wide { grid-column: 1 / -1; }
.reason { white-space: pre-wrap; line-height: 1.7; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 5px 10px; border: 1px solid var(--border); border-radius: 999px; background: var(--bg-card-soft); font-size: 11px; }
.images { padding: 0 20px 18px; }
.muted { color: var(--text-muted); }
.thumbs { display: flex; flex-wrap: wrap; gap: 10px; }
.thumb { display: block; width: 110px; height: 88px; overflow: hidden; border: 1px solid var(--border); border-radius: 9px; }
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.dialog-actions { display: flex; justify-content: flex-end; padding: 12px 20px; border-top: 1px solid var(--border-soft); }
.close-button { min-height: 38px; padding: 0 16px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font-size: 12px; font-weight: 600; }
.dialog-actions { align-items: center; gap: 8px; flex-wrap: wrap; }
.approve-button, .reject-button { display: inline-flex; align-items: center; gap: 6px; min-height: 38px; padding: 0 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
.approve-button { border: 1px solid var(--green); background: var(--green); color: #fff; }
.reject-button { border: 1px solid var(--red); background: var(--red-soft); color: var(--red); }
.close-button:disabled, .approve-button:disabled, .reject-button:disabled { opacity: .55; cursor: not-allowed; }
.footer-note { flex: 1; min-width: 180px; margin: 0; color: var(--text-muted); font-size: 11px; }
.action-panel { border-top: 1px solid var(--border-soft); }
.action-panel .dialog-actions { border-top: 0; padding-top: 4px; }
.action-text { margin: 0; padding: 14px 20px 6px; color: var(--text-primary); font-size: 12px; line-height: 1.6; }
.reason-field { display: grid; gap: 6px; padding: 14px 20px 4px; }
.reason-field span { font-size: 11px; font-weight: 600; }
.reason-field em { color: var(--red); font-style: normal; }
.reason-field textarea { width: 100%; box-sizing: border-box; padding: 9px 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 12px; resize: vertical; outline: none; }
.reason-field textarea:focus { border-color: var(--primary); }
.reason-field small { justify-self: end; color: var(--text-muted); font-size: 10px; }
.action-error { margin: 0 20px 10px; padding: 9px 11px; border-radius: 8px; background: var(--red-soft); color: var(--red); font-size: 12px; }
.rejection { color: var(--red); }
@media (max-width: 640px) { .detail-grid { grid-template-columns: 1fr; gap: 14px; } }
</style>
