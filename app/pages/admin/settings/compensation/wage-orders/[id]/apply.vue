<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ArrowLeft, CheckCheck, ChevronDown, Search, Send, X } from 'lucide-vue-next'
import AppConfirmModal from '~/components/shared/AppConfirmModal.vue'
import {
  peso,
  useWageOrders,
  wageApiError,
  wageDate,
  type WageEmployee,
  type WageEmployeesResponse,
  type WageMeta,
  type WageOrderDetail,
} from '~/composables/admin/compensation/useWageOrders'

/**
 * Apply a wage order: choose the employees who get a salary increase.
 * Employees below the new minimum are first and pre-selected (priority);
 * HR / admin may add or remove anyone and change the amounts. Each selected
 * employee becomes a pending Salary Adjustment (approve → apply → payroll).
 */
definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const api = useWageOrders()
const { success, error: toastError } = useToast()

const id = Number(route.params.id)
const DETAIL = `/admin/settings/compensation/wage-orders/${id}`

const order = ref<WageOrderDetail | null>(null)
const meta = ref<WageMeta | null>(null)
const result = ref<WageEmployeesResponse | null>(null)
const loading = ref(true)
const loadError = ref('')

// =====================================================
// FILTERS
// =====================================================

const departmentId = ref<number | ''>('')
const locationId = ref<number | ''>('')
const search = ref('')
const show = ref<'all' | 'priority' | 'others'>('all')

// =====================================================
// SELECTION (kept across filters)
// =====================================================

const selected = reactive(new Set<number>())
const amounts = reactive<Record<number, string>>({})
let initialised = false

const loadEmployees = async () => {
  try {
    const response = await api.employees(id, {
      department_id: departmentId.value,
      location_id: locationId.value,
      search: search.value.trim(),
    })
    result.value = response

    for (const e of response.data) {
      if (amounts[e.employee_id] === undefined && e.suggested_salary !== null) {
        amounts[e.employee_id] = e.suggested_salary.toFixed(2)
      }
    }

    // First load: pre-select everyone below the new minimum.
    if (!initialised) {
      response.data.filter(e => e.priority && !e.blocked_reason).forEach(e => selected.add(e.employee_id))
      initialised = true
    }
  } catch (err) {
    loadError.value = wageApiError(err, 'Unable to load employees.').message
  }
}

onMounted(async () => {
  try {
    const [o, m] = await Promise.all([api.show(id), api.meta()])
    order.value = o.data
    meta.value = m.data
    await loadEmployees()
  } catch (err) {
    loadError.value = wageApiError(err, 'Unable to load this wage order.').message
  } finally {
    loading.value = false
  }
})

let timer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(loadEmployees, 350)
})
watch([departmentId, locationId], loadEmployees)

const rows = computed(() => {
  const list = result.value?.data ?? []
  if (show.value === 'priority') return list.filter(e => e.priority)
  if (show.value === 'others') return list.filter(e => !e.priority)
  return list
})

const selectable = (e: WageEmployee) => !e.blocked_reason && e.current_salary !== null

const toggle = (e: WageEmployee) => {
  if (!selectable(e)) return
  if (selected.has(e.employee_id)) selected.delete(e.employee_id)
  else selected.add(e.employee_id)
}

const selectPriority = () => (result.value?.data ?? []).filter(e => e.priority && selectable(e)).forEach(e => selected.add(e.employee_id))
const selectVisible = () => rows.value.filter(selectable).forEach(e => selected.add(e.employee_id))
const clearSelection = () => selected.clear()

const allVisibleSelected = computed(() => rows.value.filter(selectable).length > 0 && rows.value.filter(selectable).every(e => selected.has(e.employee_id)))
const toggleVisible = () => (allVisibleSelected.value ? rows.value.forEach(e => selected.delete(e.employee_id)) : selectVisible())

// =====================================================
// AMOUNTS + TOTALS
// =====================================================

const isAmount = (v?: string) => !!v && /^\d+(\.\d{1,2})?$/.test(v.trim())

