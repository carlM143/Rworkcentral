
<script setup lang="ts">
import {
  X,
  Landmark,
  Save,
  Plus,
} from 'lucide-vue-next'

import type {
  WageOrder,
  WageOrderStatus,
} from '~/types/wageManagement'

type Mode = 'create' | 'view' | 'edit'

type WageOrderPayload = Omit<
  WageOrder,
  'id' | 'increaseAmount'
>

const props = defineProps<{
  open: boolean
  mode: Mode
  order?: WageOrder | null
  existingCodes?: string[]
}>()

const emit = defineEmits<{
  close: []
  save: [payload: WageOrderPayload]
}>()

const form = reactive<WageOrderPayload>({
  code: '',
  title: '',
  region: '',
  classification: '',
  oldMinimumRate: 0,
  newMinimumRate: 0,
  effectiveDate: '',
  tranche: 'Single Tranche',
  source: '',
  status: 'Draft',
})

const error = ref('')

const regionOptions = [
  'NCR',
  'CAR',
  'Region I',
  'Region II',
  'Region III',
  'Region IV-A',
  'Region IV-B',
  'Region V',
  'Region VI',
  'Region VII',
  'Region VIII',
  'Region IX',
  'Region X',
  'Region XI',
  'Region XII',
  'Region XIII',
  'BARMM',
]

const statusOptions: WageOrderStatus[] = [
  'Draft',
  'Scheduled',
  'Active',
  'Superseded',
]

const isView = computed(() => props.mode === 'view')

const title = computed(() => {
  if (props.mode === 'create') return 'Add Wage Order'
  if (props.mode === 'edit') return 'Edit Wage Order'
  return 'Wage Order Details'
})

const increase = computed(() => {
  return Number(
    (
      Number(form.newMinimumRate || 0) -
      Number(form.oldMinimumRate || 0)
    ).toFixed(2),
  )
})

