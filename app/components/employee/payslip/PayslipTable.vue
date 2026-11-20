<!-- Employee payslip history (shared EmployeeRequestTable). -->
<script setup lang="ts">
import { Download, LoaderCircle, WalletCards } from 'lucide-vue-next'
import EmployeeRequestTable from '~/components/shared-table/employee-table/EmployeeRequestTable.vue'
import type { EmployeePayslipListItem } from '~/types/employee/payslip/employeePayslip'
import { payslipDate, payslipPeriodLabel } from '~/utils/employeePayslip'

const props = withDefaults(defineProps<{
  payslips: EmployeePayslipListItem[]
  loading?: boolean
  /** Payslip being opened or downloaded (shows a spinner, disables downloads). */
  busyId?: number | null
}>(), {
  loading: false,
  busyId: null,
})

const emit = defineEmits<{
  view: [payslip: EmployeePayslipListItem]
  download: [payslip: EmployeePayslipListItem]
}>()

const columns = [
  { key: 'period', label: 'Pay Period' },
  { key: 'payslip_no', label: 'Payslip No.', hideOnMobile: true },
  { key: 'pay_date', label: 'Pay Date', hideOnMobile: true },
  { key: 'gross', label: 'Gross Pay', align: 'right' as const },
  { key: 'deductions', label: 'Deductions', align: 'right' as const, hideOnMobile: true },
  { key: 'net', label: 'Net Pay', align: 'right' as const },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Action', hideOnMobile: true },
]

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)

const rows = computed(() => props.payslips.map(payslip => ({ id: payslip.payroll_id, payslip })))
const payslipOf = (row: Record<string, unknown>) => row.payslip as EmployeePayslipListItem
</script>

<template>
  <EmployeeRequestTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    empty-message="No payslips yet. Your payslip appears here once HR releases it after payroll is finalized."
    mobile-hint="Tap a payslip for the full breakdown and PDF download."
    @row-click="row => emit('view', payslipOf(row))"
  >
    <template #cell-period="{ row }">
      <button type="button" class="row-open-button" @click.stop="emit('view', payslipOf(row))">
        <WalletCards :size="16" />
        <strong>{{ payslipPeriodLabel(payslipOf(row).period) }}</strong>
      </button>
      <small v-if="payslipOf(row).period.period_name">{{ payslipOf(row).period.period_name }}</small>
    </template>
    <template #cell-payslip_no="{ row }">{{ payslipOf(row).payslip_no }}</template>
    <template #cell-pay_date="{ row }">{{ payslipDate(payslipOf(row).period.payment_date) }}</template>
    <template #cell-gross="{ row }">{{ money(payslipOf(row).gross_pay) }}</template>
    <template #cell-deductions="{ row }">{{ money(payslipOf(row).total_deductions) }}</template>
    <template #cell-net="{ row }"><strong class="net">{{ money(payslipOf(row).net_pay) }}</strong></template>
    <template #cell-status="{ row }">
      <span class="status" :title="payslipOf(row).sent_at ? `Released ${payslipDate(payslipOf(row).sent_at)}` : undefined">
        <LoaderCircle v-if="busyId === payslipOf(row).payroll_id" :size="11" class="spin" />
        Released
      </span>
    </template>
    <template #cell-actions="{ row }">
      <button
        type="button"
        class="download-button"
        :disabled="busyId !== null"
        :aria-label="`Download payslip for ${payslipPeriodLabel(payslipOf(row).period)} as PDF`"
        @click.stop="emit('download', payslipOf(row))"
      >
        <Download :size="14" /> PDF
      </button>
    </template>
  </EmployeeRequestTable>
</template>

<style scoped>
/* Slot content renders in this component's scope, so these styles apply inside the shared table. */
.row-open-button { display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; background: transparent; color: var(--text-primary); font: inherit; font-size: 11px; cursor: pointer; }
.row-open-button svg { flex-shrink: 0; color: var(--primary); }
.net { color: var(--primary) !important; font-variant-numeric: tabular-nums; }
.status { display: inline-flex; align-items: center; gap: 5px; padding: 5px 8px; border-radius: 5px; background: var(--green-soft); color: var(--green); font-size: 10px; font-weight: 600; }
.download-button { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 7px; background: var(--primary-soft); color: var(--primary); font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }
.download-button:hover:not(:disabled) { border-color: var(--primary); }
.download-button:disabled { opacity: .5; cursor: not-allowed; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
</style>
