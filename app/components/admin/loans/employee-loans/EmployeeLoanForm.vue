
<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from 'vue'

import type {
  EmployeeLoanPayload,
} from '~/types/loans/employee-loans/employeeLoan'

interface RawEmployee {
  id: number
  emp_id?: string | number | null
  employee_number?: string | number | null
  name?: string | null
  firstname?: string | null
  middlename?: string | null
  lastname?: string | null
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  firstName?: string | null
  middleName?: string | null
  lastName?: string | null
}

interface LoanTypeOption {
  id: number
  loan_name: string
  loan_code: string
  status: boolean
}

interface EmployeeOption {
  id: number
  name: string
  number: string
}

interface ListResponse<T> {
  success?: boolean
  message?: string
  data: T[] | { data: T[] }
}

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  initial?: EmployeeLoanPayload
  busy?: boolean
  error?: string
}>(), {
  mode: 'create',
  busy: false,
  error: '',
})

const emit = defineEmits<{
  submit: [payload: EmployeeLoanPayload]
  cancel: []
}>()

const { $api } = useNuxtApp()

const form = reactive<EmployeeLoanPayload>({
  employee_id: 0,
  loan_type_id: 0,
  loan_reference_no: '',
  principal_amount: 0,
  total_payable_amount: 0,
  deduction_amount: 0,
  loan_date: '',
  deduction_start_date: '',
  remarks: null,
  status: true,
})

const employees = ref<EmployeeOption[]>([])
const loanTypes = ref<LoanTypeOption[]>([])
const loadingOptions = ref(true)
const optionsError = ref('')

const employeeSearch = ref('')
const employeeOpen = ref(false)
const employeeDropdown = ref<HTMLElement | null>(null)

const unpack = <T,>(response: ListResponse<T>): T[] => {
  if (response.success === false) {
    throw new Error(response.message || 'Unable to load options.')
  }

  if (Array.isArray(response.data)) {
    return response.data
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data
  }

  throw new Error('Invalid API list response.')
}

const getEmployeeName = (item: RawEmployee): string => {
  const fullName = [
    item.firstname ?? item.first_name ?? item.firstName,
    item.middlename ?? item.middle_name ?? item.middleName,
    item.lastname ?? item.last_name ?? item.lastName,
  ].filter(Boolean).join(' ')

  return fullName || item.name || `Employee #${item.id}`
}

const syncSelectedEmployee = () => {
  const selected = employees.value.find(
    item => item.id === form.employee_id,
  )

  if (selected) {
    employeeSearch.value = `${selected.name} (${selected.number})`
  }
}

watch(
  () => props.initial,
  (value) => {
    if (value) {
      Object.assign(form, value)
      syncSelectedEmployee()
    }
  },
  { immediate: true },
)

const filteredEmployees = computed(() => {
  const term = employeeSearch.value.trim().toLowerCase()

  return employees.value
    .filter(item =>
      !term ||
      item.name.toLowerCase().includes(term) ||
      item.number.toLowerCase().includes(term),
    )
    .slice(0, 30)
})

const selectEmployee = (item: EmployeeOption) => {
  form.employee_id = item.id
  employeeSearch.value = `${item.name} (${item.number})`
  employeeOpen.value = false
}

const handleEmployeeInput = () => {
  form.employee_id = 0
  employeeOpen.value = true
}

const handleOutsideClick = (event: MouseEvent) => {
  if (
    event.target instanceof Node &&
    !employeeDropdown.value?.contains(event.target)
  ) {
    employeeOpen.value = false
  }
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(value) || 0)

const valid = computed(() => {
  const principal = Number(form.principal_amount)
  const payable = Number(form.total_payable_amount)
  const deduction = Number(form.deduction_amount)

  return (
    form.employee_id > 0 &&
    form.loan_type_id > 0 &&
    form.loan_reference_no.trim().length > 0 &&
    principal > 0 &&
    payable >= principal &&
    deduction > 0 &&
    deduction <= payable &&
    Boolean(form.loan_date) &&
    Boolean(form.deduction_start_date) &&
    form.deduction_start_date >= form.loan_date
  )
})

