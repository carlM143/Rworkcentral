
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import {
  ArrowLeftRight,
  Download,
  Plus,
  X,
  Eye,
  Pencil,
  Save,
  FileDown,
  CalendarDays,
} from 'lucide-vue-next'

import EmployeeTransferStats from '~/components/admin/departments/transfers/EmployeeTransferStats.vue'
import EmployeeTransferFilters from '~/components/admin/departments/transfers/EmployeeTransferFilters.vue'
import EmployeeTransferTable from '~/components/admin/departments/transfers/EmployeeTransferTable.vue'

import type {
  EmployeeTransfer,
  EmployeeTransferStatus,
  EmployeeTransferType,
} from '~/types/employeeTransfer'

definePageMeta({
  layout: 'admin',
})

const {
  search,
  fromDepartment,
  toDepartment,
  transferType,
  status,
  dateFrom,
  dateTo,
  currentPage,
  filteredTransfers,
  stats,
  departmentOptions,
  transferTypeOptions,
  statusOptions,
  resetFilters,
} = useEmployeeTransfers()

const { info } = useToast()

// --------------------------------------------------
// LOCAL FRONTEND STATE
// --------------------------------------------------

type ModalMode = 'view' | 'create' | 'edit' | 'export' | null

interface TransferForm {
  employeeName: string
  employeeNumber: string
  transferType: string
  fromDepartment: string
  fromPosition: string
  toDepartment: string
  toPosition: string
  effectiveDate: string
  reason: string
  status: string
  requestedBy: string
  remarks: string
}

const modalMode = ref<ModalMode>(null)
const selectedTransfer = ref<EmployeeTransfer | null>(null)

const localTransfers = ref<EmployeeTransfer[]>([])
const editedTransfers = ref<Record<string, EmployeeTransfer>>({})

const saving = ref(false)
const exportScope = ref('filtered')

const emptyForm = (): TransferForm => ({
  employeeName: '',
  employeeNumber: '',
  transferType: 'Department Transfer',
  fromDepartment: '',
  fromPosition: '',
  toDepartment: '',
  toPosition: '',
  effectiveDate: '',
  reason: '',
  status: 'Pending',
  requestedBy: '',
  remarks: '',
})

const form = ref<TransferForm>(emptyForm())

// --------------------------------------------------
// DATA / PAGINATION
// --------------------------------------------------

const departmentChoices = computed(() =>
  [...new Set([
    ...departmentOptions.value,
    ...localTransfers.value.flatMap(item => [
      item.fromDepartment,
      item.toDepartment,
    ]),
  ].filter(Boolean))],
)

const matchesLocalFilters = (item: EmployeeTransfer) => {
  const term = search.value.trim().toLowerCase()

  const searchable = [
    item.transferNumber,
    item.employeeName,
    item.employeeNumber,
    item.fromDepartment,
    item.toDepartment,
    item.fromPosition,
    item.toPosition,
    item.reason,
  ].join(' ').toLowerCase()

  return (
    (!term || searchable.includes(term)) &&
    (!fromDepartment.value || fromDepartment.value === 'all' ||
      item.fromDepartment === fromDepartment.value) &&
    (!toDepartment.value || toDepartment.value === 'all' ||
      item.toDepartment === toDepartment.value) &&
    (!transferType.value || transferType.value === 'all' ||
      item.transferType === transferType.value) &&
    (!status.value || status.value === 'all' ||
      item.status === status.value) &&
    (!dateFrom.value || item.effectiveDate >= dateFrom.value) &&
    (!dateTo.value || item.effectiveDate <= dateTo.value)
  )
}

const displayTransfers = computed(() => {
  const existing = filteredTransfers.value.map(item =>
    editedTransfers.value[String(item.id)] ?? item
  )

  const added = localTransfers.value.filter(matchesLocalFilters)

  return [...added, ...existing]
})

const pageSize = 6

const totalPages = computed(() =>
  Math.max(1, Math.ceil(displayTransfers.value.length / pageSize))
)

