<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Ban, CheckCircle2, ChevronDown, CircleCheckBig, Clock3, Landmark, Search, XCircle } from 'lucide-vue-next'
import DriverStatCard from '~/components/admin/drivers/DriverStatCard.vue'
import AppConfirmModal from '~/components/shared/AppConfirmModal.vue'
import {
  peso,
  useWageOrders,
  wageApiError,
  wageDate,
  type WageAdjustment,
  type WageAdjustmentStatus,
  type WageAdjustmentsResponse,
} from '~/composables/admin/compensation/useWageOrders'

/**
 * Compensation › Wage Adjustments: salary increases created from wage
 * orders. Kept apart from Employees › Salary Adjustments (manual changes).
 * Approve → Apply here; payroll uses the new salary after it is applied.
 */
definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const api = useWageOrders()
const { success, error: toastError } = useToast()

// =====================================================
// FILTERS
// =====================================================

const wageOrderId = ref<number | ''>(route.query.wage_order_id ? Number(route.query.wage_order_id) : '')
const status = ref<WageAdjustmentStatus | ''>('pending')
const departmentId = ref<number | ''>('')
const search = ref('')

const result = ref<WageAdjustmentsResponse | null>(null)
const loading = ref(true)
const loadError = ref('')
const selected = reactive(new Set<number>())
let requestId = 0

const load = async () => {
  const id = ++requestId
  loading.value = true
  loadError.value = ''
  try {
    const response = await api.wageAdjustments({
      wage_order_id: wageOrderId.value,
      status: status.value,
      department_id: departmentId.value,
      search: search.value.trim(),
    })
    if (id !== requestId) return
    result.value = response
    // Keep only selections that are still in the list.
    const ids = new Set(response.data.map(r => r.id))
    ;[...selected].forEach(s => !ids.has(s) && selected.delete(s))
  } catch (err) {
    if (id === requestId) loadError.value = wageApiError(err, 'Unable to load wage adjustments.').message
  } finally {
    if (id === requestId) loading.value = false
  }
}

onMounted(load)

let timer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(load, 350)
})
watch([wageOrderId, status, departmentId], () => {
  selected.clear()
  load()
})

const rows = computed(() => result.value?.data ?? [])
const stats = computed(() => result.value?.stats ?? { pending: 0, approved: 0, applied: 0, rejected: 0 })

const STATUS_TABS: { value: WageAdjustmentStatus | '', label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'applied', label: 'Applied' },
  { value: 'rejected', label: 'Rejected' },
  { value: '', label: 'All' },
]

// =====================================================
// SELECTION + BULK ACTIONS
// =====================================================

const actionable = (r: WageAdjustment) => r.status === 'pending' || r.status === 'approved'

const toggle = (r: WageAdjustment) => {
  if (!actionable(r)) return
  if (selected.has(r.id)) selected.delete(r.id)
  else selected.add(r.id)
}

const allSelected = computed(() => rows.value.filter(actionable).length > 0 && rows.value.filter(actionable).every(r => selected.has(r.id)))
const toggleAll = () => (allSelected.value ? selected.clear() : rows.value.filter(actionable).forEach(r => selected.add(r.id)))

const chosen = computed(() => rows.value.filter(r => selected.has(r.id)))
const toApprove = computed(() => chosen.value.filter(r => r.status === 'pending'))
const toApply = computed(() => chosen.value.filter(r => r.status === 'approved' && r.can_apply_now))

type Action = 'approve' | 'reject' | 'apply'
const confirm = ref<Action | null>(null)
const acting = ref(false)
const actionError = ref('')
const failed = ref<{ name: string, reason: string }[]>([])

const targets = computed(() => (confirm.value === 'apply' ? toApply.value : toApprove.value))

const ACTIONS: Record<Action, { title: (n: number) => string, message: string, label: string, danger: boolean }> = {
  approve: {
    title: n => `Approve ${n} wage adjustment${n === 1 ? '' : 's'}?`,
    message: 'Approval does not change salaries yet. Apply them on or after the effective date.',
    label: 'Approve',
    danger: false,
  },
  reject: {
    title: n => `Reject ${n} wage adjustment${n === 1 ? '' : 's'}?`,
    message: 'The salaries stay the same. You can include these employees again from the wage order.',
    label: 'Reject',
    danger: true,
  },
  apply: {
    title: n => `Apply ${n} wage adjustment${n === 1 ? '' : 's'}?`,
    message: 'The new salaries are saved to the employees’ salary rates and used in the next payroll.',
    label: 'Apply',
    danger: false,
  },
}

