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
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-vue-next'

import { useCompanyApi, type CompanyRecord } from '~/composables/admin/useCompanyApi'

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

const title = 'Contribution Settings'
const subtitle = 'Configure company contribution deductions across the first and second payroll cutoffs.'
const addLabel = 'Add Deduction Setting'

const { contributionTypes, loadContributionTypes } = useContributionTypes()
const {
  deductionSettings,
  errorMessage,
  loadDeductionSettings,
  createDeductionSetting,
  updateDeductionSetting,
  deleteDeductionSetting,
} = useContributionDeductionSettings()

const companyApi = useCompanyApi()
const companies = ref<CompanyRecord[]>([])
const localError = ref('')

const companyOptions = computed(() =>
  companies.value.map(c => String(c.id)),
)

const companyLabels = computed<Record<string, string>>(() =>
  Object.fromEntries(
    companies.value.map(c => [String(c.id), c.company_name]),
  ),
)

const typeOptions = computed(() =>
  contributionTypes.value.map(t => String(t.id)),
)

const typeLabels = computed<Record<string, string>>(() =>
  Object.fromEntries(
    contributionTypes.value.map(t => [
      String(t.id),
      `${t.contribution_code} — ${t.contribution_name}`,
    ]),
  ),
)

const columns: Column[] = [
  { key: 'company_name', label: 'Company' },
  { key: 'type_name', label: 'Contribution Type' },
  { key: 'first_cutoff_percent', label: 'First Cutoff', format: 'percent' },
  { key: 'second_cutoff_percent', label: 'Second Cutoff', format: 'percent' },
  { key: 'effective_from', label: 'Effective From' },
  { key: 'effective_to', label: 'Effective To' },
  { key: 'status', label: 'Status', format: 'status' },
]

const fields = computed<Field[]>(() => [
  {
    key: 'company_id',
    label: 'Company',
    type: 'select',
    options: companyOptions.value,
    optionLabels: companyLabels.value,
    required: true,
  },
  {
    key: 'contribution_type_id',
    label: 'Contribution Type',
    type: 'select',
    options: typeOptions.value,
    optionLabels: typeLabels.value,
    required: true,
  },
  { key: 'first_cutoff_percent', label: 'First Cutoff Deduction (%)', type: 'number', required: true },
  { key: 'second_cutoff_percent', label: 'Second Cutoff Deduction (%)', type: 'number', required: true },
  { key: 'effective_from', label: 'Effective From', type: 'date', required: true },
  { key: 'effective_to', label: 'Effective To', type: 'date' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: ['Active', 'Inactive'],
    required: true,
  },
])

const numberOrNull = (value: Row[string]) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const initialRows = computed<Row[]>(() =>
  deductionSettings.value.map(item => ({
    id: item.id,
    company_id: String(item.company_id),
    company_name: item.company?.company_name
      ?? companyLabels.value[String(item.company_id)]
      ?? `Company #${item.company_id}`,
    contribution_type_id: String(item.contribution_type_id),
    type_name: item.contribution_type?.contribution_code
      ?? typeLabels.value[String(item.contribution_type_id)]
      ?? `Type #${item.contribution_type_id}`,
    first_cutoff_percent: item.first_cutoff_percent,
    second_cutoff_percent: item.second_cutoff_percent,
    effective_from: item.effective_from,
    effective_to: item.effective_to,
    status: item.is_status ? 'Active' : 'Inactive',
  })),
)

// =====================================================
// TABLE STATE
// =====================================================

const records = ref<Row[]>([])
const search = ref('')
const filterStatus = ref('all')
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

const loadCompanies = async () => {
  try {
    const res = await companyApi.getCompanies()
    companies.value = res.data ?? []
  } catch {
    // silently fallback
  }
}

onMounted(async () => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('scroll', closeActions, true)
  window.addEventListener('resize', closeActions)

  await Promise.all([
    loadCompanies(),
    loadContributionTypes(),
    loadDeductionSettings(),
  ])
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

    const matchesStatus =
      filterStatus.value === 'all' ||
      (
        filterStatus.value === 'active'
          ? row.status === 'Active'
          : row.status === 'Inactive'
      )

    return matchesSearch && matchesStatus
  })
})

const activeCount = computed(() =>
  records.value.filter((row) => row.status === 'Active').length,
)

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

