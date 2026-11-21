<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import LoanTable from '~/components/employee/loans/LoanTable.vue'
import { employeeLoanError, useEmployeePortalLoans } from '~/composables/employee/loans/useEmployeePortalLoans'
import type { EmployeeLoanListData, EmployeeLoanRecord } from '~/types/employee/loans/loans'

definePageMeta({ layout: false, middleware: 'employee' })
useHead({ title: 'Loans | Employee Portal — RWorkCentral' })

const api = useEmployeePortalLoans()

const result = ref<EmployeeLoanListData | null>(null)
const loading = ref(false)
const loadError = ref('')

const loans = computed(() => result.value?.loans ?? [])

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)

const stats = computed(() => {
  const totals = result.value?.totals
  return [
    { label: 'Active Loans', value: String(totals?.active_count ?? 0), note: `${totals?.count ?? 0} loan(s) on record` },
    { label: 'Outstanding Balance', value: money(totals?.outstanding ?? 0), note: `${money(totals?.paid ?? 0)} paid so far` },
    { label: 'Deduction per Payroll', value: money(totals?.installment_per_payroll ?? 0), note: 'All active loans together' },
  ]
})

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    result.value = await api.list()
  } catch (cause) {
    loadError.value = employeeLoanError(cause, 'Your loans could not be loaded.')
  } finally {
    loading.value = false
  }
}

onMounted(() => void load())

// Full loan terms and payment history are on their own page
const openLoan = (loan: EmployeeLoanRecord) =>
  navigateTo({ path: '/employee/loans/show', query: { id: String(loan.id) } })
</script>

<template>
  <section class="loans-page">
    <header class="page-header">
      <div>
        <h1>Loans</h1>
        <p>Your loan balances and payments. Loans are set up by HR and paid through payroll deductions.</p>
      </div>
      <button type="button" class="secondary-button" :disabled="loading" @click="load">
        <RefreshCw :size="15" :class="{ spin: loading }" /> Refresh
      </button>
    </header>

    <p v-if="loadError" class="error-message" role="alert">
      {{ loadError }} <button type="button" @click="load">Retry</button>
    </p>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <span>{{ stat.label }}</span><strong>{{ stat.value }}</strong><small>{{ stat.note }}</small>
      </div>
    </div>

    <article class="table-card">
      <div class="table-header">
        <div>
          <h2>Loan History</h2>
          <p>Open a loan for its terms, next due date and payment history.</p>
        </div>
        <span class="read-only">Read-only</span>
      </div>
      <LoanTable :loans="loans" :loading="loading && !loans.length" @view="openLoan" />
    </article>

    <p class="source-note">For corrections or questions about a loan, contact HR or Finance.</p>
  </section>
</template>

<style scoped>
/* Same frame as the other employee pages (e.g. Time Log Correction) */
.loans-page { max-width: 1660px; margin: 0 auto; color: var(--text-primary); }
.page-header, .table-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.page-header { align-items: flex-start; margin-bottom: 22px; }
h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }
h2 { margin: 0 0 6px; font-size: 15px; }
p { margin: 0; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.secondary-button { display: inline-flex; align-items: center; gap: 8px; min-height: 41px; padding: 10px 17px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-card); color: var(--text-primary); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.secondary-button:disabled { opacity: .55; cursor: wait; }
.error-message { margin-bottom: 15px; padding: 12px 15px; border-radius: 9px; background: var(--red-soft, #fee2e2); color: var(--red, #b91c1c); }
.error-message button { margin-left: 8px; padding: 3px 10px; border: 1px solid currentColor; border-radius: 6px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
.read-only { padding: 6px 10px; border: 1px solid var(--border); border-radius: 20px; color: var(--text-muted); font-size: 11px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-bottom: 18px; }
.stat-card { display: flex; flex-direction: column; gap: 7px; min-height: 102px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.stat-card span { color: var(--text-secondary); font-size: 11px; }
.stat-card strong { color: var(--primary); font-size: 24px; line-height: 1.2; overflow-wrap: anywhere; }
.stat-card small { color: var(--text-muted); font-size: 10px; }
.table-card { overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); box-shadow: var(--shadow); }
.table-header { padding: 18px; }
.source-note { margin-top: 14px; color: var(--text-muted); font-size: 11px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }

@media (max-width: 640px) {
  h1 { font-size: 22px; line-height: 1.3; }
  .page-header { flex-wrap: wrap; gap: 14px; }
  .page-header .secondary-button { width: 100%; justify-content: center; }
  .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-card { min-height: 90px; padding: 10px; }
  .stat-card:last-child { grid-column: 1 / -1; }
  .stat-card strong { font-size: 19px; }
  .table-header { padding: 14px; }
}
</style>
