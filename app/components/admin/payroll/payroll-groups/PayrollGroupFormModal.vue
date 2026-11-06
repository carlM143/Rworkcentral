<script setup lang="ts">
import { X, Save } from 'lucide-vue-next'

import type {
  PayrollGroup,
  PayrollGroupPayload,
  PayrollFrequency,
} from '~/types/payroll/payroll-groups/payrollGroup'

const props = defineProps<{
  open: boolean
  group: PayrollGroup | null
  saving: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [payload: PayrollGroupPayload]
}>()

const form = reactive<PayrollGroupPayload>({
  group_name: '',
  description: '',
  frequency: 'monthly',
  is_active: true,
})

const errors = ref<Record<string, string>>({})

watch(
  () => [props.open, props.group] as const,
  ([isOpen, group]) => {
    if (!isOpen) return

    errors.value = {}

    Object.assign(form, {
      group_name: group?.group_name || '',
      description: group?.description || '',
      frequency: group?.frequency || 'monthly',
      is_active: group?.is_active ?? true,
    })
  },
  { immediate: true },
)

const submit = () => {
  errors.value = {}

  if (!form.group_name.trim()) {
    errors.value.group_name = 'Group name is required.'
    return
  }

  if (form.group_name.length > 150) {
    errors.value.group_name = 'Maximum 150 characters.'
    return
  }

  emit('save', {
    group_name: form.group_name.trim(),
    description: form.description?.trim() || null,
    frequency: form.frequency,
    is_active: form.is_active,
  })
}

const frequencies: {
  label: string
  value: PayrollFrequency
}[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Bi-weekly', value: 'bi_weekly' },
  { label: 'Semi-monthly', value: 'semi_monthly' },
  { label: 'Monthly', value: 'monthly' },
]
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-overlay"
      @click.self="emit('close')"
    >
      <section class="modal-card">
        <header class="modal-header">
          <div>
            <h3>
              {{ group ? 'Edit Payroll Group' : 'Create Payroll Group' }}
            </h3>
            <p>Configure payroll group information.</p>
          </div>

          <button
            class="close-button"
            type="button"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>
        </header>

        <form @submit.prevent="submit">
          <div class="modal-body">
            <div class="field">
              <label>Group Name <span>*</span></label>
              <AppInput
                v-model="form.group_name"
                placeholder="Enter payroll group name"
              />
              <small v-if="errors.group_name" class="error">
                {{ errors.group_name }}
              </small>
            </div>

            <div class="field">
              <label>Pay Frequency <span>*</span></label>

              <select
                v-model="form.frequency"
                class="form-select"
              >
                <option
                  v-for="item in frequencies"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Description</label>

              <textarea
                v-model="form.description"
                rows="4"
                maxlength="2000"
                placeholder="Enter group description..."
              />

              <small class="counter">
                {{ form.description?.length || 0 }}/2000
              </small>
            </div>

            <label class="active-toggle">
              <input
                v-model="form.is_active"
                type="checkbox"
              >

              <span>
                <strong>Active Payroll Group</strong>
                <small>
                  Allow this group to receive new employee assignments.
                </small>
              </span>
            </label>

            <p
              v-if="group?.payrolls_count && form.frequency !== group.frequency"
              class="warning"
            >
              This group has payroll records. Its frequency cannot be changed.
            </p>
          </div>

          <footer class="modal-footer">
            <AppButton
              variant="secondary"
              type="button"
              @click="emit('close')"
            >
              Cancel
            </AppButton>

            <AppButton
              :icon="Save"
              :loading="saving"
              :disabled="saving || (!!group?.payrolls_count && form.frequency !== group.frequency)"
              type="submit"
            >
              {{ group ? 'Save Changes' : 'Create Group' }}
            </AppButton>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 100000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(0, 0, 0, .55);
  backdrop-filter: blur(3px);
}

.modal-card {
  width: min(510px, 100%);
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: 0 20px 60px rgba(0, 0, 0, .3);
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 19px;
  border-bottom: 1px solid var(--border-soft);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
}

.modal-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.close-button {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-body {
  display: grid;
  gap: 16px;
  padding: 19px;
}

.field {
  display: grid;
  gap: 7px;
}

.field label {
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
}

.field label span {
  color: var(--red);
}

.form-select,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
}

textarea {
  resize: vertical;
}

.form-select:focus,
textarea:focus {
  border-color: var(--primary);
}

.error {
  color: var(--red);
  font-size: 10px;
}

.counter {
  color: var(--text-muted);
  text-align: right;
  font-size: 10px;
}

.active-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.active-toggle input {
  accent-color: var(--primary);
}

.active-toggle strong,
.active-toggle small {
  display: block;
}

.active-toggle strong {
  color: var(--text-primary);
  font-size: 11px;
}

.active-toggle small {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 10px;
}

.warning {
  margin: 0;
  color: #e5a33b;
  font-size: 11px;
}

.modal-footer {
  justify-content: flex-end;
  border-top: 1px solid var(--border-soft);
  border-bottom: 0;
}
</style>