watch([search, filterStatus], () => {
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

const startForm = (record?: Row) => {
  closeActions()
  localError.value = ''

  editingId.value = record
    ? Number(record.id)
    : null

  form.value = record
    ? { ...record }
    : {
        company_id: companyOptions.value[0] ?? '',
        contribution_type_id: typeOptions.value[0] ?? '',
        first_cutoff_percent: 50,
        second_cutoff_percent: 50,
        status: 'Active',
      }

  modalOpen.value = true
}

let updatingCutoff = false

watch(
  () => form.value.first_cutoff_percent,
  (val) => {
    if (!modalOpen.value || updatingCutoff) return
    if (val === '' || val === null || val === undefined) return
    const num = Number(val)
    if (!Number.isNaN(num) && num >= 0 && num <= 100) {
      updatingCutoff = true
      form.value.second_cutoff_percent = Number((100 - num).toFixed(2))
      nextTick(() => {
        updatingCutoff = false
      })
    }
  },
)

watch(
  () => form.value.second_cutoff_percent,
  (val) => {
    if (!modalOpen.value || updatingCutoff) return
    if (val === '' || val === null || val === undefined) return
    const num = Number(val)
    if (!Number.isNaN(num) && num >= 0 && num <= 100) {
      updatingCutoff = true
      form.value.first_cutoff_percent = Number((100 - num).toFixed(2))
      nextTick(() => {
        updatingCutoff = false
      })
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
  const companyId = Number(row.company_id)
  const typeId = Number(row.contribution_type_id)
  const firstCutoff = numberOrNull(row.first_cutoff_percent)
  const secondCutoff = numberOrNull(row.second_cutoff_percent)

  if (!companyId) {
    localError.value = 'Please select a company.'
    return
  }

  if (!typeId) {
    localError.value = 'Please select a contribution type.'
    return
  }

  if (firstCutoff === null || firstCutoff < 0 || firstCutoff > 100) {
    localError.value = 'First cutoff percentage must be between 0% and 100%.'
    return
  }

  if (secondCutoff === null || secondCutoff < 0 || secondCutoff > 100) {
    localError.value = 'Second cutoff percentage must be between 0% and 100%.'
    return
  }

  if (!row.effective_from) {
    localError.value = 'Effective From date is required.'
    return
  }

  if (row.effective_to && String(row.effective_to) < String(row.effective_from)) {
    localError.value = 'Effective To date cannot be before Effective From date.'
    return
  }

  const payload = {
    company_id: companyId,
    contribution_type_id: typeId,
    first_cutoff_percent: firstCutoff,
    second_cutoff_percent: secondCutoff,
    effective_from: String(row.effective_from),
    effective_to: row.effective_to ? String(row.effective_to) : null,
    is_status: row.status === 'Active',
  }

  try {
    if (row.id) {
      await updateDeductionSetting(Number(row.id), payload)
    } else {
      await createDeductionSetting(payload)
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
  } else {
    const payload: Row = { ...form.value }
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
    await deleteDeductionSetting(deletedId)
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

        <button
          type="button"
          class="cw-btn cw-primary"
          @click="startForm()"
        >
          <Plus :size="16" />
          <span>{{ addLabel }}</span>
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
        <strong>{{ activeCount }}</strong>

        <small class="cw-green">
          <CheckCircle2 :size="13" />
          Currently enabled
        </small>
      </div>

      <div class="cw-stat">
        <span>Inactive Records</span>
        <strong>{{ records.length - activeCount }}</strong>
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
        <p>View and manage company contribution split rules across cutoffs.</p>
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
            v-model="filterStatus"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
                <!-- STATUS BADGE -->
                <span
                  v-if="column.format === 'status'"
                  class="cw-pill"
                  :class="
                    row[column.key] === 'Active'
                      ? 'cw-active'
                      : 'cw-inactive'
                  "
                >
                  <span class="cw-status-dot"></span>
                  {{ row[column.key] }}
                </span>

                <!-- NORMAL CELL -->
                <span
                  v-else
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
                No contribution settings found.
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
         ADD / EDIT MODAL
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
          :aria-label="
            editingId === null ? addLabel : 'Edit Record'
          "
        >
          <div class="cw-modal-head">
            <div>
              <h2>
                {{
                  editingId === null
                    ? addLabel
                    : 'Edit Record'
                }}
              </h2>

              <p>Configure cutoff deduction split percentages for this contribution.</p>
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
                  :max="field.type === 'number' ? '100' : undefined"
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
                {{
                  editingId === null
                    ? 'Save Record'
                    : 'Save Changes'
                }}
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
            This will permanently delete the contribution deduction setting from the database.
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
   STATUS BADGES
===================================================== */

.cw-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
}

.cw-status-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.cw-active {
  background: rgba(22, 163, 74, 0.14);
  color: #16a34a;
}

.cw-inactive {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
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
