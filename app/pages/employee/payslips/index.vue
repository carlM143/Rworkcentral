<script setup lang="ts">
import { Download, RefreshCw } from 'lucide-vue-next'
import PayslipBreakdown from '~/components/employee/payslip/PayslipBreakdown.vue'
import PayslipTable from '~/components/employee/payslip/PayslipTable.vue'
import { employeePayslipError, useEmployeePayslips } from '~/composables/employee/payslip/useEmployeePayslips'
import type { EmployeePayslipListData, EmployeePayslipListItem } from '~/types/employee/payslip/employeePayslip'
import { toEmployeePayslip, type EmployeePayslip } from '~/utils/employeePayslip'
import { employeePayslipPdf } from '~/utils/employeePayslipPdf'

definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'Payslips | Employee Portal — RWorkCentral' })

const api = useEmployeePayslips()
const { profile } = useEmployeePortal()

/* =========================================================
   LIST (only payslips HR has released)
========================================================= */

const result = ref<EmployeePayslipListData | null>(null)
const year = ref<number | null>(null)
const loading = ref(false)
const loadError = ref('')

const payslips = computed(() => result.value?.payslips ?? [])
const years = computed(() => result.value?.years ?? [])

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)

const stats = computed(() => [
  { label: 'Payslips', value: String(result.value?.totals.count ?? 0), note: year.value ? `Released in ${year.value}` : 'Released to you' },
  { label: 'Total Gross Pay', value: money(result.value?.totals.gross_pay ?? 0), note: 'Before deductions' },
  { label: 'Total Net Pay', value: money(result.value?.totals.net_pay ?? 0), note: 'Take-home pay' },
])

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    result.value = await api.list(year.value)
  } catch (cause) {
    loadError.value = employeePayslipError(cause, 'Your payslips could not be loaded.')
  } finally {
    loading.value = false
  }
}

watch(year, () => void load())
onMounted(() => void load())

/* =========================================================
   FULL PAYSLIP: fetched on view or download, then kept for this visit
========================================================= */

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
  } catch (cause) {
    actionError.value = employeePayslipError(cause, 'The payslip could not be opened. Please try again.')
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
  } catch (cause) {
    actionError.value = employeePayslipError(cause, 'The payslip could not be downloaded. Please try again.')
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
  <section class="payslips-page">
    <header class="page-header">
      <div>
        <h1>Payslips</h1>
        <p>Payslips released by HR. Open one for the full breakdown or download it as a PDF.</p>
      </div>
      <button type="button" class="secondary-button" :disabled="loading" @click="load">
        <RefreshCw :size="15" :class="{ spin: loading }" /> Refresh
      </button>
    </header>

    <p v-if="loadError" class="error-message" role="alert">
      {{ loadError }} <button type="button" @click="load">Retry</button>
    </p>
    <p v-if="actionError && !detailsOpen" class="error-message" role="alert">{{ actionError }}</p>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <span>{{ stat.label }}</span><strong>{{ stat.value }}</strong><small>{{ stat.note }}</small>
      </div>
    </div>

    <article class="table-card">
      <div class="table-header">
        <div>
          <h2>Payslip History</h2>
          <p>{{ payslips.length }} record(s)</p>
        </div>
        <select v-if="years.length" v-model="year" class="year-filter" aria-label="Filter payslips by year">
          <option :value="null">All years</option>
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <PayslipTable
        :payslips="payslips"
        :loading="loading && !payslips.length"
        :busy-id="busyId"
        @view="viewSlip"
        @download="downloadSlip"
      />
    </article>

    <EmployeeRecordDialog v-model="detailsOpen" title="Payslip Details" :subtitle="selectedSlip?.period" wide>
      <PayslipBreakdown v-if="selectedSlip" :slip="selectedSlip" :employee="pdfEmployee(selectedSlip)" />
      <p v-if="actionError" class="error-message" role="alert">{{ actionError }}</p>
      <template #actions>
        <button v-if="selectedSlip" type="button" class="download-button" @click="downloadSelected">
          <Download :size="16" /> Download PDF
        </button>
      </template>
    </EmployeeRecordDialog>
  </section>
</template>

<style scoped>
/* Same frame as the other employee pages (e.g. Time Log Correction) */
.payslips-page { max-width: 1660px; margin: 0 auto; color: var(--text-primary); }
.page-header, .table-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.page-header { align-items: flex-start; margin-bottom: 22px; }
h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }
h2 { margin: 0 0 6px; font-size: 15px; }
p { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.secondary-button { display: inline-flex; align-items: center; gap: 8px; min-height: 41px; padding: 10px 17px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card); color: var(--text-primary); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.secondary-button:disabled { opacity: .55; cursor: wait; }
.error-message { margin-bottom: 15px; padding: 12px 15px; border-radius: 9px; background: var(--red-soft, #fee2e2); color: var(--red, #b91c1c); }
.error-message button { margin-left: 8px; padding: 3px 10px; border: 1px solid currentColor; border-radius: 6px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
.stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-bottom: 18px; }
.stat-card { display: flex; flex-direction: column; gap: 7px; min-height: 102px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.stat-card span { color: var(--text-secondary); font-size: 11px; }
.stat-card strong { font-size: 24px; line-height: 1.2; overflow-wrap: anywhere; }
.stat-card small { color: var(--text-muted); font-size: 10px; }
.table-card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.table-header { padding: 18px; }
.year-filter { height: 38px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 12px; }
.download-button { display: inline-flex; align-items: center; gap: 7px; padding: 9px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--primary-soft); color: var(--primary); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
@media (max-width: 640px) {
  h1 { font-size: 22px; line-height: 1.3; }
  .page-header { flex-wrap: wrap; gap: 14px; }
  .page-header .secondary-button { width: 100%; justify-content: center; }
  .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-card { min-height: 90px; padding: 10px; }
  .stat-card:first-child { grid-column: 1 / -1; }
  .stat-card strong { font-size: 19px; }
  .table-header { padding: 14px; }
}
</style>
