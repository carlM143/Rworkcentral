
<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted,
  unref,
} from 'vue'

import {
  Download,
  TrendingUp,
  X,
  Eye,
  Pencil,
  Save,
  FileDown,
} from 'lucide-vue-next'

import PromotionStats from '~/components/admin/employee-lifecycle/promotions/PromotionStats.vue'
import PromotionFilters from '~/components/admin/employee-lifecycle/promotions/PromotionFilters.vue'
import PromotionTable from '~/components/admin/employee-lifecycle/promotions/PromotionTable.vue'

import type {
  PromotionRecord,
  PromotionStatus,
  PromotionType,
} from '~/types/promotion'

definePageMeta({
  layout: 'admin',
})

const {
  search,
  department,
  promotionType,
  status,
  currentPage,
  filteredRecords,
  stats,
  departmentOptions,
  promotionTypeOptions,
  statusOptions,
  resetFilters,
} = usePromotions()

const { info } = useToast()

// ----------------------------------------------
// TYPES
// ----------------------------------------------

type ModalMode =
  | 'view'
  | 'create'
  | 'edit'
  | 'export'
  | null

interface PromotionForm {
  employeeName: string
  employeeNumber: string
  department: string
  promotionType: string
  currentPosition: string
  newPosition: string
  currentSalary: number
  newSalary: number
  recommendedBy: string
  approvedBy: string
  recommendationDate: string
  effectiveDate: string
  status: string
  reason: string
}

// ----------------------------------------------
// STATE
// ----------------------------------------------

const modalMode = ref<ModalMode>(null)

const selectedPromotion = ref<PromotionRecord | null>(null)

const addedRecords = ref<PromotionRecord[]>([])

const editedRecords = ref<Record<string, PromotionRecord>>({})

const exportScope = ref<'filtered' | 'loaded'>('filtered')

const formError = ref('')

const saving = ref(false)

const emptyForm = (): PromotionForm => ({
  employeeName: '',
  employeeNumber: '',
  department: '',
  promotionType: 'Position Promotion',
  currentPosition: '',
  newPosition: '',
  currentSalary: 0,
  newSalary: 0,
  recommendedBy: '',
  approvedBy: '',
  recommendationDate: '',
  effectiveDate: '',
  status: 'Draft',
  reason: '',
})

const form = ref<PromotionForm>(emptyForm())

// ----------------------------------------------
// OPTIONS
// ----------------------------------------------

const normalizeOptions = (source: unknown): string[] => {
  const values = unref(source)

  if (!Array.isArray(values)) return []

  return values
    .filter((value): value is string => typeof value === 'string')
    .filter(value => {
      const normalized = value.trim().toLowerCase()

      return (
        normalized !== 'all' &&
        !normalized.startsWith('all ')
      )
    })
}

const departmentChoices = computed(() => [
  ...new Set([
    ...normalizeOptions(departmentOptions),
    ...unref(filteredRecords).map(item => item.department),
    ...addedRecords.value.map(item => item.department),
    ...(form.value.department ? [form.value.department] : []),
  ].filter(Boolean)),
])

const typeChoices = computed(() => [
  ...new Set([
    ...normalizeOptions(promotionTypeOptions),
    'Position Promotion',
    'Grade Promotion',
    'Salary Promotion',
    'Leadership Promotion',
    ...(form.value.promotionType ? [form.value.promotionType] : []),
  ]),
])

const statusChoices = computed(() => [
  ...new Set([
    ...normalizeOptions(statusOptions),
    'Draft',
    'For Review',
    'Pending Approval',
    'Approved',
    'Scheduled',
    'Effective',
    'Rejected',
    'Cancelled',
  ]),
])

// ----------------------------------------------
// FILTERED LOCAL RECORDS
// ----------------------------------------------

