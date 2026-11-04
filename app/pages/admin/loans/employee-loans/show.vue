<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, CalendarDays, CircleDollarSign, FileText, RefreshCw, UserRound, WalletCards } from 'lucide-vue-next'

import type { EmployeeLoan, LoanMoney } from '~/types/loans/employee-loans/employeeLoan'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { getEmployeeLoan } = useEmployeeLoans()
const loan = ref<EmployeeLoan | null>(null)
const loading = ref(true)
const loadError = ref('')

const loanId = computed(() => {
  const rawId = Array.isArray(route.query.id) ? route.query.id[0] : route.query.id
  const id = Number(rawId)
  return Number.isInteger(id) && id > 0 ? id : null
})

const errorMessage = (error: unknown) => {
  const problem = error as {
    data?: { message?: string }
    response?: { _data?: { message?: string } }
    message?: string
  }

  return problem.data?.message || problem.response?._data?.message || problem.message ||
    'Unable to load employee loan details.'
}

const loadLoan = async () => {
  if (!loanId.value) {
    loadError.value = 'A valid employee loan ID is required.'
    loading.value = false
    return
  }

  loading.value = true
  loadError.value = ''

  try {
    loan.value = await getEmployeeLoan(loanId.value)
  } catch (error: unknown) {
    loan.value = null
    loadError.value = errorMessage(error)
  } finally {
    loading.value = false
  }
}

const goBack = () => navigateTo('/admin/loans/employee-loans')

const formatMoney = (value: LoanMoney) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value) || 0)

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

onMounted(() => void loadLoan())
</script>

<template>
  <section class="loan-details-page">
    <button type="button" class="back-link" @click="goBack">
      <ArrowLeft :size="15" />
      Back to Employee Loans
    </button>

    <PageHeader
      title="Employee Loan Details"
      description="Review the employee, loan terms and scheduled deduction information."
    >
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading || !loanId" @click="loadLoan">
        Refresh
      </AppButton>
    </PageHeader>

    <div v-if="loading" class="page-state" role="status">
      <span class="loader" aria-hidden="true" />
      <strong>Loading employee loan...</strong>
    </div>

    <div v-else-if="loadError" class="page-state error-state" role="alert">
      <strong>Unable to display employee loan</strong>
      <p>{{ loadError }}</p>
      <AppButton v-if="loanId" variant="secondary" :icon="RefreshCw" @click="loadLoan">Try Again</AppButton>
    </div>

    <template v-else-if="loan">
      <article class="summary-card">
        <div class="summary-icon"><WalletCards :size="24" /></div>
        <div class="summary-copy">
          <span>Loan Reference</span>
          <h2>{{ loan.loan_reference_no }}</h2>
          <p>{{ loan.loan_type?.loan_name || 'Loan type not assigned' }}</p>
        </div>
        <span class="status-pill" :class="loan.status ? 'active' : 'inactive'">
          {{ loan.status ? 'Active' : 'Inactive' }}
        </span>
      </article>

      <div class="details-grid">
        <article class="detail-card">
          <header>
            <span class="section-icon"><UserRound :size="18" /></span>
            <div><h3>Employee Information</h3><p>Employee connected to this loan record.</p></div>
          </header>
          <dl>
            <div><dt>Employee</dt><dd>{{ loan.employee?.name || 'Not available' }}</dd></div>
            <div><dt>Employee ID</dt><dd>{{ loan.employee?.emp_id ?? '—' }}</dd></div>
            <div><dt>Created By</dt><dd>{{ loan.created_by_name || '—' }}</dd></div>
          </dl>
        </article>

        <article class="detail-card">
          <header>
            <span class="section-icon"><FileText :size="18" /></span>
            <div><h3>Loan Information</h3><p>Loan category and identifying information.</p></div>
          </header>
          <dl>
            <div><dt>Loan Type</dt><dd>{{ loan.loan_type?.loan_name || '—' }}</dd></div>
            <div><dt>Loan Code</dt><dd>{{ loan.loan_type?.loan_code || '—' }}</dd></div>
            <div><dt>Provider</dt><dd>{{ loan.loan_type?.provider || '—' }}</dd></div>
          </dl>
        </article>
      </div>

      <article class="detail-card full-width">
        <header>
          <span class="section-icon"><CircleDollarSign :size="18" /></span>
          <div><h3>Loan Amounts</h3><p>Principal, payable amount, balance and scheduled deduction.</p></div>
        </header>
        <div class="amount-grid">
          <div><span>Principal Amount</span><strong>{{ formatMoney(loan.principal_amount) }}</strong></div>
          <div><span>Total Payable</span><strong>{{ formatMoney(loan.total_payable_amount) }}</strong></div>
          <div><span>Opening Balance</span><strong>{{ formatMoney(loan.opening_balance) }}</strong></div>
          <div><span>Deduction Amount</span><strong>{{ formatMoney(loan.deduction_amount) }}</strong></div>
        </div>
      </article>

      <div class="details-grid">
        <article class="detail-card">
          <header>
            <span class="section-icon"><CalendarDays :size="18" /></span>
            <div><h3>Schedule</h3><p>Loan and payroll deduction dates.</p></div>
          </header>
          <dl>
            <div><dt>Loan Date</dt><dd>{{ formatDate(loan.loan_date) }}</dd></div>
            <div><dt>Deduction Starts</dt><dd>{{ formatDate(loan.deduction_start_date) }}</dd></div>
            <div><dt>Record Created</dt><dd>{{ formatDate(loan.created_at) }}</dd></div>
          </dl>
        </article>

        <article class="detail-card">
          <header>
            <span class="section-icon"><FileText :size="18" /></span>
            <div><h3>Remarks</h3><p>Additional information attached to the loan.</p></div>
          </header>
          <p class="remarks">{{ loan.remarks || 'No remarks provided.' }}</p>
        </article>
      </div>
    </template>
  </section>
