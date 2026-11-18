<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Plus, Save, Trash2, X } from 'lucide-vue-next'
import type { WageMeta, WageOrderDetail, WageOrderPayload } from '~/composables/admin/compensation/useWageOrders'

/**
 * Create / edit form for a wage order: one effective date, and one new
 * minimum daily rate per classification (the full increase at once).
 */
const props = defineProps<{
  meta: WageMeta
  initial?: WageOrderDetail | null
  saving?: boolean
  errors?: Record<string, string[]>
  submitLabel?: string
}>()

const emit = defineEmits<{
  save: [payload: WageOrderPayload]
  cancel: []
}>()

interface RateRow {
  key: number
  classification: string
  daily_rate: string
  previous_rate: string
}

let key = 0
const toRow = (r?: Partial<WageOrderDetail['rates'][number]>): RateRow => ({
  key: ++key,
  classification: r?.classification ?? 'non_agriculture',
  daily_rate: r?.daily_rate !== undefined ? String(r.daily_rate) : '',
  previous_rate: r?.previous_rate !== null && r?.previous_rate !== undefined ? String(r.previous_rate) : '',
})

const form = reactive({
  region_code: props.initial?.region_code ?? props.meta.default_region,
  order_no: props.initial?.order_no ?? '',
  title: props.initial?.title ?? '',
  effective_date: props.initial?.effective_date ?? '',
  remarks: props.initial?.remarks ?? '',
  rates: (props.initial?.rates?.length ? props.initial.rates.map(r => toRow(r)) : [toRow()]) as RateRow[],
})

const localError = ref('')
const fieldError = (name: string) => props.errors?.[name]?.[0] ?? ''
const ratesError = computed(() => {
  const k = Object.keys(props.errors ?? {}).find(e => e === 'rates' || e.startsWith('rates.'))
  return k ? props.errors?.[k]?.[0] ?? '' : ''
})

// Classifications not used yet, so each appears once.
const unusedClassifications = computed(() =>
  props.meta.classifications.filter(c => !form.rates.some(r => r.classification === c.key)),
)

const addRate = () => {
  const next = unusedClassifications.value[0]
  if (next) form.rates.push(toRow({ classification: next.key }))
}

const removeRate = (k: number) => {
  form.rates = form.rates.filter(r => r.key !== k)
}

const optionsFor = (row: RateRow) =>
  props.meta.classifications.filter(c => c.key === row.classification || !form.rates.some(r => r.classification === c.key))

const increase = (row: RateRow) => {
  const now = Number(row.daily_rate)
  const before = Number(row.previous_rate)
  return row.previous_rate && row.daily_rate && Number.isFinite(now) && Number.isFinite(before) ? now - before : null
}

const amount = (v: string) => /^\d+(\.\d{1,2})?$/.test(v.trim())

const submit = () => {
  localError.value = ''
  if (!form.order_no.trim() || !form.title.trim()) { localError.value = 'Enter the wage order number and title.'; return }
  if (!form.effective_date) { localError.value = 'Select the effective date.'; return }
  if (!form.rates.length) { localError.value = 'Add at least one rate.'; return }
  for (const [i, r] of form.rates.entries()) {
    const n = i + 1
    if (!amount(r.daily_rate)) { localError.value = `Rate ${n}: enter the new minimum daily rate.`; return }
    if (r.previous_rate && !amount(r.previous_rate)) { localError.value = `Rate ${n}: previous rate must be an amount.`; return }
  }

  emit('save', {
    region_code: form.region_code,
    order_no: form.order_no.trim(),
    title: form.title.trim(),
    effective_date: form.effective_date,
    issued_date: props.initial?.issued_date ?? null,
    published_date: props.initial?.published_date ?? null,
    source: props.initial?.source ?? null,
    remarks: form.remarks.trim() || null,
    rates: form.rates.map(r => ({
      classification: r.classification,
      daily_rate: Number(r.daily_rate),
      cola: 0,
      previous_rate: r.previous_rate ? Number(r.previous_rate) : null,
      notes: null,
    })),
  })
}
</script>