const matchesFilters = (item: PromotionRecord) => {
  const keyword = search.value.trim().toLowerCase()

  const searchable = [
    item.promotionNumber,
    item.employeeName,
    item.employeeNumber,
    item.department,
    item.currentPosition,
    item.newPosition,
    item.reason,
  ].join(' ').toLowerCase()

  const matchesSelection = (
    selected: string,
    value: string,
  ) => {
    const normalized = String(selected ?? '').toLowerCase()

    return (
      !normalized ||
      normalized === 'all' ||
      normalized.startsWith('all ') ||
      selected === value
    )
  }

  return (
    (!keyword || searchable.includes(keyword)) &&
    matchesSelection(department.value, item.department) &&
    matchesSelection(promotionType.value, item.promotionType) &&
    matchesSelection(status.value, item.status)
  )
}

const displayRecords = computed(() => {
  const existing = filteredRecords.value
    .map(item => editedRecords.value[String(item.id)] ?? item)
    .filter(matchesFilters)

  const added = addedRecords.value.filter(matchesFilters)

  return [...added, ...existing]
})

// ----------------------------------------------
// PAGINATION
// ----------------------------------------------

const pageSize = 6

const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(displayRecords.value.length / pageSize),
  ),
)

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return displayRecords.value.slice(
    start,
    start + pageSize,
  )
})

const showingFrom = computed(() =>
  displayRecords.value.length
    ? (currentPage.value - 1) * pageSize + 1
    : 0,
)

const showingTo = computed(() =>
  Math.min(
    currentPage.value * pageSize,
    displayRecords.value.length,
  ),
)

watch(displayRecords, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

// ----------------------------------------------
// FORM CALCULATIONS
// ----------------------------------------------

const salaryIncrease = computed(() =>
  Number(form.value.newSalary || 0) -
  Number(form.value.currentSalary || 0),
)

const increasePercentage = computed(() => {
  const current = Number(form.value.currentSalary || 0)

  if (current <= 0) return 0

  return (salaryIncrease.value / current) * 100
})

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)

// ----------------------------------------------
// MODAL ACTIONS
// ----------------------------------------------

const closeModal = () => {
  modalMode.value = null
  selectedPromotion.value = null
  formError.value = ''
  saving.value = false
}

const handleNewPromotion = () => {
  form.value = emptyForm()
  selectedPromotion.value = null
  formError.value = ''
  modalMode.value = 'create'
}

const handleViewPromotion = (item: PromotionRecord) => {
  selectedPromotion.value = item
  modalMode.value = 'view'
}

const handleEditPromotion = (item: PromotionRecord) => {
  selectedPromotion.value = item

  form.value = {
    employeeName: item.employeeName,
    employeeNumber: item.employeeNumber,
    department: item.department,
    promotionType: item.promotionType,
    currentPosition: item.currentPosition,
    newPosition: item.newPosition,
    currentSalary: item.currentSalary,
    newSalary: item.newSalary,
    recommendedBy: item.recommendedBy,
    approvedBy: item.approvedBy ?? '',
    recommendationDate: item.recommendationDate,
    effectiveDate: item.effectiveDate,
    status: item.status,
    reason: item.reason,
  }

  formError.value = ''
  modalMode.value = 'edit'
}

// ----------------------------------------------
// SAVE PROMOTION
// ----------------------------------------------

