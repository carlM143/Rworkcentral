<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  Banknote,
  CalendarCheck,
  FileSpreadsheet,
  Gift,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
} from 'lucide-vue-next'
import {
  useThirteenthMonthReport,
  type ThirteenthMonthResponse,
} from '~/composables/admin/reports/useThirteenthMonthReport'

/**
 * Reports › 13th Month Pay: total basic salary earned in the year ÷ 12
 * (PD 851), from generated payroll. Read-only.
 */
definePageMeta({ layout: 'admin' })
useHead({ title: '13th Month Pay | RWorkCentral' })

const api = useThirteenthMonthReport()
const { error: toastError } = useToast()
const { user } = useAuth()

const filters = reactive({ year: '' as number | '', department_id: '' as number | '', search: '', include_draft: true })
const report = ref<ThirteenthMonthResponse | null>(null)
const loading = ref(true)

const load = async () => {
  loading.value = true
  try {
    report.value = await api.load({ ...filters, search: filters.search.trim() })
    if (!filters.year && report.value.year) filters.year = report.value.year
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
watch(() => [filters.year, filters.department_id, filters.include_draft], load)

const reset = () => {
  filters.department_id = ''
  filters.search = ''
  filters.include_draft = true
}

const rows = computed(() => report.value?.data ?? [])
const totals = computed(() => report.value?.totals)

const peso = (v: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Number(v ?? 0))
const amount = (v: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v ?? 0))
const date = (v: string | null | undefined) =>
  v ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${v.slice(0, 10)}T00:00:00`)) : '—'

const daysToDeadline = computed(() => {
  if (!report.value) return null
  const diff = Math.ceil((new Date(`${report.value.deadline}T00:00:00`).getTime() - Date.now()) / 86_400_000)
  return diff
})

const printedAt = computed(() => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()))

const printReport = () => window.print()

const exportExcel = () => {
  const header = ['Employee No.', 'Employee', 'Department', 'Position', 'Payroll Cutoffs', 'Months', 'Basic Pay', 'Absences/Late/UT', 'Basic Salary Earned', '13th Month Pay', 'Taxable Excess', 'Status']
  const lines = rows.value.map(r => [
    r.emp_id, r.employee, r.department, r.position, r.payrolls, r.months, r.basic_pay, r.deductions, r.earned_basic,
    r.thirteenth_month, r.taxable_excess, `${r.active ? 'Active' : 'Inactive'}${r.draft_payrolls ? ' · includes draft' : ''}`,
  ])
  const t = totals.value
  const totalLine = t ? ['TOTAL', `${t.employees} employee(s)`, '', '', '', '', t.basic_pay, t.deductions, t.earned_basic, t.thirteenth_month, t.taxable_excess, ''] : []
  const title = [`13th Month Pay — ${report.value?.year}`, `Payroll covered until ${date(report.value?.covered_until)}`, report.value?.official ? 'Official (finalized payroll)' : 'PREVIEW (includes draft payroll)']
  const csv = [title, [], header, ...lines, totalLine]
    .map(cols => cols.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `13th-month-pay-${report.value?.year ?? 'year'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="tm-page" :class="{ preview: report && !report.official }">
    <div class="no-print">
      <PageHeader
        title="13th Month Pay"
        description="Total basic salary earned in the year ÷ 12 (PD 851), from generated payroll. Overtime, holiday premiums and allowances are not included."
      >
        <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="load">Refresh</AppButton>
        <AppButton variant="secondary" :icon="Printer" :disabled="!rows.length" @click="printReport">Print / PDF</AppButton>
        <AppButton :icon="FileSpreadsheet" :disabled="!rows.length" @click="exportExcel">Excel</AppButton>
      </PageHeader>
    </div>

    <!-- YEAR BAR -->
    <div v-if="report" class="year-bar">
      <div><small>Year</small><strong>{{ report.year }}</strong></div>
      <div><small>Payroll covered until</small><strong>{{ date(report.covered_until) }}</strong></div>
      <div>
        <small>Pay on or before</small>
        <strong>{{ date(report.deadline) }}<template v-if="daysToDeadline !== null && daysToDeadline >= 0"> · {{ daysToDeadline }} day(s) left</template></strong>
      </div>
      <span class="badge" :class="report.official ? 'ok' : 'warn'">{{ report.official ? 'Official · Finalized' : 'Preview · Includes draft' }}</span>
    </div>

    <p v-if="report && rows.length && report.covered_until && report.covered_until.slice(5, 10) < '12-31'" class="banner info no-print" role="status">
      <CalendarCheck :size="16" />
      Amounts are accrued up to {{ date(report.covered_until) }}. They grow as the remaining {{ report.year }} payroll is generated.
    </p>
    <p v-if="report && report.draft_payrolls" class="banner warn no-print" role="status">
      {{ report.draft_payrolls }} draft payroll record(s) are included. Turn off “Include draft payroll” to see finalized payroll only.
    </p>

    <!-- STATS -->
    <div class="stats">
      <div class="stat"><span class="icon blue"><Users :size="18" /></span><span><small>Employees</small><strong>{{ totals?.employees ?? 0 }}</strong></span></div>
      <div class="stat"><span class="icon green"><Banknote :size="18" /></span><span><small>Basic Salary Earned</small><strong>{{ peso(totals?.earned_basic) }}</strong></span></div>
      <div class="stat"><span class="icon purple"><Gift :size="18" /></span><span><small>Total 13th Month Pay</small><strong>{{ peso(totals?.thirteenth_month) }}</strong></span></div>
      <div class="stat"><span class="icon orange"><CalendarCheck :size="18" /></span><span><small>Taxable Excess (over ₱90,000)</small><strong>{{ peso(totals?.taxable_excess) }}</strong></span></div>
    </div>

    <!-- FILTERS -->
    <div class="filters no-print">
      <label class="search">
        <Search :size="16" />
        <input v-model="filters.search" type="search" placeholder="Search employee, employee no., department or position..." aria-label="Search">
      </label>
      <select v-model="filters.year" aria-label="Year">
        <option v-for="y in report?.filters.years ?? []" :key="y" :value="y">{{ y }}</option>
      </select>
      <select v-model="filters.department_id" aria-label="Department">
        <option value="">All Departments</option>
        <option v-for="d in report?.filters.departments ?? []" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
      <label class="check">
        <input v-model="filters.include_draft" type="checkbox">
        Include draft payroll
      </label>
      <AppButton variant="secondary" :icon="RotateCcw" @click="reset">Reset</AppButton>
    </div>

    <!-- TABLE -->
    <section class="panel">
      <header class="panel-head">
        <h2>13th Month Pay · {{ report?.year }}</h2>
        <p>Basic salary earned = basic pay − absences, late, undertime, unpaid leave and unpaid holidays. 13th month pay = earned ÷ 12.</p>
      </header>

      <div v-if="loading && !report" class="state">Loading...</div>
      <div v-else-if="!rows.length" class="state">
        <strong>No payroll for {{ report?.year }}</strong>
        <span>{{ filters.include_draft ? 'The 13th month pay is computed from generated payroll (Payroll › Employee Payroll).' : 'No finalized payroll yet. Turn on “Include draft payroll” to preview.' }}</span>
      </div>

      <div v-else class="table-wrap" :class="{ dim: loading }">
        <table class="register">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Department</th>
              <th scope="col" class="num">Cutoffs</th>
              <th scope="col" class="num">Basic Pay</th>
              <th scope="col" class="num">Absences/Late/UT</th>
              <th scope="col" class="num">Basic Earned</th>
              <th scope="col" class="num strong">13th Month Pay</th>
              <th scope="col" class="num">Taxable Excess</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.employee_id">
              <td>
                <strong class="name">{{ r.employee }}</strong>
                <small>{{ r.emp_id }}<template v-if="!r.active"> · Inactive</template><template v-if="r.draft_payrolls"> · {{ r.draft_payrolls }} draft</template></small>
              </td>
              <td>{{ r.department }}<small>{{ r.position }}</small></td>
              <td class="num">{{ r.payrolls }}<small>{{ r.months }} month(s)</small></td>
              <td class="num">{{ amount(r.basic_pay) }}</td>
              <td class="num">{{ r.deductions ? `−${amount(r.deductions)}` : '—' }}</td>
              <td class="num">{{ amount(r.earned_basic) }}</td>
              <td class="num net">{{ amount(r.thirteenth_month) }}</td>
              <td class="num">{{ r.taxable_excess ? amount(r.taxable_excess) : '—' }}</td>
            </tr>
          </tbody>
          <tfoot v-if="totals">
            <tr>
              <th scope="row" colspan="3">Total · {{ totals.employees }} employee(s)</th>
              <td class="num">{{ amount(totals.basic_pay) }}</td>
              <td class="num">{{ totals.deductions ? `−${amount(totals.deductions)}` : '—' }}</td>
              <td class="num">{{ amount(totals.earned_basic) }}</td>
              <td class="num net">{{ amount(totals.thirteenth_month) }}</td>
              <td class="num">{{ totals.taxable_excess ? amount(totals.taxable_excess) : '—' }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

    <p class="note no-print">
      Taxable excess compares only the 13th month pay with the ₱90,000 tax-exempt ceiling; other benefits (bonuses, de minimis excess) are not included yet.
      Employees who left during the year receive a pro-rated amount based on what they earned.
    </p>

    <!-- PRINT ONLY -->
    <div class="print-only signatures">
      <div><span /><strong>Prepared by</strong><small>{{ user?.name }}</small></div>
      <div><span /><strong>Checked by</strong><small>Payroll / HR</small></div>
      <div><span /><strong>Approved by</strong><small>Management</small></div>
    </div>
    <p class="print-only printed">Printed {{ printedAt }}{{ report?.official ? '' : ' · PREVIEW — includes draft payroll' }}</p>
  </section>
</template>

<style scoped>
.tm-page { display: grid; gap: 14px; width: 100%; max-width: 1500px; margin: 0 auto; }

.year-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 28px; padding: 14px 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.year-bar div { display: grid; gap: 2px; }
.year-bar small { color: var(--text-muted); font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.year-bar strong { color: var(--text-primary); font-size: 13px; }
.badge { margin-left: auto; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.badge.ok { background: var(--green-soft); color: var(--green); }
.badge.warn { background: var(--orange-soft); color: var(--orange); }

.banner { display: flex; align-items: center; gap: 8px; margin: 0; padding: 10px 14px; border-radius: 10px; font-size: 13px; }
.banner.warn { background: var(--orange-soft); color: var(--orange); }
.banner.info { background: var(--primary-soft); color: var(--primary); }

.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.stat { display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.stat > span:last-child { display: grid; gap: 3px; min-width: 0; }
.stat small { color: var(--text-secondary); font-size: 11px; }
.stat strong { overflow: hidden; color: var(--text-primary); font-size: 19px; text-overflow: ellipsis; white-space: nowrap; }
.icon { display: grid; width: 40px; height: 40px; flex-shrink: 0; place-items: center; border-radius: 10px; }
.icon.blue { background: var(--primary-soft); color: var(--primary); }
.icon.green { background: var(--green-soft); color: var(--green); }
.icon.orange { background: var(--orange-soft); color: var(--orange); }
.icon.purple { background: var(--purple-soft); color: var(--purple); }

.filters { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.filters select, .search { height: 40px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 13px; }
.filters select { padding: 0 10px; }
.search { display: flex; min-width: 240px; flex: 1; align-items: center; gap: 8px; padding: 0 12px; color: var(--text-muted); }
.search input { width: 100%; height: 100%; border: 0; outline: 0; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 13px; }
.check { display: inline-flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 13px; cursor: pointer; }
.check input { width: 16px; height: 16px; accent-color: var(--primary); }
.filters select:focus-visible, .search:focus-within { border-color: var(--primary); }

.panel { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.panel-head { padding: 16px 18px; border-bottom: 1px solid var(--border-soft); }
.panel-head h2 { margin: 0; font-size: 16px; }
.panel-head p { margin: 3px 0 0; color: var(--text-secondary); font-size: 12px; }
.state { display: flex; min-height: 180px; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: var(--text-muted); font-size: 13px; text-align: center; }
.state strong { color: var(--text-primary); font-size: 15px; }

.table-wrap { overflow-x: auto; }
.table-wrap.dim { opacity: 0.6; }
.register { width: 100%; min-width: 980px; border-collapse: collapse; font-size: 12px; }
.register th { padding: 10px 12px; border-bottom: 1px solid var(--border); color: var(--text-secondary); font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-align: left; text-transform: uppercase; white-space: nowrap; }
.register td { padding: 10px 12px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); vertical-align: top; }
.register td small { display: block; margin-top: 2px; color: var(--text-muted); font-size: 10px; }
.register tfoot th, .register tfoot td { border-top: 2px solid var(--border); background: var(--bg-card-soft); color: var(--text-primary); font-weight: 700; }
.register tfoot th { font-size: 11px; letter-spacing: 0; text-transform: none; }
.name { color: var(--text-primary); }
.num { font-variant-numeric: tabular-nums; text-align: right !important; white-space: nowrap; }
.strong { color: var(--text-primary) !important; font-weight: 700; }
.net { color: var(--green) !important; font-weight: 800; }
.note { margin: 0; color: var(--text-muted); font-size: 12px; line-height: 1.6; }

.print-only { display: none; }

@media (max-width: 1000px) { .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

@media print {
  @page { size: A4 portrait; margin: 12mm; }
  :global(.sidebar), :global(.topbar), :global(.sidebar-overlay) { display: none !important; }
  :global(.main-area) { margin-left: 0 !important; }
  :global(.page-content) { padding: 0 !important; }
  :global(html), :global(body) { background: #fff !important; }
  .no-print { display: none !important; }
  .print-only { display: block; }
  .tm-page { max-width: none; gap: 8px; color: #000; }
  .tm-page.preview::before { content: 'PREVIEW'; position: fixed; top: 40%; left: 15%; color: rgba(0, 0, 0, 0.07); font-size: 120px; font-weight: 800; transform: rotate(-20deg); }
  .panel, .year-bar, .stat { border-color: #999; background: #fff; break-inside: avoid; }
  .stat { padding: 8px; }
  .stat strong { color: #000; font-size: 13px; }
  .icon { display: none; }
  .table-wrap { overflow: visible; }
  .register { min-width: 0; font-size: 9.5px; }
  .register th, .register td { padding: 4px 6px; color: #000 !important; }
  .register tfoot th, .register tfoot td { background: #eee; }
  .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 36px; margin-top: 28px; }
  .signatures div { display: grid; gap: 3px; text-align: center; font-size: 11px; }
  .signatures span { height: 28px; border-bottom: 1px solid #000; }
  .printed { margin: 8px 0 0; font-size: 9px; color: #555; }
}
</style>