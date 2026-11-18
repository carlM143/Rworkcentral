<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleCheckBig,
  Coins,
  Gift,
  Pencil,
  Plus,
  Save,
  Trash2,
  WalletCards,
  X,
  XCircle,
} from 'lucide-vue-next'
import DriverStatCard from '~/components/admin/drivers/DriverStatCard.vue'
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
  clears_allowances?: boolean
  current_allowances?: ExtraAllowance[]
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

const LIST_PATH = '/admin/employees/salary-adjustments'
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

const toNumber = (value: Money) => (value === null || value === '' || value === undefined ? 0 : Number(value))

const money = (value: Money) =>
  value === null || value === '' || value === undefined
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
const sum = (rows: ExtraAllowance[]) => rows.reduce((total, row) => total + toNumber(row.amount), 0)

// =====================================================
// SALARY COMPARISON
// =====================================================

const currentExtras = computed(() => item.value?.current_allowances ?? [])

// What the employee will have after this adjustment is applied.
const newExtras = computed<ExtraAllowance[]>(() => {
  if (!item.value) return []
  if (item.value.allowances.length) return item.value.allowances
  return item.value.clears_allowances ? [] : currentExtras.value
})

const extrasUnchanged = computed(() => !!item.value && !item.value.allowances.length && !item.value.clears_allowances)

const rows = computed(() => {
  const a = item.value
  if (!a) return []
  const list = [
    { label: 'Basic salary', before: toNumber(a.previous_basic_salary), after: toNumber(a.new_basic_salary) },
    { label: 'Allowance', before: toNumber(a.previous_allowance), after: toNumber(a.new_allowance) },
    { label: 'Additional allowances', before: sum(currentExtras.value), after: sum(newExtras.value) },
  ]
  return [
    ...list,
    { label: 'Total', before: list.reduce((t, r) => t + r.before, 0), after: list.reduce((t, r) => t + r.after, 0), total: true },
  ]
})

const basicDiff = computed(() => (item.value ? toNumber(item.value.new_basic_salary) - toNumber(item.value.previous_basic_salary) : 0))

const totalRow = computed(() => rows.value[rows.value.length - 1] ?? { before: 0, after: 0 })

// One line per allowance name: current vs new.
const extraLines = computed(() => {
  const lines = new Map<string, { name: string, current: number | null, next: number | null }>()
  currentExtras.value.forEach(row => lines.set(row.allowance_name.toLowerCase(), { name: row.allowance_name, current: toNumber(row.amount), next: null }))
  newExtras.value.forEach((row) => {
    const key = row.allowance_name.toLowerCase()
    const existing = lines.get(key)
    lines.set(key, { name: existing?.name ?? row.allowance_name, current: existing?.current ?? null, next: toNumber(row.amount) })
  })
  return [...lines.values()]
})

const changeTag = (line: { current: number | null, next: number | null }) => {
  if (line.current === null) return { label: 'New', tone: 'up' }
  if (line.next === null) return { label: 'Removed', tone: 'down' }
  if (line.next > line.current) return { label: 'Increased', tone: 'up' }
  if (line.next < line.current) return { label: 'Decreased', tone: 'down' }
  return { label: 'No change', tone: '' }
}

// =====================================================
// PERMISSIONS BY STATUS
// =====================================================

const canEdit = computed(() => !!item.value && ['pending', 'approved'].includes(item.value.status))
const canDelete = computed(() => !!item.value && item.value.status !== 'applied')
const isFutureEffective = computed(() => !!item.value && item.value.effective_date > new Date().toISOString().slice(0, 10))

// =====================================================
// EDIT (pending or approved)
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
    // Start from the allowances the employee will have after this adjustment.
    allowances: newExtras.value.map(a => ({ key: ++rowKey, allowance_name: a.allowance_name, amount: String(a.amount ?? '') })),
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

const extrasTotal = computed(() => form.allowances.reduce((total, row) => total + (Number(row.amount) || 0), 0))

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
        // The list below is complete: removed rows end those allowances.
        replace_allowances: true,
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
// REMOVE AN ALLOWANCE (allowances are not permanent)
// =====================================================

interface RemoveTarget { kind: 'base' | 'extra', name: string, amount: number }

const removeTarget = ref<RemoveTarget | null>(null)
const removing = ref(false)
const removeError = ref('')

const askRemove = (target: RemoveTarget) => {
  removeError.value = ''
  removeTarget.value = target
}

