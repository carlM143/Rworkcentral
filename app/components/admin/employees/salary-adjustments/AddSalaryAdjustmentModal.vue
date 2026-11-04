<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X, Search, Info, ArrowRight } from 'lucide-vue-next'
import type {
  AdjustmentType,
  CreateSalaryAdjustmentPayload,
  MoneyValue,
  SalarySetupChoice,
} from '~/types/salaryAdjustments/salaryAdjustment'

const props = withDefaults(defineProps<{
  open: boolean
  employees: SalarySetupChoice[]
  loadingEmployees?: boolean
  employeesError?: string
  saving?: boolean
  apiError?: string
  fieldErrors?: Record<string, string[]>
}>(), {
  loadingEmployees: false,
  employeesError: '',
  saving: false,
  apiError: '',
  fieldErrors: () => ({}),
})

const emit = defineEmits<{
  close: []
  save: [payload: CreateSalaryAdjustmentPayload]
}>()

const employeeSearch = ref('')
const employeeId = ref<number | null>(null)
const dropdownOpen = ref(false)
const adjustmentType = ref<AdjustmentType>('increase')
const newBasic = ref('')
const newAllowance = ref('')
const effectiveDate = ref('')
const reason = ref('')
const localError = ref('')

const selectedEmployee = computed(() =>
  props.employees.find(item => item.employee_id === employeeId.value) ?? null,
)

const matchingEmployees = computed(() => {
  const keyword = employeeSearch.value.trim().toLowerCase()
  if (!keyword || selectedEmployee.value) return props.employees
  return props.employees.filter(item =>
    [item.employee_name, item.emp_id, item.department_name]
      .filter(value => value != null)
      .join(' ').toLowerCase().includes(keyword),
  )
})

const money = (value: MoneyValue): string => {
  if (value == null || value === '') return '—'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value))
}

const fieldError = (key: string) => props.fieldErrors[key]?.[0] ?? ''

const resetForm = () => {
  employeeSearch.value = ''
  employeeId.value = null
  dropdownOpen.value = false
  adjustmentType.value = 'increase'
  newBasic.value = ''
  newAllowance.value = ''
  effectiveDate.value = ''
  reason.value = ''
  localError.value = ''
}

watch(() => props.open, opened => { if (opened) resetForm() })

const selectEmployee = (item: SalarySetupChoice) => {
  employeeId.value = item.employee_id
  employeeSearch.value = `${item.employee_name} (${item.emp_id ?? item.employee_id})`
  newBasic.value = item.basic_salary == null ? '' : String(item.basic_salary)
  newAllowance.value = item.allowance == null ? '' : String(item.allowance)
  dropdownOpen.value = false
  localError.value = ''
}

const onEmployeeSearch = () => {
  employeeId.value = null
  newBasic.value = ''
  newAllowance.value = ''
  dropdownOpen.value = true
}

const onClose = () => { if (!props.saving) emit('close') }

const isValidAmount = (value: string): boolean =>
  /^(?:\d+)(?:\.\d{1,2})?$/.test(value.trim()) && Number.isFinite(Number(value))

