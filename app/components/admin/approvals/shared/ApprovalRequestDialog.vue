<script setup lang="ts">
import type { ApprovalDecisionPreview, ApprovalUiKind, ApprovalUiRecord } from '~/utils/approvalUi'
import { approvalCanReview, approvalDetailFields, approvalReference } from '~/utils/approvalUi'
import { reportTimestamp, reportValue } from '~/utils/reportExport'
const props = defineProps<{ open: boolean; kind: ApprovalUiKind; mode: string; request: ApprovalUiRecord | null }>()
const emit = defineEmits<{ close: [] }>()
const ui = useApprovalUi()
const decision = ref<'approve' | 'reject'>('approve')
const remarks = ref('')
const approvedHours = ref(0)
const error = ref('')
const prepared = ref<ApprovalDecisionPreview | null>(null)
const historyOpen = ref(false)
watch(() => [props.open, props.mode, props.request?.id], () => {
  decision.value = props.mode === 'reject' ? 'reject' : 'approve'
  remarks.value = ''; error.value = ''; prepared.value = null; historyOpen.value = props.mode === 'history'
  approvedHours.value = props.request?.approvedHours > 0 ? props.request.approvedHours : Number(props.request?.requestedHours) || 0
}, { immediate: true })
const title = computed(() => historyOpen.value ? 'Request History' : props.mode === 'view' ? 'Request Details' : props.mode === 'review' ? 'Review Request' : props.mode === 'reject' ? 'Reject Request' : 'Approve Request')
const localHistory = computed(() => props.request ? ui.forRequest(props.kind, props.request) : [])
const canDecide = computed(() => !!props.request && approvalCanReview(props.request) && !['view', 'history'].includes(props.mode) && !historyOpen.value)
const prepare = () => {
  if (!props.request) return
  error.value = ''
  try { prepared.value = ui.prepare(props.kind, props.request, decision.value, remarks.value, approvedHours.value) }
  catch (problem) { error.value = problem instanceof Error ? problem.message : 'Unable to prepare this decision.' }
}
</script>

<template>
  <PayrollDialog :open="open" :title="title" description="UI preview only. Table values and source request statuses are not changed or sent to the backend." @close="emit('close')">
    <template v-if="request">
      <p><strong>{{ approvalReference(request) }}</strong> · {{ request.employeeName }}</p>
      <p v-if="error" role="alert" class="error">{{ error }}</p>
      <template v-if="prepared">
        <p role="status"><strong>{{ prepared.decision === 'approve' ? 'Approval' : 'Rejection' }} decision prepared.</strong> The source request remains {{ prepared.sourceStatus }}.</p>
        <dl class="details"><div><dt>Prepared By</dt><dd>{{ prepared.preparedBy }}</dd></div><div><dt>Prepared At</dt><dd>{{ reportTimestamp(prepared.preparedAt) }}</dd></div><div><dt>Remarks</dt><dd>{{ prepared.remarks || 'No remarks added' }}</dd></div><div v-if="prepared.approvedHours != null"><dt>Proposed Approved Hours</dt><dd>{{ prepared.approvedHours }}</dd></div></dl>
        <p>This decision is retained as a local UI draft for the session. No approval has been applied to the table or backend.</p>
      </template>
      <template v-else-if="historyOpen">
        <h3>Source Review Information</h3><p v-if="!request.reviewedAt && !request.reviewedBy">No dated review information is recorded on this request.</p>
        <p v-else>{{ request.reviewedBy || 'Reviewer not recorded' }} · {{ request.reviewedAt ? reportTimestamp(request.reviewedAt) : 'Review date not recorded' }}</p><p v-if="request.remarks">Source remarks: {{ request.remarks }}</p>
        <h3>Prepared Decisions · local UI only</h3><p v-if="!localHistory.length">No decisions prepared in this session.</p><ol><li v-for="item in localHistory" :key="item.id"><strong>{{ item.decision === 'approve' ? 'Approval' : 'Rejection' }} prepared</strong> · {{ item.preparedBy }} · {{ reportTimestamp(item.preparedAt) }}<p>{{ item.remarks || 'No remarks added' }}<template v-if="item.approvedHours != null"> · {{ item.approvedHours }} proposed approved hours</template></p></li></ol>
      </template>
      <template v-else>
        <dl class="details"><div v-for="[label, value] in approvalDetailFields(request, kind)" :key="label"><dt>{{ label }}</dt><dd>{{ reportValue(value) }}</dd></div></dl>
        <p v-if="kind === 'Leave' && Number(request.totalDays) > Number(request.availableBalance)" class="notice">Requested days exceed the recorded balance. Verify the leave type and company policy during review.</p>
        <template v-if="canDecide">
          <label v-if="mode === 'review'">Decision<select v-model="decision" aria-label="Decision"><option value="approve">Approve</option><option value="reject">Reject</option></select></label>
          <label v-if="kind === 'Overtime' && decision === 'approve'">Approved Hours<input v-model.number="approvedHours" type="number" min="0.01" :max="request.requestedHours" step="0.25" aria-label="Approved Hours"></label>
          <label>{{ decision === 'reject' ? 'Rejection Reason (required)' : 'Reviewer Remarks' }}<textarea v-model="remarks" rows="3" :aria-label="decision === 'reject' ? 'Rejection Reason' : 'Reviewer Remarks'" :required="decision === 'reject'" /></label>
        </template>
        <p v-else-if="!['view', 'history'].includes(mode)" class="notice">This request is not eligible for another decision.</p>
      </template>
      <footer><AppButton v-if="mode === 'view' && !historyOpen" variant="secondary" @click="historyOpen = true">View History</AppButton><AppButton v-if="canDecide && !prepared" :variant="decision === 'reject' ? 'danger' : 'primary'" @click="prepare">{{ decision === 'reject' ? 'Prepare Rejection' : 'Prepare Approval' }}</AppButton><AppButton variant="secondary" @click="emit('close')">{{ prepared ? 'Done' : 'Close' }}</AppButton></footer>
    </template>
  </PayrollDialog>
</template>

<style scoped>
p,label,li { font-size:12px;line-height:1.6; } h3 { font-size:13px;margin-top:20px; }.details { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px; } dt { font-size:11px;color:var(--text-muted); } dd { margin:5px 0 0;font-size:12px;overflow-wrap:anywhere;white-space:pre-wrap; }
label { display:flex;flex-direction:column;gap:7px;margin:18px 0; } input,select,textarea { padding:10px;border:1px solid var(--border);border-radius:7px;color:var(--text-primary);background:var(--bg-card-soft);font:inherit; }.error { color:var(--red); }.notice { color:var(--text-secondary);background:var(--bg-card-soft);padding:12px;border-radius:7px; } footer { display:flex;justify-content:flex-end;flex-wrap:wrap;gap:10px;margin-top:22px; }
@media(max-width:600px) { .details { grid-template-columns:1fr; } }
</style>
