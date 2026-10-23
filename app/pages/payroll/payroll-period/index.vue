
<script setup lang="ts">
import { ArrowLeft, Download, Plus, X } from 'lucide-vue-next'
import EmployeePayPeriodStats from '~/components/payroll/payroll-periods/EmployeePayPeriodStats.vue'
import EmployeePayPeriodFilters from '~/components/payroll/payroll-periods/EmployeePayPeriodFilters.vue'
import EmployeePayPeriodTable from '~/components/payroll/payroll-periods/EmployeePayPeriodTable.vue'
import EmployeePayPeriodFormModal from '~/components/payroll/payroll-periods/EmployeePayPeriodFormModal.vue'
import type {
  PayrollPeriod,
  PayrollPeriodFormData,
  PayrollPeriodApiRecord,
  PayrollPeriodApiResponse,
} from '~/types/payrollPeriod'

const router = useRouter()
const { $api } = useNuxtApp()
const { success, error: showError } = useToast()

// API DATA
const periods = ref<PayrollPeriod[]>([])
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')

// FILTERS
const search = ref('')
const status = ref('')
const year = ref('')
const month = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const perPage = 6

// MODALS
const formOpen = ref(false)
const editingPeriod = ref<PayrollPeriod | null>(null)
const viewingPeriod = ref<PayrollPeriod | null>(null)

// HELPERS
const dateOnly = (value: string | null | undefined) =>
  value ? String(value).slice(0, 10) : ''

const mapPeriod = (item: PayrollPeriodApiRecord): PayrollPeriod => ({
  id: Number(item.id),
  userId: item.user_id == null ? null : Number(item.user_id),
  companyId: Number(item.company_id),
  periodName: item.period_name,
  cutoffStart: dateOnly(item.cutoff_start),
  cutoffEnd: dateOnly(item.cutoff_end),
  paymentDate: dateOnly(item.payment_date),
  status: item.status || 'Draft',
})

const formatDate = (value: string) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(date)
}

const getErrorMessage = (problem: any): string => {
  const data = problem?.data ?? problem?.response?._data ?? {}
  const firstError = Object.values(data.errors ?? {}).flat()[0]
  return String(firstError || data.message || problem?.message || 'Request failed.')
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// LOAD FROM LARAVEL
const loadPeriods = async () => {
  loading.value = true
  loadError.value = ''

  try {
    const response = await $api<PayrollPeriodApiResponse<PayrollPeriodApiRecord[]>>(
      '/admin/payroll-periods',
      { method: 'GET' },
    )

    if (response.success === false) throw new Error(response.message)
    if (!Array.isArray(response.data)) throw new Error('Invalid payroll periods API response.')

    if (response.data.some(item => !item.period_name || !item.cutoff_start || !item.cutoff_end || !item.payment_date)) {
      throw new Error('The payroll periods API must return period_name, cutoff_start, cutoff_end and payment_date.')
    }

    periods.value = response.data.map(mapPeriod)
    if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
  } catch (problem) {
    periods.value = []
    loadError.value = getErrorMessage(problem)
    showError('Payroll Periods Unavailable', loadError.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => { void loadPeriods() })

// STATS
const stats = computed(() => ({
  total: periods.value.length,
  draft: periods.value.filter(item => item.status.toLowerCase() === 'draft').length,
  open: periods.value.filter(item => item.status.toLowerCase() === 'open').length,
  closed: periods.value.filter(item => item.status.toLowerCase() === 'closed').length,
}))

// FILTER OPTIONS
const statusOptions = computed(() => [...new Set(periods.value.map(item => item.status))].sort())

const yearOptions = computed(() => [...new Set(
  periods.value.map(item => item.cutoffStart.slice(0, 4)).filter(Boolean),
)].sort((a, b) => Number(b) - Number(a)))

const monthOptions = computed(() => monthNames.filter((name, index) =>
  periods.value.some(item => Number(item.cutoffStart.slice(5, 7)) === index + 1)
))

// FILTERED RECORDS
const filteredPeriods = computed(() => periods.value.filter(item => {
  const term = search.value.trim().toLowerCase()

  if (term && !item.periodName.toLowerCase().includes(term) && !String(item.id).includes(term)) return false
  if (status.value && item.status !== status.value) return false
  if (year.value && item.cutoffStart.slice(0, 4) !== year.value) return false

  if (month.value) {
    const monthNumber = monthNames.indexOf(month.value) + 1
    if (Number(item.cutoffStart.slice(5, 7)) !== monthNumber) return false
  }

  if (dateFrom.value && item.cutoffStart < dateFrom.value) return false
  if (dateTo.value && item.cutoffEnd > dateTo.value) return false

  return true
}))

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPeriods.value.length / perPage)))
const showingFrom = computed(() => filteredPeriods.value.length ? (currentPage.value - 1) * perPage + 1 : 0)
const showingTo = computed(() => Math.min(currentPage.value * perPage, filteredPeriods.value.length))
const paginatedPeriods = computed(() =>
  filteredPeriods.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage)
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