const removeMessage = computed(() => {
  const t = removeTarget.value
  if (!t || !item.value) return ''
  const back = item.value.status === 'approved'
    ? ' This adjustment is already approved, so it goes back to Pending for a new approval.'
    : ''
  return `${t.name} (${money(t.amount)}) will be removed from this adjustment. When it is applied, the employee no longer receives this allowance.${back}`
})

const confirmRemove = async () => {
  const t = removeTarget.value
  const a = item.value
  if (!t || !a) return

  const remaining = newExtras.value.filter(e => !(t.kind === 'extra' && e.allowance_name === t.name))
  const newAllowance = t.kind === 'base' ? null : a.new_allowance
  const after = toNumber(a.new_basic_salary) + toNumber(newAllowance) + sum(remaining)
  const before = totalRow.value.before

  removing.value = true
  removeError.value = ''
  try {
    const response = await $api<ApiResponse<AdjustmentDetail>>(`/admin/salary-adjustments/${adjustmentId}`, {
      method: 'PUT',
      body: {
        // Keep the type consistent with the new total.
        adjustment_type: after > before ? 'increase' : after < before ? 'decrease' : a.adjustment_type,
        effective_date: a.effective_date,
        new_basic_salary: toNumber(a.new_basic_salary),
        new_allowance: newAllowance === null ? null : toNumber(newAllowance),
        reason: a.reason,
        replace_allowances: true,
        allowances: remaining.map(e => ({ allowance_name: e.allowance_name, amount: toNumber(e.amount) })),
      },
    })
    item.value = response.data
    removeTarget.value = null
    success('Allowance removed', `${t.name} was removed from this adjustment.`)
  } catch (err) {
    removeError.value = getSalaryAdjustmentApiError(err).message
  } finally {
    removing.value = false
  }
}

// =====================================================
// APPROVE / REJECT / APPLY / DELETE
// =====================================================

