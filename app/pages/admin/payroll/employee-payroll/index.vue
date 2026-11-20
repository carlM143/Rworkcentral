<script setup lang="ts">
import { Banknote, Eye, FileText, Printer, ReceiptText, Send, Wallet, X } from 'lucide-vue-next'
import PayslipDocument from '~/components/admin/payroll/payslip/PayslipDocument.vue'
import ConfirmationModal from '~/components/ui/ConfirmationModal.vue'
import type { Payslip } from '~/types/payroll/payslip/payslip'
import type {
  EmployeePayrollResponse,
  EmployeePayrollRow,
  EmployeePayrollStatus,
  SendPayslipsPayload,
} from '~/types/payroll/employee-payroll/employeePayroll'

import { useEmployeePayroll } from '~/composables/admin/payroll/employee-payroll/useEmployeePayroll'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const listApi = useEmployeePayroll()
const payslipApi = usePayslip()

const { loading, sending } = listApi
const { loadingPayslip } = payslipApi

const result = ref<EmployeePayrollResponse | null>(null)
const selected = ref<Payslip | null>(null)
const errorMessage = ref('')

const periodId = ref<number | null>(route.query.period ? Number(route.query.period) : null)
const departmentId = ref<number | null>(null)
const status = ref<'' | EmployeePayrollStatus>('')
const search = ref('')
const page = ref(1)
const perPage = 10

const rows = computed(() => result.value?.rows ?? [])
const meta = computed(() => result.value?.meta)
const totals = computed(() => result.value?.totals)
const periodOptions = computed(() => result.value?.filters.periods ?? [])
const departmentOptions = computed(() => result.value?.filters.departments ?? [])

const money = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value ?? 0))

const shortDate = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
}

const load = async () => {
  errorMessage.value = ''

  try {
    result.value = await listApi.fetchEmployeePayrolls({
      payroll_period_id: periodId.value,
      department_id: departmentId.value,
      status: status.value,
      search: search.value.trim(),
      page: page.value,
      per_page: perPage,
    })
  } catch (err) {
    errorMessage.value = payslipApi.getErrorMessage(err)
  }
}

// "Rice Subsidy ₱500.00, Transport ₱250.00" for the Allowance cell tooltip
const allowanceTooltip = (row: EmployeePayrollRow) =>
  (row.additional_allowances ?? [])
    .map(line => `${line.allowance_name ?? 'Allowance'} ${money(line.amount)}`)
    .join(', ')

// The payslip endpoint (PayslipService) already lists additional allowances separately.
const openPayslip = async (row: EmployeePayrollRow) => {
  if (row.status !== 'finalized') return
  errorMessage.value = ''

  try {
    selected.value = await payslipApi.fetchPayslip(row.payroll_id)
  } catch (err) {
    errorMessage.value = payslipApi.getErrorMessage(err)
  }
}

/* =========================================================
   SEND PAYSLIPS
   Releases finalized payslips to the employees' accounts.
   Whole period (header button) or one row (resend if already sent).
========================================================= */

interface PendingSend {
  title: string
  message: string
  confirmText: string
  payload: SendPayslipsPayload
}

const pendingSend = ref<PendingSend | null>(null)

const selectedPeriodName = computed(() =>
  periodOptions.value.find(p => p.id === periodId.value)?.period_name ?? 'this pay period',
)

const askSendPeriod = () => {
  if (!periodId.value) return
  pendingSend.value = {
    title: 'Send Payslips?',
    message: `Finalized payslips for ${selectedPeriodName.value} will be sent to the employees' accounts and they will be notified.\nPayslips already sent are skipped.`,
    confirmText: 'Send Payslips',
    payload: { payroll_period_id: periodId.value },
  }
}

const askSendRow = (row: EmployeePayrollRow) => {
  if (row.status !== 'finalized') return
  const resend = !!row.payslip_sent
  pendingSend.value = {
    title: resend ? 'Resend Payslip?' : 'Send Payslip?',
    message: resend
      ? `${row.employee.name}'s payslip was already sent. Send it again and notify the employee?`
      : `${row.employee.name}'s payslip for ${row.period?.period_name ?? 'this period'} will be sent to the employee's account.`,
    confirmText: resend ? 'Resend' : 'Send',
    payload: { payroll_ids: [row.payroll_id], resend },
  }
}

