<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Landmark,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-vue-next'

// =====================================================
// TYPES
// =====================================================

type Row = Record<string, string | number | boolean | null>

type Field = {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select'
  options?: string[]
  optionLabels?: Record<string, string>
  required?: boolean
}

type Column = {
  key: string
  label: string
  format?: 'money' | 'percent' | 'status'
}

// =====================================================
// SECTION CONFIG
// =====================================================

const title = 'Contribution History'
const subtitle = 'Review and manage contribution rate bracket records (historical rate schedules).'

const { rateSchedules, loadRateSchedules } = useContributionRateSchedules()
const {
  rateBrackets,
  errorMessage,
  loadRateBrackets,
  updateRateBracket,
  deleteRateBracket,
} = useContributionRateBrackets()

const localError = ref('')

const activeSchedulesCount = computed(() =>
  rateSchedules.value.filter(s => s.is_status).length,
)

const scheduleOptions = computed(() =>
  rateSchedules.value.map(s => String(s.id)),
)

const scheduleLabels = computed<Record<string, string>>(() =>
  Object.fromEntries(
    rateSchedules.value.map(s => {
      const typeCode = s.contribution_type?.contribution_code ?? 'Type'
      return [
        String(s.id),
        `${typeCode} — ${s.salary_basis} (${s.calculation_method}, Effective: ${s.effective_from})`,
      ]
    }),
  ),
)

const columns: Column[] = [
  { key: 'schedule_name', label: 'Rate Schedule' },
  { key: 'salary_from', label: 'Salary From', format: 'money' },
  { key: 'salary_to', label: 'Salary To', format: 'money' },
  { key: 'monthly_salary_credit', label: 'Monthly Salary Credit', format: 'money' },
  { key: 'employee_rate', label: 'Employee Rate', format: 'percent' },
  { key: 'employer_rate', label: 'Employer Rate', format: 'percent' },
  { key: 'employee_amount', label: 'Employee Amount', format: 'money' },
  { key: 'employer_amount', label: 'Employer Amount', format: 'money' },
  { key: 'employer_ec_amount', label: 'Employer EC', format: 'money' },
]

const fields = computed<Field[]>(() => [
  {
    key: 'contribution_rate_schedule_id',
    label: 'Rate Schedule',
    type: 'select',
    options: scheduleOptions.value,
    optionLabels: scheduleLabels.value,
    required: true,
  },
  { key: 'salary_from', label: 'Salary From (₱)', type: 'number', required: true },
  { key: 'salary_to', label: 'Salary To (₱ - Leave empty for and above)', type: 'number' },
  { key: 'monthly_salary_credit', label: 'Monthly Salary Credit (MSC ₱)', type: 'number' },
  { key: 'employee_rate', label: 'Employee Rate (%)', type: 'number' },
  { key: 'employer_rate', label: 'Employer Rate (%)', type: 'number' },
  { key: 'employee_amount', label: 'Employee Amount (₱)', type: 'number' },
  { key: 'employer_amount', label: 'Employer Amount (₱)', type: 'number' },
  { key: 'employer_ec_amount', label: 'Employer EC Amount (₱)', type: 'number' },
])

const numberOrNull = (value: Row[string]) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const initialRows = computed<Row[]>(() =>
  rateBrackets.value.map(item => ({
    id: item.id,
    contribution_rate_schedule_id: String(item.contribution_rate_schedule_id),
    schedule_name: scheduleLabels.value[String(item.contribution_rate_schedule_id)]
      ?? (item.rate_schedule?.contribution_type?.contribution_code
        ? `${item.rate_schedule.contribution_type.contribution_code} (#${item.contribution_rate_schedule_id})`
        : `Schedule #${item.contribution_rate_schedule_id}`),
    salary_from: item.salary_from,
    salary_to: item.salary_to,
    monthly_salary_credit: item.monthly_salary_credit,
    employee_rate: item.employee_rate,
    employer_rate: item.employer_rate,
    employee_amount: item.employee_amount,
    employer_amount: item.employer_amount,
    employer_ec_amount: item.employer_ec_amount,
  })),
)

// =====================================================
// TABLE STATE
// =====================================================