const paginatedTransfers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return displayTransfers.value.slice(start, start + pageSize)
})

const showingFrom = computed(() =>
  displayTransfers.value.length
    ? (currentPage.value - 1) * pageSize + 1
    : 0
)

const showingTo = computed(() =>
  Math.min(
    currentPage.value * pageSize,
    displayTransfers.value.length,
  )
)

watch(displayTransfers, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

// --------------------------------------------------
// MODAL ACTIONS
// --------------------------------------------------

const closeModal = () => {
  modalMode.value = null
  selectedTransfer.value = null
  saving.value = false
}

const handleNewTransfer = () => {
  form.value = emptyForm()
  selectedTransfer.value = null
  modalMode.value = 'create'
}

const handleViewTransfer = (item: EmployeeTransfer) => {
  selectedTransfer.value = item
  modalMode.value = 'view'
}

const handleEditTransfer = (item: EmployeeTransfer) => {
  selectedTransfer.value = item

  form.value = {
    employeeName: item.employeeName,
    employeeNumber: item.employeeNumber,
    transferType: item.transferType,
    fromDepartment: item.fromDepartment,
    fromPosition: item.fromPosition,
    toDepartment: item.toDepartment,
    toPosition: item.toPosition,
    effectiveDate: item.effectiveDate,
    reason: item.reason,
    status: item.status,
    requestedBy: item.requestedBy,
    remarks: item.remarks || '',
  }

  modalMode.value = 'edit'
}

const validateForm = () => {
  const required = [
    form.value.employeeName,
    form.value.employeeNumber,
    form.value.fromDepartment,
    form.value.toDepartment,
    form.value.effectiveDate,
    form.value.reason,
    form.value.requestedBy,
  ]

  if (required.some(value => !value.trim())) {
    info('Required Fields', 'Please complete all required fields.')
    return false
  }

  if (
    form.value.transferType === 'Department Transfer' &&
    form.value.fromDepartment === form.value.toDepartment
  ) {
    info('Invalid Transfer', 'Select a different destination department.')
    return false
  }

  return true
}

const handleSaveTransfer = () => {
  if (!validateForm()) return

  saving.value = true

  const isEdit = modalMode.value === 'edit'
  const existing = selectedTransfer.value

  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  const id = isEdit && existing
    ? existing.id
    : Date.now()

  const record = {
    ...(existing ?? {}),
    id,
    transferNumber: existing?.transferNumber ??
      `TRF-${id}`,
    employeeName: form.value.employeeName.trim(),
    employeeNumber: form.value.employeeNumber.trim(),
    transferType: form.value.transferType as EmployeeTransferType,
    fromDepartment: form.value.fromDepartment,
    fromPosition: form.value.fromPosition,
    toDepartment: form.value.toDepartment,
    toPosition: form.value.toPosition,
    effectiveDate: form.value.effectiveDate,
    requestedDate: existing?.requestedDate ?? today,
    reason: form.value.reason.trim(),
    status: form.value.status as EmployeeTransferStatus,
    requestedBy: form.value.requestedBy.trim(),
    remarks: form.value.remarks.trim(),
    reviewedBy: existing?.reviewedBy ?? null,
    reviewedAt: existing?.reviewedAt ?? null,
  } as EmployeeTransfer

  if (isEdit) {
    editedTransfers.value[String(id)] = record

    localTransfers.value = localTransfers.value.map(item =>
      item.id === id ? record : item
    )
  } else {
    localTransfers.value.unshift(record)
    currentPage.value = 1
  }

  info(
    isEdit ? 'Transfer Updated' : 'Transfer Created',
    'Changes saved in the current frontend session only.',
  )

  closeModal()
}

// --------------------------------------------------
// EXPORT
// --------------------------------------------------

const handleExport = () => {
  exportScope.value = 'filtered'
  modalMode.value = 'export'
}

const exportCsv = () => {
  const records = exportScope.value === 'all'
    ? [
        ...localTransfers.value,
        ...filteredTransfers.value.map(item =>
          editedTransfers.value[String(item.id)] ?? item
        ),
      ]
    : displayTransfers.value

  const headers = [
    'Transfer No',
    'Employee',
    'Employee ID',
    'Transfer Type',
    'From Department',
    'From Position',
    'To Department',
    'To Position',
    'Requested Date',
    'Effective Date',
    'Status',
    'Reason',
    'Requested By',
    'Reviewed By',
    'Remarks',
  ]

  const escapeCsv = (value: unknown) => {
    const text = String(value ?? '')
    return `"${text.replace(/"/g, '""')}"`
  }

  const rows = records.map(item => [
    item.transferNumber,
    item.employeeName,
    item.employeeNumber,
    item.transferType,
    item.fromDepartment,
    item.fromPosition,
    item.toDepartment,
    item.toPosition,
    item.requestedDate,
    item.effectiveDate,
    item.status,
    item.reason,
    item.requestedBy,
    item.reviewedBy,
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
  const link = document.createElement('a')

  link.href = url
  link.download = 'employee-transfers.csv'

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)

  closeModal()
}

// --------------------------------------------------
// KEYBOARD / SCROLL LOCK
// --------------------------------------------------

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && modalMode.value) {
    closeModal()
  }
}

