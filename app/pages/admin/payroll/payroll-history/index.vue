<script setup lang="ts">
import { Banknote, FileText, ReceiptText, RefreshCw, Wallet } from 'lucide-vue-next'
import PayrollHistoryPeriodTable from '~/components/admin/payroll/payroll-history/PayrollHistoryPeriodTable.vue'
import BaseTableFooter from '~/components/shared-table/BaseTableFooter.vue'
import { payrollHistoryError, usePayrollHistory } from '~/composables/admin/payroll/payroll-history/usePayrollHistory'
import type { PayrollHistoryListData, PayrollHistoryPeriodRow } from '~/types/payroll/payroll-history/payrollHistory'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Payroll History | Admin — RWorkCentral' })

const route = useRoute()
const router = useRouter()
const api = usePayrollHistory()

const result = ref<PayrollHistoryListData | null>(null)
const loading = ref(false)
const loadError = ref('')

const year = ref<number | null>(route.query.year ? Number(route.query.year) : null)
const status = ref<'' | 'processing' | 'closed'>('')
const page = ref(1)
const perPage = 20

const rows = computed(() => result.value?.periods ?? [])
const meta = computed(() => result.value?.meta)
const summary = computed(() => result.value?.summary)
const years = computed(() => result.value?.years ?? [])

const money = (value: number | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value ?? 0)

const stats = computed(() => [
  { label: 'Payroll Records', value: String(summary.value?.employees ?? 0), note: `${meta.value?.total ?? 0} period(s)`, icon: FileText, tone: 'blue' },
  { label: 'Total Gross Pay', value: money(summary.value?.gross_pay), note: year.value ? `In ${year.value}` : 'All years', icon: Banknote, tone: 'violet' },
  { label: 'Total Deductions', value: money(summary.value?.total_deductions), note: `Tax ${money(summary.value?.withholding_tax)}`, icon: ReceiptText, tone: 'amber' },
  { label: 'Total Net Pay', value: money(summary.value?.net_pay), note: `${summary.value?.payslips_sent ?? 0} payslip(s) sent`, icon: Wallet, tone: 'green' },
])

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    result.value = await api.list({ year: year.value, status: status.value, page: page.value, per_page: perPage })
  } catch (cause) {
    loadError.value = payrollHistoryError(cause, 'Unable to load payroll history.')
  } finally {
    loading.value = false
  }
}

// Filters go back to page 1
watch([year, status], () => {
  router.replace({ query: { ...route.query, year: year.value ? String(year.value) : undefined } })
  if (page.value !== 1) page.value = 1
  else void load()
})
watch(page, () => void load())
onMounted(() => void load())

const showingFrom = computed(() => meta.value?.total ? (meta.value.current_page - 1) * meta.value.per_page + 1 : 0)
const showingTo = computed(() => meta.value ? Math.min(meta.value.current_page * meta.value.per_page, meta.value.total) : 0)

const openPeriod = (row: PayrollHistoryPeriodRow) =>
  navigateTo({ path: '/admin/payroll/payroll-history/show', query: { id: String(row.period.id) } })

const resetFilters = () => {
  year.value = null
  status.value = ''
}
</script>

<template>
  <section class="history-page">
    <PageHeader
      title="Payroll History"
      description="Every payroll period that has been generated, with its totals. Open a period for each group and employee."
    >
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="load">
        {{ loading ? 'Refreshing…' : 'Refresh' }}
      </AppButton>
    </PageHeader>

    <div v-if="loadError" class="alert" role="alert">
      {{ loadError }}
      <AppButton variant="secondary" size="sm" :disabled="loading" @click="load">Retry</AppButton>
    </div>

    <div class="stats">
      <div v-for="stat in stats" :key="stat.label" class="stat">
        <span class="stat-icon" :class="`stat-icon--${stat.tone}`"><component :is="stat.icon" :size="18" /></span>
        <div>
          <small>{{ stat.label }}</small>
          <strong>{{ stat.value }}</strong>
          <em>{{ stat.note }}</em>
        </div>
      </div>
    </div>

    <PayrollHistoryPeriodTable :rows="rows" :loading="loading && !rows.length" @view="openPeriod">
      <template #toolbar>
        <select v-model="year" class="table-filter" aria-label="Year">
          <option :value="null">All years</option>
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <select v-model="status" class="table-filter" aria-label="Period status">
          <option value="">All statuses</option>
          <option value="processing">Processing (draft payroll)</option>
          <option value="closed">Closed (finalized)</option>
        </select>
        <AppButton variant="secondary" @click="resetFilters">Reset</AppButton>
      </template>

      <template #bottom>
        <div class="footer-wrap">
          <BaseTableFooter
            v-model="page"
            :showing-from="showingFrom"
            :showing-to="showingTo"
            :total-items="meta?.total ?? 0"
            :total-pages="meta?.last_page ?? 1"
            item-label="periods"
          />
        </div>
      </template>
    </PayrollHistoryPeriodTable>
  </section>
</template>

<style scoped>
.history-page { width: 100%; min-width: 0; }
.alert { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; padding: 11px 14px; border-radius: 8px; background: rgb(248 113 113 / 10%); color: #f87171; font-size: 12px; }
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
.stat { display: flex; align-items: center; gap: 14px; padding: 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); }
.stat small { display: block; color: var(--text-secondary); font-size: 11px; }
.stat strong { display: block; margin-top: 4px; color: var(--text-primary); font-size: 20px; }
.stat em { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; font-style: normal; }
.stat-icon { display: grid; flex-shrink: 0; width: 40px; height: 40px; place-items: center; border-radius: 10px; }
.stat-icon--blue { background: rgb(59 130 246 / 12%); color: #60a5fa; }
.stat-icon--violet { background: rgb(139 92 246 / 12%); color: #a78bfa; }
.stat-icon--amber { background: rgb(245 158 11 / 12%); color: #fbbf24; }
.stat-icon--green { background: rgb(34 197 94 / 12%); color: #4ade80; }
.table-filter { min-height: 38px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 12px; }
.footer-wrap { padding: 0 16px 14px; }
@media (max-width: 1100px) { .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .stats { grid-template-columns: 1fr; } }
</style>
