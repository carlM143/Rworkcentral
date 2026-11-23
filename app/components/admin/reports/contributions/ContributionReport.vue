<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  AlertTriangle,
  Building2,
  FileSpreadsheet,
  Landmark,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  UserRound,
  Users,
} from 'lucide-vue-next'
import {
  useContributionReport,
  type ContributionAgency,
  type ContributionReportResponse,
} from '~/composables/admin/reports/useContributionReport'

/**
 * Monthly SSS / PhilHealth / Pag-IBIG contributions for remittance, from
 * generated payroll (both cutoffs of the month combined). Read-only.
 */
const props = defineProps<{ agency: ContributionAgency }>()

const TITLES: Record<ContributionAgency, string> = {
  sss: 'SSS Contribution Report',
  philhealth: 'PhilHealth Contribution Report',
  pagibig: 'Pag-IBIG Contribution Report',
}

const api = useContributionReport()
const { error: toastError } = useToast()
const { user } = useAuth()

const filters = reactive({ month: '', department_id: '' as number | '', search: '' })
const report = ref<ContributionReportResponse | null>(null)
const loading = ref(true)
const missingOnly = ref(false)

const load = async () => {
  loading.value = true
  try {
    report.value = await api.load(props.agency, { ...filters, search: filters.search.trim() })
    if (!filters.month && report.value.month) filters.month = report.value.month
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
watch(() => [filters.month, filters.department_id], load)

const reset = () => {
  filters.department_id = ''
  filters.search = ''
  missingOnly.value = false
}

const agency = computed(() => report.value?.agency)
const totals = computed(() => report.value?.totals)
const rows = computed(() => {
  const all = report.value?.data ?? []
  return missingOnly.value ? all.filter(r => !r.id_number) : all
})
const hasEc = computed(() => !!agency.value?.has_ec)

const peso = (v: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Number(v ?? 0))
const amount = (v: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v ?? 0))

const periodsLabel = computed(() => (report.value?.periods ?? []).map(p => p.period_name).join(' · ') || '—')
const printedAt = computed(() => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()))

// =====================================================
// EXPORT
// =====================================================

const printReport = () => window.print()

