<script setup lang="ts">
import { Download, LoaderCircle, RefreshCw } from 'lucide-vue-next'
import { employeePayslipPdf } from '~/utils/employeePayslipPdf'
import { payslipDate, payslipPeriodLabel, toEmployeePayslip, type EmployeePayslip } from '~/utils/employeePayslip'
import { employeePayslipError, useEmployeePayslips } from '~/composables/employee/payslip/useEmployeePayslips'
import type { EmployeePayslipListData, EmployeePayslipListItem } from '~/types/employee/payslip/employeePayslip'

const { profile } = useEmployeePortal()
const api = useEmployeePayslips()

const result = ref<EmployeePayslipListData | null>(null)
const year = ref<number | null>(null)
const loading = ref(false)
const loadError = ref('')

const payslips = computed(() => result.value?.payslips ?? [])
const years = computed(() => result.value?.years ?? [])

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    result.value = await api.list(year.value)
  } catch (err) {
    loadError.value = employeePayslipError(err, 'Your payslips could not be loaded.')
  } finally {
    loading.value = false
  }
}

watch(year, () => void load())
onMounted(() => void load())

/* Full payslip: fetched on view or download, then kept for this visit */
const details = new Map<number, EmployeePayslip>()
const busyId = ref<number | null>(null)
const actionError = ref('')

const getPayslip = async (row: EmployeePayslipListItem) => {
  const cached = details.get(row.payroll_id)
  if (cached) return cached
  const slip = toEmployeePayslip(row.payroll_id, await api.show(row.payroll_id))
  details.set(row.payroll_id, slip)
  return slip
}

const detailsOpen = ref(false)
const selectedSlip = ref<EmployeePayslip | null>(null)

const viewSlip = async (row: EmployeePayslipListItem) => {
  if (busyId.value) return
  actionError.value = ''
  busyId.value = row.payroll_id
  try {
    selectedSlip.value = await getPayslip(row)
    detailsOpen.value = true
  } catch (err) {
    actionError.value = employeePayslipError(err, 'The payslip could not be opened. Please try again.')
  } finally {
    busyId.value = null
  }
}

// Employee details from the payslip; position and location from the profile
const pdfEmployee = (slip: EmployeePayslip) => ({
  name: slip.employee.name || profile.value.name,
  employeeId: slip.employee.employeeId || profile.value.employeeId,
  department: slip.employee.department || profile.value.department,
  position: profile.value.position,
  location: profile.value.location,
})

const savePdf = (slip: EmployeePayslip) => {
  let url: string | undefined
  const link = document.createElement('a')
  try {
    const bytes = employeePayslipPdf(slip, pdfEmployee(slip))
    url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
    const safe = (value: string) => value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '')
    link.href = url
    link.download = `Payslip-${safe(slip.id)}.pdf`
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    if (url) { const objectUrl = url; setTimeout(() => URL.revokeObjectURL(objectUrl), 1000) }
  }
}

const downloadSlip = async (row: EmployeePayslipListItem) => {
  if (busyId.value) return
  actionError.value = ''
  busyId.value = row.payroll_id
  try {
    savePdf(await getPayslip(row))
  } catch (err) {
    actionError.value = employeePayslipError(err, 'The payslip could not be downloaded. Please try again.')
  } finally {
    busyId.value = null
  }
}

const downloadSelected = () => {
  if (!selectedSlip.value) return
  actionError.value = ''
  try {
    savePdf(selectedSlip.value)
  } catch {
    actionError.value = 'The payslip could not be downloaded. Please try again.'
  }
}
</script>

