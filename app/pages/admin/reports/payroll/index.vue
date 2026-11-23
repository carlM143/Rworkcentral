<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  Banknote,
  Building2,
  FileSpreadsheet,
  Landmark,
  MinusCircle,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
} from 'lucide-vue-next'
import {
  usePayrollRegister,
  type PayrollReportResponse,
  type PayrollRegisterRow,
} from '~/composables/admin/reports/usePayrollRegister'

/**
 * Reports › Payroll Reports: the payroll register of a pay period, read-only,
 * from generated payroll. Finalized payroll is official; draft is a preview.
 */
definePageMeta({ layout: 'admin' })

const api = usePayrollRegister()
const { error: toastError } = useToast()
const { user } = useAuth()

const filters = reactive({
  payroll_period_id: '' as number | '',
  department_id: '' as number | '',
  employment_type_id: '' as number | '',
  status: '' as '' | 'draft' | 'finalized',
  search: '',
})

const report = ref<PayrollReportResponse | null>(null)
const loading = ref(true)

const load = async () => {
  loading.value = true
  try {
    report.value = await api.load({ ...filters, search: filters.search.trim() })
    // First load picks the latest period with payroll; keep it selected.
    if (!filters.payroll_period_id && report.value.period) filters.payroll_period_id = report.value.period.id
  } catch (err) {
    const e = err as { data?: { message?: string } }
    toastError('Unable to load the payroll report', e?.data?.message ?? 'Please try again.')
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
watch(() => [filters.payroll_period_id, filters.department_id, filters.employment_type_id, filters.status], load)

const reset = () => {
  Object.assign(filters, { department_id: '', employment_type_id: '', status: '', search: '' })
}

const period = computed(() => report.value?.period ?? null)
const rows = computed(() => report.value?.data ?? [])
const totals = computed(() => report.value?.totals)
const official = computed(() => !!period.value?.official && (report.value?.counts.draft ?? 0) === 0)

// =====================================================
// FORMAT
// =====================================================

const peso = (v: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Number(v ?? 0))

const amount = (v: number | null | undefined) =>
  Number(v ?? 0) === 0 ? '—' : new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v))