const increaseOf = (e: WageEmployee) => {
  const v = amounts[e.employee_id]
  return isAmount(v) && e.current_salary !== null ? Number(v) - e.current_salary : null
}

// Monthly cost of the increase, to show the total impact.
const monthlyOf = (e: WageEmployee, amount: number) => {
  const type = e.salary_type.toLowerCase()
  const days = meta.value?.working_days_per_year ?? 261
  if (type.includes('daily')) return (amount * days) / 12
  if (type.includes('hour')) return (amount * 8 * days) / 12
  return amount
}

const chosen = computed(() => (result.value?.data ?? []).filter(e => selected.has(e.employee_id)))

const problems = computed(() =>
  chosen.value
    .filter(e => !isAmount(amounts[e.employee_id]) || (increaseOf(e) ?? 0) <= 0)
    .map(e => e.name),
)

const belowStillLow = computed(() =>
  chosen.value.filter((e) => {
    if (e.new_minimum === null || !isAmount(amounts[e.employee_id])) return false
    const type = e.salary_type.toLowerCase()
    const days = meta.value?.working_days_per_year ?? 261
    const v = Number(amounts[e.employee_id])
    const daily = type.includes('daily') ? v : type.includes('hour') ? v * 8 : (v * 12) / days
    return daily < e.new_minimum - 0.005
  }).map(e => e.name),
)

const monthlyTotal = computed(() =>
  chosen.value.reduce((sum, e) => sum + Math.max(0, monthlyOf(e, increaseOf(e) ?? 0)), 0),
)

const statusLabel = (e: WageEmployee) => ({
  below: `Below by ${peso(e.shortfall_daily)}/day`,
  at: 'At minimum',
  above: 'Above minimum',
  unknown: e.current_salary === null ? 'No salary rate' : 'Not covered',
}[e.status])

// =====================================================
// SUBMIT
// =====================================================

const reason = ref('')
const confirming = ref(false)
const submitting = ref(false)
const submitError = ref('')
const outcome = ref<{ created: { employee_id: number, name: string, salary_adjustment_id: number }[], skipped: { name: string | null, reason: string }[] } | null>(null)

const openConfirm = () => {
  submitError.value = ''
  if (!chosen.value.length) {
    toastError('No employees selected', 'Select at least one employee.')
    return
  }
  if (problems.value.length) {
    toastError('Check the new salaries', `Enter a higher salary for: ${problems.value.slice(0, 3).join(', ')}${problems.value.length > 3 ? '…' : ''}`)
    return
  }
  confirming.value = true
}

