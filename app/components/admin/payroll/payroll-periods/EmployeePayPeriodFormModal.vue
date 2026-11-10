<script setup lang="ts">
import { X, Wand2 } from 'lucide-vue-next'
import type {
  PayrollPeriodFormData,
  PayrollPeriodFormValue,
} from '~/types/payroll/payroll-periods/payrollPeriod'

const props = defineProps<{
  open: boolean
  period: PayrollPeriodFormValue | null
  saving: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [form: PayrollPeriodFormData]
}>()

const CUTOFF_1_START_DAY = 23
const CUTOFF_1_END_DAY = 7
const CUTOFF_2_START_DAY = 8
const CUTOFF_2_END_DAY = 22

const empty = (): PayrollPeriodFormData => ({
  periodName: '',
  cutoffNumber: 1,
  payPeriodStart: '',
  payPeriodEnd: '',
  cutoffStart: '',
  cutoffEnd: '',
  paymentDate: '',
})

const form = reactive<PayrollPeriodFormData>(empty())
const errors = ref<Record<string, string>>({})

const isEditing = computed(() => !!props.period)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    errors.value = {}
    Object.assign(form, props.period
      ? {
          periodName: props.period.periodName,
          cutoffNumber: props.period.cutoffNumber ?? 1,
          payPeriodStart: props.period.payPeriodStart ?? '',
          payPeriodEnd: props.period.payPeriodEnd ?? '',
          cutoffStart: props.period.cutoffStart,
          cutoffEnd: props.period.cutoffEnd,
          paymentDate: props.period.paymentDate,
        }
      : empty())
  },
  { immediate: true },
)

const pad = (n: number) => String(n).padStart(2, '0')
const toIso = (y: number, m: number, d: number) => {
  const date = new Date(y, m, d)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const monthName = (m: number) =>
  new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2000, m, 1))

const suggestFromPayStart = () => {
  if (!form.payPeriodStart) {
    errors.value = { payPeriodStart: 'Pick the pay period start first.' }
    return
  }

  const [y = NaN, m = NaN, d = NaN] = form.payPeriodStart.split('-').map(Number)

  if ([y, m, d].some(Number.isNaN)) {
    errors.value = { payPeriodStart: 'Enter a valid date.' }
    return
  }
  const month = m - 1
  const isFirstHalf = d <= 15
  const lastDay = new Date(y, month + 1, 0).getDate()

  form.cutoffNumber = isFirstHalf ? 1 : 2
  form.payPeriodStart = toIso(y, month, isFirstHalf ? 1 : 16)
  form.payPeriodEnd = toIso(y, month, isFirstHalf ? 15 : lastDay)

  if (isFirstHalf) {
    form.cutoffStart = toIso(y, month - 1, CUTOFF_1_START_DAY)
    form.cutoffEnd = toIso(y, month, CUTOFF_1_END_DAY)
  } else {
    form.cutoffStart = toIso(y, month, CUTOFF_2_START_DAY)
    form.cutoffEnd = toIso(y, month, CUTOFF_2_END_DAY)
  }

  form.paymentDate = form.payPeriodEnd
  form.periodName = `${monthName(month)} ${isFirstHalf ? 1 : 16}–${isFirstHalf ? 15 : lastDay}, ${y}`
  errors.value = {}
}

const validate = () => {
  const e: Record<string, string> = {}

  if (!form.periodName.trim()) e.periodName = 'Period name is required.'
  if (!form.payPeriodStart) e.payPeriodStart = 'Required.'
  if (!form.payPeriodEnd) e.payPeriodEnd = 'Required.'
  if (form.payPeriodStart && form.payPeriodEnd && form.payPeriodEnd < form.payPeriodStart) {
    e.payPeriodEnd = 'Must be on or after the start.'
  }
  if (!form.cutoffStart) e.cutoffStart = 'Required.'
  if (!form.cutoffEnd) e.cutoffEnd = 'Required.'
  if (form.cutoffStart && form.cutoffEnd && form.cutoffEnd < form.cutoffStart) {
    e.cutoffEnd = 'Must be on or after the start.'
  }
  if (!form.paymentDate) e.paymentDate = 'Required.'
  if (form.paymentDate && form.cutoffEnd && form.paymentDate < form.cutoffEnd) {
    e.paymentDate = 'Must be on or after the cut-off end.'
  }

  errors.value = e
  return Object.keys(e).length === 0
}