</template>

<style scoped>
.loan-details-page { width: 100%; max-width: 1320px; min-width: 0; margin: 0 auto; }
.back-link {
  display: inline-flex; align-items: center; gap: 6px; margin-bottom: 14px; padding: 0;
  border: 0; background: transparent; color: var(--primary); font-size: 12px; font-weight: 600; cursor: pointer;
}
.page-state {
  display: flex; min-height: 300px; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; padding: 28px; border: 1px solid var(--border); border-radius: 12px;
  background: var(--bg-card); color: var(--text-secondary); text-align: center;
}
.page-state strong { color: var(--text-primary); font-size: 15px; }
.page-state p { max-width: 520px; margin: 0; color: var(--text-secondary); font-size: 12px; }
.error-state strong { color: var(--red, #ef4444); }
.loader { width: 22px; height: 22px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin .75s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.summary-card, .detail-card { border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.summary-card { display: flex; align-items: center; gap: 14px; padding: 18px; margin-bottom: 14px; }
.summary-icon, .section-icon { display: grid; flex: 0 0 auto; place-items: center; background: var(--primary-soft); color: var(--primary); }
.summary-icon { width: 46px; height: 46px; border-radius: 11px; }
.summary-copy { min-width: 0; flex: 1; }
.summary-copy span { color: var(--text-muted); font-size: 11px; }
.summary-copy h2 { margin: 3px 0 0; color: var(--text-primary); font-size: 18px; }
.summary-copy p { margin: 4px 0 0; color: var(--text-secondary); font-size: 12px; }
.status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.status-pill::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.status-pill.active { background: rgb(34 197 94 / 11%); color: #22c55e; }
.status-pill.inactive { background: rgb(248 113 113 / 11%); color: #f87171; }
.details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 14px; }
.detail-card.full-width { margin-bottom: 14px; }
.detail-card header { display: flex; align-items: center; gap: 11px; padding: 15px 17px; border-bottom: 1px solid var(--border-soft); }
.section-icon { width: 36px; height: 36px; border-radius: 9px; }
.detail-card h3 { margin: 0; color: var(--text-primary); font-size: 15px; }
.detail-card header p { margin: 3px 0 0; color: var(--text-muted); font-size: 11px; }
.detail-card dl { margin: 0; padding: 5px 17px; }
.detail-card dl > div { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 12px 0; border-bottom: 1px solid var(--border-soft); }
.detail-card dl > div:last-child { border-bottom: 0; }
.detail-card dt { color: var(--text-muted); font-size: 12px; }
.detail-card dd { margin: 0; color: var(--text-primary); font-size: 13px; font-weight: 600; text-align: right; }
.amount-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; padding: 17px; }
.amount-grid > div { padding: 14px; border: 1px solid var(--border-soft); border-radius: 9px; background: var(--bg-card-soft); }
.amount-grid span { display: block; color: var(--text-muted); font-size: 11px; }
.amount-grid strong { display: block; margin-top: 6px; color: var(--text-primary); font-size: 15px; font-variant-numeric: tabular-nums; }
.remarks { min-height: 96px; margin: 0; padding: 17px; color: var(--text-primary); font-size: 13px; line-height: 1.7; white-space: pre-wrap; }
@media (max-width: 900px) { .amount-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 650px) {
  .summary-card { align-items: flex-start; flex-wrap: wrap; }
  .summary-copy { min-width: calc(100% - 60px); }
  .details-grid, .amount-grid { grid-template-columns: 1fr; }
  .detail-card dl > div { align-items: flex-start; flex-direction: column; gap: 5px; }
  .detail-card dd { text-align: left; }
}
@media (prefers-reduced-motion: reduce) { .loader { animation: none; } }
</style>
