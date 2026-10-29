
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, unref } from 'vue'

import {
  Download,
  FilePenLine,
  X,
  Eye,
  Pencil,
  Save,
  FileDown,
} from 'lucide-vue-next'

import EmploymentChangeStats from '~/components/admin/employee-lifecycle/changes/EmploymentChangeStats.vue'
import EmploymentChangeFilters from '~/components/admin/employee-lifecycle/changes/EmploymentChangeFilters.vue'
import EmploymentChangeTable from '~/components/admin/employee-lifecycle/changes/EmploymentChangeTable.vue'

import type {
  EmploymentChangeRecord,
  EmploymentChangeStatus,
  EmploymentChangeType,
} from '~/types/employmentChange'

definePageMeta({ layout: 'admin' })

const {
  search,
  changeType,
  department,
  status,
  currentPage,
  filteredRecords,
  paginatedRecords,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  changeTypeOptions,
  departmentOptions,
  statusOptions,
  resetFilters,
} = useEmploymentChanges()

const { info } = useToast()

type ModalMode = 'create' | 'view' | 'edit' | 'export' | null

interface EmploymentChangeForm {
  employeeName: string
  employeeNumber: string
  position: string
  department: string
  changeType: string
  currentValue: string
  newValue: string
  requestedDate: string
  effectiveDate: string
  requestedBy: string
  approvedBy: string
  status: string
  reason: string
  remarks: string
}

const modalMode = ref<ModalMode>(null)
const selectedRecord = ref<EmploymentChangeRecord | null>(null)
const addedRecords = ref<EmploymentChangeRecord[]>([])
const editedRecords = ref<Record<string, EmploymentChangeRecord>>({})
const formError = ref('')
const exportScope = ref<'filtered' | 'all'>('filtered')

const emptyForm = (): EmploymentChangeForm => ({
  employeeName: '',
  employeeNumber: '',
  position: '',
  department: '',
  changeType: '',
  currentValue: '',
  newValue: '',
  requestedDate: new Date().toLocaleDateString('en-CA'),
  effectiveDate: '',
  requestedBy: '',
  approvedBy: '',
  status: 'Draft',
  reason: '',
  remarks: '',
})

const form = ref<EmploymentChangeForm>(emptyForm())

// --------------------------------------------------
// DROPDOWN OPTIONS
// --------------------------------------------------

const normalizeOptions = (source: unknown): string[] => {
  const values = unref(source)

  if (!Array.isArray(values)) return []

  return values.filter(
    (value): value is string =>
      typeof value === 'string' &&
      value.trim().length > 0 &&
      !value.toLowerCase().startsWith('all '),
  )
}

const changeTypeChoices = computed(() => [
  ...new Set([
    ...normalizeOptions(changeTypeOptions),
    'Employment Type Change',
    'Contract Extension',
    'Work Arrangement Change',
    'Reporting Line Change',
    'Compensation Adjustment',
    'Employment Status Change',
    ...(form.value.changeType ? [form.value.changeType] : []),
  ]),
])

const departmentChoices = computed(() => [
  ...new Set([
    ...normalizeOptions(departmentOptions),
    ...filteredRecords.value.map(item => item.department),
    ...addedRecords.value.map(item => item.department),
    ...(form.value.department ? [form.value.department] : []),
  ].filter(Boolean)),
])

const statusChoices = [
  'Draft',
  'For Review',
  'Pending Approval',
  'Approved',
  'Scheduled',
  'Effective',
  'Rejected',
  'Cancelled',
]

// --------------------------------------------------
// DISPLAY RECORDS
// --------------------------------------------------

const allRecords = computed(() => {
  const base = filteredRecords.value.map(item =>
    editedRecords.value[String(item.id)] ?? item,
  )

  return [...addedRecords.value, ...base]
})