const date = (v: string | null | undefined, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  v ? new Intl.DateTimeFormat('en-US', opts).format(new Date(`${String(v).slice(0, 10)}T00:00:00`)) : '—'

const periodStatus = computed(() => {
  const s = period.value?.status
  if (!s) return ''
  return { draft: 'Draft', open: 'Open', processing: 'Processing', closed: 'Closed' }[s] ?? s
})

// =====================================================
// EXPORT
// =====================================================

const printReport = () => window.print()

const exportExcel = () => {
  const header = [
    'Payroll No.', 'Employee No.', 'Employee', 'Department', 'Position', 'Employment Type', 'Days Worked',
    'Basic Pay', 'Overtime Pay', 'Holiday Pay', 'Allowances', 'Gross Pay',
    'Late/Undertime/Unpaid', 'SSS', 'PhilHealth', 'Pag-IBIG', 'Withholding Tax', 'Loans', 'Total Deductions',
    'Net Pay', 'Employer Contributions', 'Bank', 'Account No.', 'Status',
  ]
  const line = (r: PayrollRegisterRow) => [
    r.payroll_no, r.emp_id, r.employee, r.department, r.position, r.employment_type, r.days_worked,
    r.basic_pay, r.overtime_pay, r.holiday_pay, r.allowance_pay, r.gross_pay,
    r.attendance_deductions, r.sss, r.philhealth, r.pagibig, r.withholding_tax, r.loan_deductions, r.total_deductions,
    r.net_pay, r.employer_contributions, r.bank_name ?? '', r.account_number ?? '', r.status,
  ]
  const t = totals.value
  const totalLine = t
    ? ['TOTAL', '', `${t.employees} employee(s)`, '', '', '', '', t.basic_pay, t.overtime_pay, t.holiday_pay, t.allowance_pay, t.gross_pay,
        t.attendance_deductions, t.sss, t.philhealth, t.pagibig, t.withholding_tax, t.loan_deductions, t.total_deductions,
        t.net_pay, t.employer_contributions, '', '', '']
    : []
  const title = [`Payroll Register — ${period.value?.name ?? ''}`, `Cutoff ${date(period.value?.cutoff_start)} – ${date(period.value?.cutoff_end)}`, `Payday ${date(period.value?.payment_date)}`, official.value ? 'Official (finalized)' : 'PREVIEW (not finalized)']
  const csv = [title, [], header, ...rows.value.map(line), totalLine]
    .map(cols => cols.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `payroll-register-${(period.value?.name ?? 'period').replace(/[^\w-]+/g, '-').toLowerCase()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const printedAt = computed(() => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()))
</script>

<template>
  <section class="pr-page" :class="{ preview: !official }">
    <div class="no-print">
      <PageHeader
        title="Payroll Report"
        description="Payroll register of a pay period: earnings, statutory contributions, deductions and net pay. Read-only; payroll is generated and finalized in Payroll › Employee Payroll."
      >
        <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="load">Refresh</AppButton>
        <AppButton variant="secondary" :icon="Printer" :disabled="!rows.length" @click="printReport">Print / PDF</AppButton>
        <AppButton :icon="FileSpreadsheet" :disabled="!rows.length" @click="exportExcel">Excel</AppButton>
      </PageHeader>
    </div>

    <!-- PERIOD BAR -->
    <div v-if="period" class="period-bar">
      <div><small>Pay period</small><strong>{{ period.name }}</strong></div>
      <div><small>Cutoff</small><strong>{{ date(period.cutoff_start, { month: 'short', day: 'numeric' }) }} – {{ date(period.cutoff_end) }}</strong></div>
      <div><small>Payday</small><strong>{{ date(period.payment_date) }}</strong></div>
      <div><small>Period status</small><strong>{{ periodStatus }}</strong></div>
      <span class="badge" :class="official ? 'ok' : 'warn'">{{ official ? 'Official · Finalized' : 'Preview · Not finalized' }}</span>
    </div>

    <p v-if="period && !official && rows.length" class="banner warn no-print" role="status">
      This payroll is not finalized yet ({{ report?.counts.draft }} draft record(s)). Amounts can still change; printed copies are marked PREVIEW.
    </p>

    <!-- STATS -->
    <div class="stats">
      <div class="stat"><span class="icon blue"><Users :size="18" /></span><span><small>Employees</small><strong>{{ totals?.employees ?? 0 }}</strong></span></div>
      <div class="stat"><span class="icon green"><Banknote :size="18" /></span><span><small>Gross Payroll</small><strong>{{ peso(totals?.gross_pay) }}</strong></span></div>
      <div class="stat"><span class="icon orange"><MinusCircle :size="18" /></span><span><small>Total Deductions</small><strong>{{ peso(totals?.total_deductions) }}</strong></span></div>
      <div class="stat"><span class="icon purple"><Landmark :size="18" /></span><span><small>Net Payroll</small><strong>{{ peso(totals?.net_pay) }}</strong></span></div>
      <div class="stat"><span class="icon gray"><Building2 :size="18" /></span><span><small>Employer Contributions</small><strong>{{ peso(totals?.employer_contributions) }}</strong></span></div>
    </div>

    <!-- FILTERS -->
    <div class="filters no-print">
      <label class="search">
        <Search :size="16" />
        <input v-model="filters.search" type="search" placeholder="Search employee, payroll no. or position..." aria-label="Search">
      </label>
      <select v-model="filters.payroll_period_id" aria-label="Pay period">
        <option v-for="p in report?.filters.periods ?? []" :key="p.id" :value="p.id">
          {{ p.name }}{{ p.payrolls ? ` · ${p.payrolls} payroll` : ' · not generated' }}
        </option>
      </select>
      <select v-model="filters.department_id" aria-label="Department">
        <option value="">All Departments</option>
        <option v-for="d in report?.filters.departments ?? []" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
      <select v-model="filters.employment_type_id" aria-label="Employment type">
        <option value="">All Employment Types</option>
        <option v-for="t in report?.filters.employment_types ?? []" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <select v-model="filters.status" aria-label="Payroll status">
        <option value="">All Payroll Status</option>
        <option value="draft">Draft ({{ report?.counts.draft ?? 0 }})</option>
        <option value="finalized">Finalized ({{ report?.counts.finalized ?? 0 }})</option>
      </select>
      <AppButton variant="secondary" :icon="RotateCcw" @click="reset">Reset</AppButton>
    </div>

    <!-- REGISTER -->
    <section class="panel">
      <header class="panel-head">
        <h2>Payroll Register</h2>
        <p>Amounts in PHP. Late/UT/Unpaid = late, undertime, unpaid leave and unpaid holiday deductions.</p>
      </header>

      <div v-if="loading && !report" class="state">Loading payroll...</div>
      <div v-else-if="!period" class="state"><strong>No pay periods yet</strong><span>Create a pay period in Payroll › Pay Periods.</span></div>
      <div v-else-if="!rows.length" class="state">
        <strong>{{ period.payrolls ? 'No payroll matches the filters' : 'Payroll not generated yet' }}</strong>
        <span>{{ period.payrolls ? 'Try another filter.' : 'Generate payroll for this period in Payroll › Employee Payroll.' }}</span>
      </div>

      <div v-else class="table-wrap" :class="{ dim: loading }">
        <table class="register">
          <thead>
            <tr class="group">
              <th colspan="3" />
              <th colspan="5" class="g-earn">Earnings</th>
              <th colspan="7" class="g-ded">Deductions</th>
              <th colspan="2" />
            </tr>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Department</th>
              <th scope="col" class="num">Days</th>
              <th scope="col" class="num">Basic</th>
              <th scope="col" class="num">Overtime</th>
              <th scope="col" class="num">Holiday</th>
              <th scope="col" class="num">Allowance</th>
              <th scope="col" class="num strong">Gross</th>
              <th scope="col" class="num">Late/UT/Unpaid</th>
              <th scope="col" class="num">SSS</th>
              <th scope="col" class="num">PhilHealth</th>
              <th scope="col" class="num">Pag-IBIG</th>
              <th scope="col" class="num">Tax</th>
              <th scope="col" class="num">Loans</th>
              <th scope="col" class="num strong">Total</th>
              <th scope="col" class="num strong">Net Pay</th>
              <th scope="col" class="no-print">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td><strong class="name">{{ r.employee }}</strong><small>{{ r.emp_id }} · {{ r.payroll_no }}</small></td>
              <td>{{ r.department }}<small>{{ r.position }}</small></td>
              <td class="num">{{ r.days_worked || '—' }}</td>
              <td class="num">{{ amount(r.basic_pay) }}</td>
              <td class="num">{{ amount(r.overtime_pay) }}</td>
              <td class="num">{{ amount(r.holiday_pay) }}</td>
              <td class="num">{{ amount(r.allowance_pay) }}</td>
              <td class="num strong">{{ amount(r.gross_pay) }}</td>
              <td class="num">{{ amount(r.attendance_deductions) }}</td>
              <td class="num">{{ amount(r.sss) }}</td>
              <td class="num">{{ amount(r.philhealth) }}</td>
              <td class="num">{{ amount(r.pagibig) }}</td>
              <td class="num">{{ amount(r.withholding_tax) }}</td>
              <td class="num">{{ amount(r.loan_deductions) }}</td>
              <td class="num strong">{{ amount(r.total_deductions) }}</td>
              <td class="num net">{{ amount(r.net_pay) }}</td>
              <td class="no-print"><span class="pill" :class="r.status">{{ r.status === 'finalized' ? 'Finalized' : 'Draft' }}</span></td>
            </tr>
          </tbody>
          <tfoot v-if="totals">
            <tr>
              <th scope="row" colspan="3">Total · {{ totals.employees }} employee(s)</th>
              <td class="num">{{ amount(totals.basic_pay) }}</td>
              <td class="num">{{ amount(totals.overtime_pay) }}</td>
              <td class="num">{{ amount(totals.holiday_pay) }}</td>
              <td class="num">{{ amount(totals.allowance_pay) }}</td>
              <td class="num strong">{{ amount(totals.gross_pay) }}</td>
              <td class="num">{{ amount(totals.attendance_deductions) }}</td>
              <td class="num">{{ amount(totals.sss) }}</td>
              <td class="num">{{ amount(totals.philhealth) }}</td>
              <td class="num">{{ amount(totals.pagibig) }}</td>
              <td class="num">{{ amount(totals.withholding_tax) }}</td>
              <td class="num">{{ amount(totals.loan_deductions) }}</td>
              <td class="num strong">{{ amount(totals.total_deductions) }}</td>
              <td class="num net">{{ amount(totals.net_pay) }}</td>
              <td class="no-print" />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

    <!-- DEPARTMENT SUMMARY -->
    <section v-if="report?.departments.length" class="panel">
      <header class="panel-head">
        <h2>Summary by Department</h2>
        <p>For accounting entries and cost allocation.</p>
      </header>
      <div class="table-wrap">
        <table class="register small">
          <thead>
            <tr>
              <th scope="col">Department</th>
              <th scope="col" class="num">Employees</th>
              <th scope="col" class="num">Gross Pay</th>
              <th scope="col" class="num">Deductions</th>
              <th scope="col" class="num">Net Pay</th>
              <th scope="col" class="num">Employer Contributions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in report.departments" :key="d.department">
              <td><strong class="name">{{ d.department }}</strong></td>
              <td class="num">{{ d.employees }}</td>
              <td class="num">{{ amount(d.gross_pay) }}</td>
              <td class="num">{{ amount(d.total_deductions) }}</td>
              <td class="num net">{{ amount(d.net_pay) }}</td>
              <td class="num">{{ amount(d.employer_contributions) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- PRINT ONLY: signatures -->
    <div class="print-only signatures">
      <div><span /><strong>Prepared by</strong><small>{{ user?.name }}</small></div>
      <div><span /><strong>Checked by</strong><small>Payroll / HR</small></div>
      <div><span /><strong>Approved by</strong><small>Management</small></div>
    </div>
    <p class="print-only printed">Printed {{ printedAt }}{{ official ? '' : ' · PREVIEW — payroll not finalized' }}</p>
  </section>
</template>

<style scoped>
.pr-page { display: grid; gap: 14px; width: 100%; max-width: 1700px; margin: 0 auto; }

.period-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 28px; padding: 14px 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.period-bar div { display: grid; gap: 2px; }
.period-bar small { color: var(--text-muted); font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.period-bar strong { color: var(--text-primary); font-size: 13px; }
.badge { margin-left: auto; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.badge.ok { background: var(--green-soft); color: var(--green); }
.badge.warn { background: var(--orange-soft); color: var(--orange); }

.banner { margin: 0; padding: 10px 14px; border-radius: 10px; font-size: 13px; }
.banner.warn { background: var(--orange-soft); color: var(--orange); }

.stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
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
.register { width: 100%; min-width: 1500px; border-collapse: collapse; font-size: 12px; }
.register.small { min-width: 760px; }
.register th { padding: 10px 12px; color: var(--text-secondary); font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-align: left; text-transform: uppercase; white-space: nowrap; }
.register thead tr:last-child th { border-bottom: 1px solid var(--border); }
.register .group th { padding-bottom: 0; font-size: 10px; }
.g-earn { color: var(--green) !important; text-align: center !important; border-bottom: 2px solid var(--green); }
.g-ded { color: var(--orange) !important; text-align: center !important; border-bottom: 2px solid var(--orange); }
.register td { padding: 10px 12px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); vertical-align: top; }
.register td small { display: block; margin-top: 2px; color: var(--text-muted); font-size: 10px; }
.register tfoot th, .register tfoot td { border-top: 2px solid var(--border); background: var(--bg-card-soft); color: var(--text-primary); font-weight: 700; }
.register tfoot th { font-size: 11px; text-transform: none; letter-spacing: 0; }
.name { color: var(--text-primary); }
.num { font-variant-numeric: tabular-nums; text-align: right !important; white-space: nowrap; }
.strong { color: var(--text-primary) !important; font-weight: 700; }
.net { color: var(--green) !important; font-weight: 800; }
.pill { padding: 3px 9px; border-radius: 999px; font-size: 10px; font-weight: 700; }
.pill.finalized { background: var(--green-soft); color: var(--green); }
.pill.draft { background: var(--orange-soft); color: var(--orange); }

.print-only { display: none; }

@media (max-width: 1200px) { .stats { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 700px) { .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .badge { margin-left: 0; } }

/* =====================================================
   PRINT / PDF (landscape register with signatures)
===================================================== */
@media print {
  @page { size: A4 landscape; margin: 10mm; }
  :global(.sidebar), :global(.topbar), :global(.sidebar-overlay) { display: none !important; }
  :global(.main-area) { margin-left: 0 !important; }
  :global(.page-content) { padding: 0 !important; }
  :global(html), :global(body) { background: #fff !important; }
  .no-print { display: none !important; }
  .print-only { display: block; }
  .pr-page { max-width: none; gap: 8px; color: #000; }
  .pr-page.preview::before { content: 'PREVIEW'; position: fixed; top: 40%; left: 25%; z-index: 0; color: rgba(0, 0, 0, 0.07); font-size: 140px; font-weight: 800; transform: rotate(-20deg); }
  .panel, .period-bar, .stat { border-color: #999; background: #fff; break-inside: avoid; }
  .stats { grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .stat { padding: 8px; }
  .stat strong { font-size: 13px; color: #000; }
  .icon { display: none; }
  .table-wrap { overflow: visible; }
  .register { min-width: 0; font-size: 8.5px; }
  .register th, .register td { padding: 4px 5px; color: #000 !important; }
  .register tfoot th, .register tfoot td { background: #eee; }
  .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 30px; }
  .signatures div { display: grid; gap: 3px; text-align: center; font-size: 11px; }
  .signatures span { height: 28px; border-bottom: 1px solid #000; }
  .printed { margin: 8px 0 0; font-size: 9px; color: #555; }
}
</style>