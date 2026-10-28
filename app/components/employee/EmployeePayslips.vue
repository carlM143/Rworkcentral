<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import { employeePayslipPdf } from '~/utils/employeePayslipPdf'
import { createEmployeePayslips, payslipTotals, type EmployeePayslip } from '~/utils/employeePayslip'

const { profile } = useEmployeePortal()
const downloadError = ref('')
const detailsOpen = ref(false)
const selectedSlip = ref<EmployeePayslip | null>(null)
const viewSlip = (slip: EmployeePayslip) => { selectedSlip.value = slip; detailsOpen.value = true }
const payslips = createEmployeePayslips()
const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
const downloadPayslip = (slip: EmployeePayslip) => {
  downloadError.value = ''
  let url: string | undefined
  const link = document.createElement('a')
  try {
    const bytes = employeePayslipPdf(slip, profile.value)
    url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
    const safe = (value: string) => value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '')
    link.href = url
    link.download = `Payslip-${safe(profile.value.employeeId)}-${safe(slip.period)}.pdf`
    document.body.appendChild(link)
    link.click()
  } catch {
    downloadError.value = 'The payslip could not be downloaded. Please try again.'
  } finally {
    link.remove()
    if (url) { const objectUrl = url; setTimeout(() => URL.revokeObjectURL(objectUrl), 1000) }
  }
}
</script>

<template>
  <section class="payslips">
    <p v-if="downloadError" class="download-error" role="alert">{{ downloadError }}</p>
    <article class="payslip-table-card">
      <header><div><h2>Payslip History</h2><p>View your pay summaries and download a PDF for each period.</p></div><span class="record-count">{{ payslips.length }} records</span></header>
      <p class="mobile-table-hint">Tap a payslip row for full details and your PDF download.</p>
      <div class="table-scroll" role="region" aria-label="Payslip history" tabindex="0">
        <table class="mobile-compact-table">
          <caption class="sr-only">Payslip history with earnings, deductions, net pay, and PDF downloads</caption>
          <thead>
            <tr><th scope="col">Pay Period</th><th scope="col" class="amount mobile-hide">Basic Pay</th><th scope="col" class="amount mobile-hide">Overtime</th><th scope="col" class="amount">Gross Pay</th><th scope="col" class="amount mobile-hide">Deductions</th><th scope="col" class="amount">Net Pay</th><th scope="col">Status</th><th scope="col" class="mobile-hide">Action</th></tr>
          </thead>
          <tbody>
            <tr v-for="slip in payslips" :key="slip.period" class="record-row" @click="viewSlip(slip)">
              <th scope="row" class="period"><button type="button" class="row-open-button" :aria-label="`Open payslip details for ${slip.period}`" @click.stop="viewSlip(slip)">{{ slip.period }}</button></th>
              <td class="amount mobile-hide">{{ money(slip.earnings[0]?.amount || 0) }}</td>
              <td class="amount mobile-hide">{{ money(slip.earnings.find(row => row.label === 'Overtime Pay')?.amount || 0) }}</td>
              <td class="amount">{{ money(payslipTotals(slip).gross) }}</td>
              <td class="amount mobile-hide">{{ money(payslipTotals(slip).totalDeductions) }}</td>
              <td class="amount net">{{ money(payslipTotals(slip).net) }}</td>
              <td><span class="status">Released</span></td>
              <td class="mobile-hide"><button type="button" class="download-button" :aria-label="`Download payslip for ${slip.period} as PDF`" @click.stop="downloadPayslip(slip)"><Download :size="15" />Download PDF</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
    <EmployeeRecordDialog v-model="detailsOpen" title="Payslip Details" :subtitle="selectedSlip?.period" wide>
      <EmployeePayslipBreakdown v-if="selectedSlip" :slip="selectedSlip" :employee="profile" />
      <p v-if="downloadError" class="download-error" role="alert">{{ downloadError }}</p>
      <template #actions><button v-if="selectedSlip" type="button" class="download-button" @click="downloadPayslip(selectedSlip)"><Download :size="16" />Download PDF</button></template>
    </EmployeeRecordDialog>
  </section>
</template>

<style scoped>
.payslips { min-width: 0; }
.payslip-table-card { min-width: 0; overflow: hidden; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; box-shadow: var(--shadow); }
header { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px; }
h2 { font-size: 14px; margin: 0; }
header p { margin: 5px 0 0; font-size: 11px; color: var(--text-secondary); line-height: 1.6; }
.record-count { flex-shrink: 0; color: var(--text-secondary); font-size: 11px; }
.table-scroll { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 11px; }
thead th { background: var(--bg-card-soft); color: var(--text-secondary); font-size: 10px; font-weight: 500; }
th, td { padding: 14px 18px; white-space: nowrap; }
tbody th, tbody td { border-top: 1px solid var(--border-soft); }
tbody td { color: var(--text-secondary); }
tbody tr:hover { background: var(--bg-card-soft); }
.period { font-weight: 600; color: var(--text-primary); }
.amount { text-align: right; font-variant-numeric: tabular-nums; }
.net { font-weight: 700; color: var(--primary); }
.status { display: inline-block; color: var(--green); background: var(--green-soft); border-radius: 5px; padding: 5px 8px; font-size: 10px; font-weight: 600; }
.download-button { display: inline-flex; justify-content: center; align-items: center; gap: 7px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 7px; background: var(--primary-soft); color: var(--primary); font: inherit; font-size: 11px; font-weight: 600; }
.download-button:hover { border-color: var(--primary); }
.download-button:focus-visible, .table-scroll:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
.download-error { color: var(--red); font-size: 12px; margin: 0 0 12px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media(max-width: 850px) { header { flex-wrap: wrap; padding: 16px; }header p { font-size: 13px; }.record-count { font-size: 12px; }.download-button { padding: 10px 12px; } }
</style>