const run = async () => {
  const action = confirm.value
  if (!action) return
  acting.value = true
  actionError.value = ''
  try {
    const response = await api.bulkAdjustments(action, targets.value.map(r => r.id))
    failed.value = response.data.failed
    confirm.value = null
    selected.clear()
    if (response.data.done.length) success('Wage adjustments updated', response.message)
    else toastError('Nothing was changed', response.message)
    await load()
  } catch (err) {
    actionError.value = wageApiError(err, 'Unable to update the wage adjustments.').message
  } finally {
    acting.value = false
  }
}

const statusLabel: Record<WageAdjustmentStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  applied: 'Applied',
  rejected: 'Rejected',
}
</script>

<template>
  <section class="adjust-page">
    <PageHeader
      title="Wage Adjustments"
      description="Salary increases created from wage orders. Approve, then apply them so payroll uses the new salary."
    >
      <AppButton variant="secondary" :icon="Landmark" @click="router.push('/admin/settings/compensation/wage-orders')">Wage Orders</AppButton>
    </PageHeader>

    <section class="stats-grid">
      <DriverStatCard label="Pending" :value="stats.pending" description="Waiting for approval" accent="orange" :icon="Clock3" />
      <DriverStatCard label="Approved" :value="stats.approved" description="Ready to apply" accent="blue" :icon="CheckCircle2" />
      <DriverStatCard label="Applied" :value="stats.applied" description="Salary updated" accent="green" :icon="CircleCheckBig" />
      <DriverStatCard label="Rejected" :value="stats.rejected" description="Salary unchanged" accent="purple" :icon="Ban" />
    </section>

    <!-- FILTERS -->
    <div class="filters-row">
      <div class="segmented" role="group" aria-label="Status">
        <button
          v-for="tab in STATUS_TABS"
          :key="tab.value || 'all'"
          type="button"
          :class="{ active: status === tab.value }"
          :aria-pressed="status === tab.value"
          @click="status = tab.value"
        >
          {{ tab.label }}<span v-if="tab.value" class="count">{{ stats[tab.value] }}</span>
        </button>
      </div>
      <div class="select-wrap">
        <select v-model="wageOrderId" aria-label="Wage order">
          <option value="">All Wage Orders</option>
          <option v-for="w in result?.wage_orders ?? []" :key="w.id" :value="w.id">{{ w.order_no }}</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>
      <div class="select-wrap">
        <select v-model="departmentId" aria-label="Department">
          <option value="">All Departments</option>
          <option v-for="d in result?.departments ?? []" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
        <ChevronDown :size="14" class="select-icon" />
      </div>
      <div class="search-box">
        <Search :size="15" />
        <input v-model="search" type="text" placeholder="Search employee or wage order no..." aria-label="Search">
      </div>
    </div>

    <p v-if="loadError" class="load-error" role="alert">{{ loadError }} <button type="button" @click="load">Retry</button></p>

    <section v-if="failed.length" class="failed">
      <strong>Not changed:</strong>
      <ul><li v-for="f in failed" :key="f.name + f.reason">{{ f.name }}: {{ f.reason }}</li></ul>
      <button type="button" class="link" @click="failed = []">Dismiss</button>
    </section>

    <!-- TABLE -->
    <section class="list-card">
      <div v-if="loading && !result" class="list-state">Loading wage adjustments...</div>
      <div v-else-if="!rows.length" class="list-state">
        <strong>No wage adjustments here</strong>
        <span>Apply a published wage order to employees to create them.</span>
      </div>

      <div v-else class="table-wrap" :class="{ dimmed: loading }">
        <table class="table">
          <thead>
            <tr>
              <th scope="col" class="check-col">
                <input type="checkbox" :checked="allSelected" :disabled="!rows.some(actionable)" aria-label="Select all" @change="toggleAll">
              </th>
              <th scope="col">Employee</th>
              <th scope="col">Department</th>
              <th scope="col">Wage Order</th>
              <th scope="col">Previous</th>
              <th scope="col">New Salary</th>
              <th scope="col">Increase</th>
              <th scope="col">Effective</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id" :class="{ selected: selected.has(r.id) }">
              <td class="check-col">
                <input type="checkbox" :checked="selected.has(r.id)" :disabled="!actionable(r)" :aria-label="`Select ${r.name}`" @change="toggle(r)">
              </td>
              <td>
                <strong>{{ r.name }}</strong>
                <small>{{ r.emp_id }}<template v-if="r.position"> · {{ r.position }}</template></small>
              </td>
              <td>{{ r.department ?? '—' }}</td>
              <td>
                <button type="button" class="link" @click="router.push(`/admin/settings/compensation/wage-orders/${r.wage_order_id}`)">{{ r.order_no }}</button>
              </td>
              <td>{{ peso(r.previous_salary) }}<small>{{ r.salary_type }}</small></td>
              <td><strong>{{ peso(r.new_salary) }}</strong></td>
              <td class="good">+{{ peso(r.increase) }}</td>
              <td>
                {{ wageDate(r.effective_date) }}
                <small v-if="r.status === 'approved' && !r.can_apply_now">Can apply on this date</small>
              </td>
              <td>
                <span class="status" :class="r.status">{{ statusLabel[r.status] }}</span>
                <small v-if="r.approved_by">by {{ r.approved_by }}</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- BULK BAR -->
    <section v-if="selected.size" class="bulk-bar">
      <span><strong>{{ selected.size }}</strong> selected</span>
      <div class="bulk-actions">
        <AppButton variant="secondary" :icon="XCircle" :disabled="!toApprove.length" @click="confirm = 'reject'">
          Reject {{ toApprove.length || '' }}
        </AppButton>
        <AppButton variant="secondary" :icon="CheckCircle2" :disabled="!toApprove.length" @click="confirm = 'approve'">
          Approve {{ toApprove.length || '' }}
        </AppButton>
        <AppButton :icon="CircleCheckBig" :disabled="!toApply.length" @click="confirm = 'apply'">
          Apply {{ toApply.length || '' }}
        </AppButton>
      </div>
    </section>

    <AppConfirmModal
      v-if="confirm"
      :title="ACTIONS[confirm].title(targets.length)"
      :message="ACTIONS[confirm].message"
      :confirm-label="ACTIONS[confirm].label"
      :danger="ACTIONS[confirm].danger"
      :busy="acting"
      :error="actionError"
      @close="confirm = null"
      @confirm="run"
    />
  </section>
