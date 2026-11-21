<script setup lang="ts">
import { ArrowLeft, RefreshCw, Users } from 'lucide-vue-next'
import PayrollHistoryPayrollTable from '~/components/admin/payroll/payroll-history/PayrollHistoryPayrollTable.vue'
import { payrollHistoryError, usePayrollHistory } from '~/composables/admin/payroll/payroll-history/usePayrollHistory'
import type { PayrollHistoryPayrollRow, PayrollHistoryPeriodDetail } from '~/types/payroll/payroll-history/payrollHistory'

// /admin/payroll/payroll-history/show?id=1
definePageMeta({ layout: 'admin' })
useHead({ title: 'Payroll Period History | Admin — RWorkCentral' })

const BASE = '/admin/payroll/payroll-history'

const route = useRoute()
const api = usePayrollHistory()

const periodId = computed(() => {
  const id = Number(route.query.id)
  return Number.isInteger(id) && id > 0 ? id : null
})

const detail = ref<PayrollHistoryPeriodDetail | null>(null)
const loading = ref(false)
const loadError = ref('')

// Employee filters (sent to the API)
const groupId = ref<number | null>(null)
const status = ref<'' | 'draft' | 'finalized'>('')
const search = ref('')

const load = async () => {
  if (!periodId.value) {
    loadError.value = 'A valid payroll period is required.'
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    detail.value = await api.period(periodId.value, {
      payroll_group_id: groupId.value,
      status: status.value,
      search: search.value.trim(),
    })
  } catch (cause) {
    loadError.value = payrollHistoryError(cause, 'Unable to load this payroll period.')
  } finally {
    loading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch([groupId, status], () => void load())
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => void load(), 350)
})
onMounted(() => void load())
onBeforeUnmount(() => clearTimeout(searchTimer))

const money = (value: number | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value ?? 0)

const shortDate = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const period = computed(() => detail.value?.period)
const totals = computed(() => detail.value?.totals)

const amounts = computed(() => [
  { label: 'Gross Pay', value: money(totals.value?.gross_pay) },
  { label: 'Contributions', value: money(totals.value?.contributions_total), minus: true },
  { label: 'Loans', value: money(totals.value?.loan_deductions_total), minus: true },
  { label: 'Withholding Tax', value: money(totals.value?.withholding_tax), minus: true },
  { label: 'Total Deductions', value: money(totals.value?.total_deductions), minus: true },
  { label: 'Net Pay', value: money(totals.value?.net_pay), net: true },
])

const openEmployee = (row: PayrollHistoryPayrollRow) =>
  navigateTo({ path: `${BASE}/employee`, query: { id: String(row.employee.id) } })

const resetFilters = () => {
  groupId.value = null
  status.value = ''
  search.value = ''
}
</script>

