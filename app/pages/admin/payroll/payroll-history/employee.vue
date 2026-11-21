<script setup lang="ts">
import { ArrowLeft, RefreshCw } from 'lucide-vue-next'
import PayrollHistoryPayrollTable from '~/components/admin/payroll/payroll-history/PayrollHistoryPayrollTable.vue'
import { payrollHistoryError, usePayrollHistory } from '~/composables/admin/payroll/payroll-history/usePayrollHistory'
import type { PayrollHistoryEmployeeData } from '~/types/payroll/payroll-history/payrollHistory'

// /admin/payroll/payroll-history/employee?id=9
definePageMeta({ layout: 'admin' })
useHead({ title: 'Employee Payroll History | Admin — RWorkCentral' })

const route = useRoute()
const router = useRouter()
const api = usePayrollHistory()

const employeeId = computed(() => {
  const id = Number(route.query.id)
  return Number.isInteger(id) && id > 0 ? id : null
})

const data = ref<PayrollHistoryEmployeeData | null>(null)
const loading = ref(false)
const loadError = ref('')

const thisYear = new Date().getFullYear()
const year = ref<number | null>(null)
const yearOptions = Array.from({ length: 6 }, (_, index) => thisYear - index)

const load = async () => {
  if (!employeeId.value) {
    loadError.value = 'A valid employee is required.'
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    data.value = await api.employee(employeeId.value, year.value)
  } catch (cause) {
    loadError.value = payrollHistoryError(cause, "Unable to load this employee's payroll history.")
  } finally {
    loading.value = false
  }
}

watch(year, () => void load())
onMounted(() => void load())

const money = (value: number | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value ?? 0)

const totals = computed(() => data.value?.totals)

const amounts = computed(() => [
  { label: 'Gross Pay', value: money(totals.value?.gross_pay) },
  { label: 'Contributions', value: money(totals.value?.contributions), minus: true },
  { label: 'Loans', value: money(totals.value?.loan_deductions), minus: true },
  { label: 'Withholding Tax', value: money(totals.value?.withholding_tax), minus: true },
  { label: 'Total Deductions', value: money(totals.value?.total_deductions), minus: true },
  { label: 'Net Pay', value: money(totals.value?.net_pay), net: true },
])

// Back to the period this page was opened from (browser history), else the list
const goBack = () => (window.history.length > 1 ? router.back() : navigateTo('/admin/payroll/payroll-history'))
</script>

<template>
  <section class="history-page">
    <button type="button" class="back-link" @click="goBack"><ArrowLeft :size="15" /> Back</button>

    <PageHeader
      :title="data?.employee.name || 'Employee Payroll History'"
      :description="data ? `${data.employee.emp_id ?? '—'}${data.employee.department ? ` · ${data.employee.department}` : ''} · payroll across all periods` : 'Payroll across all periods.'"
    >
      <select v-model="year" class="table-filter" aria-label="Year">
        <option :value="null">All years</option>
        <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
      </select>
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading || !employeeId" @click="load">Refresh</AppButton>
    </PageHeader>

    <div v-if="loadError" class="alert" role="alert">
      {{ loadError }}
      <AppButton v-if="employeeId" variant="secondary" size="sm" :disabled="loading" @click="load">Retry</AppButton>
    </div>

    <div v-if="loading && !data" class="state">Loading payroll history…</div>

    <template v-if="data">
      <article class="card">
        <div class="card-head">
          <h3>{{ year ? `${year} Totals` : 'All-time Totals' }}</h3>
          <p>{{ totals?.payroll_count ?? 0 }} finalized payroll(s). Draft payrolls are not counted because they can still change.</p>
        </div>
        <div class="amounts">
          <div v-for="item in amounts" :key="item.label" :class="{ net: item.net }">
            <span>{{ item.label }}</span>
            <strong :class="{ minus: item.minus }">{{ item.minus ? '− ' : '' }}{{ item.value }}</strong>
          </div>
        </div>
      </article>

      <PayrollHistoryPayrollTable
        mode="periods"
        title="Payroll by Period"
        description="Newest first. Includes draft payrolls."
        :rows="data.payrolls"
        :loading="loading"
      />
    </template>
  </section>
</template>

<style scoped>
.history-page { width: 100%; min-width: 0; }
.back-link { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 14px; padding: 0; border: 0; background: transparent; color: var(--primary); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.alert { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; padding: 11px 14px; border-radius: 8px; background: rgb(248 113 113 / 10%); color: #f87171; font-size: 12px; }
.state { padding: 40px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-secondary); font-size: 12px; text-align: center; }
.card { margin-bottom: 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.card-head { padding: 15px 17px; border-bottom: 1px solid var(--border-soft); }
.card-head h3 { margin: 0; color: var(--text-primary); font-size: 15px; }
.card-head p { margin: 4px 0 0; color: var(--text-muted); font-size: 12px; }
.amounts { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; padding: 17px; }
.amounts > div { padding: 13px; border: 1px solid var(--border-soft); border-radius: 9px; background: var(--bg-card-soft); }
.amounts > div.net { border-color: rgb(34 197 94 / 30%); background: rgb(34 197 94 / 7%); }
.amounts span { display: block; color: var(--text-muted); font-size: 11px; }
.amounts strong { display: block; margin-top: 6px; color: var(--text-primary); font-size: 15px; font-variant-numeric: tabular-nums; }
.amounts .net strong { color: #22c55e; }
.minus { color: #f87171 !important; }
.table-filter { min-height: 38px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 12px; }
@media (max-width: 1200px) { .amounts { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 640px) { .amounts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