<template>
  <form class="wage-form" @submit.prevent="submit">
    <p v-if="localError" class="form-error" role="alert">{{ localError }}</p>

    <section class="panel">
      <header class="panel-header">
        <h2>Wage Order</h2>
        <p>As written on the RTWPB wage order.</p>
      </header>
      <div class="panel-body grid">
        <div class="field">
          <label for="wo-region">Region <span class="req">*</span></label>
          <select id="wo-region" v-model="form.region_code" :disabled="saving">
            <option v-for="r in meta.regions" :key="r.code" :value="r.code">{{ r.name }}</option>
          </select>
        </div>
        <div class="field" :class="{ invalid: fieldError('order_no') }">
          <label for="wo-no">Wage order no. <span class="req">*</span></label>
          <input id="wo-no" v-model="form.order_no" type="text" maxlength="50" placeholder="e.g. RB XI-24" :disabled="saving">
          <small v-if="fieldError('order_no')" class="err">{{ fieldError('order_no') }}</small>
        </div>
        <div class="field" :class="{ invalid: fieldError('effective_date') }">
          <label for="wo-effective">Effective date <span class="req">*</span></label>
          <input id="wo-effective" v-model="form.effective_date" type="date" :disabled="saving">
          <small>The new minimum applies in full from this date.</small>
        </div>
        <div class="field wide" :class="{ invalid: fieldError('title') }">
          <label for="wo-title">Title <span class="req">*</span></label>
          <input id="wo-title" v-model="form.title" type="text" maxlength="255" placeholder="e.g. Davao Region Minimum Wage Adjustment" :disabled="saving">
        </div>
        <div class="field wide">
          <label for="wo-remarks">Remarks</label>
          <textarea id="wo-remarks" v-model="form.remarks" rows="2" maxlength="5000" :disabled="saving" />
        </div>
      </div>
    </section>

    <section class="panel">
      <header class="panel-header row">
        <div>
          <h2>New Minimum Rates</h2>
          <p>One row per classification. Leave “Previous” blank to fill it from the minimum in force.</p>
        </div>
        <button type="button" class="ghost" :disabled="saving || !unusedClassifications.length" @click="addRate">
          <Plus :size="14" /> Add classification
        </button>
      </header>

      <div class="table-wrap">
        <table class="rates">
          <thead>
            <tr>
              <th scope="col">Classification</th>
              <th scope="col">New daily minimum</th>
              <th scope="col">Previous</th>
              <th scope="col">Increase</th>
              <th scope="col"><span class="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in form.rates" :key="row.key">
              <td>
                <select v-model="row.classification" :aria-label="`Rate ${i + 1} classification`" :disabled="saving">
                  <option v-for="c in optionsFor(row)" :key="c.key" :value="c.key">{{ c.name }}</option>
                </select>
              </td>
              <td><input v-model="row.daily_rate" inputmode="decimal" placeholder="0.00" :aria-label="`Rate ${i + 1} new daily minimum`" :disabled="saving"></td>
              <td><input v-model="row.previous_rate" inputmode="decimal" placeholder="Auto" :aria-label="`Rate ${i + 1} previous rate`" :disabled="saving"></td>
              <td class="inc">{{ increase(row) === null ? '—' : `+₱${increase(row)!.toFixed(2)}` }}</td>
              <td>
                <button type="button" class="icon" :aria-label="`Remove rate ${i + 1}`" :disabled="saving || form.rates.length === 1" @click="removeRate(row.key)">
                  <Trash2 :size="15" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="ratesError" class="err pad">{{ ratesError }}</p>
    </section>

    <div class="actions">
      <AppButton variant="secondary" :icon="X" :disabled="saving" @click="emit('cancel')">Cancel</AppButton>
      <AppButton :icon="Save" :disabled="saving" @click="submit">{{ saving ? 'Saving...' : submitLabel ?? 'Save' }}</AppButton>
    </div>
  </form>
</template>

<style scoped>
.wage-form { display: grid; gap: 14px; }
.form-error { margin: 0; padding: 10px 12px; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 9px; background: var(--red-soft); color: var(--red); font-size: 12px; }
.panel { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.panel-header { padding: 16px 18px 12px; border-bottom: 1px solid var(--border-soft); }
.panel-header.row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.panel-header h2 { margin: 0; font-size: 15px; }
.panel-header p { margin: 3px 0 0; color: var(--text-secondary); font-size: 12px; }
.panel-body { padding: 16px 18px 18px; }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.field { display: flex; min-width: 0; flex-direction: column; gap: 6px; }
.field.wide { grid-column: 1 / -1; }
.field label { color: var(--text-secondary); font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.field small { color: var(--text-muted); font-size: 11px; }
.req, .err { color: var(--red); }
.err { font-size: 11px; }
.pad { margin: 0; padding: 0 18px 14px; }
.field input, .field select, .field textarea, .rates input, .rates select { width: 100%; min-height: 38px; padding: 8px 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 13px; outline: none; }
.field textarea { resize: vertical; }
input[type='date'] { color-scheme: dark; }
.field.invalid input { border-color: var(--red); }
.field input:focus, .field select:focus, .field textarea:focus, .rates input:focus, .rates select:focus { border-color: var(--primary); }
.ghost { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.ghost:disabled { opacity: 0.5; cursor: not-allowed; }
.table-wrap { overflow-x: auto; }
.rates { width: 100%; min-width: 640px; border-collapse: collapse; }
.rates th { padding: 10px 8px; color: var(--text-secondary); font-size: 11px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.05em; }
.rates th:first-child, .rates td:first-child { padding-left: 18px; }
.rates td { padding: 6px 8px; border-top: 1px solid var(--border-soft); }
.rates .inc { color: var(--green); font-size: 13px; font-weight: 600; white-space: nowrap; }
.icon { display: grid; width: 36px; height: 36px; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-muted); cursor: pointer; }
.icon:hover:not(:disabled) { border-color: var(--red); color: var(--red); }
.icon:disabled { opacity: 0.4; cursor: not-allowed; }
.ghost:focus-visible, .icon:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.actions { display: flex; justify-content: flex-end; gap: 10px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
</style>