<template>
  <section class="history-page">
    <NuxtLink :to="BASE" class="back-link"><ArrowLeft :size="15" /> Back to Payroll History</NuxtLink>

    <PageHeader
      :title="period?.period_name || 'Payroll Period'"
      :description="period ? `Cutoff ${period.cutoff_number} · ${shortDate(period.cutoff_start)} – ${shortDate(period.cutoff_end)} · Pay on ${shortDate(period.payment_date)}` : 'Totals per payroll group and every employee\'s payroll.'"
    >
      <StatusBadge v-if="period" :status="period.status" />
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading || !periodId" @click="load">Refresh</AppButton>
    </PageHeader>

    <div v-if="loadError" class="alert" role="alert">
      {{ loadError }}
      <AppButton v-if="periodId" variant="secondary" size="sm" :disabled="loading" @click="load">Retry</AppButton>
    </div>

    <div v-if="loading && !detail" class="state">Loading payroll period…</div>

    <template v-if="detail">
      <!-- Period totals -->
      <article class="card">
        <div class="card-head">
          <div>
            <h3>Period Totals</h3>
            <p>
              {{ totals?.employees ?? 0 }} employee(s) · {{ totals?.finalized ?? 0 }} finalized
              <template v-if="totals?.draft"> · {{ totals.draft }} draft</template>
              · {{ totals?.payslips_sent ?? 0 }} payslip(s) sent
              <template v-if="totals?.finalized_at"> · finalized {{ shortDate(totals.finalized_at) }}</template>
            </p>
          </div>
        </div>
        <div class="amounts">
          <div v-for="item in amounts" :key="item.label" :class="{ net: item.net }">
            <span>{{ item.label }}</span>
            <strong :class="{ minus: item.minus }">{{ item.minus ? '− ' : '' }}{{ item.value }}</strong>
          </div>
        </div>
      </article>

      <!-- Per payroll group -->
      <article v-if="detail.by_group.length" class="card">
        <div class="card-head">
          <div>
            <h3><Users :size="16" /> By Payroll Group</h3>
            <p>Click a group to show only its employees below.</p>
          </div>
        </div>
        <div class="groups">
          <button
            v-for="group in detail.by_group"
            :key="group.payroll_group_id"
            type="button"
            class="group"
            :class="{ active: groupId === group.payroll_group_id }"
            @click="groupId = groupId === group.payroll_group_id ? null : group.payroll_group_id"
          >
            <strong>{{ group.group_name }}</strong>
            <span>{{ group.totals.employees }} employee(s)</span>
            <span>Gross {{ money(group.totals.gross_pay) }}</span>
            <span class="net-text">Net {{ money(group.totals.net_pay) }}</span>
          </button>
        </div>
      </article>

      <!-- Employees -->
      <PayrollHistoryPayrollTable
        mode="employees"
        title="Employee Payroll"
        description="Every employee's payroll in this period. Open History for an employee's payroll across periods."
        :rows="detail.employees"
        :loading="loading"
        @open="openEmployee"
      >
        <template #toolbar>
          <input v-model="search" type="search" class="table-search" placeholder="Search employee name or ID" aria-label="Search employees">
          <select v-model="groupId" class="table-filter" aria-label="Payroll group">
            <option :value="null">All payroll groups</option>
            <option v-for="group in detail.by_group" :key="group.payroll_group_id" :value="group.payroll_group_id">{{ group.group_name }}</option>
          </select>
          <select v-model="status" class="table-filter" aria-label="Payroll status">
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="finalized">Finalized</option>
          </select>
          <AppButton variant="secondary" @click="resetFilters">Reset</AppButton>
        </template>
      </PayrollHistoryPayrollTable>
    </template>
  </section>
</template>

<style scoped>
.history-page { width: 100%; min-width: 0; }
.back-link { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 14px; color: var(--primary); font-size: 12px; font-weight: 600; text-decoration: none; }
.alert { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; padding: 11px 14px; border-radius: 8px; background: rgb(248 113 113 / 10%); color: #f87171; font-size: 12px; }
.state { padding: 40px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-secondary); font-size: 12px; text-align: center; }
.card { margin-bottom: 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.card-head { padding: 15px 17px; border-bottom: 1px solid var(--border-soft); }
.card-head h3 { display: flex; align-items: center; gap: 8px; margin: 0; color: var(--text-primary); font-size: 15px; }
.card-head h3 svg { color: var(--primary); }
.card-head p { margin: 4px 0 0; color: var(--text-muted); font-size: 12px; }
.amounts { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; padding: 17px; }
.amounts > div { padding: 13px; border: 1px solid var(--border-soft); border-radius: 9px; background: var(--bg-card-soft); }
.amounts > div.net { border-color: rgb(34 197 94 / 30%); background: rgb(34 197 94 / 7%); }
.amounts span { display: block; color: var(--text-muted); font-size: 11px; }
.amounts strong { display: block; margin-top: 6px; color: var(--text-primary); font-size: 15px; font-variant-numeric: tabular-nums; }
.amounts .net strong { color: #22c55e; }
.minus { color: #f87171 !important; }
.groups { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; padding: 17px; }
.group { display: flex; flex-direction: column; gap: 4px; padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card-soft); color: var(--text-secondary); font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
.group strong { color: var(--text-primary); font-size: 13px; }
.group:hover, .group.active { border-color: var(--primary); }
.group.active { background: var(--primary-soft); }
.net-text { color: #22c55e; font-weight: 600; }
.table-search { min-width: 220px; min-height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 12px; }
.table-filter { min-height: 38px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 12px; }
@media (max-width: 1200px) { .amounts { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 640px) { .amounts { grid-template-columns: repeat(2, minmax(0, 1fr)); } .table-search { min-width: 0; width: 100%; } }
</style>
