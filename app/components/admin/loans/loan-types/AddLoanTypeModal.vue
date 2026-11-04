
<script setup lang="ts">
import { computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { X, Save, Plus } from 'lucide-vue-next'

import type {
  CreateLoanTypePayload,
  LoanType,
} from '~/types/loans/loan-types/loanType'

const props = withDefaults(
  defineProps<{
    open: boolean
    busy?: boolean
    error?: string
    loanType?: LoanType | null
  }>(),
  {
    busy: false,
    error: '',
    loanType: null,
  },
)

const emit = defineEmits<{
  close: []
  submit: [payload: CreateLoanTypePayload]
}>()

const defaultForm = (): CreateLoanTypePayload => ({
  loan_code: '',
  loan_name: '',
  provider: '',
  status: true,
})

const form = reactive<CreateLoanTypePayload>(defaultForm())
const isEditing = computed(() => Boolean(props.loanType))

watch(
  [() => props.open, () => props.loanType],
  ([visible, item]) => {
    if (visible) {
      Object.assign(form, item ? {
        loan_code: item.loan_code,
        loan_name: item.loan_name,
        provider: item.provider ?? '',
        status: item.status,
      } : defaultForm())
    }
  },
  { immediate: true },
)

const isValid = computed(() =>
  /^[A-Z0-9_-]+$/.test(form.loan_code.trim().toUpperCase()) &&
  form.loan_name.trim().length > 0 &&
  form.provider.trim().length > 0,
)

const closeModal = () => {
  if (props.busy) return
  emit('close')
}

const handleSubmit = () => {
  if (props.busy || !isValid.value) return

  emit('submit', {
    loan_code: form.loan_code.trim().toUpperCase(),
    loan_name: form.loan_name.trim(),
    provider: form.provider.trim(),
    status: form.status,
  })
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) {
    closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div
        class="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-loan-title"
      >
        <!-- HEADER -->
        <div class="modal-header">
          <div class="modal-heading">
            <h3 id="add-loan-title">{{ isEditing ? 'Edit Loan Type' : 'Add Loan Type' }}</h3>
            <p>{{ isEditing ? 'Update the selected loan type details.' : 'Fill in the loan type details below.' }}</p>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close modal"
            :disabled="busy"
            @click="closeModal"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- FORM -->
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">

            <div v-if="error" class="form-error" role="alert">
              {{ error }}
            </div>

            <div class="form-grid">

              <!-- LOAN CODE -->
              <div class="form-group">
                <label for="loan-code">
                  Loan Code <span class="required">*</span>
                </label>

                <input
                  id="loan-code"
                  v-model.trim="form.loan_code"
                  type="text"
                  placeholder="e.g. SSS-SL"
                  maxlength="50"
                  required
                  :disabled="busy"
                  @input="form.loan_code = form.loan_code.toUpperCase()"
                />
              </div>

              <!-- PROVIDER -->
              <div class="form-group">
                <label for="loan-provider">
                  Provider <span class="required">*</span>
                </label>

                <input
                  id="loan-provider"
                  v-model.trim="form.provider"
                  type="text"
                  placeholder="e.g. SSS, Pag-IBIG, Company"
                  maxlength="150"
                  required
                  :disabled="busy"
                />
              </div>

              <!-- LOAN NAME -->
              <div class="form-group full-width">
                <label for="loan-name">
                  Loan Name <span class="required">*</span>
                </label>

                <input
                  id="loan-name"
                  v-model.trim="form.loan_name"
                  type="text"
                  placeholder="Enter loan type name"
                  maxlength="150"
                  required
                  :disabled="busy"
                />
              </div>

              <!-- STATUS -->
              <div class="form-group full-width">
                <label for="loan-status">
                  Status <span class="required">*</span>
                </label>

                <select
                  id="loan-status"
                  v-model="form.status"
                  :disabled="busy"
                >
                  <option :value="true">Active</option>
                  <option :value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="modal-footer">
            <button
              type="button"
              class="cancel-button"
              :disabled="busy"
              @click="closeModal"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="save-button"
              :disabled="busy || !isValid"
            >
              <Save v-if="busy" :size="16" />
              <Plus v-else :size="16" />

              {{ busy ? 'Saving...' : isEditing ? 'Update Loan Type' : 'Save Loan Type' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(5px);
}

.modal-container {
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border, #29364d);
  border-radius: 14px;
  background: var(--bg-card, #131e30);
  box-shadow: 0 20px 60px rgba(0, 0, 0, .3);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  padding: 22px 24px 14px;
}

.modal-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
}

.modal-heading p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 12px;
}

.close-button {
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.close-button:hover {
  color: var(--text-primary);
  background: var(--bg-card-soft);
}

.modal-body {
  padding: 18px 24px 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
}

.required {
  color: var(--red, #ef4444);
}

.form-group input,
.form-group select {
  width: 100%;
  height: 42px;
  padding: 0 13px;
  border: 1px solid var(--border, #29364d);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft, #182438);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  font-weight: 400;
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--primary, #327bff);
}

.form-group input:disabled,
.form-group select:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.form-error {
  padding: 11px 13px;
  margin-bottom: 16px;
  border: 1px solid var(--red, #ef4444);
  border-radius: 8px;
  background: var(--red-soft, rgba(239, 68, 68, .1));
  color: var(--red, #ef4444);
  font-size: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 22px;
}

.cancel-button,
.save-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-primary);
}

.save-button {
  border: 1px solid var(--primary, #327bff);
  background: var(--primary, #327bff);
  color: #fff;
}

.cancel-button:hover {
  background: var(--bg-card-soft);
}

.save-button:hover:not(:disabled) {
  filter: brightness(1.1);
}

.save-button:disabled,
.cancel-button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