const handleSavePromotion = () => {
  formError.value = ''

  const values = form.value

  if (
    !values.employeeName.trim() ||
    !values.employeeNumber.trim() ||
    !values.department ||
    !values.promotionType ||
    !values.currentPosition.trim() ||
    !values.newPosition.trim() ||
    !values.recommendedBy.trim() ||
    !values.recommendationDate ||
    !values.effectiveDate ||
    !values.reason.trim()
  ) {
    formError.value = 'Please complete all required fields.'
    return
  }

  if (
    values.currentSalary < 0 ||
    values.newSalary < 0
  ) {
    formError.value = 'Salary cannot be negative.'
    return
  }

  if (salaryIncrease.value < 0) {
    formError.value = 'New salary cannot be lower than current salary.'
    return
  }

  saving.value = true

  const isEdit = modalMode.value === 'edit'
  const existing = selectedPromotion.value

  const id = isEdit && existing
    ? existing.id
    : Date.now()

  const record = {
    ...(existing ?? {}),
    id,
    promotionNumber:
      existing?.promotionNumber ?? `PROM-${id}`,
    employeeName: values.employeeName.trim(),
    employeeNumber: values.employeeNumber.trim(),
    department: values.department,
    promotionType: values.promotionType as PromotionType,
    currentPosition: values.currentPosition.trim(),
    newPosition: values.newPosition.trim(),
    currentSalary: Number(values.currentSalary),
    newSalary: Number(values.newSalary),
    salaryIncrease: salaryIncrease.value,
    increasePercentage: increasePercentage.value,
    recommendedBy: values.recommendedBy.trim(),
    approvedBy: values.approvedBy.trim() || undefined,
    recommendationDate: values.recommendationDate,
    effectiveDate: values.effectiveDate,
    status: values.status as PromotionStatus,
    reason: values.reason.trim(),
    currentGrade: existing?.currentGrade ?? '',
    newGrade: existing?.newGrade ?? '',
  } as PromotionRecord

  if (isEdit && existing) {
    if (addedRecords.value.some(item => item.id === existing.id)) {
      addedRecords.value = addedRecords.value.map(item =>
        item.id === existing.id ? record : item,
      )
    } else {
      editedRecords.value[String(existing.id)] = record
    }
  } else {
    addedRecords.value.unshift(record)
  }

  currentPage.value = 1

  info(
    isEdit ? 'Promotion Updated' : 'Promotion Created',
    'Changes are saved in the current frontend session only.',
  )

  closeModal()
}

// ----------------------------------------------
// EXPORT
// ----------------------------------------------

const handleExport = () => {
  exportScope.value = 'filtered'
  modalMode.value = 'export'
}

const escapeCsv = (value: unknown) => {
  const text = String(value ?? '')

  const safe = /^[\s]*[=+\-@]/.test(text)
    ? `'${text}`
    : text

  return `"${safe.replace(/"/g, '""')}"`
}

const exportCsv = () => {
  const records = exportScope.value === 'filtered'
    ? displayRecords.value
    : [
        ...addedRecords.value,
        ...filteredRecords.value.map(item =>
          editedRecords.value[String(item.id)] ?? item,
        ),
      ]

  const headers = [
    'Promotion No',
    'Employee',
    'Employee ID',
    'Department',
    'Promotion Type',
    'Current Position',
    'New Position',
    'Current Salary',
    'New Salary',
    'Increase',
    'Increase Percentage',
    'Recommended By',
    'Approved By',
    'Recommendation Date',
    'Effective Date',
    'Status',
    'Reason',
  ]

  const rows = records.map(item => [
    item.promotionNumber,
    item.employeeName,
    item.employeeNumber,
    item.department,
    item.promotionType,
    item.currentPosition,
    item.newPosition,
    item.currentSalary,
    item.newSalary,
    item.salaryIncrease,
    item.increasePercentage,
    item.recommendedBy,
    item.approvedBy,
    item.recommendationDate,
    item.effectiveDate,
    item.status,
    item.reason,
  ])

  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\r\n')

  const blob = new Blob(
    ['\uFEFF', csv],
    { type: 'text/csv;charset=utf-8;' },
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'employee-promotions.csv'

  document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)

  closeModal()
}

// ----------------------------------------------
// KEYBOARD / SCROLL
// ----------------------------------------------

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && modalMode.value) {
    closeModal()
  }
}

