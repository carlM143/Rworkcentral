<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleCheckBig,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  XCircle,
} from 'lucide-vue-next'
import AppConfirmModal from '~/components/shared/AppConfirmModal.vue'
import { getSalaryAdjustmentApiError } from '~/composables/admin/salaryAdjustments/useSalaryAdjustments'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'admin' })

// =====================================================
// TYPES (as returned by SalaryAdjustmentController)
// =====================================================

type Money = string | number | null
type Status = 'pending' | 'approved' | 'rejected' | 'applied' | 'cancelled'
type AdjustmentType = 'increase' | 'decrease' | 'correction'

interface ExtraAllowance {
  id?: number
  allowance_name: string
  amount: Money
}

interface AdjustmentDetail {
  id: number
  employee_id: number
  employee_name: string
  emp_id: string | number | null
  salary_setup_id: number
  salary_type: string | null
  adjustment_type: AdjustmentType
  previous_basic_salary: Money
  new_basic_salary: Money
  previous_allowance: Money
  new_allowance: Money
  allowances: ExtraAllowance[]
  allowances_total: Money
  effective_date: string
  reason: string | null
  status: Status
  approved_by_name: string | null
  approved_at: string | null
  applied_by_name: string | null
  applied_at: string | null
  created_at: string | null
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// =====================================================
// LOAD
// =====================================================

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { success, error: showError } = useToast()

const adjustmentId = Number(route.params.id)
const item = ref<AdjustmentDetail | null>(null)
const loading = ref(true)
const loadError = ref('')

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await $api<ApiResponse<AdjustmentDetail>>(`/admin/salary-adjustments/${adjustmentId}`, { method: 'GET' })
    item.value = response.data
  } catch (err) {
    loadError.value = getSalaryAdjustmentApiError(err).message
  } finally {
    loading.value = false
  }
}

onMounted(load)

// =====================================================
// FORMATTING
// =====================================================

const toNumber = (value: Money) => (value === null || value === '' ? 0 : Number(value))

const money = (value: Money) =>
  value === null || value === ''
    ? '—'
    : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value))

