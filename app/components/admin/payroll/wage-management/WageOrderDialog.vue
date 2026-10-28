<script setup lang="ts">
import type { WageOrder } from '~/types/wageManagement'
import { wageToday, wageRegions, previousWageOrder } from '~/utils/wageWorkflow'
import { reportLabel, reportTimestamp } from '~/utils/reportExport'
const props = defineProps<{ open: boolean; mode: string; order: WageOrder | null }>()
const emit = defineEmits<{ close: [] }>()
const workflow = useWageWorkflow()
const { success } = useToast()
const error = ref('')
const form = reactive({ code: '', title: '', region: 'NCR', classification: 'Non-Agriculture', oldMinimumRate: 0, newMinimumRate: 0, effectiveDate: wageToday(), tranche: 'Single Tranche', source: '', status: 'Draft' as WageOrder['status'] })
watch(() => [props.open, props.mode, props.order?.id], () => {
  error.value = ''
  Object.assign(form, props.order ?? { code: '', title: '', region: 'NCR', classification: 'Non-Agriculture', oldMinimumRate: 0, newMinimumRate: 0, effectiveDate: wageToday(), tranche: 'Single Tranche', source: '', status: 'Draft' })
}, { immediate: true })
const previousOrder = computed(() => previousWageOrder(workflow.wageOrders.value, form, props.order?.id))
watch(() => [form.region, form.classification, form.effectiveDate, props.open], () => {
  if (previousOrder.value) form.oldMinimumRate = previousOrder.value.newMinimumRate
  else if (!props.order || props.order.region !== form.region || props.order.classification !== form.classification) form.oldMinimumRate = 0
}, { immediate: true, flush: 'sync' })
const title = computed(() => props.mode === 'form' ? props.order ? 'Edit Wage Order' : 'Add Wage Order' : props.mode === 'history' ? 'Wage Order History' : props.mode === 'publish' ? form.effectiveDate > wageToday() ? 'Schedule Wage Order' : 'Activate Wage Order' : props.mode === 'supersede' ? 'Supersede Wage Order' : 'Wage Order Details')
const history = computed(() => workflow.events.value.filter(item => item.orderCode === props.order?.code))
const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
const confirm = () => {
  error.value = ''
  try {
    if (props.mode === 'form') workflow.saveOrder(form, props.order?.id)
    else if (props.mode === 'publish' && props.order) workflow.publishOrder(props.order)
    else if (props.mode === 'supersede' && props.order) workflow.supersedeOrder(props.order)
    success('Wage order updated', 'Saved in the sample workspace for this session.')
    emit('close')
  } catch (problem) { error.value = problem instanceof Error ? problem.message : 'Unable to save.' }
}
</script>

<template>
  <WageDialog :open="open" :title="title" @close="emit('close')">
    <p v-if="error" role="alert" class="error">{{ error }}</p>
    <form v-if="mode === 'form'" @submit.prevent="confirm">
      <div class="form-grid">
        <label>Order Code<input v-model="form.code" required maxlength="80"></label>
        <label>Title<input v-model="form.title" required maxlength="160"></label>
        <label>Region<select v-model="form.region" aria-label="Region" required><option v-for="region in wageRegions" :key="region" :value="region">{{ region }}</option></select></label>
        <label>Classification<input v-model="form.classification" required></label>
        <label>Previous Daily Minimum (PHP)<input v-model.number="form.oldMinimumRate" aria-label="Previous Daily Minimum (PHP)" type="number" min="0" step="0.01" :readonly="!!previousOrder" required><small>{{ previousOrder ? `From ${previousOrder.code}; read-only.` : 'No preceding order found; enter the previous minimum manually.' }}</small></label>
        <label>New Daily Minimum (PHP)<input v-model.number="form.newMinimumRate" type="number" min="0.01" step="0.01" required></label>
        <label>Effective Date<input v-model="form.effectiveDate" type="date" required></label>
        <label>Tranche<input v-model="form.tranche"></label>
        <label class="wide">Source / Reference<input v-model="form.source" placeholder="Issuing authority or source reference"></label>
      </div>
      <p>Daily increase: <strong>{{ money(form.newMinimumRate - form.oldMinimumRate) }}</strong>. New orders are saved as Draft, then activated or scheduled separately.</p>
      <footer><AppButton variant="secondary" @click="emit('close')">Cancel</AppButton><AppButton type="submit">{{ order ? 'Save Changes' : 'Save Draft' }}</AppButton></footer>
    </form>
    <template v-else>
      <dl v-if="order && mode !== 'history'" class="detail-grid"><div v-for="key in (['code', 'title', 'region', 'classification', 'oldMinimumRate', 'newMinimumRate', 'increaseAmount', 'effectiveDate', 'tranche', 'source', 'status'] as const)" :key="key"><dt>{{ reportLabel(key) }}</dt><dd>{{ typeof order[key] === 'number' ? money(order[key] as number) : order[key] }}</dd></div></dl>
      <template v-if="mode === 'history'">
        <p v-if="!history.length">No changes recorded for this wage order in this session.</p>
        <ol v-else><li v-for="event in history" :key="event.id"><strong>{{ event.action }}</strong><p>{{ reportTimestamp(event.at) }} · {{ event.actor }} · {{ event.employee }} {{ event.remarks }}</p></li></ol>
      </template>
      <p v-if="mode === 'publish'">{{ form.effectiveDate > wageToday() ? 'This order will be scheduled for its future effective date. Employee adjustments still require separate evaluation and approval.' : 'This enables the order for employee evaluation. Existing employee rates are not changed by activating an order.' }}</p>
      <p v-if="mode === 'supersede'">This marks the configuration as replaced. Existing salary history will be retained; this order will no longer be available for new evaluations.</p>
      <footer><AppButton variant="secondary" @click="emit('close')">Close</AppButton><AppButton v-if="mode === 'publish' || mode === 'supersede'" @click="confirm">{{ title }}</AppButton></footer>
    </template>
  </WageDialog>
</template>

<style scoped>
.form-grid, .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
label { display: flex; flex-direction: column; gap: 7px; font-size: 12px; } input, select { width: 100%; box-sizing: border-box; padding: 10px; color: var(--text-primary); background: var(--bg-card-soft); border: 1px solid var(--border); border-radius: 7px; } input[readonly] { opacity: .7; } small { color: var(--text-muted); }
.wide { grid-column: 1 / -1; } dt { font-size: 11px; color: var(--text-muted); } dd { margin: 5px 0 0; font-size: 13px; overflow-wrap: anywhere; }
p, li { font-size: 12px; line-height: 1.6; } .error { color: var(--red); } footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
@media(max-width:600px) { .form-grid, .detail-grid { grid-template-columns: 1fr; } }
</style>
