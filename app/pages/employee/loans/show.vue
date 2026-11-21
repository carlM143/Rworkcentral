<script setup lang="ts">
import { ArrowLeft, Landmark, ListChecks, RefreshCw, WalletCards } from 'lucide-vue-next'
import { employeeLoanError, loanFrequencyLabel, useEmployeePortalLoans } from '~/composables/employee/loans/useEmployeePortalLoans'
import type { EmployeeLoanDetail, EmployeeLoanPayment } from '~/types/employee/loans/loans'

// /employee/loans/show?id=1
definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'Loan Details | Employee Portal — RWorkCentral' })

const BASE = '/employee/loans'

const route = useRoute()
const api = useEmployeePortalLoans()
const { profile } = useEmployeePortal()

const id = computed(() => Number(route.query.id))
const loan = ref<EmployeeLoanDetail | null>(null)
const loading = ref(true)
const loadError = ref('')

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    if (!Number.isInteger(id.value) || id.value <= 0) {
      loan.value = null
      loadError.value = 'Loan not found. Return to your loans and open it again.'
      return
    }
    loan.value = await api.show(id.value)
  } catch (cause) {
    loan.value = null
    loadError.value = employeeLoanError(cause, 'The loan details could not be loaded.')
  } finally {
    loading.value = false
  }
}

onMounted(() => void load())

/* =========================================================
   DISPLAY HELPERS
========================================================= */

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
const date = (value: string | null, empty = '—') => value
  ? new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  : empty

const statusClass = computed(() => {
  const status = loan.value?.summary.status
  return status === 'Fully Paid' ? 'green' : status === 'Inactive' ? 'neutral' : 'blue'
})

const nextDueText = computed(() => {
  const current = loan.value
  if (!current) return '—'
  if (current.summary.status === 'Fully Paid') return 'Fully paid — no payment due'
  if (current.summary.status === 'Inactive') return 'Deductions paused by HR'
  return date(current.next_due_date, 'Next payroll (not scheduled yet)')
})

// Newest payment first
const payments = computed(() => [...(loan.value?.payments ?? [])].reverse())

const isAdjustment = (payment: EmployeeLoanPayment) => payment.type === 'adjustment' || payment.type === 'reversal'

const amountText = (payment: EmployeeLoanPayment) =>
  isAdjustment(payment)
    ? `${payment.amount > 0 ? '+' : '−'} ${money(Math.abs(payment.amount))}`
    : money(payment.amount)
</script>

