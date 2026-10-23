
<script setup lang="ts">
import { X, CalendarRange, Save } from 'lucide-vue-next'
import type { PayrollPeriod, PayrollPeriodFormData } from '~/types/payrollPeriod'

const props = withDefaults(defineProps<{
  open: boolean
  period?: PayrollPeriod | null
  saving?: boolean
}>(), {
  period: null,
  saving: false,
})

const emit = defineEmits<{
  close: []
  save: [payload: PayrollPeriodFormData]
}>()

const { error: showError } = useToast()

const form = reactive<PayrollPeriodFormData>({
  periodName: '',
  cutoffStart: '',
  cutoffEnd: '',
  paymentDate: '',
})

const isEdit = computed(() => Boolean(props.period))

const reset = () => {
  form.periodName = ''
  form.cutoffStart = ''
  form.cutoffEnd = ''
  form.paymentDate = ''
}

const load = () => {
  if (!props.period) {
    reset()
    return
  }

  form.periodName = props.period.periodName
  form.cutoffStart = props.period.cutoffStart
  form.cutoffEnd = props.period.cutoffEnd
  form.paymentDate = props.period.paymentDate
}

watch(
  () => [props.open, props.period] as const,
  () => {
    if (props.open) load()
  },
  { immediate: true },
)

const closeModal = () => {
  if (props.saving) return
  emit('close')
}