watch(modalMode, value => {
  if (!import.meta.client) return
  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="promotions-page">
    <!-- HEADER -->
    <PageHeader
      title="Employee Promotions"
      description="Manage employee position, grade and salary advancement with recommendation, approval and effective-date tracking."
    >
      <div class="header-actions">
        <AppButton
          variant="secondary"
          :icon="Download"
          @click="handleExport"
        >
          Export
        </AppButton>

        <AppButton
          :icon="TrendingUp"
          @click="handleNewPromotion"
        >
          New Promotion
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS -->
    <PromotionStats :stats="stats" />

    <!-- FILTERS -->
    <PromotionFilters
      v-model:search="search"
      v-model:department="department"
      v-model:promotion-type="promotionType"
      v-model:status="status"
      :departments="departmentOptions"
      :promotion-types="promotionTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE -->
    <PromotionTable
      :records="paginatedRecords"
      @view="handleViewPromotion"
      @edit="handleEditPromotion"
    />

    <!-- PAGINATION -->
    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ displayRecords.length }}</strong>
        promotion records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- MODALS -->
    <Teleport to="body">
      <div
        v-if="modalMode"
        class="promotion-modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="promotion-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="promotion-modal-title"
        >
          <!-- MODAL HEADER -->
          <div class="promotion-modal-header">
            <div class="promotion-modal-title">
              <div class="promotion-modal-icon">
                <FileDown v-if="modalMode === 'export'" :size="19" />
                <Eye v-else-if="modalMode === 'view'" :size="19" />
                <Pencil v-else-if="modalMode === 'edit'" :size="19" />
                <TrendingUp v-else :size="19" />
              </div>

              <div>
                <h2 id="promotion-modal-title">
                  {{
                    modalMode === 'export'
                      ? 'Export Employee Promotions'
                      : modalMode === 'view'
                        ? 'View Promotion'
                        : modalMode === 'edit'
                          ? 'Edit Promotion'
                          : 'New Employee Promotion'
                  }}
                </h2>

                <p>
                  {{
                    modalMode === 'export'
                      ? 'Export promotion records to CSV.'
                      : modalMode === 'view'
                        ? 'Review employee promotion information.'
                        : 'Complete the employee promotion details.'
                  }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="promotion-modal-close"
              aria-label="Close modal"
              @click="closeModal"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- VIEW PROMOTION -->
          <div
            v-if="modalMode === 'view' && selectedPromotion"
            class="promotion-modal-body"
          >
            <div class="promotion-details-grid">
              <div
                v-for="field in [
                  { label: 'Promotion No.', value: selectedPromotion.promotionNumber },
                  { label: 'Employee', value: selectedPromotion.employeeName },
                  { label: 'Employee ID', value: selectedPromotion.employeeNumber },
                  { label: 'Department', value: selectedPromotion.department },
                  { label: 'Promotion Type', value: selectedPromotion.promotionType },
                  { label: 'Current Position', value: selectedPromotion.currentPosition },
                  { label: 'New Position', value: selectedPromotion.newPosition },
                  { label: 'Current Salary', value: formatMoney(selectedPromotion.currentSalary) },
                  { label: 'New Salary', value: formatMoney(selectedPromotion.newSalary) },
                  { label: 'Salary Increase', value: formatMoney(selectedPromotion.salaryIncrease) },
                  { label: 'Increase Percentage', value: `${selectedPromotion.increasePercentage.toFixed(2)}%` },
                  { label: 'Recommended By', value: selectedPromotion.recommendedBy },
                  { label: 'Approved By', value: selectedPromotion.approvedBy },
                  { label: 'Recommendation Date', value: selectedPromotion.recommendationDate },
                  { label: 'Effective Date', value: selectedPromotion.effectiveDate },
                  { label: 'Status', value: selectedPromotion.status },
                ]"
                :key="field.label"
                class="promotion-detail"
              >
                <span>{{ field.label }}</span>
                <strong>{{ field.value || '—' }}</strong>
              </div>

              <div class="promotion-detail full-width">
                <span>Reason</span>
                <strong>{{ selectedPromotion.reason || '—' }}</strong>
              </div>
            </div>
          </div>

          <!-- CREATE / EDIT -->
          <form
            v-else-if="modalMode === 'create' || modalMode === 'edit'"
            @submit.prevent="handleSavePromotion"
          >
            <div class="promotion-modal-body">
              <div v-if="formError" class="promotion-form-error">
                {{ formError }}
              </div>

              <div class="promotion-form-grid">
                <label class="promotion-field">
                  Employee Name *
                  <input
                    v-model="form.employeeName"
                    placeholder="Employee full name"
                    required
                  />
                </label>

                <label class="promotion-field">
                  Employee ID *
                  <input
                    v-model="form.employeeNumber"
                    placeholder="EMP-001"
                    required
                  />
                </label>

                <label class="promotion-field">
                  Department *
                  <select v-model="form.department" required>
                    <option value="" disabled>Select department</option>

                    <option
                      v-for="option in departmentChoices"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="promotion-field">
                  Promotion Type *
                  <select v-model="form.promotionType" required>
                    <option
                      v-for="option in typeChoices"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="promotion-field">
                  Current Position *
                  <input
                    v-model="form.currentPosition"
                    placeholder="Current position"
                    required
                  />
                </label>

                <label class="promotion-field">
                  New Position *
                  <input
                    v-model="form.newPosition"
                    placeholder="Promoted position"
                    required
                  />
                </label>

                <label class="promotion-field">
                  Current Salary (PHP)
                  <input
                    v-model.number="form.currentSalary"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </label>

                <label class="promotion-field">
                  New Salary (PHP)
                  <input
                    v-model.number="form.newSalary"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </label>

                <div class="promotion-salary-summary full-width">
                  <div>
                    <span>Salary Increase</span>
                    <strong>{{ formatMoney(salaryIncrease) }}</strong>
                  </div>

                  <div>
                    <span>Increase Percentage</span>
                    <strong>{{ increasePercentage.toFixed(2) }}%</strong>
                  </div>
                </div>

                <label class="promotion-field">
                  Recommended By *
                  <input
                    v-model="form.recommendedBy"
                    placeholder="Recommending officer"
                    required
                  />
                </label>

                <label class="promotion-field">
                  Approved By
                  <input
                    v-model="form.approvedBy"
                    placeholder="Approving officer (optional)"
                  />
                </label>

                <label class="promotion-field">
                  Recommendation Date *
                  <input
                    v-model="form.recommendationDate"
                    type="date"
                    required
                  />
                </label>

                <label class="promotion-field">
                  Effective Date *
                  <input
                    v-model="form.effectiveDate"
                    type="date"
                    required
                  />
                </label>

                <label class="promotion-field">
                  Status
                  <select v-model="form.status">
                    <option
                      v-for="option in statusChoices"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="promotion-field full-width">
                  Reason for Promotion *
                  <textarea
                    v-model="form.reason"
                    rows="4"
                    placeholder="Enter the reason for promotion..."
                    required
                  />
                </label>
              </div>

              <p class="promotion-demo-note">
                Frontend demonstration only. Records are not yet
                saved to the Laravel database.
              </p>
            </div>

            <div class="promotion-modal-footer">
              <button
                type="button"
                class="promotion-secondary-button"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="promotion-primary-button"
                :disabled="saving"
              >
                <Save :size="15" />
                {{ modalMode === 'edit' ? 'Save Changes' : 'Create Promotion' }}
              </button>
            </div>
          </form>

          <!-- EXPORT MODAL -->
          <div
            v-else-if="modalMode === 'export'"
            class="promotion-modal-body"
          >
            <p class="promotion-export-description">
              Select which promotion records you want to export.
            </p>

            <label class="promotion-export-option">
              <input
                v-model="exportScope"
                type="radio"
                value="filtered"
              />

              <span>
                <strong>Filtered Records</strong>
                <small>
                  Export {{ displayRecords.length }} matching records.
                </small>
              </span>
            </label>

            <label class="promotion-export-option">
              <input
                v-model="exportScope"
                type="radio"
                value="loaded"
              />

              <span>
                <strong>Currently Loaded Records</strong>
                <small>
                  Export currently loaded frontend records.
                </small>
              </span>
            </label>
          </div>

          <!-- VIEW / EXPORT FOOTER -->
          <div
            v-if="modalMode === 'view' || modalMode === 'export'"
            class="promotion-modal-footer"
          >
            <button
              type="button"
              class="promotion-secondary-button"
              @click="closeModal"
            >
              Close
            </button>

            <button
              v-if="modalMode === 'view' && selectedPromotion"
              type="button"
              class="promotion-primary-button"
              @click="handleEditPromotion(selectedPromotion)"
            >
              <Pencil :size="15" />
              Edit Promotion
            </button>

            <button
              v-if="modalMode === 'export'"
              type="button"
              class="promotion-primary-button"
              @click="exportCsv"
            >
              <Download :size="15" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.promotions-page {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 3px 0;
}

