<script setup lang="ts">
import type { WageProposal } from '~/types/wageFlow'
import { canApplyWageOrder, wageMoney as money, wageToday } from '~/utils/wageWorkflow'
import { reportTimestamp } from '~/utils/reportExport'
const props = defineProps<{ open: boolean; mode: string; record: WageProposal | null; orderCode: string }>()
const emit = defineEmits<{ close: [] }>()
const workflow = useWageWorkflow()
const { success } = useToast()
const error = ref('')
const remarks = ref('')
const proposedRate = ref(0)
const acknowledged = ref(false)
watch(() => [props.open, props.mode, props.record?.id], () => {
  error.value = ''; remarks.value = ''; acknowledged.value = false
  proposedRate.value = props.record?.proposedRate ?? 0
}, { immediate: true })
const order = computed(() => workflow.orderByCode(props.orderCode))
const batch = computed(() => workflow.batchFor(props.orderCode))
const rows = computed(() => props.mode === 'evaluate' ? order.value ? workflow.evaluationFor(order.value) : []
  : ['submitBatch', 'reviewBatch', 'applyBatch'].includes(props.mode) ? workflow.batchRows(batch.value) : props.record ? [props.record] : [])
const titles: Record<string, string> = { view: 'Wage Proposal Details', history: 'Proposal History', batchHistory: 'Batch History', evaluate: 'Evaluate Employees', submitBatch: 'Submit Batch for Approval', reviewBatch: 'Batch Approval Decision', applyBatch: 'Apply Approved Batch', reviewDistortion: 'HR Distortion Review', applyDistortion: 'Apply Distortion Correction' }
const history = computed(() => workflow.events.value.filter(event => props.mode === 'history' ? event.proposalId === props.record?.id : event.orderCode === props.orderCode))
const retro = (row: WageProposal) => workflow.retroFor(row)
const totalRetro = computed(() => rows.value.reduce((sum, row) => sum + retro(row).retroAmount, 0))
const applyProblem = computed(() => canApplyWageOrder(order.value, wageToday()))
const isApplying = computed(() => ['applyBatch', 'applyDistortion'].includes(props.mode))
const confirm = (decision?: 'Approve' | 'Reject' | 'Dismiss') => {
  error.value = ''
  try {
    if (props.mode === 'evaluate' && order.value) workflow.saveEvaluation(order.value)
    else if (props.mode === 'submitBatch' && batch.value) workflow.submitBatch(batch.value)
    else if (props.mode === 'reviewBatch' && batch.value && (decision === 'Approve' || decision === 'Reject')) workflow.decideBatch(batch.value, decision, remarks.value)
    else if (props.mode === 'reviewDistortion' && props.record && (decision === 'Approve' || decision === 'Dismiss')) workflow.decideDistortion(props.record, decision, proposedRate.value, remarks.value)
    else if (isApplying.value) {
      if (!acknowledged.value) throw new Error('Review and confirm the rates and retro breakdown first.')
      if (props.mode === 'applyBatch' && batch.value) workflow.applyBatch(batch.value)
      else if (props.mode === 'applyDistortion' && props.record) workflow.applyDistortion(props.record)
      else throw new Error('Select an approved batch or HR correction.')
    } else throw new Error('No eligible evaluation or proposal selected.')
    success('Wage workflow updated', 'Sample/session data updated. Payroll lines shown here are previews only.')
    emit('close')
  } catch (problem) { error.value = problem instanceof Error ? problem.message : 'Unable to complete this action.' }
}
</script>