watch(modalMode, mode => {
  if (!import.meta.client) return

  document.body.style.overflow = mode ? 'hidden' : ''
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="employee-transfers-page">
    <!-- HEADER -->
    <PageHeader
      title="Employee Transfers"
      description="Track employee department and position movements, transfer requests, effective dates and completed internal transfers."
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
          @click="handleNewTransfer"
        >
          New Transfer
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS -->
    <EmployeeTransferStats :stats="stats" />

    <!-- FILTERS -->
    <EmployeeTransferFilters
      v-model:search="search"
      v-model:from-department="fromDepartment"
      v-model:to-department="toDepartment"
      v-model:transfer-type="transferType"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departmentOptions"
      :transfer-types="transferTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE -->
    <EmployeeTransferTable
      :transfers="paginatedTransfers"
      @view="handleViewTransfer"
      @edit="handleEditTransfer"
    />

    <!-- PAGINATION -->
    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ displayTransfers.length }}</strong>
        employee transfers
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
        class="employee-transfer-overlay"
        @click.self="closeModal"
      >
        <div
          class="employee-transfer-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="employee-transfer-modal-title"
        >
          <!-- MODAL HEADER -->
          <div class="employee-transfer-modal-header">
            <div class="modal-title-group">
              <div class="modal-title-icon">
                <FileDown v-if="modalMode === 'export'" :size="19" />
                <Eye v-else-if="modalMode === 'view'" :size="19" />
                <Pencil v-else-if="modalMode === 'edit'" :size="19" />
                <ArrowLeftRight v-else :size="19" />
              </div>

              <div>
                <h2 id="employee-transfer-modal-title">
                  {{
                    modalMode === 'export'
                      ? 'Export Employee Transfers'
                      : modalMode === 'view'
                        ? 'View Employee Transfer'
                        : modalMode === 'edit'
                          ? 'Edit Employee Transfer'
                          : 'New Employee Transfer'
                  }}
                </h2>

                <p>
                  {{
                    modalMode === 'view'
                      ? 'Review transfer information and current status.'
                      : modalMode === 'export'
                        ? 'Choose the records to export.'
                        : 'Complete the employee transfer information.'
                  }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="modal-close"
              aria-label="Close modal"
              @click="closeModal"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- VIEW MODAL -->
          <div
            v-if="modalMode === 'view' && selectedTransfer"
            class="employee-transfer-modal-body"
          >
            <div class="transfer-detail-grid">
              <div
                v-for="field in [
                  { label: 'Transfer No.', value: selectedTransfer.transferNumber },
                  { label: 'Employee', value: selectedTransfer.employeeName },
                  { label: 'Employee ID', value: selectedTransfer.employeeNumber },
                  { label: 'Transfer Type', value: selectedTransfer.transferType },
                  { label: 'From Department', value: selectedTransfer.fromDepartment },
                  { label: 'From Position', value: selectedTransfer.fromPosition },
                  { label: 'To Department', value: selectedTransfer.toDepartment },
                  { label: 'To Position', value: selectedTransfer.toPosition },
                  { label: 'Requested Date', value: selectedTransfer.requestedDate },
                  { label: 'Effective Date', value: selectedTransfer.effectiveDate },
                  { label: 'Status', value: selectedTransfer.status },
                  { label: 'Requested By', value: selectedTransfer.requestedBy },
                  { label: 'Reviewed By', value: selectedTransfer.reviewedBy },
                  { label: 'Reviewed At', value: selectedTransfer.reviewedAt },
                  { label: 'Reason', value: selectedTransfer.reason },
                  { label: 'Remarks', value: selectedTransfer.remarks },
                ]"
                :key="field.label"
                class="transfer-detail-field"
              >
                <span>{{ field.label }}</span>
                <strong>{{ field.value || '—' }}</strong>
              </div>
            </div>
          </div>

          <!-- CREATE / EDIT MODAL -->
          <form
            v-else-if="modalMode === 'create' || modalMode === 'edit'"
            class="employee-transfer-form"
            @submit.prevent="handleSaveTransfer"
          >
            <div class="employee-transfer-modal-body">
              <div class="transfer-form-grid">
                <label class="transfer-field">
                  Employee Name *
                  <input
                    v-model="form.employeeName"
                    placeholder="Employee full name"
                    required
                  />
                </label>

                <label class="transfer-field">
                  Employee ID *
                  <input
                    v-model="form.employeeNumber"
                    placeholder="EMP-001"
                    required
                  />
                </label>

                <label class="transfer-field">
                  Transfer Type *
                  <select v-model="form.transferType" required>
                    <option value="Department Transfer">Department Transfer</option>
                    <option value="Position Change">Position Change</option>
                    <option value="Department and Position Transfer">
                      Department and Position Transfer
                    </option>
                  </select>
                </label>

                <label class="transfer-field">
                  Status
                  <select v-model="form.status">
                    <option value="Pending">Pending</option>
                    <option value="For Review">For Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </label>

                <label class="transfer-field">
                  From Department *
                  <select v-model="form.fromDepartment" required>
                    <option value="" disabled>Select department</option>
                    <option
                      v-for="department in departmentChoices"
                      :key="department"
                      :value="department"
                    >
                      {{ department }}
                    </option>
                  </select>
                </label>

                <label class="transfer-field">
                  From Position
                  <input
                    v-model="form.fromPosition"
                    placeholder="Current position"
                  />
                </label>

                <label class="transfer-field">
                  To Department *
                  <select v-model="form.toDepartment" required>
                    <option value="" disabled>Select department</option>
                    <option
                      v-for="department in departmentChoices"
                      :key="department"
                      :value="department"
                    >
                      {{ department }}
                    </option>
                  </select>
                </label>

                <label class="transfer-field">
                  To Position
                  <input
                    v-model="form.toPosition"
                    placeholder="New position"
                  />
                </label>

                <label class="transfer-field">
                  <span class="field-label-icon">
                    <CalendarDays :size="13" />
                    Effective Date *
                  </span>
                  <input
                    v-model="form.effectiveDate"
                    type="date"
                    required
                  />
                </label>

                <label class="transfer-field">
                  Requested By *
                  <input
                    v-model="form.requestedBy"
                    placeholder="Requestor's name"
                    required
                  />
                </label>

                <label class="transfer-field full-width">
                  Reason for Transfer *
                  <textarea
                    v-model="form.reason"
                    rows="3"
                    placeholder="Enter the reason for transfer..."
                    required
                  />
                </label>

                <label class="transfer-field full-width">
                  Remarks
                  <textarea
                    v-model="form.remarks"
                    rows="2"
                    placeholder="Additional remarks (optional)"
                  />
                </label>
              </div>
            </div>

            <div class="employee-transfer-modal-footer">
              <button
                type="button"
                class="modal-secondary-button"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="modal-primary-button"
                :disabled="saving"
              >
                <Save :size="15" />
                {{ modalMode === 'edit' ? 'Save Changes' : 'Create Transfer' }}
              </button>
            </div>
          </form>

          <!-- EXPORT MODAL -->
          <div
            v-else-if="modalMode === 'export'"
            class="employee-transfer-modal-body"
          >
            <p class="export-description">
              Export transfer records as a CSV file.
            </p>

            <label class="export-option">
              <input
                v-model="exportScope"
                type="radio"
                value="filtered"
              />
              <span>
                <strong>Filtered Records</strong>
                <small>Export records matching current filters.</small>
              </span>
            </label>

            <label class="export-option">
              <input
                v-model="exportScope"
                type="radio"
                value="all"
              />
              <span>
                <strong>Current Loaded Records</strong>
                <small>Export records currently loaded in the frontend.</small>
              </span>
            </label>
          </div>

          <!-- FOOTER FOR VIEW / EXPORT -->
          <div
            v-if="modalMode === 'view' || modalMode === 'export'"
            class="employee-transfer-modal-footer"
          >
            <button
              type="button"
              class="modal-secondary-button"
              @click="closeModal"
            >
              Close
            </button>

            <button
              v-if="modalMode === 'view' && selectedTransfer"
              type="button"
              class="modal-primary-button"
              @click="handleEditTransfer(selectedTransfer)"
            >
              <Pencil :size="15" />
              Edit Transfer
            </button>

            <button
              v-if="modalMode === 'export'"
              type="button"
              class="modal-primary-button"
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
.employee-transfers-page {
  width: 100%;
  max-width: 1660px;
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
/* MODAL BACKDROP */

.employee-transfer-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 9, 22, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* MODAL CONTAINER */

.employee-transfer-modal {
  width: 100%;
  max-width: 740px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

/* MODAL HEADER */

.employee-transfer-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title-icon {
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

.employee-transfer-modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 700;
}

.employee-transfer-modal-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.modal-close {
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

.modal-close:hover {
  border-color: var(--border);
  background: var(--bg-card-soft);
}

/* MODAL BODY */

.employee-transfer-modal-body {
  padding: 24px;
}

.transfer-form-grid,
.transfer-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.transfer-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.transfer-field.full-width {
  grid-column: 1 / -1;
}

.field-label-icon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.transfer-field input,
.transfer-field select,
.transfer-field textarea {
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

.transfer-field textarea {
  resize: vertical;
}

.transfer-field input:focus,
.transfer-field select:focus,
.transfer-field textarea:focus {
  border-color: var(--primary);
}

.transfer-field input::placeholder,
.transfer-field textarea::placeholder {
  color: var(--text-muted);
}

/* VIEW DETAILS */

.transfer-detail-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.transfer-detail-field span {
  color: var(--text-muted);
  font-size: 11px;
}

.transfer-detail-field strong {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

/* EXPORT OPTIONS */

.export-description {
  margin: 0 0 16px;
  color: var(--text-secondary);
  font-size: 12px;
}

.export-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  margin-top: 10px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  cursor: pointer;
}

.export-option input {
  margin-top: 3px;
  accent-color: var(--primary);
}

.export-option span {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.export-option strong {
  color: var(--text-primary);
  font-size: 12px;
}

.export-option small {
  color: var(--text-muted);
  font-size: 10px;
}

/* MODAL FOOTER */

.employee-transfer-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.modal-secondary-button,
.modal-primary-button {
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

.modal-secondary-button {
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.modal-primary-button {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
}

.modal-primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 650px) {
  .employee-transfer-overlay {
    padding: 12px;
  }

  .employee-transfer-modal {
    max-height: 94vh;
  }

  .employee-transfer-modal-body {
    padding: 18px;
  }

  .transfer-form-grid,
  .transfer-detail-grid {
    grid-template-columns: 1fr;
  }

  .employee-transfer-modal-footer {
    flex-wrap: wrap;
  }
}
</style>