const matchesFilters = (item: EmploymentChangeRecord) => {
  const keyword = String(search.value ?? '').trim().toLowerCase()

  const searchable = [
    item.changeNumber,
    item.employeeName,
    item.employeeNumber,
    item.position,
    item.department,
    item.changeType,
    item.currentValue,
    item.newValue,
    item.reason,
    item.remarks,
  ].join(' ').toLowerCase()

  const matchesChoice = (selected: string, value: string) => {
    const selectedValue = String(selected ?? '').toLowerCase()

    return (
      !selectedValue ||
      selectedValue === 'all' ||
      selectedValue.startsWith('all ') ||
      selected === value
    )
  }

  return (
    (!keyword || searchable.includes(keyword)) &&
    matchesChoice(String(changeType.value), item.changeType) &&
    matchesChoice(String(department.value), item.department) &&
    matchesChoice(String(status.value), item.status)
  )
}

const displayRecords = computed(() =>
  allRecords.value.filter(matchesFilters),
)

// Existing composable pagination remains the default.
// Locally added records are included in the same displayed list.
const pageSize = computed(() => {
  const currentCount = paginatedRecords.value.length

  return Math.max(currentCount, 6)
})

const displayTotalPages = computed(() =>
  Math.max(1, Math.ceil(displayRecords.value.length / pageSize.value)),
)

const displayPaginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value

  return displayRecords.value.slice(start, start + pageSize.value)
})

const displayShowingFrom = computed(() =>
  displayRecords.value.length
    ? (currentPage.value - 1) * pageSize.value + 1
    : 0,
)

const displayShowingTo = computed(() =>
  Math.min(
    currentPage.value * pageSize.value,
    displayRecords.value.length,
  ),
)

watch([search, changeType, department, status], () => {
  currentPage.value = 1
})

watch(displayTotalPages, pages => {
  if (currentPage.value > pages) currentPage.value = pages
})

// --------------------------------------------------
// MODAL CONTROLS
// --------------------------------------------------

const closeModal = () => {
  modalMode.value = null
  selectedRecord.value = null
  formError.value = ''
}

const handleNewChange = () => {
  selectedRecord.value = null
  form.value = emptyForm()
  formError.value = ''
  modalMode.value = 'create'
}

const handleViewChange = (item: EmploymentChangeRecord) => {
  selectedRecord.value = item
  modalMode.value = 'view'
}

const handleEditChange = (item: EmploymentChangeRecord) => {
  selectedRecord.value = item

  form.value = {
    employeeName: item.employeeName,
    employeeNumber: item.employeeNumber,
    position: item.position,
    department: item.department,
    changeType: item.changeType,
    currentValue: item.currentValue,
    newValue: item.newValue,
    requestedDate: item.requestedDate,
    effectiveDate: item.effectiveDate,
    requestedBy: item.requestedBy,
    approvedBy: item.approvedBy ?? '',
    status: item.status,
    reason: item.reason,
    remarks: item.remarks ?? '',
  }

  formError.value = ''
  modalMode.value = 'edit'
}

// --------------------------------------------------
// CREATE / UPDATE
// --------------------------------------------------

const handleSaveChange = () => {
  formError.value = ''

  const values = form.value

  if (
    !values.employeeName.trim() ||
    !values.employeeNumber.trim() ||
    !values.position.trim() ||
    !values.department.trim() ||
    !values.changeType.trim() ||
    !values.currentValue.trim() ||
    !values.newValue.trim() ||
    !values.requestedDate ||
    !values.effectiveDate ||
    !values.requestedBy.trim() ||
    !values.reason.trim()
  ) {
    formError.value = 'Please complete all required fields.'
    return
  }

  if (values.effectiveDate < values.requestedDate) {
    formError.value =
      'Effective date cannot be earlier than the requested date.'
    return
  }

  const isEdit = modalMode.value === 'edit'
  const original = selectedRecord.value
  const newId = Date.now()

  const record = {
    ...(original ?? {}),
    id: isEdit && original ? original.id : newId,
    changeNumber: isEdit && original
      ? original.changeNumber
      : `EC-${newId}`,
    employeeName: values.employeeName.trim(),
    employeeNumber: values.employeeNumber.trim(),
    position: values.position.trim(),
    department: values.department,
    changeType: values.changeType as EmploymentChangeType,
    currentValue: values.currentValue.trim(),
    newValue: values.newValue.trim(),
    requestedDate: values.requestedDate,
    effectiveDate: values.effectiveDate,
    requestedBy: values.requestedBy.trim(),
    approvedBy: values.approvedBy.trim(),
    status: values.status as EmploymentChangeStatus,
    reason: values.reason.trim(),
    remarks: values.remarks.trim(),
  } as EmploymentChangeRecord

  if (isEdit && original) {
    const index = addedRecords.value.findIndex(
      item => item.id === original.id,
    )

    if (index !== -1) {
      addedRecords.value[index] = record
    } else {
      editedRecords.value[String(original.id)] = record
    }
  } else {
    addedRecords.value.unshift(record)
  }

  currentPage.value = 1

  info(
    isEdit ? 'Employment Change Updated' : 'Employment Change Created',
    'Changes are stored in the current frontend session only.',
  )

  closeModal()
}