type Action = 'approve' | 'reject' | 'apply' | 'delete'

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
  delete: {
    title: 'Delete this salary adjustment?',
    message: 'The adjustment and its allowance lines are removed permanently. The employee salary is not changed.',
    label: 'Delete',
    done: 'deleted',
    danger: true,
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
    if (action === 'delete') {
      await $api(`/admin/salary-adjustments/${adjustmentId}`, { method: 'DELETE' })
      confirmAction.value = null
      success('Salary Adjustment Deleted', 'The adjustment was removed.')
      await router.push(LIST_PATH)
      return
    }
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
</script>

<template>
  <section class="adjustment-page">
    <PageHeader
      title="Salary Adjustment"
      :description="item ? `${item.employee_name} · salary change, allowances and approval history.` : 'Salary change, allowances and approval history.'"
    >
      <AppButton variant="secondary" :icon="ArrowLeft" :disabled="saving" @click="router.push(LIST_PATH)">
        Back
      </AppButton>

      <template v-if="item && !editing">
        <AppButton v-if="canEdit" variant="secondary" :icon="Pencil" @click="startEdit">Edit</AppButton>
        <AppButton v-if="canDelete" variant="secondary" :icon="Trash2" @click="openAction('delete')">Delete</AppButton>
        <AppButton v-if="item.status === 'pending'" variant="secondary" :icon="XCircle" @click="openAction('reject')">Reject</AppButton>
        <AppButton v-if="item.status === 'pending'" :icon="CheckCircle2" @click="openAction('approve')">Approve</AppButton>
        <AppButton v-if="item.status === 'approved'" :icon="CircleCheckBig" :disabled="isFutureEffective" @click="openAction('apply')">
          Apply Adjustment
        </AppButton>
      </template>

      <template v-if="editing">
        <AppButton variant="secondary" :icon="X" :disabled="saving" @click="cancelEdit">Cancel</AppButton>
        <AppButton :icon="Save" :disabled="saving" @click="saveEdit">{{ saving ? 'Saving...' : 'Save Changes' }}</AppButton>
      </template>
    </PageHeader>

    <!-- LOADING / NOT FOUND -->
    <div v-if="loading" class="state-card">Loading salary adjustment...</div>

    <div v-else-if="loadError || !item" class="state-card">
      <AlertTriangle :size="20" class="state-icon" />
      <strong>Unable to load this salary adjustment</strong>
      <span>{{ loadError || 'This adjustment may have been removed.' }}</span>
      <AppButton variant="secondary" :icon="ArrowLeft" @click="router.push(LIST_PATH)">Back to Salary Adjustments</AppButton>
    </div>

    <template v-else>
      <!-- SUMMARY -->
      <section class="summary-card">
        <div>
          <span class="eyebrow">Salary Adjustment #{{ item.id }}</span>
          <h2>{{ item.employee_name }}</h2>
          <p>
            {{ item.emp_id ?? `Employee #${item.employee_id}` }} · {{ item.salary_type || 'No salary type' }} ·
            Effective {{ dateLabel(item.effective_date) }}
          </p>
        </div>
        <div class="summary-status">
          <span class="status-pill" :class="item.status">{{ titleCase(item.status) }}</span>
          <small v-if="item.status === 'approved'">
            {{ isFutureEffective ? `Can be applied on ${dateLabel(item.effective_date)}` : 'Ready to apply' }}
          </small>
          <small v-else-if="item.status === 'pending'">Waiting for approval</small>
          <small v-else-if="item.status === 'applied'">Applied {{ dateLabel(item.applied_at) }}</small>
        </div>
      </section>

      <!-- STATS -->
      <section class="stats-grid">
        <DriverStatCard
          label="New Basic Salary"
          :value="money(item.new_basic_salary)"
          :description="`Was ${money(item.previous_basic_salary)} · ${signedMoney(basicDiff)}`"
          accent="blue"
          :icon="WalletCards"
        />
        <DriverStatCard
          label="New Allowance"
          :value="money(item.new_allowance ?? 0)"
          :description="`Was ${money(item.previous_allowance ?? 0)}`"
          accent="green"
          :icon="Coins"
        />
        <DriverStatCard
          label="Additional Allowances"
          :value="money(sum(newExtras))"
          :description="extrasUnchanged ? 'Unchanged' : `${newExtras.length} item${newExtras.length === 1 ? '' : 's'}`"
          accent="purple"
          :icon="Gift"
        />
        <DriverStatCard
          label="Effective Date"
          :value="dateLabel(item.effective_date)"
          :description="`Total ${signedMoney(totalRow.after - totalRow.before)}`"
          accent="orange"
          :icon="CalendarDays"
        />
      </section>

      <div class="detail-grid">
        <!-- LEFT -->
        <div class="column">
          <template v-if="!editing">
            <section class="panel">
              <header class="panel-header">
                <div>
                  <h3>Salary Change</h3>
                  <p>Previous basic salary and allowance were taken when the adjustment was filed.</p>
                </div>
              </header>
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Item</th>
                      <th scope="col">Current</th>
                      <th scope="col">New</th>
                      <th scope="col">Difference</th>
                      <th scope="col"><span class="sr-only">Remove</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in rows" :key="row.label" :class="{ 'total-row': 'total' in row }">
                      <th scope="row">{{ row.label }}</th>
                      <td>{{ money(row.before) }}</td>
                      <td><strong>{{ money(row.after) }}</strong></td>
                      <td>
                        <span class="diff" :class="{ up: row.after > row.before, down: row.after < row.before }">
                          {{ signedMoney(row.after - row.before) }}
                        </span>
                      </td>
                      <td class="remove-cell">
                        <button
                          v-if="canEdit && row.label === 'Allowance' && row.after > 0"
                          type="button"
                          class="trash-btn"
                          aria-label="Remove allowance"
                          title="Remove allowance"
                          @click="askRemove({ kind: 'base', name: 'Allowance', amount: row.after })"
                        >
                          <Trash2 :size="15" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="panel">
              <header class="panel-header">
                <div>
                  <h3>Additional Allowances</h3>
                  <p v-if="extrasUnchanged">This adjustment keeps the employee's current additional allowances.</p>
                  <p v-else-if="item.clears_allowances">This adjustment ends all additional allowances.</p>
                  <p v-else>The employee's additional allowances after this adjustment is applied.</p>
                </div>
              </header>
              <div v-if="extraLines.length" class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Allowance</th>
                      <th scope="col">Current</th>
                      <th scope="col">New</th>
                      <th scope="col">Change</th>
                      <th scope="col"><span class="sr-only">Remove</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="line in extraLines" :key="line.name">
                      <th scope="row">{{ line.name }}</th>
                      <td>{{ line.current === null ? '—' : money(line.current) }}</td>
                      <td><strong>{{ line.next === null ? '—' : money(line.next) }}</strong></td>
                      <td><span class="tag" :class="changeTag(line).tone">{{ changeTag(line).label }}</span></td>
                      <td class="remove-cell">
                        <button
                          v-if="canEdit && line.next !== null"
                          type="button"
                          class="trash-btn"
                          :aria-label="`Remove ${line.name}`"
                          :title="`Remove ${line.name}`"
                          @click="askRemove({ kind: 'extra', name: line.name, amount: line.next })"
                        >
                          <Trash2 :size="15" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="empty">No additional allowances.</p>
            </section>
          </template>

          <!-- EDIT -->
          <section v-else class="panel">
            <header class="panel-header">
              <div>
                <h3>Edit Salary Adjustment</h3>
                <p>Change the salary, allowances or effective date. Remove a row to end that allowance.</p>
              </div>
            </header>

            <div class="form-body">
              <p v-if="item.status === 'approved'" class="notice">
                This adjustment is already approved. Saving changes sends it back to <strong>Pending</strong> for a new approval.
              </p>
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
                  <small>Current: {{ money(item.previous_basic_salary) }}</small>
                  <small v-if="fieldError('new_basic_salary')" class="error-text">{{ fieldError('new_basic_salary') }}</small>
                </div>
                <div class="field">
                  <label for="ed-allowance">New Allowance (PHP)</label>
                  <input id="ed-allowance" v-model="form.new_allowance" inputmode="decimal" placeholder="Leave blank for none" :disabled="saving">
                  <small>Current: {{ money(item.previous_allowance) }}</small>
                  <small v-if="fieldError('new_allowance')" class="error-text">{{ fieldError('new_allowance') }}</small>
                </div>
              </div>

              <div class="extras-editor">
                <div class="extras-head">
                  <div>
                    <span class="extras-title">Additional Allowances</span>
                    <small>e.g. Rice, Transportation. Remove a row to end that allowance.</small>
                  </div>
                  <AppButton variant="secondary" size="sm" :icon="Plus" :disabled="saving || form.allowances.length >= 20" @click="addExtra">
                    Add Allowance
                  </AppButton>
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
                <p v-else class="empty compact">
                  No additional allowances. Saving like this ends all of the employee's additional allowances when applied.
                </p>

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

        <!-- RIGHT -->
        <aside class="column">
          <section class="panel">
            <header class="panel-header">
              <div>
                <h3>Adjustment Details</h3>
                <p>Who, what and when.</p>
              </div>
            </header>
            <dl class="detail-list">
              <div><dt>Employee</dt><dd>{{ item.employee_name }}</dd></div>
              <div><dt>Employee No.</dt><dd>{{ item.emp_id ?? '—' }}</dd></div>
              <div><dt>Salary Type</dt><dd>{{ item.salary_type || '—' }}</dd></div>
              <div><dt>Adjustment</dt><dd><span class="tag" :class="{ up: item.adjustment_type === 'increase', down: item.adjustment_type === 'decrease' }">{{ titleCase(item.adjustment_type) }}</span></dd></div>
              <div><dt>Effective Date</dt><dd>{{ dateLabel(item.effective_date) }}</dd></div>
              <div class="stacked"><dt>Reason</dt><dd>{{ item.reason || 'Not provided' }}</dd></div>
            </dl>
          </section>

          <section class="panel">
            <header class="panel-header">
              <div>
                <h3>Approval History</h3>
                <p>From filing to salary update.</p>
              </div>
            </header>
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
      v-if="removeTarget"
      :title="`Remove ${removeTarget.name}?`"
      :message="removeMessage"
      confirm-label="Remove allowance"
      danger
      :busy="removing"
      :error="removeError"
      @close="removeTarget = null"
      @confirm="confirmRemove"
    />

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
.adjustment-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.state-card {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 13px;
}

.state-card strong {
  color: var(--text-primary);
  font-size: 15px;
}

.state-icon { color: #fb7185; }

/* ===== Summary ===== */

.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.1), var(--bg-card));
}