const confirmSend = async () => {
  const pending = pendingSend.value
  if (!pending || sending.value) return

  try {
    const res = await listApi.sendPayslips(pending.payload)
    const skipped = res.data?.skipped ?? []
    // Show why, when only a few were skipped (e.g. "Payslip was already sent.")
    const reasons = skipped.length && skipped.length <= 3
      ? ` ${skipped.map(s => `${s.name}: ${s.reason}`).join(' ')}`
      : ''

    if (res.success) toast.success('Payslips Sent', res.message + reasons)
    else toast.warning('No Payslips Sent', res.message + reasons)

    await load()
  } catch (err) {
    toast.error('Unable to Send Payslips', payslipApi.getErrorMessage(err))
  } finally {
    pendingSend.value = null
  }
}

const sentDate = (value?: string | null) => {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? ''
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d)
}

// The class turns on the print-only styles below; removed once the print dialog closes.
const printPayslip = () => {
  const root = document.documentElement
  root.classList.add('printing-payslip')
  window.addEventListener('afterprint', () => root.classList.remove('printing-payslip'), { once: true })
  window.print()
}

const resetFilters = () => {
  periodId.value = null
  departmentId.value = null
  status.value = ''
  search.value = ''
}

// Filters reset to page 1; search waits until typing stops
let searchTimer: ReturnType<typeof setTimeout> | undefined

watch([periodId, departmentId, status], () => {
  router.replace({ query: { ...route.query, period: periodId.value ? String(periodId.value) : undefined } })
  if (page.value !== 1) page.value = 1
  else void load()
})

watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (page.value !== 1) page.value = 1
    else void load()
  }, 350)
})

watch(page, () => void load())

const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') selected.value = null
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  void load()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearTimeout(searchTimer)
})
</script>