const submit = async () => {
  submitting.value = true
  submitError.value = ''
  try {
    const response = await api.apply(id, {
      items: chosen.value.map(e => ({ employee_id: e.employee_id, new_basic_salary: Number(amounts[e.employee_id]) })),
      reason: reason.value.trim() || undefined,
    })
    outcome.value = response.data
    confirming.value = false
    selected.clear()
    success('Salary adjustments created', response.message)
    await loadEmployees()
  } catch (err) {
    submitError.value = wageApiError(err, 'Unable to create the salary adjustments.').message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="apply-page">
    <button type="button" class="back-link" @click="router.push(DETAIL)">
      <ArrowLeft :size="14" /> Back to Wage Order
    </button>

    <div v-if="loading" class="state">Loading employees...</div>
    <div v-else-if="loadError || !order" class="state">
      <strong>Unable to load</strong>
      <span>{{ loadError }}</span>
    </div>

    <template v-else>
      <PageHeader
        :title="`Apply ${order.order_no}`"
        :description="`Choose who gets a salary increase. New minimum effective ${wageDate(order.effective_date)} in ${order.region_name}.`"
      />

      <div v-if="order.status !== 'published'" class="state">
        <strong>Publish this wage order first</strong>
        <span>Only published wage orders can be applied to employees.</span>
        <AppButton variant="secondary" @click="router.push(DETAIL)">Back to Wage Order</AppButton>
      </div>

      <template v-else>
        <!-- RESULT OF LAST SUBMIT -->
        <section v-if="outcome" class="outcome">
          <div>
            <strong>{{ outcome.created.length }} salary adjustment{{ outcome.created.length === 1 ? '' : 's' }} created</strong>
            <span>They are pending approval in Compensation › Wage Adjustments. Payroll uses the new salary after they are approved and applied.</span>
            <ul v-if="outcome.skipped.length" class="skipped">
              <li v-for="s in outcome.skipped" :key="`${s.name}-${s.reason}`">{{ s.name ?? 'Employee' }}: {{ s.reason }}</li>
            </ul>
          </div>
          <div class="outcome-actions">
            <AppButton variant="secondary" @click="router.push(`/admin/settings/compensation/wage-adjustments?wage_order_id=${id}`)">Open Wage Adjustments</AppButton>
            <button type="button" class="close" aria-label="Dismiss" @click="outcome = null"><X :size="16" /></button>
          </div>
        </section>

        <!-- RATES OF THIS ORDER -->
        <section class="rates-strip">
          <span v-for="r in order.rates" :key="r.id" class="rate-chip">
            {{ r.classification_name }}: <strong>{{ peso(r.daily_rate) }}</strong>/day
          </span>
        </section>

        <!-- FILTERS -->
        <div class="filters-row">
          <div class="select-wrap">
            <select v-model="departmentId" aria-label="Department">
              <option value="">All Departments</option>
              <option v-for="d in result?.departments ?? []" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
            <ChevronDown :size="14" class="select-icon" />
          </div>
          <div class="select-wrap">
            <select v-model="locationId" aria-label="Location">
              <option value="">All Locations</option>
              <option v-for="l in result?.locations ?? []" :key="l.id" :value="l.id">{{ l.name }}</option>
            </select>
            <ChevronDown :size="14" class="select-icon" />
          </div>
          <div class="segmented" role="group" aria-label="Show">
            <button type="button" :class="{ active: show === 'all' }" :aria-pressed="show === 'all'" @click="show = 'all'">All</button>
            <button type="button" :class="{ active: show === 'priority' }" :aria-pressed="show === 'priority'" @click="show = 'priority'">
              Below minimum <span class="count">{{ result?.stats.below_minimum ?? 0 }}</span>
            </button>
            <button type="button" :class="{ active: show === 'others' }" :aria-pressed="show === 'others'" @click="show = 'others'">Others</button>
          </div>
          <div class="search-box">
            <Search :size="15" />
            <input v-model="search" type="text" placeholder="Search name, employee no. or position..." aria-label="Search employees">
          </div>
        </div>

        <!-- TABLE -->
        <section class="list-card">
          <header class="list-header">
            <div>
              <h2>Employees in {{ order.region_code }}</h2>
              <p>Below the new minimum are first and pre-selected. You can select anyone and change the new salary.</p>
            </div>
            <div class="header-actions">
              <button type="button" class="ghost" @click="selectPriority"><CheckCheck :size="14" /> Select all below minimum</button>
              <button type="button" class="ghost" :disabled="!selected.size" @click="clearSelection">Clear</button>
            </div>
          </header>

          <div v-if="!rows.length" class="list-state">
            <strong>No employees found</strong>
            <span>Check the region of your work locations in Regional Rates, or change the filters.</span>
          </div>

          <div v-else class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col" class="check-col">
                    <input type="checkbox" :checked="allVisibleSelected" aria-label="Select all shown" @change="toggleVisible">
                  </th>
                  <th scope="col">Employee</th>
                  <th scope="col">Department</th>
                  <th scope="col">Location</th>
                  <th scope="col">Current salary</th>
                  <th scope="col">New minimum</th>
                  <th scope="col">Status</th>
                  <th scope="col">New salary</th>
                  <th scope="col">Increase</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="e in rows"
                  :key="e.employee_id"
                  :class="{ selected: selected.has(e.employee_id), priority: e.priority, blocked: !selectable(e) }"
                >
                  <td class="check-col">
                    <input
                      type="checkbox"
                      :checked="selected.has(e.employee_id)"
                      :disabled="!selectable(e)"
                      :aria-label="`Select ${e.name}`"
                      @change="toggle(e)"
                    >
                  </td>
                  <td>
                    <strong>{{ e.name }}</strong>
                    <small>{{ e.emp_id }}<template v-if="e.position"> · {{ e.position }}</template></small>
                    <small v-if="e.blocked_reason" class="blocked-reason">{{ e.blocked_reason }}</small>
                  </td>
                  <td>{{ e.department ?? '—' }}</td>
                  <td>{{ e.location }}<small>{{ e.classification_name }}</small></td>
                  <td>
                    {{ peso(e.current_salary) }}
                    <small>{{ e.salary_type }}<template v-if="e.current_daily !== null && !e.salary_type.toLowerCase().includes('daily')"> · ≈ {{ peso(e.current_daily) }}/day</template></small>
                  </td>
                  <td>{{ e.new_minimum !== null ? `${peso(e.new_minimum)}/day` : '—' }}</td>
                  <td><span class="status" :class="e.status">{{ statusLabel(e) }}</span></td>
                  <td>
                    <div class="amount" :class="{ off: !selected.has(e.employee_id) }">
                      <span>₱</span>
                      <input
                        v-model="amounts[e.employee_id]"
                        inputmode="decimal"
                        :disabled="!selectable(e)"
                        :aria-label="`New ${e.salary_type.toLowerCase()} salary of ${e.name}`"
                        @focus="selectable(e) && selected.add(e.employee_id)"
                      >
                    </div>
                  </td>
                  <td class="inc">
                    <template v-if="increaseOf(e) !== null">{{ increaseOf(e)! > 0 ? '+' : '' }}{{ peso(increaseOf(e)) }}</template>
                    <template v-else>—</template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- SUMMARY + SUBMIT -->
        <section class="submit-bar">
          <div class="totals">
            <div><span>Selected</span><strong>{{ selected.size }}</strong></div>
            <div><span>Added cost per month</span><strong>{{ peso(monthlyTotal) }}</strong></div>
          </div>
          <div class="reason">
            <label for="apply-reason">Reason (optional)</label>
            <input id="apply-reason" v-model="reason" type="text" maxlength="1000" :placeholder="`Wage Order ${order.order_no}`">
          </div>
          <AppButton :icon="Send" :disabled="!selected.size" @click="openConfirm">
            Create {{ selected.size }} salary adjustment{{ selected.size === 1 ? '' : 's' }}
          </AppButton>
        </section>
      </template>
    </template>

    <AppConfirmModal
      v-if="confirming"
      :title="`Create ${selected.size} salary adjustment${selected.size === 1 ? '' : 's'}?`"
      :message="belowStillLow.length
        ? `Warning: ${belowStillLow.length} selected employee(s) would still be below the new minimum. They are created as Pending; approve and apply them in Wage Adjustments before payroll.`
        : 'They are created as Pending. Approve and apply them in Compensation › Wage Adjustments; payroll uses the new salary after that.'"
      confirm-label="Create adjustments"
      :busy="submitting"
      :error="submitError"
      @close="confirming = false"
      @confirm="submit"
    />
  </section>
</template>

<style scoped>
.apply-page { width: 100%; max-width: 1660px; margin: 0 auto; display: grid; gap: 14px; padding-bottom: 90px; }
.back-link { display: inline-flex; width: fit-content; align-items: center; gap: 6px; padding: 0; border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.state { display: flex; min-height: 200px; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-muted); font-size: 13px; text-align: center; }
.state strong { color: var(--text-primary); font-size: 15px; }

.outcome { display: flex; justify-content: space-between; gap: 16px; padding: 14px 16px; border: 1px solid color-mix(in srgb, var(--green) 35%, var(--border)); border-radius: 12px; background: var(--green-soft); }
.outcome strong { display: block; color: var(--green); font-size: 14px; }
.outcome span { display: block; margin-top: 4px; color: var(--text-secondary); font-size: 12px; }
.skipped { margin: 8px 0 0; padding-left: 18px; color: var(--orange); font-size: 12px; }
.outcome-actions { display: flex; align-items: flex-start; gap: 8px; }
.close { display: grid; width: 32px; height: 32px; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--text-muted); cursor: pointer; }

.rates-strip { display: flex; flex-wrap: wrap; gap: 8px; }
.rate-chip { padding: 7px 12px; border: 1px solid var(--border); border-radius: 999px; background: var(--bg-card); color: var(--text-secondary); font-size: 12px; }
.rate-chip strong { color: var(--green); }

.filters-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.select-wrap { position: relative; min-width: 180px; }
.select-wrap select { width: 100%; height: 40px; padding: 0 34px 0 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 12px; appearance: none; }
.select-icon { position: absolute; top: 50%; right: 10px; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.segmented { display: inline-flex; padding: 3px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card-soft); }
.segmented button { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border: 0; border-radius: 7px; background: transparent; color: var(--text-secondary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.segmented button.active { background: var(--primary-soft); color: var(--text-primary); }
.segmented .count { padding: 1px 7px; border-radius: 999px; background: var(--red); color: #fff; font-size: 10px; }
.search-box { display: flex; flex: 1; min-width: 220px; height: 40px; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-muted); }
.search-box input { width: 100%; border: 0; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 12px; outline: none; }
.search-box:focus-within, .select-wrap select:focus-visible { border-color: var(--primary); outline: none; }
.segmented button:focus-visible, .ghost:focus-visible, .close:focus-visible, .back-link:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.list-card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.list-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 16px 18px; border-bottom: 1px solid var(--border-soft); }
.list-header h2 { margin: 0; font-size: 16px; }
.list-header p { margin: 3px 0 0; color: var(--text-secondary); font-size: 12px; }
.header-actions { display: flex; gap: 8px; }
.ghost { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.ghost:disabled { opacity: 0.5; cursor: not-allowed; }
.list-state { display: flex; min-height: 180px; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: var(--text-muted); font-size: 13px; }
.list-state strong { color: var(--text-primary); }

.table-wrap { overflow-x: auto; }
.table { width: 100%; min-width: 1200px; border-collapse: collapse; font-size: 13px; }
.table th { padding: 10px 12px; color: var(--text-secondary); font-size: 11px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.05em; }
.table td { padding: 11px 12px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); vertical-align: middle; }
.table td strong { color: var(--text-primary); }
.table td small { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; }
.check-col { width: 40px; text-align: center !important; }
.check-col input { width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary); }
tr.priority td:first-child { box-shadow: inset 3px 0 0 var(--red); }
tr.selected { background: color-mix(in srgb, var(--primary-soft) 45%, transparent); }
tr.blocked { opacity: 0.55; }
.blocked-reason { color: var(--orange) !important; }

.status { display: inline-block; padding: 4px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; background: var(--bg-card-soft); color: var(--text-secondary); }
.status.below { background: var(--red-soft); color: var(--red); }
.status.at { background: var(--orange-soft); color: var(--orange); }
.status.above { background: var(--green-soft); color: var(--green); }

.amount { display: flex; width: 140px; align-items: center; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); }
.amount span { padding: 0 0 0 10px; color: var(--text-muted); }
.amount input { width: 100%; height: 34px; padding: 0 10px 0 4px; border: 0; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 13px; outline: none; }
.amount:focus-within { border-color: var(--primary); }
.amount.off { opacity: 0.6; }
.inc { color: var(--green) !important; font-weight: 600; white-space: nowrap; }

.submit-bar {
  position: sticky; bottom: 12px; z-index: 5; display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px; padding: 14px 16px;
  border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.totals { display: flex; gap: 20px; }
.totals span { display: block; color: var(--text-muted); font-size: 11px; }
.totals strong { display: block; margin-top: 3px; font-size: 18px; }
.reason { display: flex; flex: 1; min-width: 220px; flex-direction: column; gap: 5px; }
.reason label { color: var(--text-secondary); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.reason input { height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 13px; outline: none; }
.reason input:focus { border-color: var(--primary); }
</style>