.eyebrow {
  color: var(--text-secondary);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.summary-card h2 {
  margin: 4px 0;
  font-size: 22px;
}

.summary-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.summary-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  text-align: right;
}

.summary-status small {
  color: var(--text-muted);
  font-size: 11px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 14px 0;
}

/* ===== Panels ===== */

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr);
  gap: 14px;
  align-items: start;
}

.column {
  display: grid;
  gap: 14px;
}

.panel {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 60px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-soft);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.panel-header p {
  margin: 3px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.table-wrap { overflow-x: auto; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th,
.data-table td {
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-soft);
  text-align: left;
  white-space: nowrap;
}

.data-table thead th {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.data-table tbody th {
  color: var(--text-primary);
  font-weight: 600;
}

.data-table td { color: var(--text-secondary); }
.data-table td strong { color: var(--text-primary); }
.data-table tbody tr:last-child th,
.data-table tbody tr:last-child td { border-bottom: 0; }

.total-row th,
.total-row td {
  background: var(--bg-card-soft);
  font-weight: 700;
}

.diff {
  font-weight: 600;
  color: var(--text-muted);
}

.diff.up { color: var(--green); }
.diff.down { color: var(--red); }

.remove-cell { width: 48px; text-align: right !important; }

.trash-btn {
  display: inline-grid; width: 32px; height: 32px; place-items: center; border: 1px solid var(--border); border-radius: 8px;
  background: transparent; color: var(--text-muted); cursor: pointer;
}

.trash-btn:hover { border-color: var(--red); color: var(--red); }
.trash-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.tag {
  display: inline-block;
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.14);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.tag.up { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.tag.down { background: rgba(239, 68, 68, 0.12); color: #f87171; }

.empty {
  margin: 0;
  padding: 18px;
  color: var(--text-muted);
  font-size: 13px;
}

.empty.compact { padding: 0; font-size: 12px; }

.detail-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 18px;
}

.detail-list div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-soft);
}

.detail-list div:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.detail-list div.stacked {
  flex-direction: column;
  gap: 6px;
}

.detail-list dt {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.detail-list dd {
  margin: 0;
  font-size: 13px;
  text-align: right;
  overflow-wrap: anywhere;
}

.detail-list div.stacked dd {
  text-align: left;
  line-height: 1.5;
}

/* ===== Timeline ===== */

.timeline {
  margin: 0;
  padding: 18px;
  list-style: none;
}

.timeline li {
  position: relative;
  margin-left: 6px;
  padding: 0 0 18px 22px;
  border-left: 2px solid var(--border);
}

.timeline li:last-child {
  padding-bottom: 0;
  border-left-color: transparent;
}

.timeline li::before {
  position: absolute;
  top: 2px;
  left: -7px;
  width: 12px;
  height: 12px;
  border: 2px solid var(--border);
  border-radius: 50%;
  background: var(--bg-card);
  content: '';
}

.timeline li.done::before { border-color: var(--green); background: var(--green); }
.timeline li.rejected::before { border-color: var(--red); background: var(--red); }

.timeline strong {
  display: block;
  font-size: 13px;
}

.timeline span {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 12px;
}

/* ===== Status ===== */

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(148, 163, 184, 0.14);
  color: var(--text-secondary);
}

.status-pill.pending { background: rgba(245, 158, 11, 0.13); color: #fbbf24; }
.status-pill.approved { background: rgba(59, 130, 246, 0.14); color: #60a5fa; }
.status-pill.applied { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.status-pill.rejected { background: rgba(239, 68, 68, 0.12); color: #f87171; }

/* ===== Edit form ===== */

.form-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
}

.notice {
  margin: 0;
  padding: 10px 12px;
  border-radius: 9px;
  background: var(--orange-soft);
  color: var(--orange);
  font-size: 12px;
}

.form-error {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 9px;
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  font-size: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.field label {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.required,
.error-text { color: #f87171; }

.field input,
.field select,
.field textarea,
.extra-rows input {
  width: 100%;
  min-height: 40px;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  outline: none;
}

.field input[type='date'] { color-scheme: dark; }
.field textarea { resize: vertical; }

.field input:focus,
.field select:focus,
.field textarea:focus,
.extra-rows input:focus { border-color: var(--primary); }

.field small {
  color: var(--text-muted);
  font-size: 11px;
}

.field small.error-text,
small.error-text {
  color: #f87171;
  font-size: 11px;
}

.extras-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
}

.extras-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.extras-title {
  display: block;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.extras-head small {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 11px;
}

.extra-rows {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.extra-rows li {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 40px;
  gap: 8px;
}

.extra-rows input { background: var(--bg-card); }

.icon-btn {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.icon-btn:hover {
  border-color: var(--red);
  color: var(--red);
}

.icon-btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.extras-sum {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 12px;
}

.extras-sum strong { color: var(--text-primary); }

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .detail-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .stats-grid,
  .form-grid { grid-template-columns: 1fr; }

  .summary-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-status {
    align-items: flex-start;
    text-align: left;
  }
}
</style>