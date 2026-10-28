
<script setup lang="ts">
import { Save, ClipboardList, ShieldCheck, Settings2, CalendarDays } from 'lucide-vue-next'
import type { LeavePolicyPayload, LeaveTypeOption, EmploymentTypeOption } from '~/types/leavePolicy'

type FormState = Omit<LeavePolicyPayload, 'effective_to'> & { effective_to: string }

const props = withDefaults(defineProps<{
  initialValues?: LeavePolicyPayload | null
  leaveTypes: LeaveTypeOption[]
  employmentTypes: EmploymentTypeOption[]
  saving?: boolean
}>(), {
  initialValues: null,
  saving: false,
})

const emit = defineEmits<{
  save: [payload: LeavePolicyPayload]
  cancel: []
}>()

const initialForm = (): FormState => ({
  leave_type_id: 0,
  employment_type_id: 0,
  is_eligible: true,
  is_paid: true,
  annual_credits: 0,
  min_service_months: 0,
  allow_carry_over: false,
  max_carry_over_days: 0,
  requires_approval: true,
  usage_window: 'calendar_year',
  validity_period: 'annual',
  effective_from: '',
  effective_to: '',
  status: 'pending',
})

const form = reactive<FormState>(initialForm())
const formError = ref('')
const isEdit = computed(() => !!props.initialValues)

watch(() => props.initialValues, values => {
  Object.assign(form, initialForm(), values || {}, {
    effective_to: values?.effective_to || '',
  })
  formError.value = ''
}, { immediate: true })

watch(() => form.allow_carry_over, enabled => {
  if (!enabled) form.max_carry_over_days = 0
})

const handleSave = () => {
  formError.value = ''

  if (!form.leave_type_id || !form.employment_type_id) {
    formError.value = 'Please select a Leave Type and Employment Type.'
    return
  }

  if (!Number.isFinite(form.annual_credits) || form.annual_credits < 0) {
    formError.value = 'Annual Credits must be zero or greater.'
    return
  }

  if (!Number.isInteger(form.min_service_months) || form.min_service_months < 0) {
    formError.value = 'Minimum Service Months must be a non-negative whole number.'
    return
  }

  if (form.allow_carry_over && (!Number.isFinite(form.max_carry_over_days) || form.max_carry_over_days < 0)) {
    formError.value = 'Maximum Carry-Over Days must be zero or greater.'
    return
  }

  if (!form.usage_window.trim() || !form.validity_period.trim()) {
    formError.value = 'Usage Window and Validity Period are required.'
    return
  }

  if (!form.effective_from) {
    formError.value = 'Effective From is required.'
    return
  }

  if (form.effective_to && form.effective_to < form.effective_from) {
    formError.value = 'Effective To must be on or after Effective From.'
    return
  }

  emit('save', {
    ...form,
    leave_type_id: Number(form.leave_type_id),
    employment_type_id: Number(form.employment_type_id),
    annual_credits: Number(form.annual_credits),
    min_service_months: Number(form.min_service_months),
    max_carry_over_days: form.allow_carry_over ? Number(form.max_carry_over_days) : 0,
    usage_window: form.usage_window.trim(),
    validity_period: form.validity_period.trim(),
    effective_to: form.effective_to || null,
  })
}
</script>