const submit = () => {
  localError.value = ''
  const selected = selectedEmployee.value
  if (!selected || selected.id == null) {
    localError.value = 'Select an employee with an existing salary setup.'
    return
  }
  if (!isValidAmount(newBasic.value)) {
    localError.value = 'Enter a valid new basic salary (up to 2 decimal places).'
    return
  }
  if (newAllowance.value.trim() && !isValidAmount(newAllowance.value)) {
    localError.value = 'Enter a valid allowance or leave it blank.'
    return
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveDate.value)) {
    localError.value = 'Select a valid effective date.'
    return
  }
  if (Number(newBasic.value) > 9999999999.99 || Number(newAllowance.value || 0) > 9999999999.99) {
    localError.value = 'Salary values exceed the allowed limit.'
    return
  }

  emit('save', {
    employee_id: selected.employee_id,
    salary_setup_id: selected.id,
    adjustment_type: adjustmentType.value,
    new_basic_salary: Number(newBasic.value),
    new_allowance: newAllowance.value.trim() ? Number(newAllowance.value) : null,
    effective_date: effectiveDate.value,
    reason: reason.value.trim() || null,
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @mousedown.self="onClose">
      <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="salary-adjustment-modal-title">
        <div class="modal-heading">
          <div>
            <h2 id="salary-adjustment-modal-title">Add Salary Adjustment</h2>
            <p>Propose an employee salary change for approval.</p>
          </div>
          <button type="button" class="icon-button" aria-label="Close" :disabled="saving" @click="onClose"><X :size="18" /></button>
        </div>

        <div class="modal-body">
          <div class="info-banner"><Info :size="16" /> The current salary is loaded from the database. Approval does not update it; HR must apply the approved adjustment.</div>

          <p v-if="employeesError" class="form-error" role="alert">{{ employeesError }}</p>
          <p v-if="apiError" class="form-error" role="alert">{{ apiError }}</p>
          <p v-if="localError" class="form-error" role="alert">{{ localError }}</p>

          <div class="field employee-picker">
            <label for="salary-adjustment-employee">Employee <span class="required">*</span></label>
            <div class="search-input">
              <Search :size="15" />
              <input
                id="salary-adjustment-employee"
                v-model="employeeSearch"
                autocomplete="off"
                placeholder="Search employee name or ID..."
                :disabled="saving || loadingEmployees || !!employeesError"
                @focus="dropdownOpen = true"
                @input="onEmployeeSearch"
              />
            </div>
            <div v-if="dropdownOpen && !loadingEmployees && !employeesError" class="employee-options">
              <button
                v-for="item in matchingEmployees"
                :key="item.employee_id"
                type="button"
                class="employee-option"
                @mousedown.prevent
                @click="selectEmployee(item)"
              >
                <strong>{{ item.employee_name }}</strong>
                <span>{{ item.emp_id || `Employee #${item.employee_id}` }} · {{ item.salary_type_name }} · {{ money(item.basic_salary) }}</span>
              </button>
              <p v-if="!matchingEmployees.length" class="no-options">No matching employees with configured salaries.</p>
            </div>
            <small v-if="loadingEmployees">Loading salary setups...</small>
            <small v-else-if="!employees.length && !employeesError">No active employees with salary setups. Configure salaries first in Salary Rates.</small>
            <small v-if="fieldError('employee_id') || fieldError('salary_setup_id')" class="error-text">
              {{ fieldError('employee_id') || fieldError('salary_setup_id') }}
            </small>
          </div>

          <div v-if="selectedEmployee" class="current-salary">
            <div><span>Current Basic Salary</span><strong>{{ money(selectedEmployee.basic_salary) }}</strong></div>
            <ArrowRight :size="17" />
            <div><span>Current Allowance</span><strong>{{ money(selectedEmployee.allowance) }}</strong></div>
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="adjustment-type">Adjustment Type <span class="required">*</span></label>
              <select id="adjustment-type" v-model="adjustmentType" :disabled="saving">
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
                <option value="correction">Correction</option>
              </select>
              <small v-if="fieldError('adjustment_type')" class="error-text">{{ fieldError('adjustment_type') }}</small>
            </div>
            <div class="field">
              <label for="effective-date">Effective Date <span class="required">*</span></label>
              <input id="effective-date" v-model="effectiveDate" type="date" :disabled="saving" />
              <small v-if="fieldError('effective_date')" class="error-text">{{ fieldError('effective_date') }}</small>
            </div>
            <div class="field">
              <label for="new-basic">New Basic Salary (PHP) <span class="required">*</span></label>
              <input id="new-basic" v-model="newBasic" inputmode="decimal" placeholder="e.g. 23000.00" :disabled="saving" />
              <small v-if="fieldError('new_basic_salary')" class="error-text">{{ fieldError('new_basic_salary') }}</small>
            </div>
            <div class="field">
              <label for="new-allowance">New Allowance (PHP)</label>
              <input id="new-allowance" v-model="newAllowance" inputmode="decimal" placeholder="Leave blank for none" :disabled="saving" />
              <small v-if="fieldError('new_allowance')" class="error-text">{{ fieldError('new_allowance') }}</small>
            </div>
          </div>
          <div class="field">
            <label for="adjustment-reason">Reason</label>
            <textarea id="adjustment-reason" v-model="reason" rows="3" maxlength="5000" placeholder="Reason for this adjustment..." :disabled="saving" />
            <small v-if="fieldError('reason')" class="error-text">{{ fieldError('reason') }}</small>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="button secondary" :disabled="saving" @click="onClose">Cancel</button>
          <button type="button" class="button primary" :disabled="saving || loadingEmployees || !employees.length" @click="submit">
            {{ saving ? 'Saving...' : 'Save Adjustment' }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; z-index: 9000; display: flex; align-items: center; justify-content: center; padding: 18px; background: rgba(2, 6, 23, .74); backdrop-filter: blur(5px); }
.modal-panel { width: min(690px, 100%); max-height: 92vh; overflow-y: auto; border: 1px solid var(--border); border-radius: 15px; background: var(--bg-card); box-shadow: 0 30px 85px rgba(0, 0, 0, .42); }
.modal-heading { display: flex; justify-content: space-between; gap: 15px; padding: 23px 24px 18px; }
.modal-heading h2 { margin: 0; color: var(--text-primary); font-size: 18px; font-weight: 700; }
.modal-heading p { margin: 5px 0 0; color: var(--text-muted); font-size: 12px; }
.icon-button { display: grid; place-items: center; width: 34px; height: 34px; flex-shrink: 0; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.modal-body { display: flex; flex-direction: column; gap: 17px; padding: 0 24px 20px; }
.info-banner { display: flex; align-items: flex-start; gap: 10px; padding: 11px 12px; border: 1px solid rgba(59,130,246,.25); border-radius: 9px; background: rgba(37,99,235,.10); color: #a5c8ff; font-size: 12px; line-height: 1.5; }
.info-banner svg { flex-shrink: 0; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.field { display: flex; flex-direction: column; gap: 7px; min-width: 0; position: relative; }
.field label { color: var(--text-primary); font-size: 11px; font-weight: 600; }
.required, .error-text { color: #fb7185; }
.field input, .field select, .field textarea {
  width: 100%; min-height: 40px; padding: 10px 12px;
  border: 1px solid var(--border); border-radius: 8px;
  background: var(--bg-card-soft); color: var(--text-primary); font-size: 12px; outline: none;
}
.field input[type="date"] { color-scheme: dark; }
.field textarea { resize: vertical; min-height: 82px; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--primary); }
.field small { color: var(--text-muted); font-size: 11px; line-height: 1.45; }
.field small.error-text { color: #fb7185; }
.search-input { display: flex; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.search-input svg { color: var(--text-muted); flex-shrink: 0; }
.search-input input { padding-left: 0; border: none; background: transparent; }
.employee-options { position: absolute; z-index: 5; top: 67px; left: 0; right: 0; max-height: 200px; overflow-y: auto; padding: 5px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card); box-shadow: 0 12px 28px rgba(0,0,0,.3); }
.employee-option { display: flex; flex-direction: column; gap: 3px; width: 100%; padding: 10px; border: none; border-radius: 6px; background: transparent; color: var(--text-primary); text-align: left; cursor: pointer; }
.employee-option:hover { background: var(--bg-card-soft); }
.employee-option strong { font-size: 12px; font-weight: 600; }
.employee-option span { color: var(--text-muted); font-size: 10px; }
.no-options { margin: 8px; color: var(--text-muted); font-size: 11px; }
.current-salary { display: flex; align-items: center; justify-content: space-around; gap: 16px; padding: 13px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card-soft); }
.current-salary > div { display: flex; flex-direction: column; gap: 4px; }
.current-salary span { color: var(--text-muted); font-size: 10px; }
.current-salary strong { color: var(--text-primary); font-size: 14px; font-weight: 600; }
.current-salary svg { color: var(--text-muted); }
.form-error { margin: 0; padding: 10px; border: 1px solid rgba(244,63,94,.3); border-radius: 8px; background: rgba(244,63,94,.08); color: #fb7185; font-size: 12px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 9px; padding: 15px 24px 22px; border-top: 1px solid var(--border); }
.button { min-height: 37px; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; }
.button.secondary { background: transparent; border: 1px solid var(--border); color: var(--text-primary); }
.button.primary { background: #2563eb; color: #fff; border: 1px solid #2563eb; }
.button:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 600px) { .modal-heading { padding: 18px; } .modal-body { padding: 0 18px 18px; } .modal-footer { padding: 15px 18px; } .form-grid { grid-template-columns: 1fr; } }
</style>