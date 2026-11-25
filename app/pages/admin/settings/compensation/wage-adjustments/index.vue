<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Landmark,
  MapPin,
  Plus,
  Search,
  Trash2,
  Wallet,
} from 'lucide-vue-next'
import NewMinimumWageWizard from '~/components/admin/compensation/NewMinimumWageWizard.vue'
import {
  peso,
  useWageOrders,
  wageApiError,
  wageDate,
  type WageAdjustment,
  type WageAdjustmentStatus,
  type WageAdjustmentsResponse,
  type WageOrderSummary,
} from '~/composables/admin/compensation/useWageOrders'

/**
 * Compensation › Wage Adjustments, one group per wage order (region).
 * Each group can be approved, rejected or applied at once; open a group to
 * act on one employee. "+ New Minimum Wage" records a new regional minimum
 * and creates the adjustments in one wizard.
 */
definePageMeta({ layout: 'admin' })
useHead({ title: 'Wage Adjustments | RWorkCentral' })

const router = useRouter()
const api = useWageOrders()
const { success, error: toastError, warning } = useToast()

type Tab = WageAdjustmentStatus | 'all'
const TABS: { key: Tab, label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'applied', label: 'Applied' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
]

const filters = reactive({ status: 'pending' as Tab, region: '', department_id: '' as number | '', search: '' })
const result = ref<WageAdjustmentsResponse | null>(null)
const orders = ref<WageOrderSummary[]>([])
const loading = ref(true)
const busy = ref<string | null>(null)
const open = reactive(new Set<number>())
const showWizard = ref(false)

const load = async () => {
  loading.value = true
  try {
    const [adj, ord] = await Promise.all([
      api.wageAdjustments({
        status: filters.status === 'all' ? '' : filters.status,
        department_id: filters.department_id,
        search: filters.search.trim(),
      }),
      orders.value.length ? Promise.resolve(null) : api.list(),
    ])
    result.value = adj
    if (ord) orders.value = ord.data
  } catch (err) {
    toastError('Unable to load wage adjustments', wageApiError(err, 'Please try again.'))
  } finally {
    loading.value = false
  }
}

onMounted(load)

let timer: ReturnType<typeof setTimeout> | undefined
watch(() => filters.search, () => {
  clearTimeout(timer)
  timer = setTimeout(load, 350)
})
watch(() => [filters.status, filters.department_id], load)

const stats = computed(() => result.value?.stats ?? { pending: 0, approved: 0, applied: 0, rejected: 0 })

// =====================================================
// GROUPS (one per wage order / region)
// =====================================================

interface Group {
  order: WageOrderSummary | null
  orderId: number
  orderNo: string
  regionCode: string
  regionName: string
  rows: WageAdjustment[]
  pending: WageAdjustment[]
  applicable: WageAdjustment[]
  waitingDate: WageAdjustment[]
  increase: number
}

const groups = computed<Group[]>(() => {
  const byOrder = new Map<number, WageAdjustment[]>()
  for (const row of result.value?.data ?? []) {
    byOrder.set(row.wage_order_id, [...(byOrder.get(row.wage_order_id) ?? []), row])
  }

  return [...byOrder.entries()]
    .map(([orderId, rows]) => {
      const order = orders.value.find(o => o.id === orderId) ?? null
      return {
        order,
        orderId,
        orderNo: rows[0]!.order_no,
        regionCode: order?.region_code ?? '',
        regionName: order?.region_name ?? 'Region',
        rows,
        pending: rows.filter(r => r.status === 'pending'),
        applicable: rows.filter(r => r.status === 'approved' && r.can_apply_now),
        waitingDate: rows.filter(r => r.status === 'approved' && !r.can_apply_now),
        increase: rows.reduce((sum, r) => sum + r.increase, 0),
      }
    })
    .filter(g => !filters.region || g.regionCode === filters.region)
    .sort((a, b) => (b.order?.effective_date ?? '').localeCompare(a.order?.effective_date ?? ''))
})

const regions = computed(() => {
  const seen = new Map<string, string>()
  orders.value.forEach(o => seen.set(o.region_code, o.region_name))
  return [...seen.entries()].map(([code, name]) => ({ code, name }))
})

const toggleOpen = (id: number) => (open.has(id) ? open.delete(id) : open.add(id))

// =====================================================
// ACTIONS
// =====================================================

