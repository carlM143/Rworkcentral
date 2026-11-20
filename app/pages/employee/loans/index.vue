<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import LoanTable from '~/components/employee/loans/LoanTable.vue'
import { loanRepayments, loanSummary, useEmployeePortalLoans } from '~/composables/employee/loans/useEmployeePortalLoans'
import type { EmployeeLoanRepayment, EmployeePortalLoan } from '~/types/employee/loans/loans'

definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'Loans | Employee Portal — RWorkCentral' })

const api = useEmployeePortalLoans()
const { profile } = useEmployeePortal()

const loans = ref<EmployeePortalLoan[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    loans.value = await api.list()
  } finally {
    loading.value = false
  }
})

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
const date = (value: string | null) => value
  ? new Date(`${value}T12:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  : 'No further payments'

const activeLoans = computed(() => loans.value.filter(loan => loanSummary(loan).outstanding > 0))
const stats = computed(() => [
  { label: 'Active Loans', value: String(activeLoans.value.length), note: 'With a remaining balance' },
  { label: 'Outstanding Balance', value: money(loans.value.reduce((sum, loan) => sum + loanSummary(loan).outstanding, 0)), note: 'Across all loans' },
  {
    label: 'Monthly Installments',
    value: money(activeLoans.value.reduce((sum, loan) => sum + Math.min(loan.installment, loanSummary(loan).outstanding), 0)),
    note: 'Scheduled repayments',
  },
])

/* Details dialog (loan → repayment) */
const detailsOpen = ref(false)
const selectedLoan = ref<EmployeePortalLoan | null>(null)
const selectedPayment = ref<EmployeeLoanRepayment | null>(null)
const summary = computed(() => selectedLoan.value ? loanSummary(selectedLoan.value) : null)
const repayments = computed(() => selectedLoan.value ? loanRepayments(selectedLoan.value) : [])

const openLoan = (loan: EmployeePortalLoan) => {
  selectedLoan.value = loan
  selectedPayment.value = null
  detailsOpen.value = true
}
</script>

<template>
  <section class="loans-page">
    <header class="page-header">
      <div>
        <h1>Loans</h1>
        <p>Your loan balances and recorded repayments.</p>
      </div>
      <span class="read-only">Read-only</span>
    </header>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <span>{{ stat.label }}</span><strong>{{ stat.value }}</strong><small>{{ stat.note }}</small>
      </div>
    </div>

    <article class="table-card">
      <div class="table-header">
        <div>
          <h2>Loan History</h2>
          <p>Open a loan for its terms, due dates and repayment history.</p>
        </div>
      </div>
      <LoanTable :loans="loans" :loading="loading" @view="openLoan" />
    </article>

    <p class="source-note">
      Sample loan records — not yet connected to HR/finance data. Contact HR or Finance for corrections or payment instructions.
    </p>

    <EmployeeRecordDialog
      v-model="detailsOpen"
      :title="selectedPayment ? 'Repayment Details' : 'Loan Details'"
      :subtitle="selectedLoan ? `${selectedLoan.type} · ${selectedLoan.id}` : ''"
    >
      <template v-if="selectedLoan && summary">
        <template v-if="selectedPayment">
          <button type="button" class="back-to-loan" @click="selectedPayment = null"><ArrowLeft :size="16" /> Back to loan</button>
          <dl class="record-fields">
            <div><dt>Payment Reference</dt><dd>{{ selectedPayment.reference }}</dd></div>
            <div><dt>Payment Date</dt><dd>{{ date(selectedPayment.date) }}</dd></div>
            <div><dt>Amount Paid</dt><dd>{{ money(selectedPayment.amount) }}</dd></div>
            <div><dt>Balance After Payment</dt><dd>{{ money(selectedPayment.balanceAfter) }}</dd></div>
            <div><dt>Payment Method</dt><dd>{{ selectedPayment.method }}</dd></div>
            <div><dt>Record Status</dt><dd>Recorded</dd></div>
            <div class="wide"><dt>Remarks</dt><dd>{{ selectedPayment.remarks }}</dd></div>
          </dl>
        </template>

        <template v-else>
          <div class="loan-progress">
            <div><strong>{{ money(summary.outstanding) }} remaining</strong><span>{{ Math.round(summary.progress) }}% repaid</span></div>
            <progress :value="summary.progress" max="100" aria-label="Loan repayment progress" />
          </div>
          <dl class="record-fields">
            <div><dt>Employee</dt><dd>{{ profile.name }} · {{ profile.employeeId }}</dd></div>
            <div><dt>Status</dt><dd>{{ summary.status }}</dd></div>
            <div><dt>Principal</dt><dd>{{ money(selectedLoan.principal) }}</dd></div>
            <div><dt>Interest / Charges</dt><dd>{{ money(selectedLoan.interest) }}</dd></div>
            <div><dt>Total Amount Due</dt><dd>{{ money(summary.totalDue) }}</dd></div>
            <div><dt>Total Paid</dt><dd>{{ money(summary.paid) }}</dd></div>
            <div><dt>Outstanding Balance</dt><dd>{{ money(summary.outstanding) }}</dd></div>
            <div><dt>Scheduled Installment</dt><dd>{{ money(selectedLoan.installment) }} · {{ selectedLoan.frequency }}</dd></div>
            <div><dt>Date Granted</dt><dd>{{ date(selectedLoan.grantedAt) }}</dd></div>
            <div><dt>First Payment Date</dt><dd>{{ date(selectedLoan.firstPaymentAt) }}</dd></div>
            <div><dt>Next Payment Due</dt><dd>{{ summary.outstanding ? date(selectedLoan.nextDueAt) : 'Fully paid — no payment due' }}</dd></div>
            <div><dt>Repayment Method</dt><dd>{{ selectedLoan.method }}</dd></div>
            <div class="wide"><dt>Remarks</dt><dd>{{ selectedLoan.remarks }}</dd></div>
          </dl>

          <h3 class="repayment-heading">Repayment History</h3>
          <p class="repayment-help">Tap a repayment for its full details.</p>
          <div class="table-scroll" role="region" aria-label="Loan repayment history" tabindex="0">
            <table class="repayments">
              <thead><tr><th scope="col">Date</th><th scope="col" class="amount">Paid</th><th scope="col" class="amount">Balance</th><th scope="col">Reference</th></tr></thead>
              <tbody>
                <tr v-for="payment in repayments" :key="payment.id" class="record-row" @click="selectedPayment = payment">
                  <th scope="row">
                    <button type="button" class="row-open-button" :aria-label="`Open repayment ${payment.reference}`" @click.stop="selectedPayment = payment">{{ date(payment.date) }}</button>
                  </th>
                  <td class="amount">{{ money(payment.amount) }}</td>
                  <td class="amount">{{ money(payment.balanceAfter) }}</td>
                  <td>{{ payment.reference }}</td>
                </tr>
                <tr v-if="!repayments.length"><td colspan="4">No repayments recorded.</td></tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>
    </EmployeeRecordDialog>
  </section>
</template>

<style scoped>
/* Same frame as the other employee pages (e.g. Time Log Correction) */
.loans-page { max-width: 1660px; margin: 0 auto; color: var(--text-primary); }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }
h2 { margin: 0 0 6px; font-size: 15px; }
p { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.read-only { padding: 6px 10px; border: 1px solid var(--border); border-radius: 20px; color: var(--text-muted); font-size: 11px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-bottom: 18px; }
.stat-card { display: flex; flex-direction: column; gap: 7px; min-height: 102px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.stat-card span { color: var(--text-secondary); font-size: 11px; }
.stat-card strong { color: var(--primary); font-size: 24px; line-height: 1.2; overflow-wrap: anywhere; }
.stat-card small { color: var(--text-muted); font-size: 10px; }
.table-card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.table-header { padding: 18px; }
.source-note { margin-top: 14px; color: var(--text-muted); font-size: 11px; }

/* Details dialog */
.record-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 0; }
.record-fields dt { color: var(--text-secondary); font-size: 11px; }
.record-fields dd { margin: 5px 0 0; font-size: 13px; font-weight: 600; }
.record-fields .wide { grid-column: 1 / -1; }
.loan-progress { margin-bottom: 24px; padding: 14px; border-radius: 10px; background: var(--primary-soft); }
.loan-progress > div { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.loan-progress strong { color: var(--primary); font-size: 14px; }
.loan-progress span { color: var(--text-secondary); font-size: 11px; }
progress { width: 100%; height: 9px; accent-color: var(--primary); }
.repayment-heading { margin: 26px 0 6px; font-size: 14px; }
.repayment-help { margin: 0 0 12px; font-size: 11px; }
.table-scroll { overflow-x: auto; }
.repayments { width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; }
.repayments th, .repayments td { padding: 11px 12px; border-bottom: 1px solid var(--border-soft); }
.repayments thead th { background: var(--bg-card-soft); color: var(--text-secondary); font-weight: 500; }
.repayments td { color: var(--text-secondary); }
.amount { text-align: right; font-variant-numeric: tabular-nums; }
.record-row { cursor: pointer; }
.row-open-button { padding: 0; border: 0; background: transparent; color: var(--text-primary); font: inherit; cursor: pointer; }
.back-to-loan { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; margin-bottom: 18px; padding: 8px 11px; border: 1px solid var(--border); border-radius: 8px; background: var(--primary-soft); color: var(--primary); font: inherit; cursor: pointer; }

@media (max-width: 640px) {
  h1 { font-size: 22px; line-height: 1.3; }
  .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-card { min-height: 90px; padding: 10px; }
  .stat-card:last-child { grid-column: 1 / -1; }
  .stat-card strong { font-size: 19px; }
  .table-header { padding: 14px; }
  .record-fields { grid-template-columns: 1fr; }
}
</style>