const records = ref<Row[]>([])
const search = ref('')
const filterSchedule = ref('all')
const page = ref(1)
const perPage = 6

// =====================================================
// MODAL STATE
// =====================================================

const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)
const form = ref<Row>({})

// =====================================================
// THREE-DOTS DROPDOWN
// =====================================================

const openActionId = ref<number | null>(null)
const actionButtonRef = ref<HTMLElement | null>(null)

const actionPosition = ref({
  top: 0,
  left: 0,
})

const closeActions = () => {
  openActionId.value = null
  actionButtonRef.value = null
}

const updateActionPosition = () => {
  if (!actionButtonRef.value) return

  const rect = actionButtonRef.value.getBoundingClientRect()
  const menuWidth = 230
  const menuHeight = 112
  const gap = 6

  const left = Math.max(
    8,
    Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 8,
    ),
  )

  const showAbove = rect.bottom + menuHeight + gap > window.innerHeight
  const top = showAbove
    ? rect.top - menuHeight - gap
    : rect.bottom + gap

  actionPosition.value = {
    top: Math.max(8, top),
    left,
  }
}

const toggleActions = async (
  id: number,
  event: MouseEvent,
) => {
  if (openActionId.value === id) {
    closeActions()
    return
  }

  actionButtonRef.value = event.currentTarget as HTMLElement
  openActionId.value = id

  await nextTick()
  updateActionPosition()
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null

  if (!target) return
  if (actionButtonRef.value?.contains(target)) return
  if (target.closest('.cw-action-dropdown')) return

  closeActions()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  closeActions()
  modalOpen.value = false
  deletingId.value = null
}

onMounted(async () => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('scroll', closeActions, true)
  window.addEventListener('resize', closeActions)

  await Promise.all([loadRateSchedules(), loadRateBrackets()])
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', closeActions, true)
  window.removeEventListener('resize', closeActions)
})

// =====================================================
// COMPUTED TABLE DATA
// =====================================================

const filtered = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return records.value.filter((row) => {
    const matchesSearch = Object.values(row).some((value) =>
      String(value ?? '').toLowerCase().includes(keyword),
    )

    const matchesSchedule =
      filterSchedule.value === 'all' ||
      String(row.contribution_rate_schedule_id) === filterSchedule.value

    return matchesSearch && matchesSchedule
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / perPage)),
)

