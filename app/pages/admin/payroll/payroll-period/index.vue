<script setup lang="ts">
import { ArrowLeft, Download, Plus, X } from 'lucide-vue-next'
import EmployeePayPeriodStats from '~/components/admin/payroll/payroll-periods/EmployeePayPeriodStats.vue'
import EmployeePayPeriodFilters from '~/components/admin/payroll/payroll-periods/EmployeePayPeriodFilters.vue'
import EmployeePayPeriodTable from '~/components/admin/payroll/payroll-periods/EmployeePayPeriodTable.vue'
import EmployeePayPeriodFormModal from '~/components/admin/payroll/payroll-periods/EmployeePayPeriodFormModal.vue'
import type {
  PayrollPeriod,
  PayrollPeriodFormData,
  PayrollPeriodFormValue,
  PayrollPeriodPayload,
} from '~/types/payroll/payroll-periods/payrollPeriod'

const router = useRouter()
const { success, error: showError } = useToast()

const api = usePayrollPeriod()
const { periods, stats, years, loading, saving, error: loadError } = api

const search = ref('')
const status = ref('')
const year = ref('')
const month = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const perPage = 6

const formOpen = ref(false)
const editingPeriod = ref<PayrollPeriod | null>(null)
const viewingPeriod = ref<PayrollPeriod | null>(null)

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const periodName = (period: PayrollPeriod) =>
  period.period_name || period.label || `Payroll Period #${period.id}`

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date)
}

const loadPeriods = async () => {
  try {
    await api.fetchPeriods()
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  } catch {
    showError('Payroll Periods Unavailable', loadError.value || 'Request failed.')
  }
}

onMounted(() => { void loadPeriods() })

const statusOptions = computed(() =>
  [...new Set(periods.value.map(item => item.status))].sort(),
)

const monthOptions = computed(() =>
  monthNames.filter((_, index) =>
    periods.value.some(item => Number(item.cutoff_start?.slice(5, 7)) === index + 1),
  ),
)

const filteredPeriods = computed(() =>
  api.filterPeriods({
    search: search.value,
    status: status.value,
    year: year.value,
    month: month.value ? monthNames.indexOf(month.value) + 1 : null,
    date_from: dateFrom.value,
    date_to: dateTo.value,
  }),
)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPeriods.value.length / perPage)))
const showingFrom = computed(() => filteredPeriods.value.length ? (currentPage.value - 1) * perPage + 1 : 0)
const showingTo = computed(() => Math.min(currentPage.value * perPage, filteredPeriods.value.length))
const paginatedPeriods = computed(() =>
  filteredPeriods.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage),
)

watch([search, status, year, month, dateFrom, dateTo], () => { currentPage.value = 1 })

const resetFilters = () => {
  search.value = ''
  status.value = ''
  year.value = ''
  month.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
}

const editingFormValue = computed<PayrollPeriodFormValue | null>(() => {
  const p = editingPeriod.value
  if (!p) return null

  return {
    id: p.id,
    periodName: p.period_name ?? '',
    cutoffNumber: p.cutoff_number,
    cutoffStart: p.cutoff_start,
    cutoffEnd: p.cutoff_end,
    paymentDate: p.payment_date,
    status: p.status,
  }
})

const handleCreate = () => {
  editingPeriod.value = null
  formOpen.value = true
}

const handleEdit = (period: PayrollPeriod) => {
  editingPeriod.value = period
  formOpen.value = true
}

const toPayload = (form: PayrollPeriodFormData): PayrollPeriodPayload => ({
  period_name: form.periodName,
  cutoff_number: form.cutoffNumber
    ?? (Number(form.cutoffStart.slice(8, 10)) <= 15 ? 1 : 2),
  cutoff_start: form.cutoffStart,
  cutoff_end: form.cutoffEnd,
  payment_date: form.paymentDate,
})

const handleSave = async (form: PayrollPeriodFormData) => {
  if (saving.value) return

  const isEditing = editingPeriod.value !== null

  try {
    const response = isEditing
      ? await api.updatePeriod(editingPeriod.value!.id, toPayload(form))
      : await api.createPeriod(toPayload(form))

    formOpen.value = false
    editingPeriod.value = null

    success(
      isEditing ? 'Payroll Period Updated' : 'Payroll Period Created',
      response.message || 'Payroll period saved successfully.',
    )
  } catch (problem) {
    showError('Unable to Save Payroll Period', api.getErrorMessage(problem))
  }
}

const handleView = async (period: PayrollPeriod) => {
  try {
    viewingPeriod.value = await api.fetchPeriod(period.id)
  } catch (problem) {
    showError('Unable to View Payroll Period', api.getErrorMessage(problem))
  }
}

const handleDelete = async (period: PayrollPeriod) => {
  if (saving.value) return

  const confirmed = window.confirm(
    `Delete "${periodName(period)}"?\n\nThis action cannot be undone.`,
  )

  if (!confirmed) return

  try {
    const response = await api.deletePeriod(period.id)
    success('Payroll Period Deleted', response.message || 'Payroll period deleted successfully.')
  } catch (problem) {
    showError('Unable to Delete Payroll Period', api.getErrorMessage(problem))
  }
}