<template>
  <section class="show-page">
    <NuxtLink :to="BASE" class="back-link"><ArrowLeft :size="16" /> Back to Loans</NuxtLink>

    <div class="heading">
      <div class="heading-icon"><Landmark :size="24" /></div>
      <div>
        <h1>{{ loan?.loan_type?.name || 'Loan Details' }}</h1>
        <p>
          {{ loan ? `${loan.reference_no || `#${loan.id}`}${loan.loan_type?.provider ? ` · ${loan.loan_type.provider}` : ''}` : 'Your loan terms and payment history' }}
        </p>
      </div>
      <span v-if="loan" class="badge heading-badge" :class="statusClass">{{ loan.summary.status }}</span>
    </div>

    <div v-if="loading" class="card missing">Loading loan details…</div>

    <div v-else-if="!loan" class="card missing" role="alert">
      <p>{{ loadError }}</p>
      <div class="actions">
        <NuxtLink :to="BASE" class="secondary">Back to Loans</NuxtLink>
        <button v-if="Number.isInteger(id) && id > 0" type="button" class="primary" @click="load"><RefreshCw :size="15" /> Retry</button>
      </div>
    </div>

    <template v-else>
      <!-- Balance -->
      <article class="card balance-card">
        <div class="balance-row">
          <div>
            <span>Outstanding Balance</span>
            <strong>{{ money(loan.summary.outstanding) }}</strong>
          </div>
          <div class="balance-side">
            <span>{{ loan.summary.progress }}% repaid</span>
            <small>{{ money(loan.summary.paid) }} of {{ money(loan.summary.total_due) }}</small>
          </div>
        </div>
        <progress :value="loan.summary.progress" max="100" aria-label="Loan repayment progress" />
      </article>

      <!-- Terms -->
      <article class="card">
        <h2><WalletCards :size="16" /> Loan Terms</h2>
        <dl class="info-grid">
          <div><dt>Employee</dt><dd>{{ profile.name }} · {{ profile.employeeId }}</dd></div>
          <div><dt>Loan Type</dt><dd>{{ loan.loan_type?.name || '—' }}<template v-if="loan.loan_type?.code"> ({{ loan.loan_type.code }})</template></dd></div>
          <div><dt>Provider</dt><dd>{{ loan.loan_type?.provider || '—' }}</dd></div>
          <div><dt>Reference No.</dt><dd>{{ loan.reference_no || '—' }}</dd></div>
          <div><dt>Principal</dt><dd>{{ money(loan.principal) }}</dd></div>
          <div><dt>Interest / Charges</dt><dd>{{ money(loan.interest) }}</dd></div>
          <div><dt>Total Payable</dt><dd>{{ money(loan.total_payable) }}</dd></div>
          <div><dt>Total Amount Due</dt><dd>{{ money(loan.summary.total_due) }}</dd></div>
          <div><dt>Total Paid</dt><dd>{{ money(loan.summary.paid) }}</dd></div>
          <div><dt>Monthly Deduction</dt><dd>{{ money(loan.installment) }} · {{ loanFrequencyLabel(loan.frequency) }}</dd></div>
          <div v-if="loan.deduction_schedule">
            <dt>Deducted On</dt>
            <dd>
              {{ loan.deduction_schedule }}
              <small class="cutoff-split">1st cutoff {{ money(loan.first_cutoff_amount ?? 0) }} · 2nd cutoff {{ money(loan.second_cutoff_amount ?? 0) }}</small>
            </dd>
          </div>
          <div><dt>Remaining Deductions</dt><dd>{{ loan.remaining_installments || '—' }}</dd></div>
          <div><dt>Repayment Method</dt><dd>{{ loan.method }}</dd></div>
          <div><dt>Loan Date</dt><dd>{{ date(loan.loan_date) }}</dd></div>
          <div><dt>Deductions Start</dt><dd>{{ date(loan.deduction_start_date) }}</dd></div>
          <div><dt>Next Payment Due</dt><dd>{{ nextDueText }}</dd></div>
          <div class="wide"><dt>Remarks</dt><dd class="remarks">{{ loan.remarks || '—' }}</dd></div>
        </dl>
      </article>

      <!-- Payments -->
      <article class="card table-card">
        <div class="table-heading">
          <h2><ListChecks :size="16" /> Payment History</h2>
          <p>Payroll deductions are recorded when payroll is finalized. Newest first.</p>
        </div>
        <div class="table-scroll" role="region" aria-label="Loan payment history" tabindex="0">
          <table class="payments">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Method</th>
                <th scope="col">Payroll Period</th>
                <th scope="col">Reference</th>
                <th scope="col" class="amount">Amount</th>
                <th scope="col" class="amount">Balance After</th>
                <th scope="col">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in payments" :key="payment.id">
                <td><strong>{{ date(payment.date) }}</strong></td>
                <td>{{ payment.method }}</td>
                <td>{{ payment.payroll_period || '—' }}</td>
                <td>{{ payment.reference || '—' }}</td>
                <td class="amount" :class="{ adjustment: isAdjustment(payment) }">{{ amountText(payment) }}</td>
                <td class="amount">{{ money(payment.balance_after) }}</td>
                <td class="remarks-cell">{{ payment.remarks || '—' }}</td>
              </tr>
              <tr v-if="!payments.length">
                <td colspan="7" class="empty">No payments recorded yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <p class="source-note">For corrections or questions about this loan, contact HR or Finance.</p>
    </template>
  </section>
</template>

<style scoped>
/* Same frame as the Leave show page */
.show-page { max-width: 1100px; margin: 0 auto; color: var(--text-primary); }
.back-link { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 20px; color: var(--primary); font-size: 12px; font-weight: 600; text-decoration: none; }
.heading { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
.heading-icon { display: grid; flex-shrink: 0; width: 52px; height: 52px; place-items: center; border-radius: 12px; background: var(--primary-soft); color: var(--primary); }
.heading h1 { margin: 0 0 5px; font-size: 24px; }
.heading p { margin: 0; color: var(--text-secondary); font-size: 12px; }
.heading-badge { margin-left: auto; }
.card { margin-bottom: 14px; padding: 22px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.card h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 14px; font-size: 15px; }
.card h2 svg { color: var(--primary); }
.missing { color: var(--text-secondary); font-size: 13px; }
.missing p { margin: 0 0 14px; }

.balance-card { background: var(--primary-soft); border-color: transparent; }
.balance-row { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.balance-row span { display: block; color: var(--text-secondary); font-size: 11px; }
.balance-row strong { display: block; margin-top: 4px; color: var(--primary); font-size: 28px; font-variant-numeric: tabular-nums; }
.balance-side { text-align: right; }
.balance-side span { color: var(--primary); font-size: 13px; font-weight: 700; }
.balance-side small { color: var(--text-secondary); font-size: 11px; }
progress { width: 100%; height: 10px; accent-color: var(--primary); }

.info-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin: 0; }
.info-grid dt { color: var(--text-secondary); font-size: 11px; }
.info-grid dd { margin: 6px 0 0; font-size: 13px; font-weight: 600; }
.info-grid .wide { grid-column: 1 / -1; }
.remarks { font-weight: 400 !important; line-height: 1.6; white-space: pre-line; }
.cutoff-split { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; font-weight: 400; }

.table-card { padding: 0; overflow: hidden; }
.table-heading { padding: 18px 22px 12px; }
.table-heading h2 { margin-bottom: 4px; }
.table-heading p { margin: 0; color: var(--text-secondary); font-size: 11px; }
.table-scroll { overflow-x: auto; }
.payments { width: 100%; min-width: 760px; border-collapse: collapse; font-size: 12px; text-align: left; }
.payments th, .payments td { padding: 12px 16px; border-top: 1px solid var(--border-soft); }
.payments thead th { background: var(--bg-card-soft); color: var(--text-secondary); font-size: 11px; font-weight: 500; white-space: nowrap; }
.payments td { color: var(--text-secondary); }
.payments td strong { color: var(--text-primary); }
.amount { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.adjustment { color: var(--orange); }
.remarks-cell { max-width: 240px; overflow-wrap: anywhere; }
.empty { padding: 28px 16px !important; text-align: center; }
.source-note { margin: 4px 0 0; color: var(--text-muted); font-size: 11px; }

.badge { display: inline-block; padding: 5px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.blue { background: var(--primary-soft); color: var(--primary); }
.green { background: var(--green-soft); color: var(--green); }
.neutral { background: var(--bg-card-soft); color: var(--text-secondary); }
.actions { display: flex; flex-wrap: wrap; gap: 10px; }
.actions a, .actions button { display: inline-flex; min-height: 40px; align-items: center; justify-content: center; gap: 7px; padding: 10px 17px; border-radius: 8px; font: inherit; font-size: 12px; font-weight: 600; text-decoration: none; cursor: pointer; }
.secondary { border: 1px solid var(--border); color: var(--text-primary); }
.primary { border: 0; background: linear-gradient(135deg, #1f68f2, #2878ff); color: #fff; }

@media (max-width: 850px) { .info-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) {
  .card { padding: 16px; }
  .table-card { padding: 0; }
  .table-heading { padding: 14px 16px 10px; }
  .heading { flex-wrap: wrap; }
  .heading h1 { font-size: 20px; }
  .info-grid { grid-template-columns: 1fr; }
  .balance-row strong { font-size: 24px; }
  .balance-side { text-align: left; }
}
</style>