.table-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 11px;
}

.table-footer strong {
  color: var(--text-primary);
  font-weight: 650;
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .table-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

<style>
.promotion-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 9, 22, 0.67);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.promotion-modal {
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

.promotion-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.promotion-modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.promotion-modal-icon {
  display: flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
}

.promotion-modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 700;
}

.promotion-modal-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.promotion-modal-close {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.promotion-modal-close:hover {
  border-color: var(--border);
  background: var(--bg-card-soft);
}

.promotion-modal-body {
  padding: 24px;
}

.promotion-details-grid,
.promotion-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.promotion-detail,
.promotion-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.promotion-detail span {
  color: var(--text-muted);
  font-size: 11px;
}

.promotion-detail strong {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.promotion-field {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.promotion-field input,
.promotion-field select,
.promotion-field textarea {
  width: 100%;
  min-height: 39px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
  font-weight: 400;
}

.promotion-field input:focus,
.promotion-field select:focus,
.promotion-field textarea:focus {
  border-color: var(--primary);
}

.promotion-field textarea {
  resize: vertical;
}

.promotion-field input::placeholder,
.promotion-field textarea::placeholder {
  color: var(--text-muted);
}

.full-width {
  grid-column: 1 / -1;
}

.promotion-salary-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.promotion-salary-summary > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.promotion-salary-summary span {
  color: var(--text-muted);
  font-size: 10px;
}

.promotion-salary-summary strong {
  color: var(--green);
  font-size: 13px;
}

.promotion-form-error {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--red);
  border-radius: 8px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 11px;
}

.promotion-demo-note {
  margin: 18px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.promotion-export-description {
  margin: 0 0 16px;
  color: var(--text-secondary);
  font-size: 12px;
}

.promotion-export-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 10px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  cursor: pointer;
}

.promotion-export-option input {
  margin-top: 3px;
  accent-color: var(--primary);
}

.promotion-export-option span {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.promotion-export-option strong {
  color: var(--text-primary);
  font-size: 12px;
}

.promotion-export-option small {
  color: var(--text-muted);
  font-size: 10px;
}

.promotion-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.promotion-secondary-button,
.promotion-primary-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 17px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.promotion-secondary-button {
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.promotion-primary-button {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
}

.promotion-primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 650px) {
  .promotion-modal-overlay {
    padding: 12px;
  }

  .promotion-modal {
    max-height: 94vh;
  }

  .promotion-modal-body {
    padding: 18px;
  }

  .promotion-form-grid,
  .promotion-details-grid {
    grid-template-columns: 1fr;
  }

  .promotion-salary-summary {
    grid-template-columns: 1fr;
  }

  .promotion-modal-footer {
    flex-wrap: wrap;
  }
}
</style>