const visibleRows = computed(() => {
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

const paginationStart = computed(() => {
  if (filtered.value.length === 0) return 0
  return (page.value - 1) * perPage + 1
})

const paginationEnd = computed(() =>
  Math.min(page.value * perPage, filtered.value.length),
)

const pageNumbers = computed(() => {
  const total = totalPages.value
  const maxVisible = 5

  const start = Math.max(
    1,
    Math.min(page.value - 2, total - maxVisible + 1),
  )

  const end = Math.min(total, start + maxVisible - 1)

  return Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  )
})

// =====================================================
// WATCHERS
// =====================================================

watch([search, filterSchedule], () => {
  page.value = 1
  closeActions()
})

watch(page, () => {
  closeActions()
})

watch(
  initialRows,
  (rows) => {
    records.value = rows.map((row) => ({ ...row }))
    page.value = 1
    closeActions()
  },
  { immediate: true },
)

// =====================================================
// FORM ACTIONS
// =====================================================

const startForm = (record: Row) => {
  closeActions()
  localError.value = ''

  editingId.value = Number(record.id)
  form.value = { ...record }
  modalOpen.value = true
}

let calculatingBracket = false

// When MSC or Employee Rate changes, auto-calculate Employee Amount
watch(
  [() => form.value.monthly_salary_credit, () => form.value.employee_rate],
  ([msc, eeRate]) => {
    if (!modalOpen.value || calculatingBracket) return
    const m = Number(msc)
    const r = Number(eeRate)
    if (!Number.isNaN(m) && m > 0 && !Number.isNaN(r) && r >= 0) {
      calculatingBracket = true
      form.value.employee_amount = Number(((m * r) / 100).toFixed(2))
      nextTick(() => { calculatingBracket = false })
    }
  },
)

// When MSC or Employer Rate changes, auto-calculate Employer Amount
watch(
  [() => form.value.monthly_salary_credit, () => form.value.employer_rate],
  ([msc, erRate]) => {
    if (!modalOpen.value || calculatingBracket) return
    const m = Number(msc)
    const r = Number(erRate)
    if (!Number.isNaN(m) && m > 0 && !Number.isNaN(r) && r >= 0) {
      calculatingBracket = true
      form.value.employer_amount = Number(((m * r) / 100).toFixed(2))
      nextTick(() => { calculatingBracket = false })
    }
  },
)

const closeForm = () => {
  modalOpen.value = false
  editingId.value = null
  localError.value = ''
  form.value = {}
}

const editSelectedRecord = () => {
  const record = records.value.find(
    (row) => Number(row.id) === openActionId.value,
  )

  if (!record) {
    closeActions()
    return
  }

  startForm(record)
}

const persistRecord = async (row: Row) => {
  const scheduleId = Number(row.contribution_rate_schedule_id)
  const salaryFrom = numberOrNull(row.salary_from)
  const salaryTo = numberOrNull(row.salary_to)

  if (!scheduleId) {
    localError.value = 'Please select a valid Rate Schedule.'
    return
  }

  if (salaryFrom === null || salaryFrom < 0) {
    localError.value = 'Salary From is required and must be 0 or greater.'
    return
  }

  if (salaryTo !== null && salaryTo < salaryFrom) {
    localError.value = 'Salary To must be greater than or equal to Salary From.'
    return
  }

  const payload = {
    contribution_rate_schedule_id: scheduleId,
    salary_from: salaryFrom,
    salary_to: salaryTo,
    monthly_salary_credit: numberOrNull(row.monthly_salary_credit),
    employee_rate: numberOrNull(row.employee_rate),
    employer_rate: numberOrNull(row.employer_rate),
    employee_amount: numberOrNull(row.employee_amount),
    employer_amount: numberOrNull(row.employer_amount),
    employer_ec_amount: numberOrNull(row.employer_ec_amount),
  }

  try {
    if (row.id) {
      await updateRateBracket(Number(row.id), payload)
    }
    closeForm()
  } catch {
    // errorMessage is handled by composable
  }
}

const save = async () => {
  localError.value = ''

  if (editingId.value !== null) {
    const payload: Row = { ...form.value, id: editingId.value }
    await persistRecord(payload)
  }
}

// =====================================================
// DELETE ACTIONS
// =====================================================

const confirmDelete = () => {
  if (openActionId.value === null) return
  deletingId.value = openActionId.value
  closeActions()
}

const remove = async () => {
  if (deletingId.value === null) return
  const deletedId = deletingId.value

  try {
    await deleteRateBracket(deletedId)
  } catch {
    // errorMessage handled by composable
  } finally {
    deletingId.value = null
    page.value = Math.min(page.value, totalPages.value)
  }
}

// =====================================================
// FORMATTERS
// =====================================================

const fmt = (
  value: Row[string],
  format?: Column['format'],
) => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '—'
  }

  if (format === 'money') {
    return (
      '₱' +
      Number(value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }

  if (format === 'percent') {
    return `${Number(value).toFixed(2)}%`
  }

  return String(value)
}

// =====================================================
// CSV EXPORT
// =====================================================

const csvValue = (value: unknown) =>
  `"${String(value ?? '').replace(/"/g, '""')}"`

const exportCsv = () => {
  const header = columns
    .map((column) => csvValue(column.label))
    .join(',')

  const rows = filtered.value.map((row) =>
    columns
      .map((column) => csvValue(row[column.key]))
      .join(','),
  )

  const csv = [header, ...rows].join('\r\n')

  const blob = new Blob(
    ['\ufeff' + csv],
    { type: 'text/csv;charset=utf-8;' },
  )

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download =
    title.toLowerCase().replace(/\W+/g, '-') + '.csv'

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="cw">
    <div v-if="errorMessage || localError" class="cw-error-banner" role="alert">
      {{ localError || errorMessage }}
    </div>

    <!-- =================================================
         PAGE HEADER
    ================================================== -->

    <div class="cw-header">
      <div class="cw-header-info">
        <div class="cw-eyebrow">
          <Landmark :size="14" />
          <span>PAYROLL CONFIGURATION / CONTRIBUTIONS</span>
        </div>

        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>

      <div class="cw-header-actions">
        <button
          type="button"
          class="cw-btn cw-outline"
          @click="exportCsv"
        >
          <Download :size="16" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>

    <!-- =================================================
         SUMMARY CARDS
    ================================================== -->

    <div class="cw-stats">
      <div class="cw-stat">
        <span>Total Records</span>
        <strong>{{ records.length }}</strong>
        <small>Configured records</small>
      </div>

      <div class="cw-stat">
        <span>Active Records</span>
        <strong>{{ activeSchedulesCount }}</strong>

        <small class="cw-green">
          <CheckCircle2 :size="13" />
          Currently enabled
        </small>
      </div>

      <div class="cw-stat">
        <span>Inactive Records</span>
        <strong>{{ rateSchedules.length - activeSchedulesCount }}</strong>
        <small>Currently disabled</small>
      </div>
    </div>

    <!-- =================================================
         DIRECTORY PANEL
    ================================================== -->

    <div class="cw-panel">
      <!-- PANEL HEADER -->

      <div class="cw-panel-head">
        <h2>{{ title }} Directory</h2>
        <p>View and manage salary bracket limits, MSC values, and contribution amounts.</p>
      </div>

      <!-- SEARCH AND FILTER -->

      <div class="cw-toolbar">
        <div class="cw-search">
          <Search :size="17" />

          <input
            v-model="search"
            type="text"
            placeholder="Search records..."
            aria-label="Search contribution records"
          />
        </div>

        <div class="cw-filter">
          <Filter :size="15" />

          <select
            v-model="filterSchedule"
            aria-label="Filter by schedule"
          >
            <option value="all">All Rate Schedules</option>
            <option
              v-for="sId in scheduleOptions"
              :key="sId"
              :value="sId"
            >
              {{ scheduleLabels[sId] ?? sId }}
            </option>
          </select>
        </div>
      </div>

      <!-- TABLE -->

      <div class="cw-overflow">
        <table class="cw-table">
          <thead>
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                scope="col"
              >
                {{ column.label }}
              </th>

              <th
                scope="col"
                class="cw-actions-heading"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in visibleRows"
              :key="String(row.id)"
            >
              <td
                v-for="column in columns"
                :key="column.key"
              >
                <span
                  class="cw-cell-value"
                  :class="{
                    'cw-money': column.format === 'money',
                  }"
                >
                  {{ fmt(row[column.key], column.format) }}
                </span>
              </td>

              <!-- THREE DOTS ACTIONS -->
              <td class="cw-actions-cell">
                <button
                  type="button"
                  class="cw-more-btn"
                  aria-label="Actions menu"
                  :aria-expanded="openActionId === Number(row.id)"
                  @click.stop="toggleActions(Number(row.id), $event)"
                >
                  <MoreHorizontal :size="16" />
                </button>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td
                :colspan="columns.length + 1"
                class="cw-empty"
              >
                No rate bracket records found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- =================================================
         NUMBERED PAGINATION
    ================================================== -->

    <div class="cw-pagination">
      <div class="cw-pagination-info">
        Showing
        <strong>{{ paginationStart }}–{{ paginationEnd }}</strong>
        of
        <strong>{{ filtered.length }}</strong>
        contribution records
      </div>

      <div class="cw-pagination-controls">
        <button
          type="button"
          class="cw-page-arrow"
          aria-label="Previous page"
          :disabled="page === 1"
          @click="page--"
        >
          <ChevronLeft :size="16" />
        </button>

        <button
          v-for="pageNumber in pageNumbers"
          :key="pageNumber"
          type="button"
          class="cw-page-number"
          :class="{
            'cw-page-active': page === pageNumber,
          }"
          :aria-label="`Page ${pageNumber}`"
          :aria-current="
            page === pageNumber ? 'page' : undefined
          "
          @click="page = pageNumber"
        >
          {{ pageNumber }}
        </button>

        <button
          type="button"
          class="cw-page-arrow"
          aria-label="Next page"
          :disabled="page === totalPages"
          @click="page++"
        >
          <ChevronRight :size="16" />
        </button>
      </div>
    </div>

    <!-- =================================================
         THREE DOTS DROPDOWN
    ================================================== -->

    <Teleport to="body">
      <div
        v-if="openActionId !== null"
        class="cw-action-dropdown"
        role="menu"
        :style="{
          top: `${actionPosition.top}px`,
          left: `${actionPosition.left}px`,
        }"
      >
        <button
          type="button"
          role="menuitem"
          @click="editSelectedRecord"
        >
          <Pencil :size="15" />
          <span>Edit Record</span>
        </button>

        <button
          type="button"
          role="menuitem"
          class="cw-action-delete"
          @click="confirmDelete"
        >
          <Trash2 :size="15" />
          <span>Delete Record</span>
        </button>
      </div>
    </Teleport>

    <!-- =================================================
         EDIT MODAL
    ================================================== -->

    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="cw-backdrop"
        @click.self="closeForm"
      >
        <div
          class="cw-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Edit Record"
        >
          <div class="cw-modal-head">
            <div>
              <h2>Edit Record</h2>
              <p>Update the salary bracket tier and contribution details below.</p>
            </div>

            <button
              type="button"
              class="cw-x"
              aria-label="Close modal"
              @click="closeForm"
            >
              <X :size="20" />
            </button>
          </div>

          <form @submit.prevent="save">
            <div class="cw-fields">
              <label
                v-for="field in fields"
                :key="field.key"
              >
                <span>
                  {{ field.label }}
                  <b v-if="field.required">*</b>
                </span>

                <select
                  v-if="field.type === 'select'"
                  v-model="form[field.key]"
                  :required="field.required"
                >
                  <option value="" disabled>
                    Select {{ field.label }}
                  </option>

                  <option
                    v-for="option in field.options"
                    :key="option"
                    :value="option"
                  >
                    {{ field.optionLabels?.[option] ?? option }}
                  </option>
                </select>

                <input
                  v-else
                  v-model="form[field.key]"
                  :type="field.type || 'text'"
                  :required="field.required"
                  :step="
                    field.type === 'number'
                      ? 'any'
                      : undefined
                  "
                  :min="field.type === 'number' ? '0' : undefined"
                  :placeholder="field.label"
                />
              </label>
            </div>

            <div class="cw-modal-footer">
              <button
                type="button"
                class="cw-btn cw-outline"
                @click="closeForm"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="cw-btn cw-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- =================================================
         DELETE CONFIRMATION
    ================================================== -->

    <Teleport to="body">
      <div
        v-if="deletingId !== null"
        class="cw-backdrop"
        @click.self="deletingId = null"
      >
        <div
          class="cw-confirm"
          role="dialog"
          aria-modal="true"
          aria-label="Delete confirmation"
        >
          <h2>Delete this record?</h2>

          <p>
            This will permanently delete the rate bracket tier from the database.
          </p>

          <div class="cw-modal-footer">
            <button
              type="button"
              class="cw-btn cw-outline"
              @click="deletingId = null"
            >
              Cancel
            </button>

            <button
              type="button"
              class="cw-btn cw-delete"
              @click="remove"
            >
              Delete Record
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.cw-error-banner {
  padding: 12px;
  margin-bottom: 14px;
  border: 1px solid var(--red);
  border-radius: 8px;
  background: color-mix(in srgb, var(--red) 10%, var(--bg-card));
  color: var(--red);
  font-size: 11px;
}

