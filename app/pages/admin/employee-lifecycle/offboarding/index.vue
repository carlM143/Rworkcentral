<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, unref } from 'vue'
import {
  ClipboardCheck,
  Download,
  Eye,
  Plus,
  Save,
  X,
  Pencil,
  FileDown,
} from 'lucide-vue-next'

import OffboardingStats from '~/components/admin/employee-lifecycle/offboarding/OffboardingStats.vue'
import OffboardingFilters from '~/components/admin/employee-lifecycle/offboarding/OffboardingFilters.vue'
import OffboardingTable from '~/components/admin/employee-lifecycle/offboarding/OffboardingTable.vue'

definePageMeta({ layout: 'admin' })

type OffboardingStatus =
  | 'Draft'
  | 'Pending Clearance'
  | 'Clearance In Progress'
  | 'For Review'
  | 'Ready for Final Pay'
  | 'Completed'
  | 'Cancelled'

interface OffboardingRecord {
  id: number | string
  offboardingNumber: string
  employeeName: string
  employeeNumber: string
  position: string
  department: string
  offboardingType: string
  exitInterviewDate?: string
  finalPayStatus?: string
  initiatedBy: string
  approvedBy?: string
  status: OffboardingStatus | string
  reason: string
  remarks?: string
}

const {
  search,
  offboardingType,
  department,
  status,

  currentPage,

  filteredRecords,
  paginatedRecords,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  offboardingTypeOptions,
  departmentOptions,
  statusOptions,

  resetFilters,
} = useOffboarding()

const { info } = useToast()

type ModalMode = 'create' | 'view' | 'edit' | 'export' | null

interface OffboardingForm {
  employeeName: string
  employeeNumber: string
  position: string
  department: string
  offboardingType: string
  exitInterviewDate: string
  finalPayStatus: string
  initiatedBy: string
  approvedBy: string
  status: string
  reason: string
  remarks: string
}

const modalMode = ref<ModalMode>(null)
const selectedRecord = ref<OffboardingRecord | null>(null)
const addedRecords = ref<OffboardingRecord[]>([])
const editedRecords = ref<Record<string, OffboardingRecord>>({})
const formError = ref('')
const exportScope = ref<'filtered' | 'all'>('filtered')

const emptyForm = (): OffboardingForm => ({
  employeeName: '',
  employeeNumber: '',
  position: '',
  department: '',
  offboardingType: '',
  exitInterviewDate: '',
  finalPayStatus: 'Not Started',
  initiatedBy: '',
  approvedBy: '',
  status: 'Draft',
  reason: '',
  remarks: '',
})

const form = ref<OffboardingForm>(emptyForm())

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

const offboardingTypeChoices = computed(() => [
  ...new Set([
    ...normalizeOptions(offboardingTypeOptions),
    'Resignation',
    'Retirement',
    'End of Contract',
    'Termination',
    'Redundancy',
    ...(form.value.offboardingType ? [form.value.offboardingType] : []),
  ]),
])

const departmentChoices = computed(() => [
  ...new Set([
    ...normalizeOptions(departmentOptions),
    ...filteredRecords.value.map((item: any) => item.department),
    ...addedRecords.value.map(item => item.department),
    ...(form.value.department ? [form.value.department] : []),
  ].filter(Boolean)),
])

const statusChoices = [
  'Draft',
  'Pending Clearance',
  'Clearance In Progress',
  'For Review',
  'Ready for Final Pay',
  'Completed',
  'Cancelled',
]

const finalPayChoices = [
  'Not Started',
  'For Review',
  'Ready for Release',
  'Released',
]

const allRecords = computed<OffboardingRecord[]>(() => {
  const base = filteredRecords.value.map((item: any) =>
    editedRecords.value[String(item.id)] ?? item,
  )

  return [...addedRecords.value, ...base]
})

const matchesFilters = (item: OffboardingRecord) => {
  const keyword = String(search.value ?? '').trim().toLowerCase()

  const searchable = [
    item.offboardingNumber,
    item.employeeName,
    item.employeeNumber,
    item.position,
    item.department,
    item.offboardingType,
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
    matchesChoice(String(offboardingType.value), item.offboardingType) &&
    matchesChoice(String(department.value), item.department) &&
    matchesChoice(String(status.value), item.status)
  )
}

const displayRecords = computed(() => allRecords.value.filter(matchesFilters))

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
  Math.min(currentPage.value * pageSize.value, displayRecords.value.length),
)

watch([search, offboardingType, department, status], () => {
  currentPage.value = 1
})

