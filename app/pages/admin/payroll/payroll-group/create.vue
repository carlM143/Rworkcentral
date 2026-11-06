<!-- pages/admin/payroll/payroll-group/create.vue -->
<script setup lang="ts">
import { ArrowLeft, Save } from 'lucide-vue-next'

import type {
  PayrollGroupPayload,
} from '~/types/payroll/payroll-groups/payrollGroup'

const api = usePayrollGroup()
const { saving } = api

const LIST_ROUTE = '/admin/payroll/payroll-group'

// Must match PayrollGroupController::FREQUENCIES
const frequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi_weekly', label: 'Bi-weekly' },
  { value: 'semi_monthly', label: 'Semi-monthly' },
  { value: 'monthly', label: 'Monthly' },
] as const

const form = reactive({
  group_name: '',
  description: '',
  frequency: '',
  is_active: true,
})

const fieldErrors = ref<Record<string, string>>({})
const formError = ref('')

// Same rules as store(): required, max 150 / 2000, frequency in list
const validate = () => {
  const errors: Record<string, string> = {}
  const name = form.group_name.trim()

  if (!name) errors.group_name = 'Group name is required.'
  else if (name.length > 150) errors.group_name = 'Group name must be 150 characters or fewer.'

  if (form.description.length > 2000) {
    errors.description = 'Description must be 2000 characters or fewer.'
  }

  if (!frequencies.some(f => f.value === form.frequency)) {
    errors.frequency = 'Select a pay frequency.'
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

// Pull Laravel 422 field errors out of the response if they exist
const readServerErrors = (err: any) => {
  const errors = err?.data?.errors ?? err?.response?._data?.errors

  if (errors && typeof errors === 'object') {
    fieldErrors.value = Object.fromEntries(
      Object.entries(errors).map(([key, messages]) => [
        key,
        Array.isArray(messages) ? String(messages[0]) : String(messages),
      ]),
    )
  }

  formError.value = api.getErrorMessage(err)
}

const submit = async () => {
  formError.value = ''
  if (!validate()) return

  const payload: PayrollGroupPayload = {
    group_name: form.group_name.trim(),
    description: form.description.trim() || null,
    frequency: form.frequency,
    is_active: form.is_active,
  } as PayrollGroupPayload

  try {
    await api.createGroup(payload)
    await navigateTo({ path: LIST_ROUTE, query: { created: '1' } })
  } catch (err) {
    readServerErrors(err)
  }
}
</script>

<template>
  <section class="payroll-group-create">
    <PageHeader
      title="Add Payroll Group"
      description="Set the group name and how often its employees are paid."
    >
      <AppButton
        :icon="ArrowLeft"
        variant="secondary"
        @click="navigateTo(LIST_ROUTE)"
      >
        Back to payroll groups
      </AppButton>
    </PageHeader>

    <div
      v-if="formError"
      class="page-alert error-alert"
    >
      <span>{{ formError }}</span>
      <button
        type="button"
        @click="formError = ''"
      >
        ×
      </button>
    </div>

    <form
      class="form-card"
      novalidate
      @submit.prevent="submit"
    >
      <div class="field">
        <label for="group_name">Group name</label>
        <input
          id="group_name"
          v-model="form.group_name"
          type="text"
          maxlength="150"
          placeholder="e.g. Office staff – semi-monthly"
          :class="{ invalid: fieldErrors.group_name }"
        >
        <small
          v-if="fieldErrors.group_name"
          class="error"
        >{{ fieldErrors.group_name }}</small>
      </div>

      <div class="field">
        <label for="frequency">Pay frequency</label>
        <select
          id="frequency"
          v-model="form.frequency"
          :class="{ invalid: fieldErrors.frequency }"
        >
          <option
            value=""
            disabled
          >
            Select frequency
          </option>
          <option
            v-for="f in frequencies"
            :key="f.value"
            :value="f.value"
          >
            {{ f.label }}
          </option>
        </select>
        <small
          v-if="fieldErrors.frequency"
          class="error"
        >{{ fieldErrors.frequency }}</small>
        <small
          v-else
          class="hint"
        >This can't be changed once the group has payroll records.</small>
      </div>

      <div class="field">
        <label for="description">Description <span class="optional">(optional)</span></label>
        <textarea
          id="description"
          v-model="form.description"
          rows="4"
          maxlength="2000"
          placeholder="Who belongs in this group?"
          :class="{ invalid: fieldErrors.description }"
        />
        <small
          v-if="fieldErrors.description"
          class="error"
        >{{ fieldErrors.description }}</small>
        <small
          v-else
          class="hint"
        >{{ form.description.length }} / 2000</small>
      </div>

      <label class="toggle">
        <input
          v-model="form.is_active"
          type="checkbox"
        >
        <span>
          <strong>Active</strong>
          <small>Active groups can receive new employee assignments.</small>
        </span>
      </label>

      <div class="actions">
        <AppButton
          variant="secondary"
          type="button"
          :disabled="saving"
          @click="navigateTo(LIST_ROUTE)"
        >
          Cancel
        </AppButton>

        <AppButton
          :icon="Save"
          type="submit"
          :disabled="saving"
        >
          {{ saving ? 'Creating…' : 'Create payroll group' }}
        </AppButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.payroll-group-create {
  width: 100%;
  min-width: 0;
}

.form-card {
  display: grid;
  gap: 18px;
  max-width: 640px;
  margin-top: 14px;
  padding: 22px;
  border: 1px solid var(--border, rgb(127 127 127 / 20%));
  border-radius: 10px;
  background: var(--surface, transparent);
}

.field {
  display: grid;
  gap: 6px;
}

.field label {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
}

.optional {
  color: var(--text-muted);
  font-weight: 400;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid var(--border, rgb(127 127 127 / 30%));
  border-radius: 8px;
  background: var(--input-bg, transparent);
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--primary);
  outline: 2px solid var(--primary-soft);
}

.field .invalid {
  border-color: var(--red, #f87171);
}

.error {
  color: var(--red, #f87171);
  font-size: 11px;
}

.hint {
  color: var(--text-muted);
  font-size: 11px;
}

.toggle {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.toggle input {
  margin-top: 2px;
  accent-color: var(--primary);
}

.toggle strong,
.toggle small {
  display: block;
}

.toggle strong {
  color: var(--text-primary);
  font-size: 12px;
}

.toggle small {
  margin-top: 2px;
  color: var(--text-muted);
  font-size: 11px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 6px;
}

.page-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  max-width: 640px;
  margin: 12px 0;
  padding: 11px 14px;
  border-radius: 8px;
  font-size: 12px;
}

.page-alert button {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
}

.error-alert {
  background: rgb(248 113 113 / 10%);
  color: var(--red);
}

@media (max-width: 550px) {
  .form-card {
    padding: 16px;
  }

  .actions {
    flex-direction: column-reverse;
  }
}
</style>