const exportExcel = () => {
  const a = agency.value
  if (!a) return
  const header = ['Employee No.', 'Employee', 'Department', a.id_label, a.basis_label, 'Employee Share', 'Employer Share', ...(hasEc.value ? ['EC'] : []), 'Total']
  const lines = rows.value.map(r => [
    r.emp_id, r.employee, r.department, r.id_number ?? 'MISSING', r.salary_basis, r.employee_share, r.employer_share,
    ...(hasEc.value ? [r.ec] : []), r.total,
  ])
  const t = totals.value
  const totalLine = t ? ['TOTAL', `${t.employees} employee(s)`, '', '', '', t.employee_share, t.employer_share, ...(hasEc.value ? [t.ec] : []), t.total] : []
  const title = [`${a.label} Contributions — ${report.value?.month_label}`, `Payroll: ${periodsLabel.value}`, report.value?.official ? 'Official (finalized)' : 'PREVIEW (not finalized)']
  const csv = [title, [], header, ...lines, totalLine]
    .map(cols => cols.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.agency}-contributions-${report.value?.month ?? 'month'}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="cr-page" :class="{ preview: report && !report.official }">
    <div class="no-print">
      <PageHeader
        :title="TITLES[props.agency]"
        description="Monthly employee and employer contributions for remittance, from generated payroll. Both cutoffs of the month are combined."
      >
        <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="load">Refresh</AppButton>
        <AppButton variant="secondary" :icon="Printer" :disabled="!rows.length" @click="printReport">Print / PDF</AppButton>
        <AppButton :icon="FileSpreadsheet" :disabled="!rows.length" @click="exportExcel">Excel</AppButton>
      </PageHeader>
    </div>

    <!-- MONTH BAR -->
    <div v-if="report" class="month-bar">
      <div><small>Contribution month</small><strong>{{ report.month_label }}</strong></div>
      <div><small>Payroll included</small><strong>{{ periodsLabel }}</strong></div>
      <span class="badge" :class="report.official ? 'ok' : 'warn'">
        {{ report.official ? 'Official · Finalized' : 'Preview · Not finalized' }}
      </span>
    </div>

    <p v-if="report && !report.official && report.data.length" class="banner warn no-print" role="status">
      {{ report.draft_payrolls }} payroll record(s) of this month are not finalized yet. Amounts can still change; printed copies are marked PREVIEW.
    </p>
    <p v-if="totals?.missing_id" class="banner danger no-print" role="status">
      <AlertTriangle :size="16" />
      {{ totals.missing_id }} employee(s) have no {{ agency?.id_label }} on file. Add it in the employee’s Government Information before remitting.
      <button type="button" class="link" @click="missingOnly = !missingOnly">{{ missingOnly ? 'Show all' : 'Show them' }}</button>
    </p>

    <!-- STATS -->
    <div class="stats" :class="{ five: hasEc }">
      <div class="stat"><span class="icon blue"><Users :size="18" /></span><span><small>Employees</small><strong>{{ totals?.employees ?? 0 }}</strong></span></div>
      <div class="stat"><span class="icon green"><UserRound :size="18" /></span><span><small>Employee Share</small><strong>{{ peso(totals?.employee_share) }}</strong></span></div>
      <div class="stat"><span class="icon orange"><Building2 :size="18" /></span><span><small>Employer Share</small><strong>{{ peso(totals?.employer_share) }}</strong></span></div>
      <div v-if="hasEc" class="stat"><span class="icon gray"><Building2 :size="18" /></span><span><small>EC (Employer)</small><strong>{{ peso(totals?.ec) }}</strong></span></div>
      <div class="stat"><span class="icon purple"><Landmark :size="18" /></span><span><small>Total to Remit</small><strong>{{ peso(totals?.total) }}</strong></span></div>
    </div>

    <!-- FILTERS -->
    <div class="filters no-print">
      <label class="search">
        <Search :size="16" />
        <input v-model="filters.search" type="search" :placeholder="`Search employee, employee no. or ${agency?.id_label ?? 'ID'}...`" aria-label="Search">
      </label>
      <select v-model="filters.month" aria-label="Contribution month">
        <option v-if="!report?.filters.months.length" :value="report?.month ?? ''">{{ report?.month_label ?? 'No months yet' }}</option>
        <option v-for="m in report?.filters.months ?? []" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>
      <select v-model="filters.department_id" aria-label="Department">
        <option value="">All Departments</option>
        <option v-for="d in report?.filters.departments ?? []" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
      <AppButton variant="secondary" :icon="RotateCcw" @click="reset">Reset</AppButton>
    </div>

    <!-- TABLE -->
    <section class="panel">
      <header class="panel-head">
        <h2>{{ agency?.label ?? '' }} Contributions · {{ report?.month_label }}</h2>
        <p>One row per employee; both cutoffs of the month are added together.</p>
      </header>

      <div v-if="loading && !report" class="state">Loading contributions...</div>
      <div v-else-if="!rows.length" class="state">
        <strong>{{ missingOnly ? 'Everyone has an ID number' : 'No contributions for this month' }}</strong>
        <span>{{ missingOnly ? '' : 'Contributions appear after payroll is generated in Payroll › Employee Payroll.' }}</span>
      </div>

      <div v-else class="table-wrap" :class="{ dim: loading }">
        <table class="register">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Employee</th>
              <th scope="col">{{ agency?.id_label }}</th>
              <th scope="col">Department</th>
              <th scope="col" class="num">{{ agency?.basis_label }}</th>
              <th scope="col" class="num">Employee Share</th>
              <th scope="col" class="num">Employer Share</th>
              <th v-if="hasEc" scope="col" class="num">EC</th>
              <th scope="col" class="num strong">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in rows" :key="r.employee_id">
              <td class="muted">{{ i + 1 }}</td>
              <td><strong class="name">{{ r.employee }}</strong><small>{{ r.emp_id }}<template v-if="r.cutoffs > 1"> · {{ r.cutoffs }} cutoffs</template></small></td>
              <td>
                <span v-if="r.id_number" class="mono">{{ r.id_number }}</span>
                <span v-else class="missing"><AlertTriangle :size="12" /> Missing</span>
              </td>
              <td>{{ r.department }}</td>
              <td class="num">{{ amount(r.salary_basis) }}</td>
              <td class="num">{{ amount(r.employee_share) }}</td>
              <td class="num">{{ amount(r.employer_share) }}</td>
              <td v-if="hasEc" class="num">{{ amount(r.ec) }}</td>
              <td class="num strong">{{ amount(r.total) }}</td>
            </tr>
          </tbody>
          <tfoot v-if="totals">
            <tr>
              <th scope="row" colspan="5">Total · {{ totals.employees }} employee(s)</th>
              <td class="num">{{ amount(totals.employee_share) }}</td>
              <td class="num">{{ amount(totals.employer_share) }}</td>
              <td v-if="hasEc" class="num">{{ amount(totals.ec) }}</td>
              <td class="num strong">{{ amount(totals.total) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

    <!-- PRINT ONLY -->
    <div class="print-only signatures">
      <div><span /><strong>Prepared by</strong><small>{{ user?.name }}</small></div>
      <div><span /><strong>Checked by</strong><small>Payroll / HR</small></div>
      <div><span /><strong>Approved by</strong><small>Management</small></div>
    </div>
    <p class="print-only printed">Printed {{ printedAt }}{{ report?.official ? '' : ' · PREVIEW — payroll not finalized' }}</p>
  </section>
</template>

<style scoped>
.cr-page { display: grid; gap: 14px; width: 100%; max-width: 1500px; margin: 0 auto; }

.month-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 28px; padding: 14px 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.month-bar div { display: grid; gap: 2px; }
.month-bar small { color: var(--text-muted); font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.month-bar strong { color: var(--text-primary); font-size: 13px; }
.badge { margin-left: auto; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.badge.ok { background: var(--green-soft); color: var(--green); }
.badge.warn { background: var(--orange-soft); color: var(--orange); }

.banner { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0; padding: 10px 14px; border-radius: 10px; font-size: 13px; }
.banner.warn { background: var(--orange-soft); color: var(--orange); }
.banner.danger { background: var(--red-soft); color: var(--red); }
.link { padding: 0; border: 0; background: transparent; color: inherit; font-family: inherit; font-weight: 700; text-decoration: underline; cursor: pointer; }

.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.stats.five { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.stat { display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.stat > span:last-child { display: grid; gap: 3px; min-width: 0; }
.stat small { color: var(--text-secondary); font-size: 11px; }
.stat strong { overflow: hidden; color: var(--text-primary); font-size: 19px; text-overflow: ellipsis; white-space: nowrap; }
.icon { display: grid; width: 40px; height: 40px; flex-shrink: 0; place-items: center; border-radius: 10px; }
.icon.blue { background: var(--primary-soft); color: var(--primary); }
.icon.green { background: var(--green-soft); color: var(--green); }
.icon.orange { background: var(--orange-soft); color: var(--orange); }
.icon.purple { background: var(--purple-soft); color: var(--purple); }
.icon.gray { background: var(--bg-card-soft); color: var(--text-secondary); }

.filters { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.filters select, .search { height: 40px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card-soft); color: var(--text-primary); font-family: inherit; font-size: 13px; }
.filters select { padding: 0 10px; }
.search { display: flex; min-width: 240px; flex: 1; align-items: center; gap: 8px; padding: 0 12px; color: var(--text-muted); }
.search input { width: 100%; height: 100%; border: 0; outline: 0; background: transparent; color: var(--text-primary); font-family: inherit; font-size: 13px; }
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
.muted { color: var(--text-muted); }
.mono { font-variant-numeric: tabular-nums; letter-spacing: 0.02em; }
.missing { display: inline-flex; align-items: center; gap: 4px; color: var(--red); font-weight: 700; }

.print-only { display: none; }

@media (max-width: 1100px) { .stats, .stats.five { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

@media print {
  @page { size: A4 portrait; margin: 12mm; }
  :global(.sidebar), :global(.topbar), :global(.sidebar-overlay) { display: none !important; }
  :global(.main-area) { margin-left: 0 !important; }
  :global(.page-content) { padding: 0 !important; }
  :global(html), :global(body) { background: #fff !important; }
  .no-print { display: none !important; }
  .print-only { display: block; }
  .cr-page { max-width: none; gap: 8px; color: #000; }
  .cr-page.preview::before { content: 'PREVIEW'; position: fixed; top: 40%; left: 15%; color: rgba(0, 0, 0, 0.07); font-size: 120px; font-weight: 800; transform: rotate(-20deg); }
  .panel, .month-bar, .stat { border-color: #999; background: #fff; break-inside: avoid; }
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