watch(displayTotalPages, pages => {
  if (currentPage.value > pages) currentPage.value = pages
})

const closeModal = () => {
  modalMode.value = null
  selectedRecord.value = null
  formError.value = ''
}

const handleStartOffboarding = () => {
  selectedRecord.value = null
  form.value = emptyForm()
  formError.value = ''
  modalMode.value = 'create'
}

const handleView = (item: OffboardingRecord) => {
  selectedRecord.value = item
  modalMode.value = 'view'
}

const handleEdit = (item: OffboardingRecord) => {
  selectedRecord.value = item

  form.value = {
    employeeName: item.employeeName,
    employeeNumber: item.employeeNumber,
    position: item.position,
    department: item.department,
    offboardingType: item.offboardingType,
    exitInterviewDate: item.exitInterviewDate || '',
    finalPayStatus: item.finalPayStatus || 'Not Started',
    initiatedBy: item.initiatedBy,
    approvedBy: item.approvedBy || '',
    status: item.status,
    reason: item.reason,
    remarks: item.remarks || '',
  }

  formError.value = ''
  modalMode.value = 'edit'
}

const handleSave = () => {
  formError.value = ''

  const values = form.value

  if (
    !values.employeeName.trim() ||
    !values.employeeNumber.trim() ||
    !values.position.trim() ||
    !values.department.trim() ||
    !values.offboardingType.trim() ||
    !values.initiatedBy.trim() ||
    !values.status.trim() ||
    !values.reason.trim()
  ) {
    formError.value = 'Please complete all required fields.'
    return
  }

  const isEdit = modalMode.value === 'edit'
  const original = selectedRecord.value
  const newId = Date.now()

  const record: OffboardingRecord = {
    ...(original ?? {}),
    id: isEdit && original ? original.id : newId,
    offboardingNumber: isEdit && original ? original.offboardingNumber : `OB-${newId}`,
    employeeName: values.employeeName.trim(),
    employeeNumber: values.employeeNumber.trim(),
    position: values.position.trim(),
    department: values.department,
    offboardingType: values.offboardingType,
    exitInterviewDate: values.exitInterviewDate || '',
    finalPayStatus: values.finalPayStatus,
    initiatedBy: values.initiatedBy.trim(),
    approvedBy: values.approvedBy.trim(),
    status: values.status,
    reason: values.reason.trim(),
    remarks: values.remarks.trim(),
  }

  if (isEdit && original) {
    const index = addedRecords.value.findIndex(item => item.id === original.id)

    if (index !== -1) addedRecords.value[index] = record
    else editedRecords.value[String(original.id)] = record
  } else {
    addedRecords.value.unshift(record)
  }

  currentPage.value = 1

  info(
    isEdit ? 'Offboarding Updated' : 'Offboarding Created',
    'Changes are stored in the current frontend session only.',
  )

  closeModal()
}

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
    'Offboarding No.',
    'Employee Name',
    'Employee ID',
    'Position',
    'Department',
    'Offboarding Type',
    'Exit Interview',
    'Final Pay',
    'Initiated By',
    'Approved By',
    'Status',
    'Reason',
    'Remarks',
  ]

  const rows = records.map(item => [
    item.offboardingNumber,
    item.employeeName,
    item.employeeNumber,
    item.position,
    item.department,
    item.offboardingType,
    item.exitInterviewDate,
    item.finalPayStatus,
    item.initiatedBy,
    item.approvedBy,
    item.status,
    item.reason,
    item.remarks,
  ])

  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\r\n')

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'employee-offboarding.csv'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)

  closeModal()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && modalMode.value) closeModal()
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
  <section class="offboarding-page">
    <PageHeader
      title="Employee Offboarding"
      description="Manage employee separation, clearance, asset return, exit interviews and final pay preparation."
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
          :icon="Plus"
          @click="handleStartOffboarding"
        >
          Start Offboarding
        </AppButton>
      </div>
    </PageHeader>

    <OffboardingStats :stats="stats" />

    <OffboardingFilters
      v-model:search="search"
      v-model:offboarding-type="offboardingType"
      v-model:department="department"
      v-model:status="status"
      :offboarding-types="offboardingTypeOptions"
      :departments="departmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <OffboardingTable
      :records="displayPaginatedRecords"
      @view="handleView"
      @edit="handleEdit"
    />

    <div class="table-footer">
      <p>
        Showing
        <strong>{{ displayShowingFrom }}–{{ displayShowingTo }}</strong>
        of
        <strong>{{ displayRecords.length }}</strong>
        offboarding records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="displayTotalPages"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="modalMode"
        class="ob-modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="ob-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ob-modal-heading"
        >
          <div class="ob-modal-header">
            <div class="ob-modal-title">
              <div class="ob-modal-icon">
                <FileDown v-if="modalMode === 'export'" :size="19" />
                <Eye v-else-if="modalMode === 'view'" :size="19" />
                <Pencil v-else-if="modalMode === 'edit'" :size="19" />
                <ClipboardCheck v-else :size="19" />
              </div>

              <div>
                <h2 id="ob-modal-heading">
                  {{
                    modalMode === 'export'
                      ? 'Export Offboarding Records'
                      : modalMode === 'view'
                        ? 'View Offboarding'
                        : modalMode === 'edit'
                          ? 'Edit Offboarding'
                          : 'Start Offboarding'
                  }}
                </h2>

                <p>
                  {{
                    modalMode === 'export'
                      ? 'Download offboarding records in CSV format.'
                      : modalMode === 'view'
                        ? 'Review employee offboarding details.'
                        : 'Complete the employee offboarding information.'
                  }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="ob-modal-close"
              aria-label="Close modal"
              @click="closeModal"
            >
              <X :size="18" />
            </button>
          </div>

          <div
            v-if="modalMode === 'view' && selectedRecord"
            class="ob-modal-body"
          >
            <div class="ob-details-grid">
              <div
                v-for="field in [
                  { label: 'Offboarding No.', value: selectedRecord.offboardingNumber },
                  { label: 'Employee Name', value: selectedRecord.employeeName },
                  { label: 'Employee ID', value: selectedRecord.employeeNumber },
                  { label: 'Position', value: selectedRecord.position },
                  { label: 'Department', value: selectedRecord.department },
                  { label: 'Offboarding Type', value: selectedRecord.offboardingType },
                  { label: 'Exit Interview', value: selectedRecord.exitInterviewDate || 'Not Scheduled' },
                  { label: 'Final Pay', value: selectedRecord.finalPayStatus || 'Not Started' },
                  { label: 'Initiated By', value: selectedRecord.initiatedBy },
                  { label: 'Approved By', value: selectedRecord.approvedBy || 'Pending' },
                  { label: 'Status', value: selectedRecord.status },
                ]"
                :key="field.label"
                class="ob-detail"
              >
                <span>{{ field.label }}</span>
                <strong>{{ field.value }}</strong>
              </div>

              <div class="ob-detail full-width">
                <span>Reason</span>
                <strong>{{ selectedRecord.reason || '—' }}</strong>
              </div>

              <div class="ob-detail full-width">
                <span>Remarks</span>
                <strong>{{ selectedRecord.remarks || 'No remarks' }}</strong>
              </div>
            </div>
          </div>

          <form
            v-else-if="modalMode === 'create' || modalMode === 'edit'"
            @submit.prevent="handleSave"
          >
            <div class="ob-modal-body">
              <div v-if="formError" class="ob-form-error">
                {{ formError }}
              </div>

              <div class="ob-form-grid">
                <label class="ob-field">
                  Employee Name *
                  <input v-model="form.employeeName" placeholder="Employee full name" required />
                </label>

                <label class="ob-field">
                  Employee ID *
                  <input v-model="form.employeeNumber" placeholder="EMP-001" required />
                </label>

                <label class="ob-field">
                  Position *
                  <input v-model="form.position" placeholder="Current position" required />
                </label>

                <label class="ob-field">
                  Department *
                  <select v-model="form.department" required>
                    <option value="" disabled>Select department</option>
                    <option v-for="option in departmentChoices" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="ob-field">
                  Offboarding Type *
                  <select v-model="form.offboardingType" required>
                    <option value="" disabled>Select offboarding type</option>
                    <option v-for="option in offboardingTypeChoices" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="ob-field">
                  Status *
                  <select v-model="form.status" required>
                    <option v-for="option in statusChoices" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="ob-field">
                  Exit Interview Date
                  <input v-model="form.exitInterviewDate" type="date" />
                </label>

                <label class="ob-field">
                  Final Pay Status
                  <select v-model="form.finalPayStatus">
                    <option v-for="option in finalPayChoices" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </label>

                <label class="ob-field">
                  Initiated By *
                  <input v-model="form.initiatedBy" placeholder="Initiating officer" required />
                </label>

                <label class="ob-field">
                  Approved By
                  <input v-model="form.approvedBy" placeholder="Approving officer" />
                </label>

                <label class="ob-field full-width">
                  Reason *
                  <textarea
                    v-model="form.reason"
                    rows="3"
                    placeholder="Describe the reason for offboarding..."
                    required
                  />
                </label>

                <label class="ob-field full-width">
                  Remarks
                  <textarea
                    v-model="form.remarks"
                    rows="3"
                    placeholder="Additional remarks (optional)"
                  />
                </label>
              </div>

              <p class="ob-demo-note">
                Frontend demonstration only. Changes are not yet saved to the Laravel API.
              </p>
            </div>

            <div class="ob-modal-footer">
              <button type="button" class="ob-secondary-button" @click="closeModal">
                Cancel
              </button>

              <button type="submit" class="ob-primary-button">
                <Save :size="15" />
                {{ modalMode === 'edit' ? 'Save Changes' : 'Create Offboarding' }}
              </button>
            </div>
          </form>

          <div v-else-if="modalMode === 'export'" class="ob-modal-body">
            <p class="ob-export-description">
              Select the records you want to download in CSV format.
            </p>

            <label class="ob-export-option">
              <input v-model="exportScope" type="radio" value="filtered" />
              <span>
                <strong>Filtered Records</strong>
                <small>Export {{ displayRecords.length }} matching records.</small>
              </span>
            </label>

            <label class="ob-export-option">
              <input v-model="exportScope" type="radio" value="all" />
              <span>
                <strong>Currently Loaded Records</strong>
                <small>Export loaded frontend records, not the entire database.</small>
              </span>
            </label>
          </div>

          <div v-if="modalMode === 'view' || modalMode === 'export'" class="ob-modal-footer">
            <button type="button" class="ob-secondary-button" @click="closeModal">
              Close
            </button>

            <button
              v-if="modalMode === 'view' && selectedRecord"
              type="button"
              class="ob-primary-button"
              @click="handleEdit(selectedRecord)"
            >
              <Pencil :size="15" />
              Edit Offboarding
            </button>

            <button
              v-if="modalMode === 'export'"
              type="button"
              class="ob-primary-button"
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
.offboarding-page {
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
    align-items: stretch;
    flex-direction: column;
  }

  .table-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