const handleSave = () => {
  if (props.saving) return

  if (!form.periodName.trim()) {
    showError(
      'Period Name Required',
      'Please enter the payroll period name.',
    )
    return
  }

  if (!form.cutoffStart || !form.cutoffEnd || !form.paymentDate) {
    showError(
      'Required Dates Missing',
      'Please complete Cutoff Start, Cutoff End and Payment Date.',
    )
    return
  }

  if (form.cutoffEnd < form.cutoffStart) {
    showError(
      'Invalid Cutoff Dates',
      'Cutoff End cannot be earlier than Cutoff Start.',
    )
    return
  }

  if (form.paymentDate < form.cutoffEnd) {
    showError(
      'Invalid Payment Date',
      'Payment Date must be on or after Cutoff End.',
    )
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
    <div
      v-if="open"
      class="overlay"
      @click.self="closeModal"
    >
      <article
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payroll-period-modal-title"
      >
        <!-- HEADER -->
        <header>
          <div class="heading">
            <div class="icon">
              <CalendarRange :size="19" />
            </div>

            <div>
              <h2 id="payroll-period-modal-title">
                {{ isEdit ? 'Edit Payroll Period' : 'Create Payroll Period' }}
              </h2>

              <p>
                Configure the company's payroll cutoff and payment schedule.
              </p>
            </div>
          </div>

          <button
            type="button"
            class="close"
            :disabled="saving"
            aria-label="Close modal"
            @click="closeModal"
          >
            <X :size="18" />
          </button>
        </header>

        <!-- FORM -->
        <form @submit.prevent="handleSave">
          <div class="body">
            <!-- PERIOD NAME -->
            <div class="field full">
              <label for="payroll-period-name">
                Period Name <span class="required">*</span>
              </label>

              <input
                id="payroll-period-name"
                v-model="form.periodName"
                type="text"
                maxlength="255"
                placeholder="Example: October 1–15, 2026"
                :disabled="saving"
                required
              />
            </div>

            <!-- CUTOFF DATES -->
            <div class="grid">
              <div class="field">
                <label for="payroll-cutoff-start">
                  Cutoff Start <span class="required">*</span>
                </label>

                <input
                  id="payroll-cutoff-start"
                  v-model="form.cutoffStart"
                  type="date"
                  :disabled="saving"
                  required
                />

                <small>
                  First day covered by this payroll period.
                </small>
              </div>

              <div class="field">
                <label for="payroll-cutoff-end">
                  Cutoff End <span class="required">*</span>
                </label>

                <input
                  id="payroll-cutoff-end"
                  v-model="form.cutoffEnd"
                  type="date"
                  :min="form.cutoffStart || undefined"
                  :disabled="saving"
                  required
                />

                <small>
                  Last day covered by this payroll period.
                </small>
              </div>
            </div>

            <!-- PAYMENT DATE -->
            <div class="grid">
              <div class="field">
                <label for="payroll-payment-date">
                  Payment Date <span class="required">*</span>
                </label>

                <input
                  id="payroll-payment-date"
                  v-model="form.paymentDate"
                  type="date"
                  :min="form.cutoffEnd || undefined"
                  :disabled="saving"
                  required
                />

                <small>
                  Scheduled date for employee salary payment.
                </small>
              </div>
            </div>

            <!-- INFORMATION -->
            <div class="info-panel">
              <div class="info-icon">
                <CalendarRange :size="16" />
              </div>

              <div>
                <strong>Payroll Period Configuration</strong>
                <p>
                  The cutoff dates define the payroll coverage period.
                  The payment date specifies when employees are scheduled
                  to receive their salaries.
                </p>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <footer>
            <span>
              {{ isEdit
                ? 'Changes will update the existing payroll period.'
                : 'New payroll periods will start as Draft.'
              }}
            </span>

            <div class="footer-actions">
              <AppButton
                variant="secondary"
                :disabled="saving"
                @click="closeModal"
              >
                Cancel
              </AppButton>

              <AppButton
                :icon="Save"
                :disabled="saving"
                @click="handleSave"
              >
                {{ saving
                  ? 'Saving...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Payroll Period'
                }}
              </AppButton>
            </div>
          </footer>
        </form>
      </article>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay{
  position:fixed;
  z-index:99990;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  background:rgba(3,8,18,.76);
  backdrop-filter:blur(4px);
}
.modal{
  width:100%;
  max-width:700px;
  max-height:90vh;
  overflow-y:auto;
  border:1px solid var(--border);
  border-radius:13px;
  background:var(--bg-card);
  box-shadow:0 24px 70px rgba(0,0,0,.25);
}
header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
  padding:16px 18px;
  border-bottom:1px solid var(--border-soft);
}
.heading{
  display:flex;
  align-items:center;
  gap:10px;
}
.icon{
  display:flex;
  width:40px;
  height:40px;
  flex-shrink:0;
  align-items:center;
  justify-content:center;
  border-radius:9px;
  background:var(--primary-soft);
  color:var(--primary);
}
h2{
  margin:0;
  color:var(--text-primary);
  font-size:14px;
}
.heading p{
  margin:3px 0 0;
  color:var(--text-muted);
  font-size:8px;
}
.close{
  display:flex;
  width:32px;
  height:32px;
  flex-shrink:0;
  align-items:center;
  justify-content:center;
  border:1px solid var(--border);
  border-radius:7px;
  background:transparent;
  color:var(--text-secondary);
  cursor:pointer;
}
.close:hover{
  background:var(--bg-card-soft);
  color:var(--text-primary);
}
.close:disabled{
  opacity:.5;
  cursor:not-allowed;
}
.body{
  padding:17px 18px;
}
.grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:10px;
}
.field{
  min-width:0;
  margin-bottom:14px;
}
.field label{
  display:block;
  margin-bottom:6px;
  color:var(--text-primary);
  font-size:10px;
  font-weight:600;
}
.required{
  color:var(--red);
}
.field input{
  box-sizing:border-box;
  width:100%;
  height:39px;
  padding:0 10px;
  border:1px solid var(--border);
  border-radius:7px;
  outline:none;
  background:var(--bg-card-soft);
  color:var(--text-primary);
  font-family:inherit;
  font-size:10px;
}
.field input:focus{
  border-color:var(--primary);
  box-shadow:0 0 0 3px rgba(36,107,253,.08);
}
.field input:disabled{
  opacity:.6;
  cursor:not-allowed;
}
.field small{
  display:block;
  margin-top:5px;
  color:var(--text-muted);
  font-size:8px;
  line-height:1.5;
}
.info-panel{
  display:flex;
  align-items:flex-start;
  gap:10px;
  margin-top:7px;
  padding:12px;
  border:1px solid var(--border);
  border-radius:8px;
  background:var(--primary-soft);
}
.info-icon{
  display:flex;
  width:32px;
  height:32px;
  flex-shrink:0;
  align-items:center;
  justify-content:center;
  border-radius:8px;
  background:var(--bg-card);
  color:var(--primary);
}
.info-panel strong{
  display:block;
  color:var(--text-primary);
  font-size:10px;
}
.info-panel p{
  margin:4px 0 0;
  color:var(--text-secondary);
  font-size:9px;
  line-height:1.6;
}
footer{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:13px 18px;
  border-top:1px solid var(--border-soft);
}
footer>span{
  color:var(--text-muted);
  font-size:9px;
}
.footer-actions{
  display:flex;
  align-items:center;
  gap:7px;
}
@media(max-width:600px){
  .grid{grid-template-columns:1fr;gap:0}
  footer{align-items:stretch;flex-direction:column}
  .footer-actions{justify-content:flex-end}
}
</style>