const handleExport = () => {
  const rows = [
    ['ID', 'Period Name', 'Cutoff', 'Cutoff Start', 'Cutoff End', 'Payment Date', 'Status'],
    ...filteredPeriods.value.map(item => [
      String(item.id),
      periodName(item),
      String(item.cutoff_number),
      item.cutoff_start,
      item.cutoff_end,
      item.payment_date,
      item.status,
    ]),
  ]

  const csv = rows
    .map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = 'payroll-periods.csv'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="payroll-periods-page">
    <button type="button" class="back-button" @click="router.push('/admin/payroll')">
      <ArrowLeft :size="15" />
      Back to Payroll
    </button>

    <PageHeader
      title="Payroll Periods"
      description="Create and manage company payroll cutoff schedules, payment dates and payroll periods."
    >
      <div class="header-actions">
        <AppButton variant="secondary" :icon="Download" @click="handleExport">
          Export
        </AppButton>

        <AppButton :icon="Plus" @click="handleCreate">
          Create Payroll Period
        </AppButton>
      </div>
    </PageHeader>

    <div v-if="loadError && !loading" class="directory-message error-message">
      <div>
        <strong>Payroll periods could not be loaded</strong>
        <p>{{ loadError }}</p>
      </div>
      <AppButton variant="secondary" size="sm" @click="loadPeriods">Retry</AppButton>
    </div>

    <template v-else>
      <EmployeePayPeriodStats :stats="stats" />

      <EmployeePayPeriodFilters
        v-model:search="search"
        v-model:status="status"
        v-model:year="year"
        v-model:month="month"
        v-model:date-from="dateFrom"
        v-model:date-to="dateTo"
        :statuses="statusOptions"
        :years="years"
        :months="monthOptions"
        @reset="resetFilters"
      />

      <EmployeePayPeriodTable
        :periods="paginatedPeriods"
        :loading="loading"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
      />

      <div class="table-footer">
        <p>
          Showing <strong>{{ showingFrom }}–{{ showingTo }}</strong>
          of <strong>{{ filteredPeriods.length }}</strong> payroll periods
        </p>
        <AppPagination v-model="currentPage" :total-pages="totalPages" />
      </div>
    </template>

    <EmployeePayPeriodFormModal
      :open="formOpen"
      :period="editingFormValue"
      :saving="saving"
      @close="formOpen = false"
      @save="handleSave"
    />

    <Teleport to="body">
      <div v-if="viewingPeriod" class="details-overlay" @click.self="viewingPeriod = null">
        <div class="details-card" role="dialog" aria-modal="true" aria-labelledby="details-title">
          <div class="details-header">
            <div>
              <h3 id="details-title">Payroll Period Details</h3>
              <p>{{ periodName(viewingPeriod) }}</p>
            </div>
            <button type="button" class="details-close" aria-label="Close details" @click="viewingPeriod = null">
              <X :size="17" />
            </button>
          </div>

          <div class="details-body">
            <div class="detail-row">
              <span>Period ID</span>
              <strong>#{{ viewingPeriod.id }}</strong>
            </div>
            <div class="detail-row">
              <span>Period Name</span>
              <strong>{{ periodName(viewingPeriod) }}</strong>
            </div>
            <div class="detail-row">
              <span>Cutoff</span>
              <strong>{{ viewingPeriod.cutoff_number === 1 ? '1st cutoff' : '2nd cutoff' }}</strong>
            </div>
            <div class="detail-row">
              <span>Cutoff Start</span>
              <strong>{{ formatDate(viewingPeriod.cutoff_start) }}</strong>
            </div>
            <div class="detail-row">
              <span>Cutoff End</span>
              <strong>{{ formatDate(viewingPeriod.cutoff_end) }}</strong>
            </div>
            <div class="detail-row">
              <span>Payment Date</span>
              <strong>{{ formatDate(viewingPeriod.payment_date) }}</strong>
            </div>
            <div class="detail-row">
              <span>Status</span>
              <StatusBadge :status="viewingPeriod.status" />
            </div>
          </div>

          <div class="details-footer">
            <AppButton variant="secondary" @click="viewingPeriod = null">Close</AppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.payroll-periods-page{width:100%;max-width:1660px;margin:0 auto}
.back-button{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:0;border:0;background:transparent;color:var(--primary);font-family:inherit;font-size:10px;font-weight:600;cursor:pointer}
.back-button:hover{color:var(--primary-dark)}
.header-actions{display:flex;align-items:center;gap:8px}
.table-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 3px 0}
.table-footer p{margin:0;color:var(--text-muted);font-size:10px}
.table-footer strong{color:var(--text-primary);font-weight:650}
.directory-message{display:flex;min-height:90px;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;padding:15px;border:1px solid var(--border);border-radius:10px;background:var(--bg-card);color:var(--text-secondary);font-size:11px}
.error-message{border-color:color-mix(in srgb,var(--red) 35%,var(--border))}
.error-message strong{color:var(--red);font-size:11px}
.error-message p{margin:4px 0 0;font-size:10px}
.details-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.65);backdrop-filter:blur(3px)}
.details-card{width:100%;max-width:520px;border:1px solid var(--border);border-radius:12px;background:var(--bg-card);box-shadow:0 24px 70px rgba(0,0,0,.3)}
.details-header{display:flex;align-items:center;justify-content:space-between;padding:17px 19px;border-bottom:1px solid var(--border-soft)}
.details-header h3{margin:0;color:var(--text-primary);font-size:15px}
.details-header p{margin:5px 0 0;color:var(--text-muted);font-size:10px}
.details-close{display:flex;width:30px;height:30px;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text-secondary);cursor:pointer}
.details-body{padding:10px 19px}
.detail-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid var(--border-soft)}
.detail-row:last-child{border-bottom:0}
.detail-row span{color:var(--text-muted);font-size:10px}
.detail-row strong{color:var(--text-primary);font-size:11px;font-weight:650;text-align:right}
.details-footer{display:flex;justify-content:flex-end;padding:13px 19px;border-top:1px solid var(--border-soft)}
@media(max-width:650px){.header-actions{width:100%;align-items:stretch;flex-direction:column}.table-footer{align-items:flex-start;flex-direction:column}}
</style>