// --------------------------------------------------
// CSV EXPORT
// --------------------------------------------------

const handleExport = () => {
  exportScope.value = 'filtered'
  modalMode.value = 'export'
}

const escapeCsv = (value: unknown) => {
  const text = String(value ?? '')
  const safe = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text

  return `"${safe.replace(/"/g, '""')}"`
}

const exportCsv = () => {
  const records = exportScope.value === 'filtered'
    ? displayRecords.value
    : allRecords.value

  const headers = [
    'Change No.',
    'Employee Name',
    'Employee ID',
    'Position',
    'Department',
    'Change Type',
    'Current Value',
    'New Value',
    'Requested Date',
    'Effective Date',
    'Requested By',
    'Approved By',
    'Status',
    'Reason',
    'Remarks',
  ]

  const rows = records.map(item => [
    item.changeNumber,
    item.employeeName,
    item.employeeNumber,
    item.position,
    item.department,
    item.changeType,
    item.currentValue,
    item.newValue,
    item.requestedDate,
    item.effectiveDate,
    item.requestedBy,
    item.approvedBy,
    item.status,
    item.reason,
    item.remarks,
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
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = 'employment-changes.csv'

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)

  closeModal()
}

// --------------------------------------------------
// KEYBOARD / BACKDROP
// --------------------------------------------------

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
  <section class="employment-changes-page">
    <!-- PAGE HEADER -->
    <PageHeader
      title="Employment Changes"
      description="Track updates to employment type, contracts, compensation, reporting lines, work arrangements and employee status."
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
          :icon="FilePenLine"
          @click="handleNewChange"
        >
          New Employment Change
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS -->
    <EmploymentChangeStats :stats="stats" />

    <!-- FILTERS -->
    <EmploymentChangeFilters
      v-model:search="search"
      v-model:change-type="changeType"
      v-model:department="department"
      v-model:status="status"
      :change-types="changeTypeOptions"
      :departments="departmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE -->
    <EmploymentChangeTable
      :records="displayPaginatedRecords"
      @view="handleViewChange"
      @edit="handleEditChange"
    />

    <!-- PAGINATION -->
    <div class="table-footer">
      <p>
        Showing
        <strong>
          {{ displayShowingFrom }}–{{ displayShowingTo }}
        </strong>
        of
        <strong>{{ displayRecords.length }}</strong>
        employment changes
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="displayTotalPages"
      />
    </div>

    <!-- MODALS -->
    <Teleport to="body">
      <div
        v-if="modalMode"
        class="ec-modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="ec-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ec-modal-heading"
        >
          <!-- MODAL HEADER -->
          <div class="ec-modal-header">
            <div class="ec-modal-title">
              <div class="ec-modal-icon">
                <FileDown
                  v-if="modalMode === 'export'"
                  :size="19"
                />
                <Eye
                  v-else-if="modalMode === 'view'"
                  :size="19"
                />
                <Pencil
                  v-else-if="modalMode === 'edit'"
                  :size="19"
                />
                <FilePenLine v-else :size="19" />
              </div>

              <div>
                <h2 id="ec-modal-heading">
                  {{
                    modalMode === 'export'
                      ? 'Export Employment Changes'
                      : modalMode === 'view'
                        ? 'View Employment Change'
                        : modalMode === 'edit'
                          ? 'Edit Employment Change'
                          : 'New Employment Change'
                  }}
                </h2>

                <p>
                  {{
                    modalMode === 'export'
                      ? 'Download employment change records.'
                      : modalMode === 'view'
                        ? 'Review employee employment change details.'
                        : 'Complete the employment change information.'
                  }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="ec-modal-close"
              aria-label="Close modal"
              @click="closeModal"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- VIEW DETAILS -->
          <div
            v-if="modalMode === 'view' && selectedRecord"
            class="ec-modal-body"
          >
            <div class="ec-details-grid">
              <div
                v-for="field in [
                  { label: 'Change No.', value: selectedRecord.changeNumber },
                  { label: 'Employee Name', value: selectedRecord.employeeName },
                  { label: 'Employee ID', value: selectedRecord.employeeNumber },
                  { label: 'Position', value: selectedRecord.position },
                  { label: 'Department', value: selectedRecord.department },
                  { label: 'Change Type', value: selectedRecord.changeType },
                  { label: 'Current Value', value: selectedRecord.currentValue },
                  { label: 'New Value', value: selectedRecord.newValue },
                  { label: 'Requested Date', value: selectedRecord.requestedDate },
                  { label: 'Effective Date', value: selectedRecord.effectiveDate },
                  { label: 'Requested By', value: selectedRecord.requestedBy },
                  { label: 'Approved By', value: selectedRecord.approvedBy },
                  { label: 'Status', value: selectedRecord.status },
                ]"
                :key="field.label"
                class="ec-detail"
              >
                <span>{{ field.label }}</span>
                <strong>{{ field.value || '—' }}</strong>
              </div>

              <div class="ec-detail full-width">
                <span>Reason</span>
                <strong>{{ selectedRecord.reason || '—' }}</strong>
              </div>

              <div class="ec-detail full-width">
                <span>Remarks</span>
                <strong>{{ selectedRecord.remarks || 'No remarks' }}</strong>
              </div>
            </div>
          </div>

          <!-- CREATE / EDIT -->
          <form
            v-else-if="modalMode === 'create' || modalMode === 'edit'"
            @submit.prevent="handleSaveChange"
          >
            <div class="ec-modal-body">
              <div v-if="formError" class="ec-form-error">
                {{ formError }}
              </div>

              <div class="ec-form-grid">
                <label class="ec-field">
                  Employee Name *
                  <input
                    v-model="form.employeeName"
                    placeholder="Employee full name"
                    required
                  />
                </label>

                <label class="ec-field">
                  Employee ID *
                  <input
                    v-model="form.employeeNumber"
                    placeholder="EMP-001"
                    required
                  />
                </label>

                <label class="ec-field">
                  Position *
                  <input
                    v-model="form.position"
                    placeholder="Current position"
                    required
                  />
                </label>

                <label class="ec-field">
                  Department *
                  <select v-model="form.department" required>
                    <option value="" disabled>
                      Select department
                    </option>

                    <option
                      v-for="option in departmentChoices"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="ec-field">
                  Change Type *
                  <select v-model="form.changeType" required>
                    <option value="" disabled>
                      Select change type
                    </option>

                    <option
                      v-for="option in changeTypeChoices"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="ec-field">
                  Status *
                  <select v-model="form.status" required>
                    <option
                      v-for="option in statusChoices"
                      :key="option"
                      :value="option"
                    >
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="ec-field">
                  Current Value *
                  <input
                    v-model="form.currentValue"
                    placeholder="Existing employment value"
                    required
                  />
                </label>

                <label class="ec-field">
                  New Value *
                  <input
                    v-model="form.newValue"
                    placeholder="New employment value"
                    required
                  />
                </label>

                <label class="ec-field">
                  Requested Date *
                  <input
                    v-model="form.requestedDate"
                    type="date"
                    required
                  />
                </label>

                <label class="ec-field">
                  Effective Date *
                  <input
                    v-model="form.effectiveDate"
                    type="date"
                    required
                  />
                </label>

                <label class="ec-field">
                  Requested By *
                  <input
                    v-model="form.requestedBy"
                    placeholder="Requesting officer"
                    required
                  />
                </label>

                <label class="ec-field">
                  Approved By
                  <input
                    v-model="form.approvedBy"
                    placeholder="Approving officer"
                  />
                </label>

                <label class="ec-field full-width">
                  Reason *
                  <textarea
                    v-model="form.reason"
                    rows="3"
                    placeholder="Describe the reason for this employment change..."
                    required
                  />
                </label>

                <label class="ec-field full-width">
                  Remarks
                  <textarea
                    v-model="form.remarks"
                    rows="3"
                    placeholder="Additional remarks (optional)"
                  />
                </label>
              </div>

              <p class="ec-demo-note">
                Frontend demonstration only. Changes are not yet saved
                to the Laravel API or applied to employee records.
              </p>
            </div>

            <div class="ec-modal-footer">
              <button
                type="button"
                class="ec-secondary-button"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="ec-primary-button"
              >
                <Save :size="15" />
                {{
                  modalMode === 'edit'
                    ? 'Save Changes'
                    : 'Create Employment Change'
                }}
              </button>
            </div>
          </form>

          <!-- EXPORT -->
          <div
            v-else-if="modalMode === 'export'"
            class="ec-modal-body"
          >
            <p class="ec-export-description">
              Select the records you want to download in CSV format.
            </p>

            <label class="ec-export-option">
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

            <label class="ec-export-option">
              <input
                v-model="exportScope"
                type="radio"
                value="all"
              />
              <span>
                <strong>Currently Loaded Records</strong>
                <small>
                  Export loaded frontend records, not the entire database.
                </small>
              </span>
            </label>
          </div>

          <!-- VIEW / EXPORT FOOTER -->
          <div
            v-if="modalMode === 'view' || modalMode === 'export'"
            class="ec-modal-footer"
          >
            <button
              type="button"
              class="ec-secondary-button"
              @click="closeModal"
            >
              Close
            </button>

            <button
              v-if="modalMode === 'view' && selectedRecord"
              type="button"
              class="ec-primary-button"
              @click="handleEditChange(selectedRecord)"
            >
              <Pencil :size="15" />
              Edit Employment Change
            </button>

            <button
              v-if="modalMode === 'export'"
              type="button"
              class="ec-primary-button"
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
.employment-changes-page {
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
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<style>
.ec-modal-overlay {
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

.ec-modal {
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

.ec-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.ec-modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ec-modal-icon {
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

.ec-modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 700;
}

.ec-modal-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.ec-modal-close {
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

.ec-modal-close:hover {
  border-color: var(--border);
  background: var(--bg-card-soft);
}

.ec-modal-body {
  padding: 24px;
}

.ec-details-grid,
.ec-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.ec-detail,
.ec-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.ec-detail span {
  color: var(--text-muted);
  font-size: 11px;
}

.ec-detail strong {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.ec-field {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.ec-field input,
.ec-field select,
.ec-field textarea {
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

.ec-field textarea {
  resize: vertical;
}

.ec-field input:focus,
.ec-field select:focus,
.ec-field textarea:focus {
  border-color: var(--primary);
}

.ec-field input::placeholder,
.ec-field textarea::placeholder {
  color: var(--text-muted);
}

.full-width {
  grid-column: 1 / -1;
}

.ec-form-error {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--red);
  border-radius: 8px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 11px;
}

.ec-demo-note {
  margin: 18px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.ec-export-description {
  margin: 0 0 16px;
  color: var(--text-secondary);
  font-size: 12px;
}

.ec-export-option {
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

.ec-export-option input {
  margin-top: 3px;
  accent-color: var(--primary);
}

.ec-export-option span {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ec-export-option strong {
  color: var(--text-primary);
  font-size: 12px;
}

.ec-export-option small {
  color: var(--text-muted);
  font-size: 10px;
}

.ec-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.ec-secondary-button,
.ec-primary-button {
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

.ec-secondary-button {
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.ec-primary-button {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
}

.ec-primary-button:hover {
  filter: brightness(1.08);
}

.ec-secondary-button:hover {
  background: var(--primary-soft);
}

@media (max-width: 650px) {
  .ec-modal-overlay {
    padding: 12px;
  }

  .ec-modal {
    max-height: 94vh;
  }

  .ec-modal-body {
    padding: 18px;
  }

  .ec-details-grid,
  .ec-form-grid {
    grid-template-columns: 1fr;
  }

  .ec-modal-footer {
    flex-wrap: wrap;
  }
}
</style>