const signedMoney = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${money(Math.abs(value))}`

const dateLabel = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(value.length > 10 ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(date)
}

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const basicDiff = computed(() => (item.value ? toNumber(item.value.new_basic_salary) - toNumber(item.value.previous_basic_salary) : 0))
const allowanceDiff = computed(() => (item.value ? toNumber(item.value.new_allowance) - toNumber(item.value.previous_allowance) : 0))
const newTotalPay = computed(() =>
  item.value ? toNumber(item.value.new_basic_salary) + toNumber(item.value.new_allowance) + toNumber(item.value.allowances_total) : 0,
)

// =====================================================
// EDIT (pending only)
// =====================================================

interface ExtraRow { key: number, allowance_name: string, amount: string }

const editing = ref(false)
const saving = ref(false)
const formError = ref('')
const fieldErrors = ref<Record<string, string[]>>({})
let rowKey = 0

const form = reactive({
  adjustment_type: 'increase' as AdjustmentType,
  effective_date: '',
  new_basic_salary: '',
  new_allowance: '',
  reason: '',
  allowances: [] as ExtraRow[],
})

const startEdit = () => {
  if (!item.value) return
  Object.assign(form, {
    adjustment_type: item.value.adjustment_type,
    effective_date: item.value.effective_date,
    new_basic_salary: item.value.new_basic_salary == null ? '' : String(item.value.new_basic_salary),
    new_allowance: item.value.new_allowance == null ? '' : String(item.value.new_allowance),
    reason: item.value.reason ?? '',
    allowances: item.value.allowances.map(a => ({ key: ++rowKey, allowance_name: a.allowance_name, amount: String(a.amount ?? '') })),
  })
  formError.value = ''
  fieldErrors.value = {}
  editing.value = true
}

const cancelEdit = () => {
  if (!saving.value) editing.value = false
}

const addExtra = () => {
  if (form.allowances.length < 20) form.allowances.push({ key: ++rowKey, allowance_name: '', amount: '' })
}

const removeExtra = (key: number) => {
  form.allowances = form.allowances.filter(row => row.key !== key)
}

const extrasTotal = computed(() => form.allowances.reduce((sum, row) => sum + (Number(row.amount) || 0), 0))

const isAmount = (value: string) => /^\d+(?:\.\d{1,2})?$/.test(value.trim())
const fieldError = (key: string) => fieldErrors.value[key]?.[0] ?? ''
const extrasError = computed(() => {
  const key = Object.keys(fieldErrors.value).find(k => k.startsWith('allowances'))
  return key ? fieldErrors.value[key]?.[0] ?? '' : ''
})

const saveEdit = async () => {
  formError.value = ''
  fieldErrors.value = {}

  if (!isAmount(form.new_basic_salary)) { formError.value = 'Enter a valid new basic salary (up to 2 decimal places).'; return }
  if (form.new_allowance.trim() && !isAmount(form.new_allowance)) { formError.value = 'Enter a valid allowance or leave it blank.'; return }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.effective_date)) { formError.value = 'Select a valid effective date.'; return }

  const names = new Set<string>()
  for (const row of form.allowances) {
    const name = row.allowance_name.trim()
    if (!name) { formError.value = 'Enter a name for every additional allowance, or remove the empty row.'; return }
    if (names.has(name.toLowerCase())) { formError.value = `"${name}" is listed more than once.`; return }
    names.add(name.toLowerCase())
    if (!isAmount(row.amount)) { formError.value = `Enter a valid amount for ${name}.`; return }
  }

  saving.value = true
  try {
    const response = await $api<ApiResponse<AdjustmentDetail>>(`/admin/salary-adjustments/${adjustmentId}`, {
      method: 'PUT',
      body: {
        adjustment_type: form.adjustment_type,
        effective_date: form.effective_date,
        new_basic_salary: Number(form.new_basic_salary),
        new_allowance: form.new_allowance.trim() ? Number(form.new_allowance) : null,
        reason: form.reason.trim() || null,
        allowances: form.allowances.map(row => ({ allowance_name: row.allowance_name.trim(), amount: Number(row.amount) })),
      },
    })
    item.value = response.data
    editing.value = false
    success('Salary Adjustment Updated', response.message)
  } catch (err) {
    const details = getSalaryAdjustmentApiError(err)
    formError.value = details.message
    fieldErrors.value = details.errors
  } finally {
    saving.value = false
  }
}

// =====================================================
// APPROVE / REJECT / APPLY
// =====================================================

type Action = 'approve' | 'reject' | 'apply'

const confirmAction = ref<Action | null>(null)
const acting = ref(false)
const actionError = ref('')

const ACTIONS: Record<Action, { title: string, message: string, label: string, done: string, danger: boolean }> = {
  approve: {
    title: 'Approve this salary adjustment?',
    message: 'Approval records the decision. The employee salary changes only when the adjustment is applied.',
    label: 'Approve',
    done: 'approved',
    danger: false,
  },
  reject: {
    title: 'Reject this salary adjustment?',
    message: 'The adjustment is closed and the employee salary stays the same.',
    label: 'Reject',
    done: 'rejected',
    danger: true,
  },
  apply: {
    title: 'Apply this salary adjustment?',
    message: 'This updates the employee salary setup and allowances. Allowed only on or after the effective date.',
    label: 'Apply',
    done: 'applied',
    danger: false,
  },
}

const openAction = (action: Action) => {
  actionError.value = ''
  confirmAction.value = action
}

const runAction = async () => {
  const action = confirmAction.value
  if (!action) return
  acting.value = true
  actionError.value = ''
  try {
    const response = await $api<ApiResponse<AdjustmentDetail>>(`/admin/salary-adjustments/${adjustmentId}/${action}`, { method: 'PATCH' })
    item.value = response.data
    confirmAction.value = null
    success('Salary Adjustment Updated', `Adjustment ${ACTIONS[action].done}.`)
  } catch (err) {
    actionError.value = getSalaryAdjustmentApiError(err).message
    showError('Unable to Update Salary Adjustment', actionError.value)
  } finally {
    acting.value = false
  }
}

const isFutureEffective = computed(() => !!item.value && item.value.effective_date > new Date().toISOString().slice(0, 10))
</script>

<template>
  <section class="detail-page">
    <button type="button" class="back-link" @click="router.push('/admin/employees/salary-adjustments')">
      <ArrowLeft :size="14" /> Back to Salary Adjustments
    </button>

    <div v-if="loading" class="state-card">Loading salary adjustment...</div>

    <div v-else-if="loadError || !item" class="state-card error">
      <AlertTriangle :size="20" />
      <strong>Unable to load this salary adjustment</strong>
      <span>{{ loadError || 'Record not found.' }}</span>
      <AppButton variant="secondary" @click="load">Retry</AppButton>
    </div>

    <template v-else>
      <!-- HEADER -->
      <PageHeader
        :title="`Salary Adjustment #${item.id}`"
        :description="`${item.employee_name} · ${item.emp_id ?? `Employee #${item.employee_id}`}`"
      >
        <div class="header-actions">
          <span class="status-label" :class="item.status">{{ titleCase(item.status) }}</span>

          <template v-if="item.status === 'pending' && !editing">
            <AppButton variant="secondary" :icon="Pencil" @click="startEdit">Edit</AppButton>
            <AppButton variant="secondary" :icon="XCircle" class="reject-btn" @click="openAction('reject')">Reject</AppButton>
            <AppButton :icon="CheckCircle2" @click="openAction('approve')">Approve</AppButton>
          </template>

          <template v-if="editing">
            <AppButton variant="secondary" :icon="X" :disabled="saving" @click="cancelEdit">Cancel</AppButton>
            <AppButton :icon="Save" :disabled="saving" @click="saveEdit">{{ saving ? 'Saving...' : 'Save Changes' }}</AppButton>
          </template>

          <AppButton v-if="item.status === 'approved'" :icon="CircleCheckBig" :disabled="isFutureEffective" @click="openAction('apply')">
            Apply Adjustment
          </AppButton>
        </div>
      </PageHeader>

      <p v-if="item.status === 'approved' && isFutureEffective" class="notice">
        Approved. It can be applied on {{ dateLabel(item.effective_date) }}, the effective date.
      </p>

      <div class="content-grid">
        <!-- LEFT: SALARY -->
        <div class="column">
          <!-- VIEW -->
          <section v-if="!editing" class="card">
            <header class="card-header">
              <h2>Salary Change</h2>
              <p>Previous values were taken from the salary setup when the adjustment was filed.</p>
            </header>

            <div class="compare">
              <div class="compare-row">
                <span class="label">Basic salary</span>
                <span class="before">{{ money(item.previous_basic_salary) }}</span>
                <ArrowRight :size="14" class="arrow" />
                <strong>{{ money(item.new_basic_salary) }}</strong>
                <span class="diff" :class="{ up: basicDiff > 0, down: basicDiff < 0 }">{{ signedMoney(basicDiff) }}</span>
              </div>
              <div class="compare-row">
                <span class="label">Allowance</span>
                <span class="before">{{ money(item.previous_allowance) }}</span>
                <ArrowRight :size="14" class="arrow" />
                <strong>{{ money(item.new_allowance) }}</strong>
                <span class="diff" :class="{ up: allowanceDiff > 0, down: allowanceDiff < 0 }">{{ signedMoney(allowanceDiff) }}</span>
              </div>
            </div>

            <div class="extras">
              <h3>Additional Allowances</h3>
              <ul v-if="item.allowances.length" class="extra-list">
                <li v-for="a in item.allowances" :key="a.id ?? a.allowance_name">
                  <span>{{ a.allowance_name }}</span>
                  <strong>{{ money(a.amount) }}</strong>
                </li>
                <li class="extra-total">
                  <span>Total additional allowances</span>
                  <strong>{{ money(item.allowances_total) }}</strong>
                </li>
              </ul>
              <p v-else class="muted">None. Existing additional allowances stay as they are.</p>
            </div>

            <div class="total-pay">
              <span>New basic + allowances</span>
              <strong>{{ money(newTotalPay) }}</strong>
            </div>
          </section>

          <!-- EDIT -->
          <section v-else class="card">
            <header class="card-header">
              <h2>Edit Salary Adjustment</h2>
              <p>Only pending adjustments can be edited. Previous values are refreshed from the current salary setup when you save.</p>
            </header>

            <div class="form-body">
              <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

              <div class="form-grid">
                <div class="field">
                  <label for="ed-type">Adjustment Type <span class="required">*</span></label>
                  <select id="ed-type" v-model="form.adjustment_type" :disabled="saving">
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                    <option value="correction">Correction</option>
                  </select>
                  <small v-if="fieldError('adjustment_type')" class="error-text">{{ fieldError('adjustment_type') }}</small>
                </div>
                <div class="field">
                  <label for="ed-date">Effective Date <span class="required">*</span></label>
                  <input id="ed-date" v-model="form.effective_date" type="date" :disabled="saving">
                  <small v-if="fieldError('effective_date')" class="error-text">{{ fieldError('effective_date') }}</small>
                </div>
                <div class="field">
                  <label for="ed-basic">New Basic Salary (PHP) <span class="required">*</span></label>
                  <input id="ed-basic" v-model="form.new_basic_salary" inputmode="decimal" :disabled="saving">
                  <small class="hint">Current: {{ money(item.previous_basic_salary) }}</small>
                  <small v-if="fieldError('new_basic_salary')" class="error-text">{{ fieldError('new_basic_salary') }}</small>
                </div>
                <div class="field">
                  <label for="ed-allowance">New Allowance (PHP)</label>
                  <input id="ed-allowance" v-model="form.new_allowance" inputmode="decimal" placeholder="Leave blank for none" :disabled="saving">
                  <small class="hint">Current: {{ money(item.previous_allowance) }}</small>
                  <small v-if="fieldError('new_allowance')" class="error-text">{{ fieldError('new_allowance') }}</small>
                </div>
              </div>

              <div class="extras-editor">
                <div class="extras-head">
                  <div>
                    <span class="extras-title">Additional Allowances</span>
                    <small>e.g. Rice, Transportation. Leave empty to keep the employee's current ones.</small>
                  </div>
                  <button type="button" class="ghost-btn" :disabled="saving || form.allowances.length >= 20" @click="addExtra">
                    <Plus :size="14" /> Add Allowance
                  </button>
                </div>

                <ul v-if="form.allowances.length" class="extra-rows">
                  <li v-for="(row, index) in form.allowances" :key="row.key">
                    <input v-model="row.allowance_name" :aria-label="`Allowance ${index + 1} name`" maxlength="100" placeholder="Name" :disabled="saving">
                    <input v-model="row.amount" :aria-label="`Allowance ${index + 1} amount`" inputmode="decimal" placeholder="0.00" :disabled="saving">
                    <button type="button" class="icon-btn" :aria-label="`Remove ${row.allowance_name || `allowance ${index + 1}`}`" :disabled="saving" @click="removeExtra(row.key)">
                      <Trash2 :size="15" />
                    </button>
                  </li>
                </ul>
                <p v-else class="muted">No additional allowances.</p>

                <div v-if="form.allowances.length" class="extras-sum">
                  <span>Total additional allowances</span>
                  <strong>{{ money(extrasTotal) }}</strong>
                </div>
                <small v-if="extrasError" class="error-text">{{ extrasError }}</small>
              </div>

              <div class="field">
                <label for="ed-reason">Reason</label>
                <textarea id="ed-reason" v-model="form.reason" rows="3" maxlength="5000" :disabled="saving" />
                <small v-if="fieldError('reason')" class="error-text">{{ fieldError('reason') }}</small>
              </div>
            </div>
          </section>
        </div>

        <!-- RIGHT: DETAILS + HISTORY -->
        <aside class="column">
          <section class="card">
            <header class="card-header"><h2>Details</h2></header>
            <dl class="details">
              <div><dt>Employee</dt><dd>{{ item.employee_name }}</dd></div>
              <div><dt>Salary type</dt><dd>{{ item.salary_type || '—' }}</dd></div>
              <div><dt>Adjustment</dt><dd><span class="type-label" :class="item.adjustment_type">{{ titleCase(item.adjustment_type) }}</span></dd></div>
              <div><dt>Effective date</dt><dd>{{ dateLabel(item.effective_date) }}</dd></div>
              <div class="block"><dt>Reason</dt><dd>{{ item.reason || 'Not provided' }}</dd></div>
            </dl>
          </section>

          <section class="card">
            <header class="card-header"><h2>History</h2></header>
            <ol class="timeline">
              <li class="done">
                <strong>Filed</strong>
                <span>{{ dateLabel(item.created_at) }}</span>
              </li>
              <li v-if="item.status === 'rejected'" class="rejected">
                <strong>Rejected</strong>
                <span>The salary was not changed.</span>
              </li>
              <template v-else>
                <li :class="{ done: !!item.approved_at }">
                  <strong>{{ item.approved_at ? 'Approved' : 'Waiting for approval' }}</strong>
                  <span v-if="item.approved_at">{{ item.approved_by_name || 'Unknown user' }} · {{ dateLabel(item.approved_at) }}</span>
                </li>
                <li :class="{ done: !!item.applied_at }">
                  <strong>{{ item.applied_at ? 'Applied to salary' : 'Not yet applied' }}</strong>
                  <span v-if="item.applied_at">{{ item.applied_by_name || 'Unknown user' }} · {{ dateLabel(item.applied_at) }}</span>
                </li>
              </template>
            </ol>
          </section>
        </aside>
      </div>
    </template>

    <AppConfirmModal
      v-if="confirmAction"
      :title="ACTIONS[confirmAction].title"
      :message="ACTIONS[confirmAction].message"
      :confirm-label="ACTIONS[confirmAction].label"
      :danger="ACTIONS[confirmAction].danger"
      :busy="acting"
      :error="actionError"
      @close="confirmAction = null"
      @confirm="runAction"
    />
  </section>
