<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, ClipboardList, X } from 'lucide-vue-next'
import WfhModalShell from '~/components/admin/wfh/WfhModalShell.vue'
import WfhStatusPill from '~/components/admin/wfh/WfhStatusPill.vue'
import { wfhErrorMessage } from '~/composables/admin/wfh/useWfhDocumentApi'
import { useWfhRequestApi, type WfhRequestRecord } from '~/composables/admin/wfh/useWfhRequestApi'
import { wfhDateText, wfhPeriodText } from '~/composables/admin/wfh/useWfhFormat'

type WfhRequestModalMode = 'view' | 'decide' | 'history'

const props = withDefaults(defineProps<{
  record: WfhRequestRecord
  initialMode?: WfhRequestModalMode
  initialAction?: 'approve' | 'reject'
}>(), {
  initialMode: 'view',
  initialAction: 'approve',
})

const emit = defineEmits<{
  close: []
  saved: [record: WfhRequestRecord, message: string]
}>()

const STATUS_LABELS: Record<string, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }

const api = useWfhRequestApi()
const mode = ref<WfhRequestModalMode>(props.initialMode)
const action = ref<'approve' | 'reject'>(props.initialAction)
const note = ref('')
const error = ref('')
const saving = ref(false)

const title = computed(() => ({
  view: 'WFH Request Details',
  decide: action.value === 'approve' ? 'Approve WFH Request' : 'Reject WFH Request',
  history: 'Request History',
})[mode.value])

const subtitle = computed(() =>
  [props.record.employee.name, props.record.employee.department].filter(Boolean).join(' · '))

const daysLabel = computed(() => `${props.record.number_of_days} ${props.record.number_of_days === 1 ? 'day' : 'days'}`)

const history = computed(() => {
  const r = props.record
  const events = [{ when: r.request_date, action: 'Request filed', actor: r.employee.name, notes: r.reason }]
  if (r.status !== 'pending' && r.approved_at) {
    events.push({
      when: r.approved_at,
      action: r.status === 'approved' ? 'Request approved' : 'Request rejected',
      actor: r.approved_by ?? '—',
      notes: r.remarks ?? '',
    })
  }
  return events.reverse()
})

const startDecision = (next: 'approve' | 'reject') => {
  action.value = next
  note.value = ''
  error.value = ''
  mode.value = 'decide'
}

const submit = async () => {
  if (action.value === 'reject' && !note.value.trim()) {
    error.value = 'Enter the reason for rejecting this request.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const response = action.value === 'approve'
      ? await api.approve(props.record.id, note.value.trim())
      : await api.reject(props.record.id, note.value.trim())
    emit('saved', response.data, response.message)
  } catch (err) {
    error.value = wfhErrorMessage(err, 'Unable to save the decision.')
  } finally {
    saving.value = false
  }
}

const openDocuments = () => navigateTo('/admin/wfh/documents')
</script>

<template>
  <WfhModalShell
    :eyebrow="record.request_no"
    :title="title"
    :subtitle="subtitle"
    :busy="saving"
    @close="emit('close')"
  >
    <!-- VIEW -->
    <template v-if="mode === 'view'">
      <div class="info-grid">
        <div><small>Employee No.</small><strong>{{ record.employee.emp_id }}</strong></div>
        <div><small>Position</small><strong>{{ record.employee.position || '—' }}</strong></div>
        <div><small>WFH Period</small><strong>{{ wfhPeriodText(record.start_date, record.end_date) }}</strong></div>
        <div><small>No. of Days</small><strong>{{ daysLabel }}</strong></div>
        <div><small>Request Date</small><strong>{{ wfhDateText(record.request_date) }}</strong></div>
        <div><small>Supervisor</small><strong>{{ record.supervisor_name }}</strong></div>
        <div><small>Status</small><strong><WfhStatusPill :status="record.status" :label="STATUS_LABELS[record.status] ?? record.status" /></strong></div>
        <div>
          <small>{{ record.status === 'rejected' ? 'Rejected By' : 'Approved By' }}</small>
          <strong>{{ record.status === 'pending' ? 'Not yet decided' : record.approved_by || '—' }}</strong>
        </div>
      </div>

      <h3>Reason for WFH</h3>
      <p class="detail-text">{{ record.reason }}</p>

      <template v-if="record.remarks">
        <h3>HR Remarks</h3>
        <p class="detail-text">{{ record.remarks }}</p>
      </template>

      <div class="modal-actions">
        <template v-if="record.status === 'pending'">
          <button class="btn reject" @click="startDecision('reject')"><X :size="15" /> Reject</button>
          <button class="btn approve" @click="startDecision('approve')"><Check :size="15" /> Approve</button>
        </template>
        <button v-else-if="record.status === 'approved'" class="btn primary" @click="openDocuments">
          <ClipboardList :size="15" /> Open Document Review
        </button>
        <button v-else class="btn ghost" @click="emit('close')">Close</button>
      </div>
    </template>

    <!-- DECIDE -->
    <template v-else-if="mode === 'decide'">
      <div class="review-note">
        {{ action === 'approve' ? 'Approve' : 'Reject' }} the WFH request of <strong>{{ record.employee.name }}</strong>
        for <strong>{{ wfhPeriodText(record.start_date, record.end_date) }}</strong> ({{ daysLabel }}).
        <template v-if="action === 'approve'"> Once approved, the request appears in WFH Document Review for daily proof of work.</template>
      </div>

      <h3>Reason for WFH</h3>
      <p class="detail-text">{{ record.reason }}</p>

      <label for="req-note">HR remarks {{ action === 'reject' ? '(required)' : '(optional)' }}</label>
      <textarea
        id="req-note"
        v-model="note"
        rows="4"
        :placeholder="action === 'reject' ? 'Explain why the request is rejected...' : 'Optional note'"
      />
      <p v-if="error" class="error">{{ error }}</p>

      <div class="modal-actions">
        <button class="btn ghost" :disabled="saving" @click="emit('close')">Cancel</button>
        <button class="btn" :class="action === 'approve' ? 'approve' : 'reject'" :disabled="saving" @click="submit">
          {{ saving ? 'Saving...' : action === 'approve' ? 'Approve request' : 'Reject request' }}
        </button>
      </div>
    </template>

    <!-- HISTORY -->
    <template v-else>
      <div v-for="(h, i) in history" :key="i" class="timeline">
        <strong>{{ h.action }}</strong>
        <p>{{ wfhDateText(h.when) }} · {{ h.actor }}</p>
        <small v-if="h.notes">{{ h.notes }}</small>
      </div>
    </template>
  </WfhModalShell>
</template>