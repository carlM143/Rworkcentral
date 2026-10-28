<script setup lang="ts">
import type { PayrollPeriod } from '~/types/payroll'
import type { PayrollUiDraft } from '~/composables/admin/usePayrollWorkspace'
import type { PayrollUiRecord } from '~/utils/payrollUi'
import { payrollMoney as money, payrollUiTotals } from '~/utils/payrollUi'
const props = defineProps<{ open: boolean; period: PayrollPeriod; records: PayrollUiRecord[] }>()
const emit = defineEmits<{ close: [] }>()
const workspace = usePayrollWorkspace()
const name = ref('')
const groupId = ref('')
const selected = ref<number[]>([])
const error = ref('')
const saved = ref<PayrollUiDraft | null>(null)
const groupOptions = computed(() => workspace.groups.value.filter(group => group.status === 'Active'))
const choices = computed(() => groupId.value ? props.records.filter(record => groupOptions.value.find(group => group.id === Number(groupId.value))?.memberIds.includes(record.employeeId)) : props.records)
const selection = computed(() => choices.value.filter(record => selected.value.includes(record.employeeId)))
const totals = computed(() => payrollUiTotals(selection.value))
watch(() => props.open, open => { if (open) { name.value = 'Payroll draft ' + props.period.code; groupId.value = ''; selected.value = []; error.value = ''; saved.value = null } })
watch(groupId, () => { selected.value = [] })
const save = () => {
  error.value = ''
  try { saved.value = workspace.createDraft({ name: name.value, periodCode: props.period.code, periodName: props.period.dateFrom + ' to ' + props.period.dateTo, paymentDate: props.period.payrollDate, groupId: groupId.value ? Number(groupId.value) : null, records: selection.value }) }
  catch (problem) { error.value = problem instanceof Error ? problem.message : 'Unable to save this draft.' }
}
</script>

<template>
  <PayrollDialog :open="open" title="Create Payroll Draft" description="Uses the current overview preview. Saving a draft does not process payroll or release payments." @close="emit('close')">
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <template v-if="saved"><h3>{{ saved.code }} · {{ saved.name }}</h3><p>Status: Draft · {{ saved.records.length }} employees · Net pay preview: {{ money(saved.totals.netPay) }}</p><div class="table-wrap"><table><thead><tr><th>Employee</th><th>Status</th><th>Net Pay Preview</th></tr></thead><tbody><tr v-for="record in saved.records" :key="record.employeeId"><td>{{ record.employeeName }}</td><td>{{ record.status }}</td><td>{{ money(record.netPay) }}</td></tr></tbody></table></div><p>Saved for this session. Existing payroll records and completed runs were not changed.</p><AppButton variant="secondary" @click="saved = null; selected = []">New Draft</AppButton></template>
    <form v-else @submit.prevent="save">
      <p>Period: {{ period.dateFrom }} to {{ period.dateTo }} · Payroll date: {{ period.payrollDate }}</p>
      <label>Draft Name<input v-model="name" required></label>
      <label>Payroll Group<select v-model="groupId" aria-label="Payroll Group"><option value="">Choose employees manually</option><option v-for="group in groupOptions" :key="group.id" :value="String(group.id)">{{ group.name }}</option></select></label>
      <div class="selection-toolbar"><strong>Employees in the current preview</strong><AppButton variant="secondary" size="sm" @click="selected = choices.map(record => record.employeeId)">Select All</AppButton><AppButton variant="ghost" size="sm" @click="selected = []">Clear</AppButton></div>
      <p v-if="!choices.length">No employees in this group are present in the current payroll preview.</p>
      <label v-for="record in choices" :key="record.employeeId" class="check"><input v-model="selected" type="checkbox" :value="record.employeeId">{{ record.employeeName }} · {{ record.employeeNumber }} · {{ record.status }} · {{ money(record.netPay) }}</label>
      <p>{{ selection.length }} selected · Gross {{ money(totals.grossPay) }} · Deductions {{ money(totals.totalDeductions) }} · Net {{ money(totals.netPay) }}</p>
      <p>Records with review issues may be kept in a draft; they are not treated as processed or paid.</p>
      <footer><AppButton variant="secondary" @click="emit('close')">Cancel</AppButton><AppButton type="submit" :disabled="!selection.length">Save Payroll Draft</AppButton></footer>
    </form>
    <section v-if="workspace.drafts.value.length" class="saved-drafts"><h3>Saved Payroll Drafts · this session</h3><button v-for="draft in workspace.drafts.value" :key="draft.id" type="button" @click="saved = draft">{{ draft.code }} · {{ draft.name }} · {{ draft.records.length }} employees</button></section>
    <footer v-if="saved"><AppButton variant="secondary" @click="emit('close')">Close</AppButton></footer>
  </PayrollDialog>
</template>

<style scoped>
p,label,button { font-size:12px;line-height:1.6; } h3 { font-size:14px; } label { display:flex;flex-direction:column;gap:7px;margin:14px 0; } input:not([type="checkbox"]),select { padding:10px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft);color:var(--text-primary); }
.check { flex-direction:row;align-items:center;gap:9px; }.selection-toolbar,footer { display:flex;align-items:center;gap:10px;flex-wrap:wrap; } footer { justify-content:flex-end;margin-top:20px; }.error { color:var(--red); }
.saved-drafts { margin-top:22px;border-top:1px solid var(--border);padding-top:14px; }.saved-drafts button { display:block;width:100%;padding:10px;text-align:left;background:var(--bg-card-soft);color:var(--text-primary);border:1px solid var(--border);border-radius:7px;margin-top:7px;cursor:pointer; }
.table-wrap { overflow:auto; } table { width:100%;border-collapse:collapse;font-size:12px; } th,td { padding:10px;text-align:left;border-bottom:1px solid var(--border); }
</style>