const submit = () => {
  if (!validate()) return
  emit('save', { ...form, periodName: form.periodName.trim() })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="overlay"
      @click.self="emit('close')"
    >
      <form
        class="card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="period-form-title"
        novalidate
        @submit.prevent="submit"
      >
        <div class="head">
          <div>
            <h3 id="period-form-title">{{ isEditing ? 'Edit Payroll Period' : 'Create Payroll Period' }}</h3>
            <p>The pay period is the salary being paid. The cut-off is the attendance days counted.</p>
          </div>
          <button
            type="button"
            class="close"
            aria-label="Close"
            @click="emit('close')"
          >
            <X :size="17" />
          </button>
        </div>

        <div class="body">
          <fieldset>
            <legend>Pay period</legend>
            <div class="row">
              <label>
                <span>Start</span>
                <input v-model="form.payPeriodStart" type="date" :class="{ invalid: errors.payPeriodStart }">
                <small v-if="errors.payPeriodStart" class="error">{{ errors.payPeriodStart }}</small>
              </label>
              <label>
                <span>End</span>
                <input v-model="form.payPeriodEnd" type="date" :class="{ invalid: errors.payPeriodEnd }">
                <small v-if="errors.payPeriodEnd" class="error">{{ errors.payPeriodEnd }}</small>
              </label>
            </div>
            <button
              type="button"
              class="suggest"
              @click="suggestFromPayStart"
            >
              <Wand2 :size="13" />
              Fill the rest from the pay period start
            </button>
          </fieldset>

          <fieldset>
            <legend>Cut-off (attendance counted)</legend>
            <div class="row">
              <label>
                <span>Start</span>
                <input v-model="form.cutoffStart" type="date" :class="{ invalid: errors.cutoffStart }">
                <small v-if="errors.cutoffStart" class="error">{{ errors.cutoffStart }}</small>
              </label>
              <label>
                <span>End</span>
                <input v-model="form.cutoffEnd" type="date" :class="{ invalid: errors.cutoffEnd }">
                <small v-if="errors.cutoffEnd" class="error">{{ errors.cutoffEnd }}</small>
              </label>
            </div>
          </fieldset>

          <div class="row">
            <label>
              <span>Cutoff number</span>
              <select v-model.number="form.cutoffNumber">
                <option :value="1">1st cutoff</option>
                <option :value="2">2nd cutoff</option>
              </select>
            </label>
            <label>
              <span>Payment date</span>
              <input v-model="form.paymentDate" type="date" :class="{ invalid: errors.paymentDate }">
              <small v-if="errors.paymentDate" class="error">{{ errors.paymentDate }}</small>
            </label>
          </div>

          <label>
            <span>Period name</span>
            <input
              v-model="form.periodName"
              type="text"
              maxlength="255"
              placeholder="e.g. November 1–15, 2026"
              :class="{ invalid: errors.periodName }"
            >
            <small v-if="errors.periodName" class="error">{{ errors.periodName }}</small>
          </label>
        </div>

        <div class="foot">
          <AppButton
            variant="secondary"
            type="button"
            :disabled="saving"
            @click="emit('close')"
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            :disabled="saving"
          >
            {{ saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Period' }}
          </AppButton>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.65);backdrop-filter:blur(3px)}
.card{width:100%;max-width:560px;max-height:calc(100vh - 32px);overflow-y:auto;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);box-shadow:0 24px 70px rgba(0,0,0,.3)}
.head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:17px 19px;border-bottom:1px solid var(--border-soft)}
.head h3{margin:0;color:var(--text-primary);font-size:15px}
.head p{margin:5px 0 0;color:var(--text-muted);font-size:10px}
.close{display:flex;width:30px;height:30px;flex-shrink:0;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text-secondary);cursor:pointer}
.body{display:grid;gap:14px;padding:16px 19px}
fieldset{display:grid;gap:10px;margin:0;padding:12px;border:1px solid var(--border-soft);border-radius:9px}
legend{padding:0 6px;color:var(--text-primary);font-size:11px;font-weight:600}
.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
label{display:grid;gap:5px}
label span{color:var(--text-secondary);font-size:10px;font-weight:600}
input,select{width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:7px;background:var(--bg-card-soft,transparent);color:var(--text-primary);font:inherit;font-size:12px}
input:focus,select:focus{border-color:var(--primary);outline:2px solid var(--primary-soft)}
.invalid{border-color:var(--red)}
.error{color:var(--red);font-size:10px}
.suggest{display:inline-flex;width:max-content;align-items:center;gap:6px;padding:0;border:0;background:transparent;color:var(--primary);font:inherit;font-size:11px;font-weight:600;cursor:pointer}
.foot{display:flex;justify-content:flex-end;gap:8px;padding:13px 19px;border-top:1px solid var(--border-soft)}
@media(max-width:520px){.row{grid-template-columns:1fr}}
</style>