const money = (value: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(value)

const resetForm = () => {
  Object.assign(form, {
    code: '',
    title: '',
    region: '',
    classification: '',
    oldMinimumRate: 0,
    newMinimumRate: 0,
    effectiveDate: '',
    tranche: 'Single Tranche',
    source: '',
    status: 'Draft',
  })

  error.value = ''
}

watch(
  () => [props.open, props.order, props.mode],
  () => {
    if (!props.open) return

    resetForm()

    if (props.order) {
      Object.assign(form, {
        code: props.order.code,
        title: props.order.title,
        region: props.order.region,
        classification: props.order.classification,
        oldMinimumRate: props.order.oldMinimumRate,
        newMinimumRate: props.order.newMinimumRate,
        effectiveDate: props.order.effectiveDate,
        tranche: props.order.tranche,
        source: props.order.source,
        status: props.order.status,
      })
    }
  },
  { immediate: true },
)

const close = () => emit('close')

const save = () => {
  if (isView.value) return

  error.value = ''

  const code = form.code.trim()

  if (
    !code ||
    !form.title.trim() ||
    !form.region ||
    !form.classification.trim() ||
    !form.effectiveDate ||
    !form.tranche.trim() ||
    !form.source.trim()
  ) {
    error.value = 'Please complete all required fields.'
    return
  }

  const duplicate = (props.existingCodes ?? []).some(
    existing =>
      existing.toLowerCase() === code.toLowerCase() &&
      code.toLowerCase() !== props.order?.code.toLowerCase(),
  )

  if (duplicate) {
    error.value = 'Wage order number already exists.'
    return
  }

  if (
    !Number.isFinite(form.oldMinimumRate) ||
    !Number.isFinite(form.newMinimumRate) ||
    form.oldMinimumRate < 0 ||
    form.newMinimumRate <= 0
  ) {
    error.value = 'Please provide valid minimum wage rates.'
    return
  }

  if (increase.value < 0) {
    error.value = 'New minimum must not be lower than previous rate.'
    return
  }

  emit('save', {
    code,
    title: form.title.trim(),
    region: form.region,
    classification: form.classification.trim(),
    oldMinimumRate: Number(form.oldMinimumRate),
    newMinimumRate: Number(form.newMinimumRate),
    effectiveDate: form.effectiveDate,
    tranche: form.tranche.trim(),
    source: form.source.trim(),
    status: form.status,
  })
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) close()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() =>
  document.removeEventListener('keydown', onKeydown),
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="wage-modal-overlay"
      @click.self="close"
    >
      <section
        class="wage-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <header class="modal-header">
          <span class="modal-icon">
            <Landmark :size="18" />
          </span>

          <div class="modal-heading">
            <h3>{{ title }}</h3>
            <p>Government minimum wage configuration</p>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close modal"
            @click="close"
          >
            <X :size="17" />
          </button>
        </header>

        <form id="wage-order-form" @submit.prevent="save">
          <div class="modal-body">
            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Wage Order Number *</label>
                <input
                  v-model="form.code"
                  :disabled="isView"
                  required
                  placeholder="NCR-WO-2026-02"
                />
              </div>

              <div class="field">
                <label>Region *</label>
                <select
                  v-model="form.region"
                  :disabled="isView"
                  required
                >
                  <option value="">Select Region</option>
                  <option
                    v-for="region in regionOptions"
                    :key="region"
                    :value="region"
                  >
                    {{ region }}
                  </option>
                </select>
              </div>

              <div class="field full">
                <label>Wage Order Title *</label>
                <input
                  v-model="form.title"
                  :disabled="isView"
                  required
                  placeholder="Regional Minimum Wage Adjustment"
                />
              </div>

              <div class="field">
                <label>Classification *</label>
                <input
                  v-model="form.classification"
                  :disabled="isView"
                  required
                  placeholder="Non-Agriculture"
                />
              </div>

              <div class="field">
                <label>Tranche *</label>
                <select
                  v-model="form.tranche"
                  :disabled="isView"
                  required
                >
                  <option>Single Tranche</option>
                  <option>Tranche 1</option>
                  <option>Tranche 2</option>
                  <option>Tranche 3</option>
                </select>
              </div>

              <div class="field">
                <label>Previous Minimum Rate (PHP) *</label>
                <input
                  v-model.number="form.oldMinimumRate"
                  :disabled="isView"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div class="field">
                <label>New Minimum Rate (PHP) *</label>
                <input
                  v-model.number="form.newMinimumRate"
                  :disabled="isView"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div class="increase-summary full">
                <div>
                  <span>Calculated Wage Increase</span>
                  <strong :class="{ negative: increase < 0 }">
                    {{ money(increase) }}
                  </strong>
                </div>
                <small>Difference between new and previous rates</small>
              </div>

              <div class="field">
                <label>Effective Date *</label>
                <input
                  v-model="form.effectiveDate"
                  :disabled="isView"
                  type="date"
                  required
                />
              </div>

              <div class="field">
                <label>Status *</label>
                <select v-model="form.status" :disabled="isView">
                  <option
                    v-for="item in statusOptions"
                    :key="item"
                    :value="item"
                  >
                    {{ item }}
                  </option>
                </select>
              </div>

              <div class="field full">
                <label>Source / Official Reference *</label>
                <input
                  v-model="form.source"
                  :disabled="isView"
                  required
                  placeholder="DOLE / RTWPB Wage Order Reference"
                />
              </div>
            </div>

            <p class="form-note">
              Wage order rates must be verified against the official
              government issuance. Changes here do not automatically
              update employee salaries or historical payroll.
            </p>
          </div>

          <footer class="modal-footer">
            <button
              type="button"
              class="cancel-button"
              @click="close"
            >
              {{ isView ? 'Close' : 'Cancel' }}
            </button>

            <button
              v-if="!isView"
              type="submit"
              class="save-button"
            >
              <Plus v-if="mode === 'create'" :size="15" />
              <Save v-else :size="15" />

              {{
                mode === 'create'
                  ? 'Add Wage Order'
                  : 'Save Changes'
              }}
            </button>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.wage-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(2,9,22,.76);
  backdrop-filter: blur(5px);
}

.wage-modal {
  width: 100%;
  max-width: 620px;
  max-height: 92vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 24px 65px rgba(0,0,0,.3);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 15px 17px;
  border-bottom: 1px solid var(--border);
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.modal-heading {
  flex: 1;
}

.modal-heading h3 {
  margin: 0;
  font-size: 14px;
}

.modal-heading p {
  margin: 4px 0 0;
  font-size: 10px;
  color: var(--text-muted);
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 29px;
  height: 29px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.close-button:hover {
  border-color: var(--border);
}

.wage-modal form {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.modal-body {
  padding: 17px;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 13px;
}

.full {
  grid-column: 1 / -1;
}

.field label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 650;
}

.field input,
.field select {
  width: 100%;
  height: 38px;
  box-sizing: border-box;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
}

.field input:focus,
.field select:focus {
  border-color: var(--primary);
}

.field input:disabled,
.field select:disabled {
  opacity: .8;
  cursor: default;
}

.increase-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 13px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.increase-summary span {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
}

.increase-summary strong {
  display: block;
  margin-top: 5px;
  font-size: 16px;
  color: var(--green);
}

.increase-summary strong.negative {
  color: var(--red);
}

.increase-summary small {
  max-width: 170px;
  text-align: right;
  color: var(--text-muted);
  font-size: 9px;
}

.form-note {
  margin: 14px 0 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.6;
}

.error-message {
  margin-bottom: 13px;
  padding: 10px;
  border: 1px solid var(--red);
  border-radius: 7px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 11px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 17px;
  border-top: 1px solid var(--border);
}

.cancel-button,
.save-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 13px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-primary);
}

.save-button {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .increase-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .increase-summary small {
    text-align: left;
  }
}
</style>