<template>
  <section class="ep-page">
    <PageHeader
      title="Employee Payroll"
      description="Payroll records of every employee across pay periods. Open a finalized record to view or print the payslip."
    >
      <AppButton
        :icon="Send"
        :disabled="!periodId || sending"
        :title="periodId ? 'Send finalized payslips of this pay period to employees' : 'Select a pay period first'"
        @click="askSendPeriod"
      >
        Send Payslips
      </AppButton>
    </PageHeader>

    <div v-if="errorMessage" class="alert">{{ errorMessage }}</div>

    <!-- SUMMARY -->
    <div class="ep-stats">
      <div class="ep-stat">
        <span class="ep-icon ep-icon--blue"><FileText :size="18" /></span>
        <div>
          <small>Payroll Records</small>
          <strong>{{ totals?.records ?? 0 }}</strong>
        </div>
      </div>
      <div class="ep-stat">
        <span class="ep-icon ep-icon--violet"><Banknote :size="18" /></span>
        <div>
          <small>Total Gross Pay</small>
          <strong>{{ money(totals?.gross_pay) }}</strong>
        </div>
      </div>
      <div class="ep-stat">
        <span class="ep-icon ep-icon--amber"><ReceiptText :size="18" /></span>
        <div>
          <small>Total Deductions</small>
          <strong>{{ money(totals?.total_deductions) }}</strong>
        </div>
      </div>
      <div class="ep-stat">
        <span class="ep-icon ep-icon--green"><Wallet :size="18" /></span>
        <div>
          <small>Total Net Pay</small>
          <strong>{{ money(totals?.net_pay) }}</strong>
        </div>
      </div>
    </div>

    <!-- LEDGER -->
    <BaseDataTable
      title="Employee Payroll Ledger"
      description="Earnings, deductions and status of each employee's payroll."
      :has-rows="rows.length > 0"
      :loading="loading"
      min-width="1250px"
      empty-title="No payroll records found"
      empty-description="Generate payroll in Payroll Readiness, or adjust the filters."
    >
      <template #toolbar>
        <input
          v-model="search"
          type="search"
          class="table-search"
          placeholder="Search employee name or ID"
          aria-label="Search employee payroll"
        >

        <select v-model="periodId" class="table-filter" aria-label="Pay period">
          <option :value="null">All Pay Periods</option>
          <option v-for="p in periodOptions" :key="p.id" :value="p.id">{{ p.period_name }}</option>
        </select>

        <select v-model="departmentId" class="table-filter" aria-label="Department">
          <option :value="null">All Departments</option>
          <option v-for="d in departmentOptions" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>

        <select v-model="status" class="table-filter" aria-label="Payroll status">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="finalized">Finalized</option>
        </select>

        <AppButton variant="secondary" @click="resetFilters">Reset</AppButton>
      </template>

      <template #headers>
        <th>Employee</th>
        <th>Pay Period</th>
        <th class="num">Basic Pay</th>
        <th class="num">OT Pay</th>
        <th class="num">Allowance</th>
        <th class="num">Gross Pay</th>
        <th class="num">Deductions</th>
        <th class="num">Net Pay</th>
        <th>Status</th>
        <th class="text-right">Payslip</th>
      </template>

      <template #rows>
        <tr
          v-for="row in rows"
          :key="row.payroll_id"
          :class="{ clickable: row.status === 'finalized' }"
          @click="openPayslip(row)"
        >

          <td>
            <strong>{{ row.employee.name }}</strong>
            <small class="sub">{{ row.employee.emp_id }}<template v-if="row.employee.department"> · {{ row.employee.department }}</template></small>
          </td>
          <td>
            <strong>{{ row.period?.period_name ?? '—' }}</strong>
            <small class="sub">Pay on {{ shortDate(row.period?.payment_date) }}</small>
          </td>
          <td class="num">{{ money(row.basic_pay) }}</td>
          <td class="num">{{ row.overtime_pay ? money(row.overtime_pay) : '—' }}</td>
          <td class="num">
            {{ row.allowance_pay ? money(row.allowance_pay) : '—' }}
            <small
              v-if="row.additional_allowance_pay"
              class="sub"
              :title="allowanceTooltip(row)"
            >
              incl. {{ money(row.additional_allowance_pay) }} additional
            </small>
          </td>
          <td class="num"><strong>{{ money(row.gross_pay) }}</strong></td>
          <td class="num minus">− {{ money(row.total_deductions) }}</td>
          <td class="num"><strong class="net">{{ money(row.net_pay) }}</strong></td>
          <td>
            <span class="pill" :class="`pill--${row.status}`">
              {{ row.status === 'finalized' ? 'Finalized' : 'Draft' }}
            </span>
            <small v-if="row.status === 'finalized'" class="sub" :class="{ sent: row.payslip_sent }">
              {{ row.payslip_sent ? `Sent ${sentDate(row.payslip_sent_at)}` : 'Not sent' }}
            </small>
          </td>
          <td class="text-right">
            <button
              v-if="row.status === 'finalized'"
              type="button"
              class="view-btn"
              :disabled="sending"
              :title="row.payslip_sent ? 'Resend payslip to employee' : 'Send payslip to employee'"
              :aria-label="`${row.payslip_sent ? 'Resend' : 'Send'} payslip to ${row.employee.name}`"
              @click.stop="askSendRow(row)"
            >
              <Send :size="14" />
            </button>
            <button
              type="button"
              class="view-btn"
              :disabled="row.status !== 'finalized' || loadingPayslip"
              :title="row.status === 'finalized' ? 'View payslip' : 'Payslip is available after finalizing'"
              :aria-label="`View payslip of ${row.employee.name}`"
              @click.stop="openPayslip(row)"
            >
              <Eye :size="15" />
            </button>
          </td>
        </tr>
      </template>

      <template #bottom>
        <div class="footer-wrap">
          <BaseTableFooter
            v-model="page"
            :showing-from="meta?.from ?? 0"
            :showing-to="meta?.to ?? 0"
            :total-items="meta?.total ?? 0"
            :total-pages="meta?.last_page ?? 1"
            item-label="payroll records"
          />
        </div>
      </template>
    </BaseDataTable>

    <ConfirmationModal
      :open="!!pendingSend"
      :title="pendingSend?.title ?? ''"
      :message="pendingSend?.message"
      :confirm-text="sending ? 'Sending…' : pendingSend?.confirmText"
      :loading="sending"
      @confirm="confirmSend"
      @cancel="!sending && (pendingSend = null)"
    />

    <!-- PAYSLIP VIEWER -->
    <Teleport to="body">
      <div v-if="selected" class="ps-overlay" @click.self="selected = null">
        <div class="ps-dialog" role="dialog" aria-modal="true" aria-label="Payslip">
          <div class="ps-toolbar">
            <strong>{{ selected.employee.name }} · {{ selected.payslip_no }}</strong>
            <div class="ps-actions">
              <AppButton :icon="Printer" @click="printPayslip">Print</AppButton>
              <button type="button" class="ps-close" aria-label="Close" @click="selected = null">
                <X :size="17" />
              </button>
            </div>
          </div>

          <div class="ps-scroll">
            <div class="payslip-print">
              <PayslipDocument :payslip="selected" />
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.ep-page { width: 100%; min-width: 0; }

