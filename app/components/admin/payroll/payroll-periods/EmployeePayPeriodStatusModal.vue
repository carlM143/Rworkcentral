
<script setup lang="ts">
import { CalendarRange, X, Save } from 'lucide-vue-next'
import type { PayrollPeriod, PayrollPeriodFormData } from '~/types/payrollPeriod'

const props = withDefaults(defineProps<{
  open: boolean
  period?: PayrollPeriod | null
  saving?: boolean
}>(), { period: null, saving: false })

const emit = defineEmits<{
  close: []
  save: [payload: PayrollPeriodFormData]
}>()

const form = reactive<PayrollPeriodFormData>({
  periodName: '',
  cutoffStart: '',
  cutoffEnd: '',
  paymentDate: '',
})

const validationError = ref('')

watch(
  () => [props.open, props.period] as const,
  () => {
    if (!props.open) return
    form.periodName = props.period?.periodName ?? ''
    form.cutoffStart = props.period?.cutoffStart ?? ''
    form.cutoffEnd = props.period?.cutoffEnd ?? ''
    form.paymentDate = props.period?.paymentDate ?? ''
    validationError.value = ''
  },
  { immediate: true },
)

const closeModal = () => {
  if (!props.saving) emit('close')
}

const submit = () => {
  validationError.value = ''

  if (!form.periodName.trim() || !form.cutoffStart || !form.cutoffEnd || !form.paymentDate) {
    validationError.value = 'Please complete all required fields.'
    return
  }

  if (form.cutoffEnd < form.cutoffStart) {
    validationError.value = 'Cutoff End must be on or after Cutoff Start.'
    return
  }

  if (form.paymentDate < form.cutoffEnd) {
    validationError.value = 'Payment Date must be on or after Cutoff End.'
    return
  }

  emit('save', {
    periodName: form.periodName.trim(),
    cutoffStart: form.cutoffStart,
    cutoffEnd: form.cutoffEnd,
    paymentDate: form.paymentDate,
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="period-modal-title">
        <div class="modal-header">
          <div class="modal-title">
            <div class="header-icon"><CalendarRange :size="19" /></div>
            <div>
              <h3 id="period-modal-title">{{ period ? 'Edit Payroll Period' : 'Create Payroll Period' }}</h3>
              <p>Configure the company's payroll cutoff and payment schedule.</p>
            </div>
          </div>
          <button type="button" class="close-button" :disabled="saving" aria-label="Close" @click="closeModal">
            <X :size="17" />
          </button>
        </div>

        <form @submit.prevent="submit">
          <div class="modal-body">
            <div class="section-label">
              <CalendarRange :size="16" />
              <strong>Payroll Period Information</strong>
            </div>

            <div class="form-field">
              <label for="period-name">Period Name <span>*</span></label>
              <input
                id="period-name"
                v-model="form.periodName"
                type="text"
                maxlength="255"
                placeholder="e.g. October 1–15, 2026"
                :disabled="saving"
              />
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label for="cutoff-start">Cutoff Start <span>*</span></label>
                <input id="cutoff-start" v-model="form.cutoffStart" type="date" :disabled="saving" />
              </div>
              <div class="form-field">
                <label for="cutoff-end">Cutoff End <span>*</span></label>
                <input id="cutoff-end" v-model="form.cutoffEnd" type="date" :disabled="saving" />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label for="payment-date">Payment Date <span>*</span></label>
                <input id="payment-date" v-model="form.paymentDate" type="date" :disabled="saving" />
                <small>Date when employee salaries are scheduled for payment.</small>
              </div>
            </div>

            <div class="info-panel">
              Newly created payroll periods will have a <strong>Draft</strong> status.
              Their processing status is managed separately.
            </div>

            <p v-if="validationError" class="validation-error" role="alert">{{ validationError }}</p>
          </div>

          <div class="modal-footer">
            <button type="button" class="cancel-button" :disabled="saving" @click="closeModal">Cancel</button>
            <button type="submit" class="save-button" :disabled="saving">
              <Save :size="15" />
              {{ saving ? 'Saving...' : period ? 'Save Changes' : 'Create Payroll Period' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.65);backdrop-filter:blur(3px)}
.modal-card{width:100%;max-width:660px;max-height:90vh;overflow-y:auto;border:1px solid var(--border);border-radius:13px;background:var(--bg-card);box-shadow:0 24px 70px rgba(0,0,0,.3)}
.modal-header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:17px 19px;border-bottom:1px solid var(--border-soft)}
.modal-title{display:flex;align-items:center;gap:10px}
.header-icon{display:flex;width:38px;height:38px;align-items:center;justify-content:center;border-radius:9px;background:var(--primary-soft);color:var(--primary)}
.modal-title h3{margin:0;color:var(--text-primary);font-size:15px}
.modal-title p{margin:4px 0 0;color:var(--text-muted);font-size:9px}
.close-button{display:flex;width:31px;height:31px;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text-secondary);cursor:pointer}
.modal-body{padding:19px}
.section-label{display:flex;align-items:center;gap:9px;margin-bottom:17px;color:var(--primary);font-size:11px}
.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:15px}
.form-field{min-width:0}
.form-field label{display:block;margin-bottom:7px;color:var(--text-secondary);font-size:10px;font-weight:600}
.form-field label span{color:var(--red)}
.form-field input{width:100%;height:40px;padding:0 12px;border:1px solid var(--border);border-radius:8px;outline:0;background:var(--bg-card);color:var(--text-primary);font:inherit;font-size:11px;color-scheme:dark}
.form-field input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(36,107,253,.08)}
.form-field small{display:block;margin-top:6px;color:var(--text-muted);font-size:9px}
.info-panel{margin-top:19px;padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--primary-soft);color:var(--text-secondary);font-size:10px;line-height:1.55}
.info-panel strong{color:var(--text-primary)}
.validation-error{margin:12px 0 0;color:var(--red);font-size:10px}
.modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:13px 19px;border-top:1px solid var(--border-soft)}
.cancel-button,.save-button{display:inline-flex;min-height:38px;align-items:center;justify-content:center;gap:7px;padding:0 14px;border:1px solid var(--border);border-radius:7px;font-size:11px;font-weight:600;cursor:pointer}
.cancel-button{background:var(--bg-card);color:var(--text-primary)}
.save-button{border-color:var(--primary);background:var(--primary);color:#fff}
.cancel-button:disabled,.save-button:disabled,.close-button:disabled{opacity:.5;cursor:not-allowed}
@media(max-width:600px){.form-grid{grid-template-columns:1fr}.modal-footer{flex-wrap:wrap}}
</style>
