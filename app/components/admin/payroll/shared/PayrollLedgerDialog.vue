<script setup lang="ts">
import type { PayrollUiRecord } from '~/utils/payrollUi'
import { payrollAmountChecks, payrollMoney as money, payrollSummaryRows, payrollUiTotals } from '~/utils/payrollUi'
import { exportReport, printReport, reportTimestamp } from '~/utils/reportExport'
import type { ReportDocument } from '~/utils/reportExport'
const props = defineProps<{ open: boolean; mode: string; record?: PayrollUiRecord | null; records: PayrollUiRecord[]; title?: string }>()
const emit = defineEmits<{ close: []; checked: [at: string] }>()
const busy = ref(false)
const error = ref('')
const checkedAt = ref('')
const summaryBy = ref<'periodName' | 'department'>('periodName')
const titles: Record<string, string> = { details: 'Payroll Record Details', payslip: 'Payslip Preview', history: 'Payment and Payroll History', issues: 'Payroll Issues', summary: 'Payroll Summary', refresh: 'Refresh Payroll Preview' }
const heading = computed(() => props.mode === 'summary' ? props.title || titles.summary : titles[props.mode] || 'Payroll')
const totals = computed(() => payrollUiTotals(props.records))
const summaryRows = computed(() => payrollSummaryRows(props.records, summaryBy.value))
const checks = computed(() => props.records.map(row => ({ row, problems: payrollAmountChecks(row) })))
const flagged = computed(() => checks.value.filter(check => check.problems.length || Number(check.row.issueCount) > 0))
const earnings = computed(() => props.record ? [
  ['Basic Pay', props.record.basicPay], ['Overtime Pay', props.record.overtimePay], ['Holiday Pay', props.record.holidayPay],
  ['Night Differential', props.record.nightDifferential], ['Allowances', props.record.allowances ?? props.record.allowance], ['Other Earnings', props.record.otherEarnings],
].filter(([, value]) => value !== undefined) : [])
const deductions = computed(() => props.record ? [
  ['SSS', props.record.sss], ['PhilHealth', props.record.philHealth], ['Pag-IBIG', props.record.pagIbig],
  ['Loan Deduction', props.record.loanDeduction], ['Late Deduction', props.record.lateDeduction], ['Undertime Deduction', props.record.undertimeDeduction],
  ['Absence Deduction', props.record.absenceDeduction], ['Other Deductions', props.record.otherDeductions],
  ...(props.record.totalDeductions == null && props.record.deductions != null ? [['Total Deductions', props.record.deductions]] : []),
].filter(([, value]) => value !== undefined) : [])
const recordTotals = computed(() => payrollUiTotals(props.record ? [props.record] : []))
const history = computed(() => {
  const row = props.record
  if (!row) return []
  return [
    { label: 'Prepared', at: row.preparedAt, actor: row.preparedBy },
    { label: 'Payroll Completed', at: row.completedAt, actor: row.completedBy },
    { label: 'Payment Recorded', at: row.paidAt, actor: row.paidBy },
  ].filter(event => event.at)
})
const snapshot = (): ReportDocument => ({
  title: props.mode === 'summary' ? props.title || 'Payroll Summary' : 'Payslip Preview',
  period: props.mode === 'summary' ? 'Current filtered selection' : String(props.record?.periodName || props.record?.periodCode || 'Current payroll preview'),
  rows: props.mode === 'summary' ? summaryRows.value : props.record ? [{ ...props.record }] : [],
  totals: props.mode === 'summary' ? totals.value : undefined, generatedAt: new Date().toISOString(), sample: true,
})
const download = async () => {
  if (busy.value) return
  busy.value = true; error.value = ''
  try { await exportReport(snapshot(), 'PDF') } catch (problem) { error.value = problem instanceof Error ? problem.message : 'Unable to download.' }
  finally { busy.value = false }
}
const print = () => {
  error.value = ''
  try { printReport(snapshot()) } catch (problem) { error.value = problem instanceof Error ? problem.message : 'Unable to print.' }
}
const recheck = () => { checkedAt.value = new Date().toISOString(); emit('checked', checkedAt.value) }
watch(() => [props.open, props.mode], () => {
  error.value = ''; summaryBy.value = 'periodName'
  if (props.open && props.mode === 'refresh') recheck()
})
</script>