<style>
.ob-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 9, 22, .67);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.ob-modal {
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(0, 0, 0, .35);
}

.ob-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.ob-modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ob-modal-icon {
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

.ob-modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 700;
}

.ob-modal-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.ob-modal-close {
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

.ob-modal-close:hover {
  border-color: var(--border);
  background: var(--bg-card-soft);
}

.ob-modal-body {
  padding: 24px;
}

.ob-details-grid,
.ob-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.ob-detail,
.ob-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.ob-detail span {
  color: var(--text-muted);
  font-size: 11px;
}

.ob-detail strong {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.ob-field {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.ob-field input,
.ob-field select,
.ob-field textarea {
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

.ob-field textarea {
  resize: vertical;
}

.ob-field input:focus,
.ob-field select:focus,
.ob-field textarea:focus {
  border-color: var(--primary);
}

.ob-field input::placeholder,
.ob-field textarea::placeholder {
  color: var(--text-muted);
}

.full-width {
  grid-column: 1 / -1;
}

.ob-form-error {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid var(--red);
  border-radius: 8px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 11px;
}

.ob-demo-note {
  margin: 18px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.ob-export-description {
  margin: 0 0 16px;
  color: var(--text-secondary);
  font-size: 12px;
}

.ob-export-option {
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

.ob-export-option input {
  margin-top: 3px;
  accent-color: var(--primary);
}

.ob-export-option span {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ob-export-option strong {
  color: var(--text-primary);
  font-size: 12px;
}

.ob-export-option small {
  color: var(--text-muted);
  font-size: 10px;
}

.ob-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.ob-secondary-button,
.ob-primary-button {
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

.ob-secondary-button {
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.ob-primary-button {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
}

.ob-primary-button:hover {
  filter: brightness(1.08);
}

.ob-secondary-button:hover {
  background: var(--primary-soft);
}

@media (max-width: 650px) {
  .ob-modal-overlay {
    padding: 12px;
  }

  .ob-modal {
    max-height: 94vh;
  }

  .ob-modal-body {
    padding: 18px;
  }

  .ob-details-grid,
  .ob-form-grid {
    grid-template-columns: 1fr;
  }

  .ob-modal-footer {
    flex-wrap: wrap;
  }
}
</style>