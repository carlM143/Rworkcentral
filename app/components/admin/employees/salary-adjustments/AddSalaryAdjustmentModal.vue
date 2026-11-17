<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X, Search, Info, ArrowRight, Plus, Trash2 } from 'lucide-vue-next'
import type {
  AdjustmentType,
  CreateSalaryAdjustmentPayload,
  MoneyValue,
  SalarySetupChoice,
} from '~/types/salaryAdjustments/salaryAdjustment'

interface AllowanceRow {
  allowance_name: string
  amount: string
}

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

const MAX_EXTRA_ALLOWANCES = 20

const employeeSearch = ref('')
const employeeId = ref<number | null>(null)
const dropdownOpen = ref(false)
const adjustmentType = ref<AdjustmentType>('increase')
const newBasic = ref('')
const newAllowance = ref('')
const extraAllowances = ref<AllowanceRow[]>([])
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

const extrasTotal = computed(() =>
  extraAllowances.value.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
)

const money = (value: MoneyValue | number): string => {
  if (value == null || value === '') return '—'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value))
}

const fieldError = (key: string) => props.fieldErrors[key]?.[0] ?? ''

const allowanceFieldError = (index: number, key: 'allowance_name' | 'amount') =>
  props.fieldErrors[`allowances.${index}.${key}`]?.[0] ?? ''

const addAllowanceRow = () => {
  if (extraAllowances.value.length >= MAX_EXTRA_ALLOWANCES) return
  extraAllowances.value.push({ allowance_name: '', amount: '' })
}

const removeAllowanceRow = (index: number) => {
  extraAllowances.value.splice(index, 1)
}

const resetForm = () => {
  employeeSearch.value = ''
  employeeId.value = null
  dropdownOpen.value = false
  adjustmentType.value = 'increase'
  newBasic.value = ''
  newAllowance.value = ''
  extraAllowances.value = []
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

// Completely empty rows are ignored. Partially filled rows are errors.
const validateExtraAllowances = (): string => {
  const seen = new Set<string>()
  for (const row of extraAllowances.value) {
    const name = row.allowance_name.trim()
    const amount = String(row.amount ?? '').trim()
    if (!name && !amount) continue
    if (!name) return 'Each additional allowance needs a name.'
    if (!isValidAmount(amount)) return `Enter a valid amount for "${name}" (up to 2 decimal places).`
    if (Number(amount) > 9999999999.99) return `Amount for "${name}" exceeds the allowed limit.`
    const key = name.toLowerCase()
    if (seen.has(key)) return `Allowance "${name}" is listed more than once.`
    seen.add(key)
  }
  return ''
}

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
  const allowanceError = validateExtraAllowances()
  if (allowanceError) {
    localError.value = allowanceError
    return
  }

  emit('save', {
    employee_id: selected.employee_id,
    salary_setup_id: selected.id,
    adjustment_type: adjustmentType.value,
    new_basic_salary: Number(newBasic.value),
    new_allowance: newAllowance.value.trim() ? Number(newAllowance.value) : null,
    allowances: extraAllowances.value
      .filter(row => row.allowance_name.trim() !== '')
      .map(row => ({
        allowance_name: row.allowance_name.trim(),
        amount: Number(row.amount),
      })),
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

            <!-- NEW ALLOWANCE + ADD BUTTON -->
            <div class="field">
              <div class="label-row">
                <label for="new-allowance">New Allowance (PHP)</label>
                <button
                  type="button"
                  class="add-allowance-btn"
                  title="Add another allowance"
                  :disabled="saving || extraAllowances.length >= MAX_EXTRA_ALLOWANCES"
                  @click="addAllowanceRow"
                >
                  <Plus :size="13" /> Add
                </button>
              </div>
              <input id="new-allowance" v-model="newAllowance" inputmode="decimal" placeholder="Leave blank for none" :disabled="saving" />
              <small v-if="fieldError('new_allowance')" class="error-text">{{ fieldError('new_allowance') }}</small>
            </div>
          </div>

          <!-- MULTIPLE ADDITIONAL ALLOWANCES -->
          <div v-if="extraAllowances.length" class="extra-allowances">
            <div class="extra-head">
              <span>Additional Allowances</span>
              <strong>Total: {{ money(extrasTotal) }}</strong>
            </div>

            <div v-for="(row, index) in extraAllowances" :key="index" class="extra-row">
              <div class="extra-inputs">
                <input
                  v-model="row.allowance_name"
                  type="text"
                  maxlength="100"
                  placeholder="Allowance name (e.g. Rice, Transport)"
                  :disabled="saving"
                />
                <input
                  v-model="row.amount"
                  inputmode="decimal"
                  placeholder="Amount"
                  :disabled="saving"
                />
                <button
                  type="button"
                  class="remove-btn"
                  aria-label="Remove allowance"
                  :disabled="saving"
                  @click="removeAllowanceRow(index)"
                >
                  <Trash2 :size="15" />
                </button>
              </div>
              <small v-if="allowanceFieldError(index, 'allowance_name') || allowanceFieldError(index, 'amount')" class="error-text">
                {{ allowanceFieldError(index, 'allowance_name') || allowanceFieldError(index, 'amount') }}
              </small>
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

/* Add allowance button + extra rows */
.label-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 20px; }
.add-allowance-btn { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border: 1px solid #2563eb; border-radius: 6px; background: rgba(37,99,235,.12); color: #60a5fa; font-size: 11px; font-weight: 600; cursor: pointer; }
.add-allowance-btn:hover:not(:disabled) { background: rgba(37,99,235,.25); }
.add-allowance-btn:disabled { opacity: .5; cursor: not-allowed; }
.extra-allowances { display: flex; flex-direction: column; gap: 9px; padding: 13px; border: 1px dashed var(--border); border-radius: 10px; background: var(--bg-card-soft); }
.extra-head { display: flex; align-items: center; justify-content: space-between; color: var(--text-primary); font-size: 11px; font-weight: 600; }
.extra-head strong { color: #34d399; font-weight: 600; }
.extra-row { display: flex; flex-direction: column; gap: 4px; }
.extra-inputs { display: grid; grid-template-columns: 1fr 150px 38px; gap: 8px; }
.extra-inputs input { min-width: 0; min-height: 38px; padding: 0 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card); color: var(--text-primary); font-size: 12px; outline: none; }
.extra-inputs input:focus { border-color: var(--primary); }
.remove-btn { display: grid; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: #fb7185; cursor: pointer; }
.remove-btn:hover:not(:disabled) { background: rgba(244,63,94,.12); }
.remove-btn:disabled { opacity: .5; cursor: not-allowed; }
.extra-row .error-text { font-size: 11px; color: #fb7185; }

.form-error { margin: 0; padding: 10px; border: 1px solid rgba(244,63,94,.3); border-radius: 8px; background: rgba(244,63,94,.08); color: #fb7185; font-size: 12px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 9px; padding: 15px 24px 22px; border-top: 1px solid var(--border); }
.button { min-height: 37px; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; }
.button.secondary { background: transparent; border: 1px solid var(--border); color: var(--text-primary); }
.button.primary { background: #2563eb; color: #fff; border: 1px solid #2563eb; }
.button:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 600px) {
  .modal-heading { padding: 18px; } .modal-body { padding: 0 18px 18px; } .modal-footer { padding: 15px 18px; }
  .form-grid { grid-template-columns: 1fr; }
  .extra-inputs { grid-template-columns: 1fr 110px 38px; }
}
</style>