<template>
  <PayrollDialog :open="open" :title="heading" description="Preview from the existing sample payroll records." @close="emit('close')">
    <p v-if="error" role="alert" class="error">{{ error }}</p>
    <template v-if="mode === 'summary'">
      <div class="summary-grid"><div><span>Records</span><strong>{{ records.length }}</strong></div><div><span>Gross Pay</span><strong>{{ money(totals.grossPay) }}</strong></div><div><span>Deductions</span><strong>{{ money(totals.totalDeductions) }}</strong></div><div><span>Net Pay</span><strong>{{ money(totals.netPay) }}</strong></div></div>
      <label>Group Summary By<select v-model="summaryBy" aria-label="Group Summary By"><option value="periodName">Pay Period</option><option value="department">Department</option></select></label>
      <p v-if="!records.length">No records match the current filters.</p>
      <div v-else class="table-wrap"><table><thead><tr><th>{{ summaryBy === 'department' ? 'Department' : 'Pay Period' }}</th><th>Employees</th><th>Records</th><th>Gross Pay</th><th>Deductions</th><th>Net Pay</th></tr></thead><tbody><tr v-for="row in summaryRows" :key="row.name"><td>{{ row.name }}</td><td>{{ row.employees }}</td><td>{{ row.records }}</td><td>{{ money(row.grossPay) }}</td><td>{{ money(row.totalDeductions) }}</td><td>{{ money(row.netPay) }}</td></tr></tbody></table></div>
    </template>
    <template v-else-if="mode === 'refresh'">
      <p>Rechecks the current local preview and its amount totals. It does not fetch new attendance or recalculate statutory contributions.</p>
      <p>{{ records.length }} records checked · {{ flagged.length }} records require review</p><p v-if="checkedAt">Checked: {{ reportTimestamp(checkedAt) }}</p>
      <p v-if="!records.length">No payroll records match the current filters.</p>
      <div v-else class="table-wrap"><table><thead><tr><th>Employee</th><th>Payroll Number</th><th>Result</th></tr></thead><tbody><tr v-for="check in checks" :key="check.row.id"><td>{{ check.row.employeeName }}</td><td>{{ check.row.payrollNumber }}</td><td>{{ check.problems.join(' ') || (check.row.issueCount ? check.row.issueCount + ' existing issues; inspect the record remarks.' : 'Recorded amount totals match.') }}</td></tr></tbody></table></div>
    </template>
    <template v-else-if="record">
      <dl class="details"><div><dt>Employee</dt><dd>{{ record.employeeName }} · {{ record.employeeNumber }}</dd></div><div><dt>Payroll Number</dt><dd>{{ record.payrollNumber || 'Current overview preview' }}</dd></div><div><dt>Department / Position</dt><dd>{{ record.department }} · {{ record.position }}</dd></div><div><dt>Pay Period</dt><dd>{{ record.periodName || record.periodCode || 'Current overview preview' }}</dd></div><div><dt>Payroll Status</dt><dd>{{ record.payrollStatus || record.status }}</dd></div><div><dt>Payment Status</dt><dd>{{ record.paymentStatus || 'No payment status recorded' }}</dd></div></dl>
      <template v-if="mode === 'history'">
        <p v-if="!history.length">No dated payroll or payment events are recorded for this item.</p>
        <ol><li v-for="event in history" :key="event.label"><strong>{{ event.label }}</strong> · {{ reportTimestamp(event.at) }} · {{ event.actor || 'Actor not recorded' }}</li></ol>
        <p v-if="!record.paidAt">No payment event recorded.</p><p>Payment reference: {{ record.referenceNumber || 'Not recorded' }}</p>
      </template>
      <template v-else-if="mode === 'issues'">
        <p>Recorded issue count: {{ record.issueCount ?? (record.issue ? 1 : 0) }}</p><p>{{ record.remarks || record.issue || 'No issue detail recorded.' }}</p>
        <h3>Recorded Amount Checks</h3><ul v-if="payrollAmountChecks(record).length"><li v-for="problem in payrollAmountChecks(record)" :key="problem">{{ problem }}</li></ul><p v-else>Recorded amount totals match.</p>
      </template>
      <template v-else>
        <p v-if="mode === 'payslip'">Preview only. This does not mark payroll as completed or payment as released.</p>
        <div class="amount-grid"><section><h3>Earnings</h3><dl><div v-for="[label, value] in earnings" :key="String(label)"><dt>{{ label }}</dt><dd>{{ money(value) }}</dd></div></dl></section><section><h3>Deductions</h3><dl><div v-for="[label, value] in deductions" :key="String(label)"><dt>{{ label }}</dt><dd>{{ money(value) }}</dd></div></dl></section></div>
        <div class="summary-grid"><div><span>Gross Pay</span><strong>{{ money(recordTotals.grossPay) }}</strong></div><div><span>Total Deductions</span><strong>{{ money(recordTotals.totalDeductions) }}</strong></div><div><span>Net Pay</span><strong>{{ money(recordTotals.netPay) }}</strong></div></div>
        <p v-if="record.remarks || record.issue">Remarks: {{ record.remarks || record.issue }}</p>
        <p v-if="payrollAmountChecks(record).length" class="error">This sample has recorded amount discrepancies. Inspect Payroll Issues before relying on the totals.</p>
      </template>
    </template>
    <footer><AppButton v-if="mode === 'refresh'" @click="recheck">Recheck Records</AppButton><template v-if="mode === 'summary' || mode === 'payslip'"><AppButton variant="secondary" :disabled="busy || !(mode === 'summary' ? records.length : record)" @click="print">Print</AppButton><AppButton :disabled="busy || !(mode === 'summary' ? records.length : record)" @click="download">{{ busy ? 'Exporting…' : 'Download PDF' }}</AppButton></template><AppButton variant="secondary" @click="emit('close')">Close</AppButton></footer>
  </PayrollDialog>
</template>

<style scoped>
p, label, li { font-size:12px;line-height:1.6; } .error { color:var(--red); } h3 { font-size:13px;margin-top:20px; }
.details { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px; } dt,span { color:var(--text-muted);font-size:11px; } dd { margin:5px 0 0;font-size:12px;overflow-wrap:anywhere; }
.amount-grid { display:grid;grid-template-columns:1fr 1fr;gap:24px; }.amount-grid dl div { display:flex;justify-content:space-between;gap:15px;padding:8px 0;border-bottom:1px solid var(--border); }
.summary-grid { display:flex;gap:18px;flex-wrap:wrap;background:var(--bg-card-soft);padding:15px;border-radius:9px;margin:18px 0; }.summary-grid div { min-width:130px; } .summary-grid strong,.summary-grid span { display:block; }.summary-grid strong { margin-top:5px;font-size:15px; }
label { display:flex;flex-direction:column;gap:7px;margin:15px 0; } select { padding:10px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--text-primary); }
.table-wrap { overflow:auto; } table { width:100%;border-collapse:collapse;font-size:12px; } th,td { padding:10px;text-align:left;border-bottom:1px solid var(--border); } footer { display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;margin-top:22px; }
@media(max-width:600px) { .details,.amount-grid { grid-template-columns:1fr; } }
</style>