<template>
  <form class="policy-form" @submit.prevent="handleSave">
    <div v-if="formError" class="form-error" role="alert">{{ formError }}</div>

    <!-- POLICY ASSIGNMENT -->
    <section class="form-section">
      <div class="section-heading">
        <div class="section-icon blue"><ClipboardList :size="18" /></div>
        <div>
          <h3>Policy Assignment</h3>
          <p>Select the leave category and applicable employment type.</p>
        </div>
      </div>

      <div class="field-grid">
        <div class="form-field">
          <label for="policy-leave-type">Leave Type <span>*</span></label>
          <select id="policy-leave-type" v-model.number="form.leave_type_id" required>
            <option :value="0" disabled>Select leave type</option>
            <option v-for="item in leaveTypes" :key="item.id" :value="item.id">
              {{ item.name }} ({{ item.code }})
            </option>
          </select>
        </div>

        <div class="form-field">
          <label for="policy-employment-type">Employment Type <span>*</span></label>
          <select id="policy-employment-type" v-model.number="form.employment_type_id" required>
            <option :value="0" disabled>Select employment type</option>
            <option v-for="item in employmentTypes" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <!-- LEAVE ENTITLEMENTS -->
    <section class="form-section">
      <div class="section-heading">
        <div class="section-icon green"><ShieldCheck :size="18" /></div>
        <div>
          <h3>Leave Entitlements</h3>
          <p>Define eligibility, paid leave and annual credits.</p>
        </div>
      </div>

      <div class="field-grid">
        <div class="form-field">
          <label for="annual-credits">Annual Credits <span>*</span></label>
          <input id="annual-credits" v-model.number="form.annual_credits" type="number" min="0" step="0.01" required />
          <small>Number of leave days allocated annually.</small>
        </div>

        <div class="form-field">
          <label for="min-service">Minimum Service (Months) <span>*</span></label>
          <input id="min-service" v-model.number="form.min_service_months" type="number" min="0" step="1" required />
          <small>Required months of service before becoming eligible.</small>
        </div>
      </div>

      <div class="toggle-grid">
        <label class="toggle-card">
          <input v-model="form.is_eligible" type="checkbox" />
          <span>
            <strong>Eligible</strong>
            <small>Selected employment type can avail of this leave.</small>
          </span>
        </label>

        <label class="toggle-card">
          <input v-model="form.is_paid" type="checkbox" />
          <span>
            <strong>Paid Leave</strong>
            <small>Employee receives pay for approved leave.</small>
          </span>
        </label>
      </div>
    </section>

    <!-- POLICY RULES -->
    <section class="form-section">
      <div class="section-heading">
        <div class="section-icon orange"><Settings2 :size="18" /></div>
        <div>
          <h3>Policy Rules</h3>
          <p>Configure carry-over, approval and leave usage restrictions.</p>
        </div>
      </div>

      <div class="toggle-grid">
        <label class="toggle-card">
          <input v-model="form.allow_carry_over" type="checkbox" />
          <span>
            <strong>Allow Carry Over</strong>
            <small>Unused credits can carry over to a future period.</small>
          </span>
        </label>

        <label class="toggle-card">
          <input v-model="form.requires_approval" type="checkbox" />
          <span>
            <strong>Requires Approval</strong>
            <small>Employee leave requests require approval.</small>
          </span>
        </label>
      </div>

      <div class="field-grid">
        <div class="form-field">
          <label for="max-carry">Max Carry-Over Days <span>*</span></label>
          <input
            id="max-carry"
            v-model.number="form.max_carry_over_days"
            type="number"
            min="0"
            step="0.01"
            :disabled="!form.allow_carry_over"
          />
          <small>Maximum unused credits allowed to carry forward.</small>
        </div>

        <div class="form-field">
          <label for="usage-window">Usage Window <span>*</span></label>
          <input id="usage-window" v-model="form.usage_window" type="text" maxlength="100" placeholder="e.g. calendar_year" required />
          <small>Defines the leave credit usage window.</small>
        </div>

        <div class="form-field">
          <label for="validity-period">Validity Period <span>*</span></label>
          <input id="validity-period" v-model="form.validity_period" type="text" maxlength="100" placeholder="e.g. annual" required />
          <small>Defines how long leave credits remain valid.</small>
        </div>
      </div>
    </section>

    <!-- EFFECTIVE DATES -->
    <section class="form-section last">
      <div class="section-heading">
        <div class="section-icon purple"><CalendarDays :size="18" /></div>
        <div>
          <h3>Effective Dates & Status</h3>
          <p>Configure the policy's effective period and current status.</p>
        </div>
      </div>

      <div class="field-grid">
        <div class="form-field">
          <label for="effective-from">Effective From <span>*</span></label>
          <input id="effective-from" v-model="form.effective_from" type="date" required />
        </div>

        <div class="form-field">
          <label for="effective-to">Effective To</label>
          <input id="effective-to" v-model="form.effective_to" type="date" />
          <small>Optional. Leave blank if there is no end date.</small>
        </div>

        <div class="form-field">
          <label for="policy-status">Policy Status <span>*</span></label>
          <select id="policy-status" v-model="form.status" required>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>
    </section>

    <!-- ACTION FOOTER -->
    <footer class="form-footer">
      <p>All changes will be saved to the Laravel database.</p>
      <div class="footer-actions">
        <button type="button" class="cancel-button" :disabled="saving" @click="emit('cancel')">Cancel</button>
        <button type="submit" class="save-button" :disabled="saving">
          <Save :size="15" />
          {{ saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Leave Policy' }}
        </button>
      </div>
    </footer>
  </form>
</template>

<style scoped>
.policy-form{overflow:hidden;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);box-shadow:var(--shadow)}
.form-error{margin:17px 20px 0;padding:12px;border:1px solid var(--red);border-radius:8px;background:var(--red-soft);color:var(--red);font-size:11px}
.form-section{padding:22px 23px 9px;border-bottom:1px solid var(--border-soft)}
.form-section.last{border-bottom:0}
.section-heading{display:flex;align-items:center;gap:11px;margin-bottom:20px}
.section-icon{display:flex;width:39px;height:39px;flex-shrink:0;align-items:center;justify-content:center;border-radius:9px}
.section-icon.blue{background:var(--primary-soft);color:var(--primary)}
.section-icon.green{background:var(--green-soft);color:var(--green)}
.section-icon.orange{background:var(--orange-soft);color:var(--orange)}
.section-icon.purple{background:var(--primary-soft);color:var(--primary)}
.section-heading h3{margin:0;color:var(--text-primary);font-size:13px;font-weight:700}
.section-heading p{margin:5px 0 0;color:var(--text-muted);font-size:10px}
.field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 18px}
.form-field{margin-bottom:18px}
.form-field label{display:block;margin-bottom:7px;color:var(--text-primary);font-size:11px;font-weight:600}
.form-field label span{color:var(--red)}
.form-field input,.form-field select{box-sizing:border-box;width:100%;height:42px;padding:0 12px;border:1px solid var(--border);border-radius:8px;outline:0;background:var(--bg-card-soft);color:var(--text-primary);font-family:inherit;font-size:11px}
.form-field input:focus,.form-field select:focus{border-color:var(--primary)}
.form-field input:disabled{opacity:.5;cursor:not-allowed}
.form-field small{display:block;margin-top:6px;color:var(--text-muted);font-size:9px}
.toggle-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:19px}
.toggle-card{display:flex;align-items:center;gap:12px;min-height:58px;padding:13px;border:1px solid var(--border);border-radius:9px;background:var(--bg-card-soft);cursor:pointer}
.toggle-card input{width:16px;height:16px;flex-shrink:0;accent-color:var(--primary)}
.toggle-card strong,.toggle-card small{display:block}
.toggle-card strong{color:var(--text-primary);font-size:11px}
.toggle-card small{margin-top:5px;color:var(--text-muted);font-size:9px;line-height:1.5}
.form-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 23px;border-top:1px solid var(--border-soft);background:var(--bg-card-soft)}
.form-footer p{margin:0;color:var(--text-muted);font-size:10px}
.footer-actions{display:flex;gap:9px}
.cancel-button,.save-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:0 16px;border:1px solid var(--border);border-radius:8px;font-family:inherit;font-size:11px;font-weight:600;cursor:pointer}
.cancel-button{background:var(--bg-card);color:var(--text-secondary)}
.save-button{border-color:var(--primary);background:var(--primary);color:#fff}
.cancel-button:disabled,.save-button:disabled{opacity:.5;cursor:not-allowed}
@media(max-width:650px){.field-grid,.toggle-grid{grid-template-columns:1fr}.form-section{padding:17px 15px 5px}.form-footer{align-items:stretch;flex-direction:column;padding:15px}.footer-actions{justify-content:flex-end}}
</style>