/* =====================================================
   MAIN LAYOUT
===================================================== */

.cw {
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
  color: var(--text-primary, #172033);
}

.cw-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 24px;
}

.cw-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
  color: var(--primary, #246bfd);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1px;
}

.cw h1 {
  margin: 0 0 6px;
  font-size: 27px;
  font-weight: 750;
  line-height: 1.25;
}

.cw h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.cw p {
  margin: 5px 0 0;
  font-size: 12px;
  color: var(--text-secondary, #667085);
}

/* =====================================================
   HEADER BUTTONS
===================================================== */

.cw-header-actions {
  display: flex;
  align-items: center;
  gap: 9px;
}

.cw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  cursor: pointer;
}

.cw-primary {
  background: #246bfd;
  color: #ffffff;
}

.cw-primary:hover {
  background: #1657dd;
}

.cw-outline {
  border-color: var(--border, #e6eaf0);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

.cw-outline:hover {
  background: var(--bg-card-soft, #f8fafc);
}

/* =====================================================
   SUMMARY CARDS
===================================================== */

.cw-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.cw-stat {
  padding: 19px 21px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 12px;
  background: var(--bg-card, #ffffff);
  box-shadow: var(--shadow, none);
}

.cw-stat > span {
  display: block;
  color: var(--text-secondary, #667085);
  font-size: 12px;
}

.cw-stat strong {
  display: block;
  margin: 8px 0 2px;
  font-size: 29px;
  line-height: 1.3;
}

.cw-stat small {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-muted, #98a2b3);
  font-size: 11px;
}

.cw-green {
  color: #16a663 !important;
}

/* =====================================================
   DIRECTORY PANEL
===================================================== */

.cw-panel {
  overflow: hidden;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 12px;
  background: var(--bg-card, #ffffff);
}

.cw-panel-head {
  padding: 19px 20px 14px;
  border-bottom: 1px solid var(--border, #e6eaf0);
}

.cw-panel-head h2 {
  font-size: 14px;
  font-weight: 700;
}

.cw-panel-head p {
  margin-top: 5px;
  font-size: 11px;
}

/* =====================================================
   SEARCH AND FILTER
===================================================== */

.cw-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 18px;
}

.cw-search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 1 340px;
  width: 340px;
  max-width: 100%;
  min-width: 0;
  height: 39px;
  padding: 0 12px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-secondary, #667085);
  transition: border-color 0.2s ease;
}

.cw-search:focus-within {
  border-color: #246bfd;
}

.cw-search input {
  width: 100%;
  min-width: 0;
  flex: 1;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary, #172033);
  font-size: 12px;
}

.cw-search input::placeholder {
  color: var(--text-muted, #98a2b3);
}

.cw-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 39px;
  padding: 0 12px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-secondary, #667085);
}

.cw-filter select {
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary, #172033);
  font-size: 12px;
  cursor: pointer;
  color-scheme: light dark;
}

.cw-filter select option {
  background-color: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

/* =====================================================
   TABLE
===================================================== */

.cw-overflow {
  width: 100%;
  overflow-x: auto;
}

.cw-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  white-space: nowrap;
  text-align: left;
  font-size: 12px;
}

.cw-table thead th {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border, #e6eaf0);
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-secondary, #667085);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.25px;
  text-transform: uppercase;
}

.cw-table tbody td {
  height: 68px;
  padding: 18px 16px;
  border-bottom: 1px solid var(--border, #e6eaf0);
  color: var(--text-primary, #172033);
  font-size: 12px;
  vertical-align: middle;
}

.cw-table tbody tr {
  transition: background-color 0.2s ease;
}

.cw-table tbody tr:hover td {
  background: var(--bg-card-soft, #f8fafc);
}

.cw-table tbody tr:last-child td {
  border-bottom: none;
}

.cw-cell-value {
  font-size: 12px;
  font-weight: 500;
}

.cw-money {
  font-weight: 700;
}

/* =====================================================
   THREE-DOTS BUTTON
===================================================== */

.cw-actions-heading,
.cw-actions-cell {
  width: 85px;
  text-align: center !important;
}

.cw-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 9px;
  background: transparent;
  color: var(--text-secondary, #667085);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cw-more-btn:hover,
.cw-more-btn[aria-expanded='true'] {
  border-color: #246bfd;
  background: rgba(36, 107, 253, 0.08);
  color: #246bfd;
}

/* =====================================================
   EMPTY TABLE
===================================================== */

.cw-empty {
  padding: 45px 20px !important;
  color: var(--text-secondary, #667085);
  font-size: 12px;
  text-align: center;
}

/* =====================================================
   PAGINATION
===================================================== */

.cw-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 2px;
}

.cw-pagination-info {
  color: var(--text-secondary, #667085);
  font-size: 11px;
}

.cw-pagination-info strong {
  color: var(--text-primary, #172033);
  font-weight: 600;
}

.cw-pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cw-page-arrow,
.cw-page-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  background: var(--bg-card, #ffffff);
  color: var(--text-secondary, #667085);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cw-page-arrow:hover:not(:disabled),
.cw-page-number:hover:not(.cw-page-active) {
  border-color: #246bfd;
  color: #246bfd;
}

.cw-page-active {
  border-color: #246bfd;
  background: #246bfd;
  color: #ffffff;
  font-weight: 700;
}

.cw-page-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 768px) {
  .cw h1 {
    font-size: 23px;
  }

  .cw-header-actions {
    width: 100%;
  }

  .cw-stats {
    grid-template-columns: 1fr;
  }

  .cw-toolbar {
    padding: 12px;
  }

  .cw-search {
    flex: 1 1 100%;
    width: 100%;
    max-width: none;
  }

  .cw-pagination {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .cw-pagination-controls {
    align-self: flex-end;
  }

  .cw-table thead th,
  .cw-table tbody td {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>

<style>
/* =====================================================
   TELEPORTED THREE-DOTS MENU
===================================================== */

.cw-action-dropdown {
  position: fixed;
  z-index: 9999;
  min-width: 230px;
  padding: 7px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 12px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.2);
}

.cw-action-dropdown button {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 12px 13px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary, #172033);
  font-size: 12px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.cw-action-dropdown button:hover {
  background: var(--bg-card-soft, #f8fafc);
}

.cw-action-dropdown .cw-action-delete {
  color: #ef4444;
}

.cw-action-dropdown .cw-action-delete:hover {
  background: rgba(239, 68, 68, 0.08);
}

/* =====================================================
   MODAL BACKDROP
===================================================== */

.cw-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(5, 15, 30, 0.55);
}

/* =====================================================
   MODAL CONTAINERS
===================================================== */

.cw-modal,
.cw-confirm {
  width: min(680px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 15px;
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.27);
}

.cw-confirm {
  max-width: 420px;
}

.cw-modal h2,
.cw-confirm h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.cw-modal p,
.cw-confirm p {
  margin-top: 7px;
  color: var(--text-secondary, #667085);
  font-size: 12px;
}

.cw-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
}

.cw-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 7px;
  background: var(--bg-card, #ffffff);
  color: var(--text-secondary, #667085);
  cursor: pointer;
}

/* =====================================================
   FORM FIELDS
===================================================== */

.cw-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.cw-fields label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.cw-fields label > span {
  font-size: 11px;
  font-weight: 650;
}

.cw-fields label b {
  color: #ef4444;
}

.cw-fields input,
.cw-fields select {
  width: 100%;
  min-width: 0;
  padding: 11px;
  border: 1px solid var(--border, #e6eaf0);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft, #f8fafc);
  color: var(--text-primary, #172033);
  font-size: 12px;
  color-scheme: light dark;
}

.cw-fields select option {
  background-color: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

.cw-fields input:focus,
.cw-fields select:focus {
  border-color: #246bfd;
}

/* =====================================================
   MODAL FOOTER
===================================================== */

.cw-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 24px;
}

.cw-modal-footer .cw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.cw-modal-footer .cw-primary {
  background: #246bfd;
  color: #ffffff;
}

.cw-modal-footer .cw-primary:hover {
  background: #1657dd;
}

.cw-modal-footer .cw-outline {
  border-color: var(--border, #e6eaf0);
  background: var(--bg-card, #ffffff);
  color: var(--text-primary, #172033);
}

.cw-modal-footer .cw-outline:hover {
  background: var(--bg-card-soft, #f8fafc);
}

.cw-modal-footer .cw-delete {
  background: #dc2626;
  color: #ffffff;
}

.cw-modal-footer .cw-delete:hover {
  background: #b91c1c;
}

@media (max-width: 720px) {
  .cw-fields {
    grid-template-columns: 1fr;
  }
}
</style>