const run = async (key: string, action: 'approve' | 'reject' | 'apply', rows: WageAdjustment[], confirmText?: string) => {
  if (!rows.length) return
  if (confirmText && !window.confirm(confirmText)) return
  busy.value = key
  try {
    const response = await api.bulkAdjustments(action, rows.map(r => r.id))
    const done = response.data.done.length
    const failed = response.data.failed
    if (done) success(`${done} adjustment(s) ${action === 'apply' ? 'applied' : `${action}d`}`, action === 'apply' ? 'Salary Rates now use the new salary.' : '')
    if (failed.length) warning(`${failed.length} not ${action === 'apply' ? 'applied' : `${action}d`}`, failed.map(f => `${f.name}: ${f.reason}`).join(' · '))
    await load()
  } catch (err) {
    toastError('Action failed', wageApiError(err, 'Please try again.'))
  } finally {
    busy.value = null
  }
}

const remove = async (row: WageAdjustment) => {
  if (!window.confirm(`Delete the adjustment for ${row.name}? It can be created again from the wage order.`)) return
  busy.value = `del-${row.id}`
  try {
    await api.deleteAdjustment(row.id)
    success('Adjustment deleted', row.name)
    await load()
  } catch (err) {
    toastError('Unable to delete', wageApiError(err, 'Please try again.'))
  } finally {
    busy.value = null
  }
}

const statusLabel: Record<WageAdjustmentStatus, string> = { pending: 'Pending', approved: 'Approved', applied: 'Applied', rejected: 'Rejected' }

const onWizardDone = async (message: string) => {
  showWizard.value = false
  success('New minimum wage saved', message)
  orders.value = []
  filters.status = 'pending'
  await load()
  const newest = groups.value[0]
  if (newest) open.add(newest.orderId)
}
</script>