const submit = () => {
  if (!valid.value || props.busy || loadingOptions.value) return

  emit('submit', {
    employee_id: form.employee_id,
    loan_type_id: form.loan_type_id,
    loan_reference_no: form.loan_reference_no.trim().toUpperCase(),
    principal_amount: Number(form.principal_amount),
    total_payable_amount: Number(form.total_payable_amount),
    deduction_amount: Number(form.deduction_amount),
    loan_date: form.loan_date,
    deduction_start_date: form.deduction_start_date,
    remarks: form.remarks?.trim() || null,
    status: form.status,
  })
}

onMounted(async () => {
  document.addEventListener('click', handleOutsideClick)

  try {
    const [employeeResponse, typeResponse] = await Promise.all([
      $api<ListResponse<RawEmployee>>('/admin/employees', {
        method: 'GET',
      }),
      $api<ListResponse<LoanTypeOption>>('/admin/loan-types', {
        method: 'GET',
      }),
    ])

    employees.value = unpack(employeeResponse).map(item => ({
      id: item.id,
      name: getEmployeeName(item),
      number: String(
        item.emp_id ?? item.employee_number ?? item.id,
      ),
    }))

    loanTypes.value = unpack(typeResponse)

    syncSelectedEmployee()
  } catch (error: unknown) {
    optionsError.value =
      error instanceof Error
        ? error.message
        : 'Unable to load employees or loan types.'
  } finally {
    loadingOptions.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <form class="loan-form" @submit.prevent="submit">
    <div class="form-heading">
      <h3>Employee Loan Information</h3>
      <p>Enter the employee's loan and deduction details.</p>
    </div>

    <div class="form-body">
      <div v-if="loadingOptions" class="form-message">
        Loading employees and loan types...
      </div>

      <div v-if="optionsError" class="form-error" role="alert">
        {{ optionsError }}
      </div>

      <div v-if="error" class="form-error" role="alert">
        {{ error }}
      </div>

      <div class="form-grid">
        <!-- SEARCHABLE EMPLOYEE -->
        <div ref="employeeDropdown" class="form-group dropdown-root">
          <label for="loan-employee">Employee <span>*</span></label>

          <input
            id="loan-employee"
            v-model="employeeSearch"
            type="text"
            placeholder="Search employee name or ID..."
            autocomplete="off"
            :disabled="busy || loadingOptions"
            @focus="employeeOpen = true"
            @input="handleEmployeeInput"
            @keydown.esc="employeeOpen = false"
          />

          <div
            v-if="employeeOpen && !loadingOptions"
            class="employee-options"
          >
            <button
              v-for="employee in filteredEmployees"
              :key="employee.id"
              type="button"
              @click="selectEmployee(employee)"
            >
              <strong>{{ employee.name }}</strong>
              <small>{{ employee.number }}</small>
            </button>

            <p v-if="!filteredEmployees.length">
              No matching employees found.
            </p>
          </div>
        </div>

        <!-- LOAN TYPE -->
        <div class="form-group">
          <label for="loan-type">Loan Type <span>*</span></label>

          <select
            id="loan-type"
            v-model.number="form.loan_type_id"
            :disabled="busy || loadingOptions"
            required
          >
            <option :value="0" disabled>Select loan type</option>

            <option
              v-for="type in loanTypes"
              :key="type.id"
              :value="type.id"
            >
              {{ type.loan_code }} — {{ type.loan_name }}
            </option>
          </select>
        </div>

        <!-- REFERENCE -->
        <div class="form-group">
          <label for="loan-reference">Loan Reference No. <span>*</span></label>
          <input
            id="loan-reference"
            v-model="form.loan_reference_no"
            type="text"
            placeholder="e.g. LOAN-2026-001"
            maxlength="100"
            :disabled="busy"
            required
          />
        </div>

        <!-- PRINCIPAL -->
        <div class="form-group">
          <label for="loan-principal">Principal Amount <span>*</span></label>
          <input
            id="loan-principal"
            v-model.number="form.principal_amount"
            type="number"
            step="0.01"
            min="0.01"
            :disabled="busy"
            required
          />
        </div>

        <!-- TOTAL PAYABLE -->
        <div class="form-group">
          <label for="loan-payable">Total Payable Amount <span>*</span></label>
          <input
            id="loan-payable"
            v-model.number="form.total_payable_amount"
            type="number"
            step="0.01"
            min="0.01"
            :disabled="busy"
            required
          />
        </div>

        <!-- DEDUCTION -->
        <div class="form-group">
          <label for="loan-deduction">Deduction Amount <span>*</span></label>
          <input
            id="loan-deduction"
            v-model.number="form.deduction_amount"
            type="number"
            step="0.01"
            min="0.01"
            :disabled="busy"
            required
          />
        </div>

        <!-- LOAN DATE -->
        <div class="form-group">
          <label for="loan-date">Loan Date <span>*</span></label>
          <input
            id="loan-date"
            v-model="form.loan_date"
            type="date"
            :disabled="busy"
            required
          />
        </div>

        <!-- DEDUCTION START -->
        <div class="form-group">
          <label for="loan-start">Deduction Start Date <span>*</span></label>
          <input
            id="loan-start"
            v-model="form.deduction_start_date"
            type="date"
            :min="form.loan_date || undefined"
            :disabled="busy"
            required
          />
        </div>

        <!-- STATUS -->
        <div class="form-group">
          <label for="loan-status">Status <span>*</span></label>

          <select
            id="loan-status"
            v-model="form.status"
            :disabled="busy"
          >
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
        </div>

        <!-- REMARKS -->
        <div class="form-group full-width">
          <label for="loan-remarks">Remarks</label>
          <textarea
            id="loan-remarks"
            v-model="form.remarks"
            rows="3"
            placeholder="Optional loan remarks..."
            :disabled="busy"
          />
        </div>
      </div>

      <div class="balance-note">
        Initial Opening Balance:
        <strong>{{ formatMoney(form.total_payable_amount) }}</strong>
        <p>
          This is set automatically when the loan is saved.
          Actual payroll deductions will be recorded separately.
        </p>
      </div>
    </div>

    <div class="form-footer">
      <button
        type="button"
        class="cancel-button"
        :disabled="busy"
        @click="emit('cancel')"
      >
        Cancel
      </button>

      <button
        type="submit"
        class="save-button"
        :disabled="busy || loadingOptions || !!optionsError || !valid"
      >
        {{ busy ? 'Saving...' : mode === 'edit'
          ? 'Update Employee Loan' : 'Save Employee Loan' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.loan-form {
  overflow: visible;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-primary);
}

.form-heading {
  padding: 19px 22px;
  border-bottom: 1px solid var(--border-soft);
}

.form-heading h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 650;
}

.form-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 12px;
}

.form-body {
  padding: 22px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.form-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
}

.form-group label span {
  color: var(--red, #ef4444);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 13px;
  font-weight: 400;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-muted);
}

.employee-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  max-height: 220px;
  margin-top: 5px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 15px 30px rgba(0,0,0,.24);
}

.employee-options button {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.employee-options button:hover {
  background: var(--bg-card-soft);
}

.employee-options strong {
  font-size: 13px;
  font-weight: 500;
}

.employee-options small {
  color: var(--text-muted);
  font-size: 11px;
}

.employee-options p {
  padding: 12px;
  color: var(--text-muted);
  font-size: 12px;
}

.balance-note {
  padding: 13px;
  margin-top: 20px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  font-size: 13px;
}

.balance-note strong {
  color: var(--primary);
}

.balance-note p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 12px;
}

.form-error,
.form-message {
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 12px;
}

.form-error {
  color: var(--red, #ef4444);
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 17px 22px;
  border-top: 1px solid var(--border-soft);
}

.form-footer button {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-button {
  background: transparent;
  color: var(--text-primary);
}

.save-button {
  border-color: var(--primary) !important;
  background: var(--primary);
  color: #fff;
}

.form-footer button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-body,
  .form-heading,
  .form-footer {
    padding: 16px;
  }
}
</style>
