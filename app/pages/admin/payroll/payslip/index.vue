<script setup lang="ts">
import { Eye, Printer, X } from 'lucide-vue-next'
import PayslipDocument from '~/components/admin/payroll/payslip/PayslipDocument.vue'
import type { Payslip, PayslipListItem, PayslipPeriod } from '~/types/payroll/payslip/payslip'

const route = useRoute()
const router = useRouter()

const periodApi = usePayrollPeriod()
const payslipApi = usePayslip()

const { periods } = periodApi
const { loadingList, loadingPayslip } = payslipApi

const periodId = ref<number | null>(route.query.period ? Number(route.query.period) : null)
const period = ref<PayslipPeriod | null>(null)
const payslips = ref<PayslipListItem[]>([])
const selected = ref<Payslip | null>(null)
const errorMessage = ref('')

const search = ref('')
const page = ref(1)
const perPage = 10

// Only closed (finalized) periods have payslips
const closedPeriods = computed(() =>
  periods.value.filter(p => String(p.status ?? '').toLowerCase() === 'closed'),
)

const money = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value ?? 0))

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return payslips.value

  return payslips.value.filter(p =>
    `${p.emp_id ?? ''} ${p.name} ${p.department ?? ''} ${p.payslip_no}`.toLowerCase().includes(term),
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const visible = computed(() => filtered.value.slice((page.value - 1) * perPage, page.value * perPage))
const showingFrom = computed(() => (page.value - 1) * perPage + 1)
const showingTo = computed(() => Math.min(page.value * perPage, filtered.value.length))

const loadPayslips = async () => {
  errorMessage.value = ''
  payslips.value = []
  period.value = null

  if (!periodId.value) return

  try {
    const data = await payslipApi.fetchPayslips(periodId.value)
    period.value = data.period
    payslips.value = data.payslips
  } catch (err) {
    errorMessage.value = payslipApi.getErrorMessage(err)
  }
}

const openPayslip = async (row: PayslipListItem) => {
  errorMessage.value = ''

  try {
    selected.value = await payslipApi.fetchPayslip(row.payroll_id)
  } catch (err) {
    errorMessage.value = payslipApi.getErrorMessage(err)
  }
}

const printPayslip = () => window.print()

watch(periodId, () => {
  page.value = 1
  router.replace({ query: { ...route.query, period: periodId.value ? String(periodId.value) : undefined } })
  void loadPayslips()
})

watch(search, () => {
  page.value = 1
})

const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') selected.value = null
}