<template>
  <section class="wa-page">
    <PageHeader
      title="Wage Adjustments"
      description="Salary increases from minimum wage orders, grouped by region. Approve them, then apply them on or after the effective date so payroll uses the new salary."
    >
      <AppButton variant="secondary" :icon="Landmark" @click="router.push('/admin/settings/compensation/wage-orders')">Wage Orders</AppButton>
      <AppButton :icon="Plus" @click="showWizard = true">New Minimum Wage</AppButton>
    </PageHeader>

    <!-- STATS -->
    <div class="stats">
      <button type="button" class="stat" :class="{ on: filters.status === 'pending' }" @click="filters.status = 'pending'">
        <span class="icon orange"><Clock3 :size="18" /></span><span><small>Pending</small><strong>{{ stats.pending }}</strong><em>Waiting for approval</em></span>
      </button>
      <button type="button" class="stat" :class="{ on: filters.status === 'approved' }" @click="filters.status = 'approved'">
        <span class="icon blue"><CheckCircle2 :size="18" /></span><span><small>Approved</small><strong>{{ stats.approved }}</strong><em>Ready to apply</em></span>
      </button>
      <button type="button" class="stat" :class="{ on: filters.status === 'applied' }" @click="filters.status = 'applied'">
        <span class="icon green"><Wallet :size="18" /></span><span><small>Applied</small><strong>{{ stats.applied }}</strong><em>Salary updated</em></span>
      </button>
      <button type="button" class="stat" :class="{ on: filters.status === 'rejected' }" @click="filters.status = 'rejected'">
        <span class="icon purple"><Ban :size="18" /></span><span><small>Rejected</small><strong>{{ stats.rejected }}</strong><em>Salary unchanged</em></span>
      </button>
    </div>

    <!-- FILTERS -->
    <div class="filters">
      <div class="tabs" role="tablist" aria-label="Status">
        <button
          v-for="t in TABS"
          :key="t.key"
          type="button"
          role="tab"
          :aria-selected="filters.status === t.key"
          :class="{ on: filters.status === t.key }"
          @click="filters.status = t.key"
        >
          {{ t.label }}<span v-if="t.key !== 'all'" class="count">{{ stats[t.key as WageAdjustmentStatus] }}</span>
        </button>
      </div>
      <select v-model="filters.region" aria-label="Region">
        <option value="">All Regions</option>
        <option v-for="r in regions" :key="r.code" :value="r.code">{{ r.name }}</option>
      </select>
      <select v-model="filters.department_id" aria-label="Department">
        <option value="">All Departments</option>
        <option v-for="d in result?.departments ?? []" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
      <label class="search">
        <Search :size="16" />
        <input v-model="filters.search" type="search" placeholder="Search employee or wage order no..." aria-label="Search">
      </label>
    </div>

    <!-- GROUPS -->
    <div v-if="loading && !result" class="state">Loading wage adjustments...</div>
    <div v-else-if="!groups.length" class="state">
      <MapPin :size="26" />
      <strong>{{ filters.status === 'pending' ? 'No pending wage adjustments' : 'Nothing here' }}</strong>
      <span>When a region gets a new minimum wage, click <b>New Minimum Wage</b> to adjust the salaries of its employees.</span>
      <AppButton :icon="Plus" @click="showWizard = true">New Minimum Wage</AppButton>
    </div>

    <section v-for="g in groups" v-else :key="g.orderId" class="group" :class="{ dim: loading }">
      <header class="group-head">
        <button type="button" class="expand" :aria-expanded="open.has(g.orderId)" :aria-controls="`grp-${g.orderId}`" @click="toggleOpen(g.orderId)">
          <ChevronDown :size="18" :class="{ turned: open.has(g.orderId) }" />
        </button>
        <span class="pin"><MapPin :size="18" /></span>
        <div class="title" @click="toggleOpen(g.orderId)">
          <strong>{{ g.regionName }}</strong>
          <small>
            {{ g.orderNo }}
            <template v-if="g.order?.headline"> · {{ g.order.headline.previous_rate ? `${peso(g.order.headline.previous_rate)} → ` : '' }}{{ peso(g.order.headline.new_rate) }}/day</template>
            <template v-if="g.order?.effective_date"> · effective {{ wageDate(g.order.effective_date) }}</template>
          </small>
        </div>
        <div class="figures">
          <span><b>{{ g.rows.length }}</b> employee(s)</span>
          <span class="inc">+{{ peso(g.increase) }}</span>
        </div>
        <div class="group-actions">
          <template v-if="g.pending.length">
            <button type="button" class="btn danger-ghost" :disabled="!!busy" @click="run(`rej-${g.orderId}`, 'reject', g.pending, `Reject ${g.pending.length} pending adjustment(s) for ${g.regionName}? Salaries stay unchanged.`)">Reject all</button>
            <button type="button" class="btn primary" :disabled="!!busy" @click="run(`app-${g.orderId}`, 'approve', g.pending)">
              {{ busy === `app-${g.orderId}` ? 'Approving...' : `Approve all (${g.pending.length})` }}
            </button>
          </template>
          <button v-if="g.applicable.length" type="button" class="btn success" :disabled="!!busy" @click="run(`apl-${g.orderId}`, 'apply', g.applicable, `Apply ${g.applicable.length} approved adjustment(s)? Salary Rates will use the new salary.`)">
            {{ busy === `apl-${g.orderId}` ? 'Applying...' : `Apply all (${g.applicable.length})` }}
          </button>
          <span v-if="g.waitingDate.length && !g.applicable.length" class="hint">Apply from {{ wageDate(g.waitingDate[0]!.effective_date) }}</span>
        </div>
      </header>

      <div v-show="open.has(g.orderId)" :id="`grp-${g.orderId}`" class="table-wrap">
        <table class="rows">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Department</th>
              <th scope="col" class="num">Previous</th>
              <th scope="col" class="num">New Salary</th>
              <th scope="col" class="num">Increase</th>
              <th scope="col">Effective</th>
              <th scope="col">Status</th>
              <th scope="col"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in g.rows" :key="r.id">
              <td><strong class="name">{{ r.name }}</strong><small>{{ r.emp_id }} · {{ r.position ?? '—' }}</small></td>
              <td>{{ r.department ?? '—' }}</td>
              <td class="num">{{ peso(r.previous_salary) }}<small>{{ r.salary_type }}</small></td>
              <td class="num strong">{{ peso(r.new_salary) }}</td>
              <td class="num inc">+{{ peso(r.increase) }}</td>
              <td>{{ wageDate(r.effective_date) }}</td>
              <td><span class="pill" :class="r.status">{{ statusLabel[r.status] }}</span></td>
              <td class="row-actions">
                <template v-if="r.status === 'pending'">
                  <button type="button" class="link" :disabled="!!busy" @click="run(`a-${r.id}`, 'approve', [r])">Approve</button>
                  <button type="button" class="link danger" :disabled="!!busy" @click="run(`r-${r.id}`, 'reject', [r], `Reject the adjustment for ${r.name}?`)">Reject</button>
                  <button type="button" class="icon-btn" :disabled="!!busy" :aria-label="`Delete adjustment for ${r.name}`" @click="remove(r)"><Trash2 :size="14" /></button>
                </template>
                <button v-else-if="r.status === 'approved' && r.can_apply_now" type="button" class="link" :disabled="!!busy" @click="run(`p-${r.id}`, 'apply', [r])">Apply</button>
                <span v-else-if="r.status === 'approved'" class="hint">from {{ wageDate(r.effective_date) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <NewMinimumWageWizard v-if="showWizard" @close="showWizard = false" @done="onWizardDone" />
  </section>
</template>

<style scoped>
.wa-page { display: grid; gap: 14px; width: 100%; max-width: 1500px; margin: 0 auto; }

.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.stat { display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: inherit; font-family: inherit; text-align: left; cursor: pointer; }
.stat.on { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
.stat > span:last-child { display: grid; gap: 2px; }
.stat small { color: var(--text-secondary); font-size: 11px; }
.stat strong { color: var(--text-primary); font-size: 22px; line-height: 1.1; }
.stat em { color: var(--text-muted); font-size: 10px; font-style: normal; }
.icon { display: grid; width: 40px; height: 40px; flex-shrink: 0; place-items: center; border-radius: 10px; }
.icon.blue { background: var(--primary-soft); color: var(--primary); }
.icon.green { background: var(--green-soft); color: var(--green); }
.icon.orange { background: var(--orange-soft); color: var(--orange); }
.icon.purple { background: var(--purple-soft); color: var(--purple); }

.filters { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.tabs { display: flex; gap: 4px; padding: 4px; border-radius: 10px; background: var(--bg-card-soft); }
.tabs button { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border: 0; border-radius: 8px; background: transparent; color: var(--text-secondary); font-family: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.tabs button.on { background: var(--bg-card); color: var(--text-primary); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15); }
.count { padding: 0 6px; border-radius: 999px; background: var(--border); font-size: 10px; }
.filters select, .search { height: 40px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 13px; }
.filters select { padding: 0 10px; }
.search { display: flex; min-width: 220px; flex: 1; align-items: center; gap: 8px; padding: 0 12px; color: var(--text-muted); }
.search input { width: 100%; height: 100%; border: 0; outline: 0; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 13px; }

.state { display: flex; min-height: 220px; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 24px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-muted); font-size: 13px; text-align: center; }
.state strong { color: var(--text-primary); font-size: 15px; }

.group { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.group.dim { opacity: 0.6; }
.group-head { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 16px; }
.expand { display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.expand svg { transition: transform 0.15s ease; transform: rotate(-90deg); }
.expand svg.turned { transform: rotate(0deg); }
.pin { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 10px; background: var(--primary-soft); color: var(--primary); }
.title { display: grid; min-width: 220px; flex: 1; gap: 2px; cursor: pointer; }
.title strong { color: var(--text-primary); font-size: 15px; }
.title small { color: var(--text-secondary); font-size: 12px; }
.figures { display: flex; gap: 16px; color: var(--text-secondary); font-size: 13px; }
.figures b { color: var(--text-primary); }
.inc { color: var(--green); font-weight: 700; }
.group-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.btn { height: 36px; padding: 0 14px; border-radius: 9px; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.btn.primary { border: 0; background: var(--primary); color: #fff; }
.btn.success { border: 0; background: var(--green); color: #fff; }
.btn.danger-ghost { border: 1px solid var(--red); background: transparent; color: var(--red); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.hint { color: var(--text-muted); font-size: 11px; }

.table-wrap { overflow-x: auto; border-top: 1px solid var(--border-soft); }
.rows { width: 100%; min-width: 960px; border-collapse: collapse; font-size: 12px; }
.rows th { padding: 10px 16px; color: var(--text-secondary); font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-align: left; text-transform: uppercase; }
.rows td { padding: 10px 16px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); vertical-align: middle; }
.rows td small { display: block; margin-top: 2px; color: var(--text-muted); font-size: 10px; }
.name { color: var(--text-primary); }
.num { font-variant-numeric: tabular-nums; text-align: right !important; white-space: nowrap; }
.strong { color: var(--text-primary); font-weight: 700; }
.pill { padding: 3px 9px; border-radius: 999px; font-size: 10px; font-weight: 700; }
.pill.pending { background: var(--orange-soft); color: var(--orange); }
.pill.approved { background: var(--primary-soft); color: var(--primary); }
.pill.applied { background: var(--green-soft); color: var(--green); }
.pill.rejected { background: var(--red-soft); color: var(--red); }
.row-actions { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
.link { padding: 0; border: 0; background: transparent; color: var(--primary); font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.link.danger { color: var(--red); }
.icon-btn { display: grid; width: 28px; height: 28px; place-items: center; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-muted); cursor: pointer; }
.icon-btn:hover { border-color: var(--red); color: var(--red); }
button:focus-visible, select:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@media (max-width: 1000px) { .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (prefers-reduced-motion: reduce) { .expand svg { transition: none; } }
</style>