<template>
  <section class="payslips">
    <p v-if="actionError && !detailsOpen" class="download-error" role="alert">{{ actionError }}</p>
    <article class="payslip-table-card">
      <header>
        <div>
          <h2>Payslip History</h2>
          <p>Payslips released by HR. Open one for the full breakdown or download it as a PDF.</p>
        </div>
        <div class="header-tools">
          <select v-if="years.length" v-model="year" class="year-filter" aria-label="Filter payslips by year">
            <option :value="null">All years</option>
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
          <span class="record-count">{{ payslips.length }} records</span>
        </div>
      </header>

      <div v-if="loading && !payslips.length" class="state" role="status">
        <LoaderCircle :size="16" class="spin" /> Loading your payslips…
      </div>

      <div v-else-if="loadError" class="state state--error" role="alert">
        <span>{{ loadError }}</span>
        <button type="button" class="download-button" @click="load"><RefreshCw :size="14" />Retry</button>
      </div>

      <div v-else-if="!payslips.length" class="state">
        <strong>No payslips yet</strong>
        <span>Your payslip appears here once HR releases it after payroll is finalized.</span>
      </div>

      <template v-else>
        <p class="mobile-table-hint">Tap a payslip row for full details and your PDF download.</p>
        <div class="table-scroll" role="region" aria-label="Payslip history" tabindex="0">
          <table class="mobile-compact-table">
            <caption class="sr-only">Payslip history with gross pay, deductions, net pay, and PDF downloads</caption>
            <thead>
              <tr>
                <th scope="col">Pay Period</th>
                <th scope="col" class="mobile-hide">Payslip No.</th>
                <th scope="col" class="mobile-hide">Pay Date</th>
                <th scope="col" class="amount">Gross Pay</th>
                <th scope="col" class="amount mobile-hide">Deductions</th>
                <th scope="col" class="amount">Net Pay</th>
                <th scope="col">Status</th>
                <th scope="col" class="mobile-hide">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in payslips" :key="row.payroll_id" class="record-row" @click="viewSlip(row)">
                <th scope="row" class="period">
                  <button
                    type="button"
                    class="row-open-button"
                    :aria-label="`Open payslip details for ${payslipPeriodLabel(row.period)}`"
                    @click.stop="viewSlip(row)"
                  >
                    {{ payslipPeriodLabel(row.period) }}
                  </button>
                  <small v-if="row.period.period_name" class="sub">{{ row.period.period_name }}</small>
                </th>
                <td class="mobile-hide">{{ row.payslip_no }}</td>
                <td class="mobile-hide">{{ payslipDate(row.period.payment_date) }}</td>
                <td class="amount">{{ money(row.gross_pay) }}</td>
                <td class="amount mobile-hide">{{ money(row.total_deductions) }}</td>
                <td class="amount net">{{ money(row.net_pay) }}</td>
                <td>
                  <span class="status" :title="row.sent_at ? `Released ${payslipDate(row.sent_at)}` : undefined">
                    <LoaderCircle v-if="busyId === row.payroll_id" :size="11" class="spin" />
                    Released
                  </span>
                </td>
                <td class="mobile-hide">
                  <button
                    type="button"
                    class="download-button"
                    :disabled="busyId !== null"
                    :aria-label="`Download payslip for ${payslipPeriodLabel(row.period)} as PDF`"
                    @click.stop="downloadSlip(row)"
                  >
                    <Download :size="15" />Download PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </article>

    <EmployeeRecordDialog v-model="detailsOpen" title="Payslip Details" :subtitle="selectedSlip?.period" wide>
      <EmployeePayslipBreakdown v-if="selectedSlip" :slip="selectedSlip" :employee="pdfEmployee(selectedSlip)" />
      <p v-if="actionError" class="download-error" role="alert">{{ actionError }}</p>
      <template #actions>
        <button v-if="selectedSlip" type="button" class="download-button" @click="downloadSelected">
          <Download :size="16" />Download PDF
        </button>
      </template>
    </EmployeeRecordDialog>
  </section>
</template>

<style scoped>
.payslips { min-width: 0; }
.payslip-table-card { min-width: 0; overflow: hidden; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); }
header { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px; }
h2 { font-size: 14px; margin: 0; }
header p { margin: 5px 0 0; font-size: 11px; color: var(--text-secondary); line-height: 1.6; }
.header-tools { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.year-filter { height: 32px; padding: 0 10px; border: 1px solid var(--border); border-radius: 7px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 11px; }
.record-count { flex-shrink: 0; color: var(--text-secondary); font-size: 11px; }
.state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 140px; padding: 20px; border-top: 1px solid var(--border-soft); color: var(--text-secondary); font-size: 12px; text-align: center; }
.state strong { color: var(--text-primary); font-size: 13px; }
.state--error { color: var(--red); }
.table-scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 11px; }
thead th { background: var(--bg-card-soft); color: var(--text-secondary); font-size: 10px; font-weight: 500; }
th, td { padding: 14px 18px; white-space: nowrap; }
tbody th, tbody td { border-top: 1px solid var(--border-soft); }
tbody td { color: var(--text-secondary); }
tbody tr:hover { background: var(--bg-card-soft); }
.record-row { cursor: pointer; }
.period { font-weight: 600; color: var(--text-primary); }
.sub { display: block; margin-top: 3px; color: var(--text-muted); font-size: 10px; font-weight: 400; }
.amount { text-align: right; font-variant-numeric: tabular-nums; }
.net { font-weight: 700; color: var(--primary); }
.status { display: inline-flex; align-items: center; gap: 5px; color: var(--green); background: var(--green-soft); border-radius: 5px; padding: 5px 8px; font-size: 10px; font-weight: 600; }
.download-button { display: inline-flex; justify-content: center; align-items: center; gap: 7px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 7px; background: var(--primary-soft); color: var(--primary); font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }
.download-button:hover:not(:disabled) { border-color: var(--primary); }
.download-button:disabled { opacity: .5; cursor: not-allowed; }
.download-button:focus-visible, .table-scroll:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
.download-error { color: var(--red); font-size: 12px; margin: 0 0 12px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media(max-width: 850px) { header { flex-wrap: wrap; padding: 16px; }header p { font-size: 13px; }.record-count { font-size: 12px; }.download-button { padding: 10px 12px; } }
</style>