onMounted(async () => {
  window.addEventListener('keydown', onKey)

  try {
    await periodApi.fetchPeriods()
  } catch (err) {
    errorMessage.value = payslipApi.getErrorMessage(err)
  }

  if (periodId.value) {
    await loadPayslips()
    return
  }

  periodId.value = closedPeriods.value[0]?.id ?? null
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <section class="payslip-page">
    <PageHeader
      title="Payslips"
      description="Payslips of finalized payroll periods. Open one to view or print it."
    />

    <div v-if="errorMessage" class="alert">{{ errorMessage }}</div>

    <BaseDataTable
      title="Employee Payslips"
      :description="period ? `${period.period_name ?? 'Payroll period'} · paid ${period.payment_date ?? '—'}` : 'Select a finalized payroll period.'"
      :has-rows="visible.length > 0"
      :loading="loadingList"
      min-width="900px"
      :empty-title="closedPeriods.length ? 'No payslips found' : 'No finalized payroll yet'"
      :empty-description="closedPeriods.length ? 'Try another period or search.' : 'Finalize a payroll period in Payroll Readiness first.'"
    >
      <template #toolbar>
        <input
          v-model="search"
          type="search"
          class="table-search"
          placeholder="Search employee, ID or payslip no."
          aria-label="Search payslips"
        >

        <select v-model="periodId" class="table-filter" aria-label="Payroll period">
          <option :value="null" disabled>Select period</option>
          <option v-for="p in closedPeriods" :key="p.id" :value="p.id">
            {{ p.period_name || `Payroll Period #${p.id}` }}
          </option>
        </select>
      </template>

      <template #headers>
        <th>Employee</th>
        <th>Payslip No.</th>
        <th>Department</th>
        <th class="num">Gross Pay</th>
        <th class="num">Deductions</th>
        <th class="num">Net Pay</th>
        <th class="text-right">Action</th>
      </template>

      <template #rows>
        <tr v-for="row in visible" :key="row.payroll_id" class="clickable" @click="openPayslip(row)">
          <td>
            <strong>{{ row.name }}</strong>
            <small class="sub">{{ row.emp_id }}<template v-if="row.payroll_group"> · {{ row.payroll_group }}</template></small>
          </td>
          <td>{{ row.payslip_no }}</td>
          <td>{{ row.department ?? '—' }}</td>
          <td class="num">{{ money(row.gross_pay) }}</td>
          <td class="num minus">− {{ money(row.total_deductions) }}</td>
          <td class="num"><strong class="net">{{ money(row.net_pay) }}</strong></td>
          <td class="text-right">
            <button
              type="button"
              class="view-btn"
              :disabled="loadingPayslip"
              :aria-label="`View payslip of ${row.name}`"
              @click.stop="openPayslip(row)"
            >
              <Eye :size="15" />
            </button>
          </td>
        </tr>
      </template>

      <template #bottom>
        <div class="footer-wrap">
          <BaseTableFooter
            v-model="page"
            :showing-from="showingFrom"
            :showing-to="showingTo"
            :total-items="filtered.length"
            :total-pages="totalPages"
            item-label="payslips"
          />
        </div>
      </template>
    </BaseDataTable>

    <!-- PAYSLIP VIEWER -->
    <Teleport to="body">
      <div v-if="selected" class="ps-overlay" @click.self="selected = null">
        <div class="ps-dialog" role="dialog" aria-modal="true" aria-label="Payslip">
          <div class="ps-toolbar">
            <strong>{{ selected.employee.name }} · {{ selected.payslip_no }}</strong>
            <div class="ps-actions">
              <AppButton :icon="Printer" @click="printPayslip">Print</AppButton>
              <button type="button" class="ps-close" aria-label="Close" @click="selected = null">
                <X :size="17" />
              </button>
            </div>
          </div>

          <div class="ps-scroll">
            <div class="payslip-print">
              <PayslipDocument :payslip="selected" />
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.payslip-page { width: 100%; min-width: 0; }

.alert { margin-bottom: 12px; padding: 11px 14px; border-radius: 8px; background: rgb(248 113 113 / 10%); color: #f87171; font-size: 12px; }

.num { text-align: right; white-space: nowrap; }
.minus { color: #f87171 !important; }
.net { color: #22c55e !important; }
.clickable { cursor: pointer; }
.sub { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; }
.footer-wrap { padding: 0 16px 14px; }

.view-btn { display: inline-grid; width: 30px; height: 30px; place-items: center; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.view-btn:hover { color: var(--primary); border-color: var(--primary); }
</style>

<style>
.ps-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0, 0, 0, .65); backdrop-filter: blur(3px); }
.ps-dialog { display: flex; width: 100%; max-width: 860px; max-height: calc(100vh - 40px); flex-direction: column; overflow: hidden; border: 1px solid var(--border); border-radius: 14px; background: var(--bg-card-soft, var(--bg-card)); }
.ps-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--border-soft); color: var(--text-primary); font-size: 13px; }
.ps-actions { display: flex; align-items: center; gap: 10px; }
.ps-close { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; }
.ps-scroll { padding: 18px; overflow-y: auto; }

/* Print only the payslip */
@media print {
  body * { visibility: hidden !important; }
  .payslip-print, .payslip-print * { visibility: visible !important; }
  .payslip-print { position: absolute; top: 0; left: 0; width: 100%; }
  .ps-overlay { position: static; background: none; backdrop-filter: none; }
}
</style>