// CREATE / EDIT
const handleCreate = () => {
  editingPeriod.value = null
  formOpen.value = true
}

const handleEdit = (period: PayrollPeriod) => {
  editingPeriod.value = period
  formOpen.value = true
}

const handleSave = async (payload: PayrollPeriodFormData) => {
  if (saving.value) return
  saving.value = true

  try {
    const body = {
      period_name: payload.periodName,
      cutoff_start: payload.cutoffStart,
      cutoff_end: payload.cutoffEnd,
      payment_date: payload.paymentDate,
    }

    const isEditing = editingPeriod.value !== null
    const endpoint = isEditing
      ? `/admin/payroll-periods/${editingPeriod.value!.id}`
      : '/admin/payroll-periods'

    const response = await $api<PayrollPeriodApiResponse<PayrollPeriodApiRecord>>(endpoint, {
      method: isEditing ? 'PATCH' : 'POST',
      body,
    })

    if (response.success === false) throw new Error(response.message)

    formOpen.value = false
    editingPeriod.value = null

    success(
      isEditing ? 'Payroll Period Updated' : 'Payroll Period Created',
      response.message || 'Payroll period saved successfully.',
    )

    await loadPeriods()
  } catch (problem) {
    showError('Unable to Save Payroll Period', getErrorMessage(problem))
  } finally {
    saving.value = false
  }
}

// VIEW DETAILS
const handleView = async (period: PayrollPeriod) => {
  try {
    const response = await $api<PayrollPeriodApiResponse<PayrollPeriodApiRecord>>(
      `/admin/payroll-periods/${period.id}`,
      { method: 'GET' },
    )

    if (response.success === false) throw new Error(response.message)
    viewingPeriod.value = mapPeriod(response.data)
  } catch (problem) {
    showError('Unable to View Payroll Period', getErrorMessage(problem))
  }
}

// DELETE
const handleDelete = async (period: PayrollPeriod) => {
  if (saving.value) return

  const confirmed = window.confirm(
    `Delete "${period.periodName}"?\n\nThis action cannot be undone.`,
  )

  if (!confirmed) return
  saving.value = true

  try {
    const response = await $api<{ success: boolean; message: string }>(
      `/admin/payroll-periods/${period.id}`,
      { method: 'DELETE' },
    )

    if (response.success === false) throw new Error(response.message)

    success('Payroll Period Deleted', response.message || 'Payroll period deleted successfully.')
    await loadPeriods()
  } catch (problem) {
    showError('Unable to Delete Payroll Period', getErrorMessage(problem))
  } finally {
    saving.value = false
  }
}

// EXPORT CURRENT FILTERED DATA TO CSV
const handleExport = () => {
  const rows = [
    ['ID', 'Period Name', 'Cutoff Start', 'Cutoff End', 'Payment Date', 'Status'],
    ...filteredPeriods.value.map(item => [
      String(item.id),
      item.periodName,
      item.cutoffStart,
      item.cutoffEnd,
      item.paymentDate,
      item.status,
    ]),
  ]

  const csv = rows
    .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
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
    <button type="button" class="back-button" @click="router.push('/payroll')">
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

    <!-- LOADING -->
    <div v-if="loading" class="directory-message">
      Loading payroll periods...
    </div>

    <!-- API ERROR -->
    <div v-else-if="loadError" class="directory-message error-message">
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
        :years="yearOptions"
        :months="monthOptions"
        @reset="resetFilters"
      />

      <EmployeePayPeriodTable
        :periods="paginatedPeriods"
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

    <!-- CREATE / EDIT MODAL -->
    <EmployeePayPeriodFormModal
      :open="formOpen"
      :period="editingPeriod"
      :saving="saving"
      @close="formOpen = false"
      @save="handleSave"
    />

    <!-- VIEW DETAILS MODAL -->
    <Teleport to="body">
      <div v-if="viewingPeriod" class="details-overlay" @click.self="viewingPeriod = null">
        <div class="details-card" role="dialog" aria-modal="true" aria-labelledby="details-title">
          <div class="details-header">
            <div>
              <h3 id="details-title">Payroll Period Details</h3>
              <p>{{ viewingPeriod.periodName }}</p>
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
              <strong>{{ viewingPeriod.periodName }}</strong>
            </div>
            <div class="detail-row">
              <span>Cutoff Start</span>
              <strong>{{ formatDate(viewingPeriod.cutoffStart) }}</strong>
            </div>
            <div class="detail-row">
              <span>Cutoff End</span>
              <strong>{{ formatDate(viewingPeriod.cutoffEnd) }}</strong>
            </div>
            <div class="detail-row">
              <span>Payment Date</span>
              <strong>{{ formatDate(viewingPeriod.paymentDate) }}</strong>
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