</template>

<style scoped>
.detail-page { width: 100%; max-width: 1400px; margin: 0 auto; }

.back-link {
  display: inline-flex; align-items: center; gap: 6px; margin-bottom: 10px; padding: 0;
  border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
}

.back-link:focus-visible, .ghost-btn:focus-visible, .icon-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.header-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.reject-btn { color: #fb7185; }

.state-card {
  display: flex; min-height: 240px; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
  border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-muted); font-size: 13px;
}

.state-card.error { color: #fb7185; }
.state-card strong { color: var(--text-primary); font-size: 15px; }

.notice { margin: 0 0 14px; padding: 10px 12px; border-radius: 9px; background: rgba(59,130,246,.12); color: #93c5fd; font-size: 12px; }

.content-grid { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(280px, 1fr); gap: 16px; align-items: start; }
.column { display: grid; gap: 16px; }

.card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.card-header { padding: 16px 18px 12px; border-bottom: 1px solid var(--border); }
.card-header h2 { margin: 0; color: var(--text-primary); font-size: 15px; }
.card-header p { margin: 4px 0 0; color: var(--text-muted); font-size: 12px; line-height: 1.5; }

/* ===== View ===== */
.compare { display: grid; gap: 8px; padding: 16px 18px; }

.compare-row {
  display: grid; grid-template-columns: 110px auto 16px auto 1fr; align-items: center; gap: 10px;
  padding: 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); font-size: 13px;
}

.compare-row .label { color: var(--text-muted); font-size: 12px; }
.compare-row .before { color: var(--text-secondary); }
.compare-row .arrow { color: var(--text-muted); }
.compare-row strong { color: var(--text-primary); }
.diff { justify-self: end; color: var(--text-muted); font-weight: 600; white-space: nowrap; }
.diff.up { color: #34d399; }
.diff.down { color: #fb7185; }

.extras { padding: 0 18px 16px; }
.extras h3 { margin: 4px 0 8px; color: var(--text-primary); font-size: 13px; }
.extra-list { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }

.extra-list li {
  display: flex; justify-content: space-between; gap: 10px; padding: 9px 12px;
  border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); font-size: 12px; color: var(--text-secondary);
}

.extra-list strong { color: var(--text-primary); }
.extra-list .extra-total { background: transparent; border-style: dashed; }
.muted { margin: 0; color: var(--text-muted); font-size: 12px; }

.total-pay {
  display: flex; justify-content: space-between; padding: 14px 18px; border-top: 1px solid var(--border);
  color: var(--text-secondary); font-size: 13px;
}

.total-pay strong { color: var(--text-primary); font-size: 16px; }

/* ===== Edit ===== */
.form-body { display: flex; flex-direction: column; gap: 16px; padding: 16px 18px 18px; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field label { color: var(--text-primary); font-size: 11px; font-weight: 600; }
.required, .error-text { color: #fb7185; }

.field input, .field select, .field textarea, .extra-rows input {
  width: 100%; min-height: 40px; padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px;
  background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 12px; outline: none;
}

.field input[type='date'] { color-scheme: dark; }
.field textarea { resize: vertical; }
.field input:focus, .field select:focus, .field textarea:focus, .extra-rows input:focus { border-color: var(--primary); }
.field small, .extras-head small { color: var(--text-muted); font-size: 11px; }
.field small.error-text, small.error-text { color: #fb7185; font-size: 11px; }

.form-error {
  margin: 0; padding: 10px; border: 1px solid rgba(244,63,94,.3); border-radius: 8px;
  background: rgba(244,63,94,.08); color: #fb7185; font-size: 12px;
}

.extras-editor { display: flex; flex-direction: column; gap: 10px; padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card-soft); }
.extras-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.extras-title { display: block; color: var(--text-primary); font-size: 11px; font-weight: 600; }
.extras-head small { display: block; margin-top: 3px; }

.ghost-btn {
  display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px;
  background: transparent; color: var(--text-primary); font-family: inherit; font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer;
}

.extra-rows { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.extra-rows li { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 36px; gap: 8px; }
.extra-rows input { background: var(--bg-card); }

.icon-btn {
  display: grid; place-items: center; width: 36px; height: 40px; border: 1px solid var(--border); border-radius: 8px;
  background: transparent; color: var(--text-muted); cursor: pointer;
}

.icon-btn:hover { color: #fb7185; border-color: #fb7185; }
.extras-sum { display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-muted); }
.extras-sum strong { color: var(--text-primary); }

/* ===== Side ===== */
.details { display: grid; gap: 0; margin: 0; padding: 6px 18px 12px; }
.details div { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 12px; }
.details div:last-child { border-bottom: 0; }
.details div.block { flex-direction: column; gap: 6px; }
.details dt { color: var(--text-muted); }
.details dd { margin: 0; color: var(--text-primary); font-weight: 600; text-align: right; overflow-wrap: anywhere; }
.details div.block dd { text-align: left; font-weight: 500; line-height: 1.5; }

.timeline { display: grid; gap: 0; margin: 0; padding: 14px 18px 16px; list-style: none; }
.timeline li { position: relative; padding: 0 0 16px 22px; border-left: 2px solid var(--border); margin-left: 6px; }
.timeline li:last-child { padding-bottom: 0; border-left-color: transparent; }
.timeline li::before { position: absolute; top: 2px; left: -7px; width: 12px; height: 12px; border: 2px solid var(--border); border-radius: 50%; background: var(--bg-card); content: ''; }
.timeline li.done::before { border-color: #34d399; background: #34d399; }
.timeline li.rejected::before { border-color: #fb7185; background: #fb7185; }
.timeline strong { display: block; color: var(--text-primary); font-size: 12px; }
.timeline span { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; }

.status-label, .type-label {
  display: inline-block; padding: 5px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; white-space: nowrap;
  background: rgba(59,130,246,.12); color: #93c5fd;
}

.status-label.pending { background: rgba(245,158,11,.13); color: #fbbf24; }
.status-label.approved { background: rgba(59,130,246,.12); color: #60a5fa; }
.status-label.applied, .type-label.increase { background: rgba(16,185,129,.12); color: #34d399; }
.status-label.rejected, .type-label.decrease { background: rgba(244,63,94,.12); color: #fb7185; }

@media (max-width: 1000px) { .content-grid { grid-template-columns: 1fr; } }

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .compare-row { grid-template-columns: 1fr auto; }
  .compare-row .arrow, .compare-row .before { display: none; }
  .diff { grid-column: 1 / -1; justify-self: start; }
}
</style>