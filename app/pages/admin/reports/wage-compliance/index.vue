<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Download,
  FileWarning,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Users,
  X,
} from 'lucide-vue-next'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import {
  useWageCompliance,
  type ComplianceResponse,
  type ComplianceRow,
  type ComplianceStatus,
} from '~/composables/admin/reports/useWageCompliance'

/**
 * Reports › Wage Compliance: each active employee's daily rate against the
 * minimum wage in force for their work location (Compensation › Wage Orders).
 */
definePageMeta({ layout: 'admin' })

const api = useWageCompliance()
const { error: toastError } = useToast()

const filters = reactive({
  as_of: '',
  search: '',
  region: '',
  department_id: '' as number | '',
  status: '' as ComplianceStatus | '',
})

const result = ref<ComplianceResponse | null>(null)
const loading = ref(true)

const load = async () => {
  loading.value = true
  try {
    result.value = await api.list({ ...filters, search: filters.search.trim() })
  } catch (err) {
    const e = err as { data?: { message?: string } }
    toastError('Unable to load the report', e?.data?.message ?? 'Please try again.')
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
watch(() => [filters.as_of, filters.region, filters.department_id, filters.status], load)

const reset = () => {
  Object.assign(filters, { as_of: '', search: '', region: '', department_id: '', status: '' })
}

const rows = computed(() => result.value?.data ?? [])
const stats = computed(() => result.value?.stats)

const setStatus = (status: ComplianceStatus | '') => {
  filters.status = filters.status === status ? '' : status
}

// =====================================================
// FORMAT
// =====================================================

const peso = (v: number | null | undefined) =>
  v === null || v === undefined
    ? '—'
    : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(v)

const signed = (v: number | null) => (v === null ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${peso(Math.abs(v))}`)

const date = (v: string | null | undefined) =>
  v ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${v}T00:00:00`)) : '—'

const asOfLabel = computed(() => date(result.value?.as_of))

// =====================================================
// DETAILS
// =====================================================

const selected = ref<ComplianceRow | null>(null)

const nextStep = (r: ComplianceRow): { text: string, to?: string, label?: string } => {
  switch (r.status) {
    case 'below':
      return r.wage_order
        ? { text: 'Create a wage adjustment from the wage order to bring the salary up to the minimum.', to: `/admin/settings/compensation/wage-orders/${r.wage_order.id}/apply`, label: 'Apply wage order' }
        : { text: 'Create a salary adjustment.', to: '/admin/employees/salary-adjustments', label: 'Salary Adjustments' }
    case 'pending':
      return {
        text: `Approve and apply the ${r.adjustment?.from_wage_order ? 'wage' : 'salary'} adjustment (${r.adjustment?.status}).`,
        to: r.adjustment?.from_wage_order ? '/admin/settings/compensation/wage-adjustments' : `/admin/employees/salary-adjustments/${r.adjustment?.id}`,
        label: 'Open adjustment',
      }
    case 'distortion':
      return { text: 'The gap to the minimum is smaller than the last increase. Review the salary structure for wage distortion.', to: '/admin/employees/salary-rates', label: 'Salary Rates' }
    case 'upcoming':
      return { text: `Below the minimum taking effect on ${date(r.upcoming?.effective_date)}. Prepare the adjustment before then.`, to: r.upcoming ? `/admin/settings/compensation/wage-orders/${r.upcoming.id}/apply` : undefined, label: 'Apply wage order' }
    case 'no_salary':
      return { text: 'Set up the employee’s salary.', to: '/admin/employees/salary-rates', label: 'Salary Rates' }
    case 'no_wage_order':
      return { text: 'Publish a wage order for this region and classification.', to: '/admin/settings/compensation/wage-orders', label: 'Wage Orders' }
    case 'no_location':
      return { text: 'Set the work location’s region and classification.', to: '/admin/settings/compensation/regional-rates', label: 'Regional Rates' }
    default:
      return { text: 'No action needed.' }
  }
}

// =====================================================
// EXPORT (CSV of the rows shown)
// =====================================================

const exportCsv = () => {
  const header = ['Employee No.', 'Employee', 'Department', 'Position', 'Location', 'Region', 'Classification', 'Salary Type', 'Basic Salary', 'Daily Rate', 'Required Minimum', 'Variance (daily)', 'Monthly Shortfall', 'Wage Order', 'Status']
  const lines = rows.value.map(r => [
    r.emp_id, r.employee, r.department, r.position, r.location, r.region_code ?? '', r.classification ?? '',
    r.salary_type ?? '', r.basic_salary ?? '', r.current_daily ?? '', r.minimum_daily ?? '', r.variance_daily ?? '',
    r.monthly_shortfall || '', r.wage_order?.order_no ?? '', r.status_label,
  ])
  const csv = [header, ...lines]
    .map(line => line.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `wage-compliance-${result.value?.as_of ?? 'report'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="wc-page">
    <PageHeader
      title="Wage Compliance Report"
      description="Each active employee’s daily rate against the minimum wage in force for their work location, from published wage orders."
    >
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="load">Refresh</AppButton>
      <AppButton :icon="Download" :disabled="!rows.length" @click="exportCsv">Export</AppButton>
    </PageHeader>

    <!-- STATS (click to filter) -->
    <div class="stats">
      <button type="button" class="stat" :class="{ on: filters.status === '' }" @click="setStatus('')">
        <span class="icon blue"><Users :size="18" /></span>
        <span><small>Employees Reviewed</small><strong>{{ stats?.reviewed ?? '—' }}</strong><em>As of {{ asOfLabel }}</em></span>
      </button>
      <button type="button" class="stat" :class="{ on: filters.status === 'compliant' }" @click="setStatus('compliant')">
        <span class="icon green"><CheckCircle2 :size="18" /></span>
        <span><small>Compliant</small><strong>{{ stats?.compliant ?? '—' }}</strong><em>Meet the minimum</em></span>
      </button>
      <button type="button" class="stat" :class="{ on: filters.status === 'below' }" @click="setStatus('below')">
        <span class="icon red"><AlertTriangle :size="18" /></span>
        <span><small>Below Minimum</small><strong>{{ stats?.below ?? '—' }}</strong><em>No adjustment yet</em></span>
      </button>
      <button type="button" class="stat" :class="{ on: filters.status === 'pending' }" @click="setStatus('pending')">
        <span class="icon orange"><Scale :size="18" /></span>
        <span><small>Pending Adjustment</small><strong>{{ stats?.pending ?? '—' }}</strong><em>Approve and apply</em></span>
      </button>
      <button type="button" class="stat" :class="{ on: filters.status === 'distortion' }" @click="setStatus('distortion')">
        <span class="icon purple"><FileWarning :size="18" /></span>
        <span><small>Distortion Review</small><strong>{{ stats?.distortion ?? '—' }}</strong><em>Gap smaller than last increase</em></span>
      </button>
    </div>

    <p v-if="stats && (stats.below + stats.pending) > 0" class="banner danger" role="status">
      <AlertTriangle :size="16" />
      {{ stats.below + stats.pending }} employee(s) are below the minimum wage — about {{ peso(stats.monthly_shortfall) }} a month in total.
    </p>
    <p v-if="stats?.upcoming" class="banner warn" role="status">
      <CalendarClock :size="16" />
      {{ stats.upcoming }} employee(s) meet today’s minimum but are below a scheduled wage order.
      <button type="button" class="link" @click="setStatus('upcoming')">Show them</button>
    </p>
    <p v-if="stats?.missing_data" class="banner muted" role="status">
      <FileWarning :size="16" />
      {{ stats.missing_data }} employee(s) cannot be checked (no salary setup, region or wage order).
    </p>

    <!-- FILTERS -->
    <div class="filters">
      <label class="search">
        <Search :size="16" />
        <input v-model="filters.search" type="search" placeholder="Search employee, department, position or location..." aria-label="Search">
      </label>
      <label class="as-of">
        <span>As of</span>
        <input v-model="filters.as_of" type="date" aria-label="As of date">
      </label>
      <select v-model="filters.region" aria-label="Region">
        <option value="">All Regions</option>
        <option v-for="r in result?.filters.regions ?? []" :key="r.code" :value="r.code">{{ r.name }}</option>
      </select>
      <select v-model="filters.department_id" aria-label="Department">
        <option value="">All Departments</option>
        <option v-for="d in result?.filters.departments ?? []" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
      <select v-model="filters.status" aria-label="Compliance status">
        <option value="">All Statuses</option>
        <option v-for="s in result?.filters.statuses ?? []" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <AppButton variant="secondary" :icon="RotateCcw" @click="reset">Reset</AppButton>
    </div>

    <!-- TABLE -->
    <BaseDataTable
      title="Employee Wage Compliance"
      :description="`Daily rates compared with the minimum wage in force on ${asOfLabel}. Monthly salaries are converted with 261 working days a year.`"
      :has-rows="rows.length > 0"
      :loading="loading"
      min-width="1250px"
      empty-title="No employees found"
      empty-description="Try another filter, or set up wage orders and work location regions."
    >
      <template #headers>
        <th>Employee</th>
        <th>Department</th>
        <th>Region</th>
        <th>Salary</th>
        <th>Daily Rate</th>
        <th>Required Minimum</th>
        <th>Variance</th>
        <th>Wage Order</th>
        <th>Status</th>
        <th><span class="sr-only">Details</span></th>
      </template>

      <template #rows>
        <tr v-for="r in rows" :key="r.employee_id">
          <td>
            <strong class="name">{{ r.employee }}</strong>
            <small>{{ r.emp_id }}<template v-if="r.employment_type"> · {{ r.employment_type }}</template></small>
          </td>
          <td>{{ r.department }}<small>{{ r.position }}</small></td>
          <td>
            <span v-if="r.region_code">{{ r.region_code }}</span>
            <span v-else class="muted">—</span>
            <small>{{ r.location }}</small>
          </td>
          <td class="num">
            {{ peso(r.basic_salary) }}
            <small>{{ r.salary_type ?? '—' }}</small>
          </td>
          <td class="num">{{ peso(r.current_daily) }}</td>
          <td class="num strong">{{ peso(r.minimum_daily) }}</td>
          <td class="num" :class="{ neg: (r.variance_daily ?? 0) < 0, pos: (r.variance_daily ?? 0) > 0 }">
            {{ signed(r.variance_daily) }}
            <small v-if="r.monthly_shortfall">{{ peso(r.monthly_shortfall) }}/mo short</small>
          </td>
          <td>
            <template v-if="r.wage_order">{{ r.wage_order.order_no }}<small>Effective {{ date(r.wage_order.effective_date) }}</small></template>
            <span v-else class="muted">—</span>
          </td>
          <td><span class="pill" :class="r.status">{{ r.status_label }}</span></td>
          <td><button type="button" class="view" @click="selected = r">View</button></td>
        </tr>
      </template>
    </BaseDataTable>

    <!-- DETAILS -->
    <div v-if="selected" class="backdrop" @click.self="selected = null">
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="wc-title">
        <header>
          <div>
            <h2 id="wc-title">{{ selected.employee }}</h2>
            <p>{{ selected.emp_id }} · {{ selected.department }} · {{ selected.position }}</p>
          </div>
          <button type="button" class="close" aria-label="Close" @click="selected = null"><X :size="18" /></button>
        </header>

        <span class="pill big" :class="selected.status">{{ selected.status_label }}</span>

        <dl>
          <div><dt>Work location</dt><dd>{{ selected.location }}</dd></div>
          <div><dt>Region</dt><dd>{{ selected.region_name ?? '—' }}</dd></div>
          <div><dt>Classification</dt><dd>{{ selected.classification ?? '—' }}</dd></div>
          <div><dt>Salary</dt><dd>{{ peso(selected.basic_salary) }} {{ selected.salary_type ? `(${selected.salary_type})` : '' }}</dd></div>
          <div><dt>Daily rate</dt><dd>{{ peso(selected.current_daily) }}</dd></div>
          <div><dt>Required minimum</dt><dd>{{ peso(selected.minimum_daily) }}<template v-if="selected.previous_minimum"> (was {{ peso(selected.previous_minimum) }})</template></dd></div>
          <div><dt>Variance</dt><dd :class="{ neg: (selected.variance_daily ?? 0) < 0 }">{{ signed(selected.variance_daily) }} a day<template v-if="selected.monthly_shortfall"> · {{ peso(selected.monthly_shortfall) }} a month</template></dd></div>
          <div><dt>Wage order</dt><dd>{{ selected.wage_order ? `${selected.wage_order.order_no} — ${selected.wage_order.title}` : '—' }}</dd></div>
          <div v-if="selected.upcoming"><dt>Next minimum</dt><dd>{{ peso(selected.upcoming.minimum_daily) }} from {{ date(selected.upcoming.effective_date) }} ({{ selected.upcoming.order_no }})</dd></div>
          <div v-if="selected.adjustment"><dt>Adjustment</dt><dd>{{ selected.adjustment.status }} · new salary {{ peso(selected.adjustment.new_basic_salary) }}<template v-if="selected.adjustment.effective_date"> from {{ date(selected.adjustment.effective_date) }}</template></dd></div>
        </dl>

        <div class="next">
          <strong>Next step</strong>
          <p>{{ nextStep(selected).text }}</p>
          <NuxtLink v-if="nextStep(selected).to" :to="nextStep(selected).to!" class="go" @click="selected = null">
            {{ nextStep(selected).label }} →
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wc-page { display: grid; gap: 14px; width: 100%; max-width: 1600px; margin: 0 auto; }

.stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.stat { display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: inherit; font-family: inherit; text-align: left; cursor: pointer; }
.stat.on { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
.stat > span:last-child { display: grid; gap: 2px; }
.stat small { color: var(--text-secondary); font-size: 11px; }
.stat strong { color: var(--text-primary); font-size: 22px; line-height: 1.1; }
.stat em { color: var(--text-muted); font-size: 10px; font-style: normal; }
.icon { display: grid; width: 40px; height: 40px; flex-shrink: 0; place-items: center; border-radius: 10px; }
.icon.blue { background: var(--primary-soft); color: var(--primary); }
.icon.green { background: var(--green-soft); color: var(--green); }
.icon.red { background: var(--red-soft); color: var(--red); }
.icon.orange { background: var(--orange-soft); color: var(--orange); }
.icon.purple { background: var(--purple-soft); color: var(--purple); }

.banner { display: flex; align-items: center; gap: 8px; margin: 0; padding: 10px 14px; border-radius: 10px; font-size: 13px; }
.banner.danger { background: var(--red-soft); color: var(--red); }
.banner.warn { background: var(--orange-soft); color: var(--orange); }
.banner.muted { background: var(--bg-card-soft); color: var(--text-secondary); }
.link { padding: 0; border: 0; background: transparent; color: inherit; font-family: inherit; font-weight: 700; text-decoration: underline; cursor: pointer; }

.filters { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.filters select, .search, .as-of { height: 40px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 13px; }
.filters select { padding: 0 10px; }
.search { display: flex; min-width: 260px; flex: 1; align-items: center; gap: 8px; padding: 0 12px; color: var(--text-muted); }
.search input { width: 100%; height: 100%; border: 0; outline: 0; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 13px; }
.as-of { display: flex; align-items: center; gap: 8px; padding: 0 10px; }
.as-of span { color: var(--text-muted); font-size: 12px; }
.as-of input { border: 0; outline: 0; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 13px; }
.filters select:focus-visible, .search:focus-within, .as-of:focus-within { border-color: var(--primary); }

td small { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; }
.name { color: var(--text-primary); }
.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
.strong { color: var(--text-primary); font-weight: 700; }
.neg { color: var(--red); font-weight: 700; }
.pos { color: var(--green); font-weight: 700; }
.muted { color: var(--text-muted); }

.pill { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; background: var(--bg-card-soft); color: var(--text-secondary); }
.pill.compliant { background: var(--green-soft); color: var(--green); }
.pill.below { background: var(--red-soft); color: var(--red); }
.pill.pending, .pill.upcoming { background: var(--orange-soft); color: var(--orange); }
.pill.distortion { background: var(--purple-soft); color: var(--purple); }
.pill.big { width: fit-content; padding: 6px 12px; font-size: 12px; }

.view { height: 32px; padding: 0 14px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.view:hover { border-color: var(--primary); color: var(--primary); }
button:focus-visible, .go:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

.backdrop { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; padding: 16px; background: rgba(5, 15, 30, 0.6); }
.dialog { display: grid; width: 100%; max-width: 560px; max-height: 90vh; gap: 14px; overflow-y: auto; padding: 22px; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card); }
.dialog header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dialog h2 { margin: 0; font-size: 18px; }
.dialog header p { margin: 4px 0 0; color: var(--text-secondary); font-size: 12px; }
.close { display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; }
dl { display: grid; gap: 0; margin: 0; border: 1px solid var(--border-soft); border-radius: 10px; }
dl > div { display: grid; grid-template-columns: 150px 1fr; gap: 10px; padding: 9px 12px; border-top: 1px solid var(--border-soft); font-size: 13px; }
dl > div:first-child { border-top: 0; }
dt { color: var(--text-muted); }
dd { margin: 0; color: var(--text-primary); }
.next { padding: 12px 14px; border-radius: 10px; background: var(--primary-soft); }
.next strong { font-size: 13px; }
.next p { margin: 4px 0 8px; color: var(--text-secondary); font-size: 13px; }
.go { color: var(--primary); font-size: 13px; font-weight: 700; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@media (max-width: 1200px) { .stats { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 700px) {
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  dl > div { grid-template-columns: 1fr; gap: 2px; }
}
</style>