</template>

<style scoped>
.adjust-page { width: 100%; max-width: 1660px; margin: 0 auto; display: grid; gap: 14px; padding-bottom: 80px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }

.filters-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.segmented { display: inline-flex; flex-wrap: wrap; padding: 3px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card-soft); }
.segmented button { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border: 0; border-radius: 7px; background: transparent; color: var(--text-secondary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.segmented button.active { background: var(--primary-soft); color: var(--text-primary); }
.segmented .count { padding: 1px 7px; border-radius: 999px; background: var(--bg-card); color: var(--text-primary); font-size: 10px; }
.select-wrap { position: relative; min-width: 170px; }
.select-wrap select { width: 100%; height: 40px; padding: 0 34px 0 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 12px; appearance: none; }
.select-icon { position: absolute; top: 50%; right: 10px; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.search-box { display: flex; flex: 1; min-width: 200px; height: 40px; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-muted); }
.search-box input { width: 100%; border: 0; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 12px; outline: none; }
.search-box:focus-within, .select-wrap select:focus-visible { border-color: var(--primary); outline: none; }
.segmented button:focus-visible, .link:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.load-error { margin: 0; padding: 10px 12px; border-radius: 9px; background: var(--red-soft); color: var(--red); font-size: 13px; }
.load-error button { margin-left: 8px; border: 0; background: transparent; color: var(--primary); font-family: inherit; cursor: pointer; }

.failed { padding: 12px 14px; border: 1px solid color-mix(in srgb, var(--orange) 40%, var(--border)); border-radius: 10px; background: var(--orange-soft); color: var(--orange); font-size: 12px; }
.failed ul { margin: 6px 0; padding-left: 18px; }

.list-card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.list-state { display: flex; min-height: 200px; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: var(--text-muted); font-size: 13px; }
.list-state strong { color: var(--text-primary); font-size: 15px; }
.dimmed { opacity: 0.6; }

.table-wrap { overflow-x: auto; }
.table { width: 100%; min-width: 1100px; border-collapse: collapse; font-size: 13px; }
.table th { padding: 12px; color: var(--text-secondary); font-size: 11px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.05em; }
.table td { padding: 12px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); vertical-align: middle; }
.table td strong { color: var(--text-primary); }
.table td small { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; }
.check-col { width: 40px; text-align: center !important; }
.check-col input { width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary); }
tr.selected { background: color-mix(in srgb, var(--primary-soft) 45%, transparent); }
.good { color: var(--green) !important; font-weight: 600; }
.link { padding: 0; border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }

.status { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.status.pending { background: var(--orange-soft); color: var(--orange); }
.status.approved { background: var(--primary-soft); color: var(--primary); }
.status.applied { background: var(--green-soft); color: var(--green); }
.status.rejected { background: var(--red-soft); color: var(--red); }

.bulk-bar { position: sticky; bottom: 12px; z-index: 5; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); font-size: 13px; }
.bulk-actions { display: flex; flex-wrap: wrap; gap: 8px; }

@media (max-width: 1000px) { .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