<template>
  <WageDialog :open="open" :title="titles[mode] || 'Wage Management'" @close="emit('close')">
    <p><strong>{{ orderCode }}</strong><template v-if="batch && ['submitBatch', 'reviewBatch', 'applyBatch', 'batchHistory'].includes(mode)"> · Batch #{{ batch.id }} · {{ batch.status }}</template></p>
    <p v-if="error" role="alert" class="error">{{ error }}</p>
    <template v-if="mode === 'history' || mode === 'batchHistory'">
      <p v-if="!history.length">No history recorded in this session.</p>
      <ol><li v-for="event in history" :key="event.id"><strong>{{ event.action }}</strong><p>{{ event.actor }} · {{ reportTimestamp(event.at) }} · {{ event.employee }}</p><p v-if="event.remarks">{{ event.remarks }}</p></li></ol>
    </template>
    <template v-else-if="mode === 'reviewDistortion' && record">
      <p><strong>{{ record.employeeName }}</strong> · {{ record.employeeNumber }} · {{ record.status }}</p>
      <p>Current daily equivalent: {{ money(record.currentRate) }}. Minimum: {{ money(record.newMinimumRate) }}. This case is excluded from the Required batch.</p>
      <label>Proposed Daily Rate (PHP)<input v-model.number="proposedRate" type="number" :min="record.currentRate" step="0.01"></label>
      <label>HR Decision Remarks<textarea v-model="remarks" rows="3" required /></label>
      <p>Approve a justified correction or dismiss the case with remarks. Approval alone does not apply the rate.</p>
      <footer><AppButton variant="secondary" @click="emit('close')">Close</AppButton><AppButton variant="secondary" @click="confirm('Dismiss')">Dismiss Case</AppButton><AppButton @click="confirm('Approve')">Approve HR Correction</AppButton></footer>
    </template>
    <template v-else-if="mode === 'view' && record">
      <dl class="details">
        <div><dt>Employee</dt><dd>{{ record.employeeName }} · {{ record.employeeNumber }}</dd></div>
        <div><dt>Pay Basis</dt><dd>{{ record.employmentType }}</dd></div>
        <div v-if="record.employmentType === 'monthly'"><dt>Monthly Rate at Evaluation</dt><dd>{{ money(record.monthlyRate ?? 0) }} × 12 ÷ {{ record.conversionFactor }} = {{ money(record.currentRate) }} / day</dd></div>
        <div><dt>Old Daily Rate</dt><dd>{{ money(record.currentRate) }}</dd></div>
        <div><dt>Proposed Daily Rate</dt><dd>{{ money(record.proposedRate) }}</dd></div>
        <div><dt>Result</dt><dd>{{ record.result }}</dd></div>
        <div><dt>Workflow Status</dt><dd>{{ record.status === 'Applied' ? 'Applied (Effective)' : record.status }}</dd></div>
        <div><dt>HR Decision</dt><dd>{{ record.distortionDecision || '—' }}</dd></div>
        <div><dt>Remarks</dt><dd>{{ record.remarks || '—' }}</dd></div>
        <div><dt>Retro Period</dt><dd>{{ retro(record).retroAmount > 0 ? `${retro(record).retroFrom} to ${retro(record).retroTo}` : 'No retro' }}</dd></div>
        <div><dt>Actual Mock Days Worked / Retro Amount</dt><dd>{{ retro(record).daysCovered }} days · {{ money(retro(record).retroAmount) }}</dd></div>
      </dl>
    </template>
    <template v-else>
      <p v-if="mode === 'evaluate'">Monthly rates are converted using company factor {{ workflow.state.value.config.annualFactor }}. Distortion threshold: {{ money(workflow.state.value.config.distortionThreshold) }} per day. Required proposals will form one batch; Compliant and Distortion Review rows are excluded.</p>
      <p v-else-if="mode === 'applyDistortion'">This is a separately approved HR correction; it is not part of the Required batch.</p>
      <p v-else>Full evaluation scope: {{ rows.length }} Required proposals. Search and table filters do not change this batch.</p>
      <p v-if="mode === 'evaluate' && !rows.some(row => row.result === 'Required')">No employees below the new minimum.</p>
      <div v-if="rows.length" class="table-wrap"><table>
        <thead><tr><th>Employee / Basis</th><th>Old Daily Rate</th><th>New Daily Rate</th><th v-if="mode === 'evaluate'">Result</th><th>Retro From</th><th>Retro To</th><th>Days Covered</th><th>Retro Amount</th></tr></thead>
        <tbody><tr v-for="row in rows" :key="row.id"><td>{{ row.employeeName }}<small>{{ row.employmentType }}<template v-if="row.employmentType === 'monthly'"> · {{ money(row.monthlyRate ?? 0) }} × 12 ÷ {{ row.conversionFactor }}</template></small></td><td>{{ money(row.currentRate) }}</td><td>{{ money(row.proposedRate) }}</td><td v-if="mode === 'evaluate'">{{ row.result }}</td><td>{{ retro(row).retroFrom || 'No retro' }}</td><td>{{ retro(row).retroTo || '—' }}</td><td>{{ retro(row).daysCovered }}</td><td>{{ money(retro(row).retroAmount) }}</td></tr></tbody>
      </table></div>
      <p v-if="!rows.length">No eligible sample employee records for this selection.</p>
      <template v-if="mode !== 'evaluate'">
        <p>Application date: {{ wageToday() }} · Total retro: <strong>{{ money(totalRetro) }}</strong>. Only dated mock attendance counts toward retro.</p>
        <h3>Next payroll run · earning-line preview</h3>
        <p v-if="!totalRetro">No retro. No additional retro earning line will be created.</p>
        <div v-else class="table-wrap"><table><thead><tr><th>Employee</th><th>Separate Earning Line</th><th>Amount</th></tr></thead><tbody><tr v-for="row in rows.filter(item => retro(item).retroAmount > 0)" :key="row.id"><td>{{ row.employeeName }}</td><td>Wage Order Retro Pay</td><td>{{ money(retro(row).retroAmount) }}</td></tr></tbody></table></div>
        <p>Retro basic pay is included in the 13th-month basic-salary computation preview. No payroll or 13th-month records outside this demo are changed.</p>
      </template>
      <label v-if="mode === 'reviewBatch'">Approver Remarks<textarea v-model="remarks" rows="3" required /></label>
      <p v-if="isApplying && applyProblem" role="status" class="error">{{ applyProblem }}</p>
      <label v-if="isApplying" class="check"><input v-model="acknowledged" type="checkbox">I reviewed the approved rates, actual days worked and retro earning lines.</label>
      <footer><AppButton variant="secondary" @click="emit('close')">Close</AppButton>
        <AppButton v-if="mode === 'evaluate'" :disabled="!rows.length" @click="confirm()">Generate Proposals</AppButton>
        <AppButton v-if="mode === 'submitBatch'" :disabled="!rows.length" @click="confirm()">Confirm Batch Submission</AppButton>
        <template v-if="mode === 'reviewBatch'"><AppButton variant="secondary" @click="confirm('Reject')">Reject Batch</AppButton><AppButton @click="confirm('Approve')">Approve Batch</AppButton></template>
        <AppButton v-if="isApplying" :disabled="!acknowledged || !!applyProblem || !rows.length" :title="applyProblem" @click="confirm()">Confirm Application</AppButton>
      </footer>
    </template>
    <footer v-if="['view', 'history', 'batchHistory'].includes(mode)"><AppButton variant="secondary" @click="emit('close')">Close</AppButton></footer>
  </WageDialog>
</template>

<style scoped>
p, label, li { font-size: 12px; line-height: 1.6; } h3 { font-size: 13px; margin-top: 20px; } .error { color: var(--red); }
label { display:flex;flex-direction:column;gap:7px;margin:14px 0; } input, textarea { padding:10px;color:var(--text-primary);background:var(--bg-card-soft);border:1px solid var(--border);border-radius:7px;font:inherit; }
.details { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px; } dt { color:var(--text-muted);font-size:11px; } dd { margin:5px 0 0;font-size:13px;overflow-wrap:anywhere; }
.table-wrap { overflow:auto; } table { width:100%;border-collapse:collapse;font-size:12px; } th, td { padding:10px;border-bottom:1px solid var(--border);text-align:left;white-space:nowrap; } small { display:block;color:var(--text-muted);font-size:10px; }
.check { flex-direction:row;align-items:flex-start; } .check input { margin-top:5px; } footer { display:flex;justify-content:flex-end;flex-wrap:wrap;gap:10px;margin-top:24px; }
@media(max-width:600px) { .details { grid-template-columns:1fr; } }
</style>