.alert { margin-bottom: 12px; padding: 11px 14px; border-radius: 8px; background: rgb(248 113 113 / 10%); color: #f87171; font-size: 12px; }

.ep-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
.ep-stat { display: flex; align-items: center; gap: 14px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.ep-stat small { display: block; color: var(--text-secondary); font-size: 11px; }
.ep-stat strong { display: block; margin-top: 4px; color: var(--text-primary); font-size: 20px; }
.ep-icon { display: grid; width: 40px; height: 40px; flex-shrink: 0; place-items: center; border-radius: 10px; }
.ep-icon--blue { background: rgb(36 107 253 / 14%); color: #3b82f6; }
.ep-icon--violet { background: rgb(139 92 246 / 14%); color: #a78bfa; }
.ep-icon--amber { background: rgb(245 158 11 / 14%); color: #f59e0b; }
.ep-icon--green { background: rgb(34 197 94 / 14%); color: #22c55e; }

.num { text-align: right; white-space: nowrap; }
.minus { color: #f87171 !important; }
.net { color: #22c55e !important; }
.clickable { cursor: pointer; }
.mono { color: var(--primary, #3b82f6); font-weight: 600; white-space: nowrap; }
.sub { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; }
.footer-wrap { padding: 0 16px 14px; }

.pill { display: inline-flex; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.pill--draft { background: rgb(251 146 60 / 12%); color: #fb923c; }
.pill--finalized { background: rgb(34 197 94 / 11%); color: #22c55e; }

.view-btn { display: inline-grid; width: 30px; height: 30px; place-items: center; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.view-btn:hover:not(:disabled) { color: var(--primary); border-color: var(--primary); }
.view-btn:disabled { opacity: .35; cursor: not-allowed; }
.view-btn + .view-btn { margin-left: 6px; }
.sub.sent { color: #22c55e; }

@media (max-width: 1100px) {
  .ep-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 640px) {
  .ep-stats { grid-template-columns: 1fr; }
}
</style>

<style>
.ps-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0, 0, 0, .65); backdrop-filter: blur(3px); }
.ps-dialog { display: flex; width: 100%; max-width: 860px; max-height: calc(100vh - 40px); flex-direction: column; overflow: hidden; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card-soft, var(--bg-card)); }
.ps-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--border-soft); color: var(--text-primary); font-size: 13px; }
.ps-actions { display: flex; align-items: center; gap: 10px; }
.ps-close { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.ps-scroll { padding: 18px; overflow-y: auto; }

/*
 * Print only the payslip. `visibility: hidden` kept the hidden page's height,
 * which printed as extra blank pages, so the rest of the page is removed from
 * layout instead. Scoped to html.printing-payslip (set by printPayslip) so
 * printing on other pages is not affected.
 */
@media print {
  html.printing-payslip,
  html.printing-payslip body { height: auto !important; min-height: 0 !important; overflow: visible !important; background: #ffffff !important; }
  html.printing-payslip body > *:not(.ps-overlay) { display: none !important; }
  html.printing-payslip .ps-overlay { position: static; display: block; padding: 0; background: none; backdrop-filter: none; }
  html.printing-payslip .ps-dialog { display: block; max-width: none; max-height: none; overflow: visible; border: 0; border-radius: 0; background: none; }
  html.printing-payslip .ps-toolbar { display: none; }
  html.printing-payslip .ps-scroll { padding: 0; overflow: visible; }
}
</style>