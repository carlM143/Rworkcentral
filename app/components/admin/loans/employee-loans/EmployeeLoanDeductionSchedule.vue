<!--
  Which cutoff of the month a loan is deducted in.
  deduction_amount is the MONTHLY amount; each cutoff deducts its percent of it
  (first + second = 100). Monthly payroll groups always take 100% in their one payroll.
  Used by EmployeeLoanForm (create/edit) and the loan details page (PATCH deduction-schedule).
-->
<script setup lang="ts">
import { CalendarRange } from 'lucide-vue-next'
import { LOAN_DEDUCTION_PRESETS } from '~/types/loans/employee-loans/employeeLoan'

const props = withDefaults(defineProps<{
  /** Monthly deduction amount, for the per-cutoff preview. */
  monthlyAmount: number | string
  disabled?: boolean
}>(), { disabled: false })

const first = defineModel<number>('first', { required: true })
const second = defineModel<number>('second', { required: true })

type PresetKey = typeof LOAN_DEDUCTION_PRESETS[number]['key'] | 'custom'

const presetOf = (a: number, b: number): PresetKey =>
  LOAN_DEDUCTION_PRESETS.find(p => p.first === Number(a) && p.second === Number(b))?.key ?? 'custom'

const preset = ref<PresetKey>(presetOf(first.value, second.value))

// Keep the selected option in sync when the parent loads a loan
watch([first, second], ([a, b]) => {
  if (preset.value !== 'custom') preset.value = presetOf(a, b)
})

const choose = (key: PresetKey) => {
  preset.value = key
  const option = LOAN_DEDUCTION_PRESETS.find(p => p.key === key)
  if (option) {
    first.value = option.first
    second.value = option.second
  }
}

// Custom split: editing one side fills in the other so they always total 100
const setFirst = (value: number) => {
  const clamped = Math.min(100, Math.max(0, Number(value) || 0))
  first.value = clamped
  second.value = Math.round((100 - clamped) * 100) / 100
}

const total = computed(() => Math.round((Number(first.value) + Number(second.value)) * 100) / 100)

const money = (value: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value || 0)

const amountFor = (percent: number) => Math.round(Number(props.monthlyAmount || 0) * Number(percent)) / 100
</script>

<template>
  <fieldset class="schedule" :disabled="disabled">
    <legend><CalendarRange :size="15" /> Deduction Schedule</legend>
    <p class="hint">The deduction amount is per month. Choose which payroll cutoff takes it.</p>

    <div class="options" role="radiogroup" aria-label="Deduction schedule">
      <button
        v-for="option in LOAN_DEDUCTION_PRESETS"
        :key="option.key"
        type="button"
        class="option"
        role="radio"
        :aria-checked="preset === option.key"
        :class="{ selected: preset === option.key }"
        @click="choose(option.key)"
      >
        {{ option.label }}
      </button>
      <button
        type="button"
        class="option"
        role="radio"
        :aria-checked="preset === 'custom'"
        :class="{ selected: preset === 'custom' }"
        @click="preset = 'custom'"
      >
        Custom split
      </button>
    </div>

    <div v-if="preset === 'custom'" class="custom">
      <label>
        <span>1st cutoff %</span>
        <input type="number" min="0" max="100" step="0.01" :value="first" @input="setFirst(Number(($event.target as HTMLInputElement).value))">
      </label>
      <label>
        <span>2nd cutoff %</span>
        <input type="number" :value="second" readonly tabindex="-1">
      </label>
    </div>

    <div class="preview">
      <div>
        <span>1st cutoff</span>
        <strong>{{ money(amountFor(first)) }}</strong>
        <small>{{ Number(first) }}%</small>
      </div>
      <div>
        <span>2nd cutoff</span>
        <strong>{{ money(amountFor(second)) }}</strong>
        <small>{{ Number(second) }}%</small>
      </div>
    </div>

    <p v-if="total !== 100" class="error" role="alert">1st and 2nd cutoff must total 100% (now {{ total }}%).</p>
    <p class="hint">Monthly payroll groups have one payroll a month, so they always deduct the full amount.</p>
  </fieldset>
</template>

<style scoped>
.schedule { display: flex; flex-direction: column; gap: 10px; min-width: 0; margin: 0; padding: 14px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); }
legend { display: inline-flex; align-items: center; gap: 6px; padding: 0 4px; color: var(--text-primary); font-size: 13px; font-weight: 600; }
legend svg { color: var(--primary); }
.hint { margin: 0; color: var(--text-muted); font-size: 11px; line-height: 1.5; }
.options { display: flex; flex-wrap: wrap; gap: 8px; }
.option { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card); color: var(--text-secondary); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.option:hover:not(:disabled) { border-color: var(--primary); }
.option.selected { border-color: var(--primary); background: var(--primary-soft); color: var(--primary); }
.option:disabled { opacity: .6; cursor: not-allowed; }
.custom { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.custom label { display: flex; flex-direction: column; gap: 6px; color: var(--text-secondary); font-size: 12px; }
.custom input { width: 100%; min-height: 40px; padding: 9px 11px; border: 1px solid var(--border); border-radius: 8px; outline: none; background: var(--bg-card); color: var(--text-primary); font: inherit; font-size: 13px; }
.custom input:focus { border-color: var(--primary); }
.custom input[readonly] { color: var(--text-secondary); }
.preview { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.preview > div { padding: 10px 12px; border: 1px solid var(--border-soft, var(--border)); border-radius: 8px; background: var(--bg-card); }
.preview span { display: block; color: var(--text-secondary); font-size: 11px; }
.preview strong { display: block; margin-top: 4px; color: var(--text-primary); font-size: 15px; font-variant-numeric: tabular-nums; }
.preview small { color: var(--text-muted); font-size: 11px; }
.error { margin: 0; color: var(--red, #dc2626); font-size: 12px; }
@media (max-width: 560px) { .custom, .preview { grid-template-columns: 1fr; } }
</style>
