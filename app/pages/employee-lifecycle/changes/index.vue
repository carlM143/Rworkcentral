
<script setup lang="ts">
import {
  Download,
  FilePenLine,
  X,
  FileSpreadsheet,
  FileText,
  Table2,
  CheckCircle2,
  CircleX,
  CalendarCheck,
} from 'lucide-vue-next'

import type {
  EmploymentChangeRecord,
  EmploymentChangeStatus,
  EmploymentChangeType,
} from '~/types/employmentChange'

import EmploymentChangeStats from '~/components/employee-lifecycle/changes/EmploymentChangeStats.vue'
import EmploymentChangeFilters from '~/components/employee-lifecycle/changes/EmploymentChangeFilters.vue'
import EmploymentChangeTable from '~/components/employee-lifecycle/changes/EmploymentChangeTable.vue'

const {
  records,
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
  createEmploymentChange,
  updateEmploymentChange,
  changeEmploymentStatus,
} = useEmploymentChanges()

const {
  success,
  warning,
} = useToast()

/* =========================================
   MODAL STATE
========================================= */

type ModalType =
  | 'create'
  | 'edit'
  | 'view'
  | 'export'
  | 'submit'
  | 'approve'
  | 'schedule'
  | 'effective'
  | 'reject'
  | 'cancel'
  | null

type ActionType = Exclude<
  ModalType,
  'create' | 'edit' | 'view' | 'export' | null
>

const modal = ref<ModalType>(null)

const selected = ref<EmploymentChangeRecord | null>(null)
const errorMessage = ref('')

const exportFormat = ref<'excel' | 'pdf' | 'csv'>('excel')

const form = reactive({
  employeeId: '',
  changeType: 'Employment Type Change' as EmploymentChangeType,
  department: '',
  position: '',
  currentValue: '',
  newValue: '',
  requestedDate: '',
  effectiveDate: '',
  requestedBy: '',
  reason: '',
  remarks: '',
})

const decision = reactive({
  approvedBy: '',
  effectiveDate: '',
  remarks: '',
})

/* =========================================
   EMPLOYEE OPTIONS
========================================= */

const employeeOptions = computed(() => {
  const unique = new Map<number, EmploymentChangeRecord>()

  records.value.forEach(record => {
    if (!unique.has(record.employeeId)) {
      unique.set(record.employeeId, record)
    }
  })

  return [...unique.values()].sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName),
  )
})

const selectedEmployee = computed(() => {
  return employeeOptions.value.find(
    record => String(record.employeeId) === form.employeeId,
  )
})

/* =========================================
   HELPERS
========================================= */

const localDate = () => {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatDate = (value?: string) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const isFinal = (value: EmploymentChangeStatus) => {
  return ['Effective', 'Rejected', 'Cancelled'].includes(value)
}

/* =========================================
   FORM RESET
========================================= */

const clearForm = () => {
  Object.assign(form, {
    employeeId: '',
    changeType: 'Employment Type Change',
    department: '',
    position: '',
    currentValue: '',
    newValue: '',
    requestedDate: localDate(),
    effectiveDate: '',
    requestedBy: '',
    reason: '',
    remarks: '',
  })

  errorMessage.value = ''
}

const fillForm = (record: EmploymentChangeRecord) => {
  Object.assign(form, {
    employeeId: String(record.employeeId),
    changeType: record.changeType,
    department: record.department,
    position: record.position,
    currentValue: record.currentValue,
    newValue: record.newValue,
    requestedDate: record.requestedDate,
    effectiveDate: record.effectiveDate,
    requestedBy: record.requestedBy,
    reason: record.reason,
    remarks: record.remarks ?? '',
  })
}

const closeModal = () => {
  modal.value = null
  selected.value = null
  errorMessage.value = ''
}

/* =========================================
   OPEN MODALS
========================================= */

const openCreate = () => {
  selected.value = null
  clearForm()
  modal.value = 'create'
}

const openView = (record: EmploymentChangeRecord) => {
  selected.value = record
  errorMessage.value = ''
  modal.value = 'view'
}

const openEdit = (record: EmploymentChangeRecord) => {
  if (isFinal(record.status)) return

  selected.value = record
  fillForm(record)
  errorMessage.value = ''
  modal.value = 'edit'
}

const openAction = (
  action: ActionType,
  record: EmploymentChangeRecord,
) => {
  selected.value = record

  decision.approvedBy = record.approvedBy ?? ''
  decision.effectiveDate = record.effectiveDate
  decision.remarks = ''

  errorMessage.value = ''
  modal.value = action
}

/* =========================================
   EMPLOYEE SELECTION
========================================= */

watch(
  () => form.employeeId,
  value => {
    if (modal.value !== 'create' || !value) return

    const employee = selectedEmployee.value

    if (!employee) return

    form.department = employee.department
    form.position = employee.position

    // Historical change values are not necessarily
    // the employee's current master record.
    form.currentValue = ''
    form.newValue = ''
  },
)

/* =========================================
   CREATE / EDIT
========================================= */

const saveChange = () => {
  errorMessage.value = ''

  if (
    !form.employeeId ||
    !form.changeType ||
    !form.department.trim() ||
    !form.currentValue.trim() ||
    !form.newValue.trim() ||
    !form.requestedDate ||
    !form.effectiveDate ||
    !form.requestedBy.trim() ||
    !form.reason.trim()
  ) {
    errorMessage.value = 'Please complete all required fields.'
    return
  }

  if (form.currentValue.trim() === form.newValue.trim()) {
    errorMessage.value = 'New Value must be different from Current Value.'
    return
  }

  if (form.effectiveDate < form.requestedDate) {
    errorMessage.value =
      'Effective date cannot be earlier than requested date.'
    return
  }

  if (modal.value === 'create') {
    const employee = selectedEmployee.value

    if (!employee) {
      errorMessage.value = 'Please select an employee.'
      return
    }

    const created = createEmploymentChange({
      employeeId: employee.employeeId,
      employeeNumber: employee.employeeNumber,
      employeeName: employee.employeeName,
      department: form.department,
      position: form.position,
      changeType: form.changeType,
      currentValue: form.currentValue,
      newValue: form.newValue,
      requestedDate: form.requestedDate,
      effectiveDate: form.effectiveDate,
      requestedBy: form.requestedBy,
      reason: form.reason,
      remarks: form.remarks,
    })

    if (!created) {
      errorMessage.value = 'Unable to create employment change.'
      return
    }

    success(
      'Employment Change Created',
      `${created.changeNumber} has been saved as Draft.`,
    )

    closeModal()
    return
  }

  if (modal.value === 'edit' && selected.value) {
    const updated = updateEmploymentChange(
      selected.value.id,
      {
        changeType: form.changeType,
        currentValue: form.currentValue,
        newValue: form.newValue,
        requestedDate: form.requestedDate,
        effectiveDate: form.effectiveDate,
        requestedBy: form.requestedBy,
        reason: form.reason,
        remarks: form.remarks,
      },
    )

    if (!updated) {
      errorMessage.value = 'Unable to update employment change.'
      return
    }

    success(
      'Employment Change Updated',
      'Employment change information has been updated.',
    )

    closeModal()
  }
}

/* =========================================
   STATUS ACTIONS
========================================= */

const actionTitle = computed(() => {
  const titles: Record<ActionType, string> = {
    submit: 'Submit Employment Change',
    approve: 'Approve Employment Change',
    schedule: 'Schedule Employment Change',
    effective: 'Mark as Effective',
    reject: 'Reject Employment Change',
    cancel: 'Cancel Employment Change',
  }

  if (
    !modal.value ||
    !Object.prototype.hasOwnProperty.call(titles, modal.value)
  ) {
    return ''
  }

  return titles[modal.value as ActionType]
})

const confirmAction = () => {
  const record = selected.value
  const action = modal.value

  if (!record || !action) return

  const statusMap: Partial<Record<ActionType, EmploymentChangeStatus>> = {
    submit: record.status === 'Draft'
      ? 'For Review'
      : 'Pending Approval',
    approve: 'Approved',
    schedule: 'Scheduled',
    effective: 'Effective',
    reject: 'Rejected',
    cancel: 'Cancelled',
  }

  const nextStatus = statusMap[action as ActionType]

  if (!nextStatus) return

  if (
    action === 'approve' &&
    !decision.approvedBy.trim()
  ) {
    errorMessage.value = 'Approved By is required.'
    return
  }

  if (
    ['reject', 'cancel'].includes(action) &&
    !decision.remarks.trim()
  ) {
    errorMessage.value = 'Please provide a reason.'
    return
  }

  if (
    action === 'schedule' &&
    (
      !decision.effectiveDate ||
      decision.effectiveDate < record.requestedDate
    )
  ) {
    errorMessage.value = 'Please select a valid effective date.'
    return
  }

  if (
    action === 'effective' &&
    record.effectiveDate > localDate()
  ) {
    errorMessage.value =
      'This change cannot be marked Effective before its effective date.'
    return
  }

  const updated = changeEmploymentStatus(
    record.id,
    nextStatus,
    {
      approvedBy: decision.approvedBy,
      remarks: decision.remarks,
      effectiveDate: action === 'schedule'
        ? decision.effectiveDate
        : undefined,
    },
  )

  if (!updated) {
    warning(
      'Action Not Allowed',
      'This employment change cannot move to the selected status.',
    )
    return
  }

  success(
    'Employment Change Updated',
    `${record.changeNumber} is now ${nextStatus}.`,
  )

  closeModal()
}
</script>

<template>
  <section class="employment-changes-page">
    <PageHeader
      title="Employment Changes"
      description="Track updates to employment type, contracts, compensation, reporting lines, work arrangements and employee status."
    >
      <div class="header-actions">
        <AppButton
          variant="secondary"
          :icon="Download"
          @click="modal = 'export'"
        >
          Export
        </AppButton>

        <AppButton
          :icon="FilePenLine"
          @click="openCreate"
        >
          New Employment Change
        </AppButton>
      </div>
    </PageHeader>

    <EmploymentChangeStats :stats="stats" />

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

    <EmploymentChangeTable
      :records="paginatedRecords"
      @view="openView"
      @edit="openEdit"
      @submit="openAction('submit', $event)"
      @approve="openAction('approve', $event)"
      @schedule="openAction('schedule', $event)"
      @effective="openAction('effective', $event)"
      @reject="openAction('reject', $event)"
      @cancel="openAction('cancel', $event)"
    />

    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ filteredRecords.length }}</strong>
        employment changes
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- =====================================
         MODALS
    ====================================== -->

    <Teleport to="body">
      <div
        v-if="modal"
        class="employment-overlay"
        @click.self="closeModal"
      >
        <div
          class="employment-modal"
          role="dialog"
          aria-modal="true"
        >
          <header class="modal-header">
            <div class="modal-title">
              <span class="modal-icon">
                <FilePenLine :size="18" />
              </span>

              <div>
                <h2>
                  {{
                    modal === 'create'
                      ? 'New Employment Change'
                      : modal === 'edit'
                        ? 'Edit Employment Change'
                        : modal === 'view'
                          ? 'Employment Change Details'
                          : modal === 'export'
                            ? 'Export Employment Changes'
                            : actionTitle
                  }}
                </h2>

                <p>Employee lifecycle · Employment changes</p>
              </div>
            </div>

            <button
              type="button"
              class="close-button"
              aria-label="Close"
              @click="closeModal"
            >
              <X :size="17" />
            </button>
          </header>

          <!-- =====================================
               CREATE / EDIT FORM
          ====================================== -->

          <form
            v-if="modal === 'create' || modal === 'edit'"
            @submit.prevent="saveChange"
          >
            <div class="modal-body form-grid">
              <div class="section-title full">
                Employee Information
              </div>

              <label class="field full">
                <span>Employee *</span>

                <select
                  v-model="form.employeeId"
                  :disabled="modal === 'edit'"
                  required
                >
                  <option value="" disabled>
                    Select employee
                  </option>

                  <option
                    v-for="employee in employeeOptions"
                    :key="employee.employeeId"
                    :value="String(employee.employeeId)"
                  >
                    {{ employee.employeeName }}
                    ({{ employee.employeeNumber }})
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Department</span>
                <input v-model="form.department" disabled />
              </label>

              <label class="field">
                <span>Position</span>
                <input v-model="form.position" disabled />
              </label>

              <div class="section-title full">
                Employment Change Details
              </div>

              <label class="field full">
                <span>Change Type *</span>

                <select v-model="form.changeType" required>
                  <option
                    v-for="typeOption in changeTypeOptions"
                    :key="typeOption"
                    :value="typeOption"
                  >
                    {{ typeOption }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Current Value *</span>

                <input
                  v-model="form.currentValue"
                  placeholder="Enter current employment value"
                  required
                />
              </label>

              <label class="field">
                <span>New Value *</span>

                <input
                  v-model="form.newValue"
                  placeholder="Enter proposed employment value"
                  required
                />
              </label>

              <div class="value-preview full">
                <div>
                  <small>Current</small>
                  <strong>{{ form.currentValue || '—' }}</strong>
                </div>

                <ArrowRight :size="17" />

                <div>
                  <small>Proposed Change</small>
                  <strong>{{ form.newValue || '—' }}</strong>
                </div>
              </div>

              <div class="section-title full">
                Request Information
              </div>

              <label class="field">
                <span>Requested Date *</span>

                <input
                  v-model="form.requestedDate"
                  type="date"
                  required
                />
              </label>

              <label class="field">
                <span>Effective Date *</span>

                <input
                  v-model="form.effectiveDate"
                  type="date"
                  :min="form.requestedDate || undefined"
                  required
                />
              </label>

              <label class="field full">
                <span>Requested By *</span>

                <input
                  v-model="form.requestedBy"
                  placeholder="Requester name"
                  required
                />
              </label>

              <label class="field full">
                <span>Reason for Change *</span>

                <textarea
                  v-model="form.reason"
                  rows="3"
                  placeholder="Explain the reason for this employment change..."
                  required
                />
              </label>

              <label class="field full">
                <span>Remarks</span>

                <textarea
                  v-model="form.remarks"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </label>

              <p v-if="errorMessage" class="error-message full">
                {{ errorMessage }}
              </p>

              <div class="modal-note full">
                This form manages employment change requests only.
                Newly created changes will have Draft status.
                Changes are not automatically applied to employee records.
              </div>
            </div>

            <footer class="modal-footer">
              <button
                type="button"
                class="ui-btn"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="ui-btn primary"
              >
                {{
                  modal === 'create'
                    ? 'Create Employment Change'
                    : 'Save Changes'
                }}
              </button>
            </footer>
          </form>

          <!-- =====================================
               VIEW DETAILS
          ====================================== -->

          <template v-else-if="modal === 'view' && selected">
            <div class="modal-body">
              <div class="details-grid">
                <div>
                  <span>Change Number</span>
                  <strong>{{ selected.changeNumber }}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{{ selected.status }}</strong>
                </div>

                <div>
                  <span>Employee</span>
                  <strong>{{ selected.employeeName }}</strong>
                </div>

                <div>
                  <span>Employee Number</span>
                  <strong>{{ selected.employeeNumber }}</strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>{{ selected.department }}</strong>
                </div>

                <div>
                  <span>Position</span>
                  <strong>{{ selected.position }}</strong>
                </div>

                <div class="full">
                  <span>Change Type</span>
                  <strong>{{ selected.changeType }}</strong>
                </div>

                <div>
                  <span>Current Value</span>
                  <strong>{{ selected.currentValue }}</strong>
                </div>

                <div>
                  <span>New Value</span>
                  <strong>{{ selected.newValue }}</strong>
                </div>

                <div>
                  <span>Requested Date</span>
                  <strong>{{ formatDate(selected.requestedDate) }}</strong>
                </div>

                <div>
                  <span>Effective Date</span>
                  <strong>{{ formatDate(selected.effectiveDate) }}</strong>
                </div>

                <div>
                  <span>Requested By</span>
                  <strong>{{ selected.requestedBy }}</strong>
                </div>

                <div>
                  <span>Approved By</span>
                  <strong>{{ selected.approvedBy || 'Pending' }}</strong>
                </div>

                <div class="full">
                  <span>Reason</span>
                  <strong>{{ selected.reason }}</strong>
                </div>

                <div class="full">
                  <span>Remarks</span>
                  <strong>{{ selected.remarks || 'No remarks' }}</strong>
                </div>

                <div>
                  <span>Created At</span>
                  <strong>{{ selected.createdAt }}</strong>
                </div>

                <div>
                  <span>Last Updated</span>
                  <strong>{{ selected.updatedAt }}</strong>
                </div>
              </div>
            </div>

            <footer class="modal-footer">
              <button
                type="button"
                class="ui-btn"
                @click="closeModal"
              >
                Close
              </button>

              <button
                v-if="!isFinal(selected.status)"
                type="button"
                class="ui-btn primary"
                @click="openEdit(selected)"
              >
                Edit Change
              </button>
            </footer>
          </template>

          <!-- =====================================
               STATUS CONFIRMATION
          ====================================== -->

          <template
            v-else-if="
              selected &&
              ['submit', 'approve', 'schedule', 'effective', 'reject', 'cancel']
                .includes(modal)
            "
          >
            <div class="modal-body form-grid">
              <div
                class="confirmation-icon full"
                :class="
                  ['reject', 'cancel'].includes(modal)
                    ? 'danger-icon'
                    : 'success-icon'
                "
              >
                <CircleX
                  v-if="['reject', 'cancel'].includes(modal)"
                  :size="25"
                />

                <CheckCircle2 v-else :size="25" />
              </div>

              <h3 class="confirmation-title full">
                {{ actionTitle }}?
              </h3>

              <p class="confirmation-text full">
                You are updating the employment change for
                <strong>{{ selected.employeeName }}</strong>
                ({{ selected.changeNumber }}).
              </p>

              <div class="summary-grid full">
                <div>
                  <small>Change Type</small>
                  <strong>{{ selected.changeType }}</strong>
                </div>

                <div>
                  <small>Current Status</small>
                  <strong>{{ selected.status }}</strong>
                </div>

                <div>
                  <small>Current Value</small>
                  <strong>{{ selected.currentValue }}</strong>
                </div>

                <div>
                  <small>New Value</small>
                  <strong>{{ selected.newValue }}</strong>
                </div>
              </div>

              <label
                v-if="modal === 'approve'"
                class="field full"
              >
                <span>Approved By *</span>

                <input
                  v-model="decision.approvedBy"
                  placeholder="Enter authorized approver"
                />
              </label>

              <label
                v-if="modal === 'schedule'"
                class="field full"
              >
                <span>Effective Date *</span>

                <input
                  v-model="decision.effectiveDate"
                  type="date"
                  :min="selected.requestedDate"
                />
              </label>

              <div
                v-if="modal === 'schedule'"
                class="modal-note full"
              >
                <CalendarCheck :size="15" />
                Confirm the implementation date for this approved change.
              </div>

              <label class="field full">
                <span>
                  {{
                    ['reject', 'cancel'].includes(modal)
                      ? 'Reason *'
                      : 'Remarks'
                  }}
                </span>

                <textarea
                  v-model="decision.remarks"
                  rows="3"
                  placeholder="Enter remarks..."
                />
              </label>

              <p v-if="errorMessage" class="error-message full">
                {{ errorMessage }}
              </p>

              <div class="modal-note full">
                This action updates employment change tracking only.
                It does not modify the employee master record or payroll.
              </div>
            </div>

            <footer class="modal-footer">
              <button
                type="button"
                class="ui-btn"
                @click="closeModal"
              >
                Back
              </button>

              <button
                type="button"
                class="ui-btn"
                :class="
                  ['reject', 'cancel'].includes(modal)
                    ? 'danger'
                    : 'primary'
                "
                @click="confirmAction"
              >
                Confirm Action
              </button>
            </footer>
          </template>

          <!-- =====================================
               EXPORT MODAL — UI ONLY
          ====================================== -->

          <template v-else-if="modal === 'export'">
            <div class="modal-body">
              <div class="export-stats">
                <div>
                  <small>Total</small>
                  <strong>{{ stats.total }}</strong>
                </div>

                <div>
                  <small>Pending</small>
                  <strong>{{ stats.pending }}</strong>
                </div>

                <div>
                  <small>Approved</small>
                  <strong>{{ stats.approved }}</strong>
                </div>

                <div>
                  <small>Effective</small>
                  <strong>{{ stats.effective }}</strong>
                </div>
              </div>

              <h4 class="export-heading">
                Export Format
              </h4>

              <div class="export-options">
                <button
                  type="button"
                  :class="{ active: exportFormat === 'excel' }"
                  @click="exportFormat = 'excel'"
                >
                  <FileSpreadsheet :size="19" />
                  <strong>Excel</strong>
                  <small>Spreadsheet report</small>
                </button>

                <button
                  type="button"
                  :class="{ active: exportFormat === 'pdf' }"
                  @click="exportFormat = 'pdf'"
                >
                  <FileText :size="19" />
                  <strong>PDF</strong>
                  <small>Printable report</small>
                </button>

                <button
                  type="button"
                  :class="{ active: exportFormat === 'csv' }"
                  @click="exportFormat = 'csv'"
                >
                  <Table2 :size="19" />
                  <strong>CSV</strong>
                  <small>Raw data</small>
                </button>
              </div>

              <div class="modal-note">
                Included Data: Employee, Department, Change Type,
                Current Value, New Value, Requested Date, Effective Date,
                Requested By, Approved By, Status, Reason and Remarks.

                Export functionality will be connected later.
              </div>
            </div>

            <footer class="modal-footer">
              <button
                type="button"
                class="ui-btn"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="button"
                class="ui-btn primary"
                disabled
              >
                <Download :size="15" />
                Export {{ exportFormat.toUpperCase() }}
              </button>
            </footer>
          </template>
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

/* =========================================
   MODAL
========================================= */

.employment-overlay {
  position: fixed;
  inset: 0;
  z-index: 10010;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(2, 9, 22, 0.75);
  backdrop-filter: blur(5px);
}

.employment-modal {
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 17px;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-icon {
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.modal-title h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.modal-title p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.close-button {
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-body {
  padding: 17px;
}

.modal-footer {
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  border-bottom: 0;
}

.ui-btn {
  display: inline-flex;
  min-height: 35px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 13px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.ui-btn.primary {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}

.ui-btn.danger {
  border-color: var(--red);
  background: var(--red);
  color: #fff;
}

.ui-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* =========================================
   FORMS
========================================= */

.form-grid,
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.full {
  grid-column: 1 / -1;
}

.field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.field span {
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 650;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  min-height: 38px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 11px;
  outline: none;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--primary);
}

.field input:disabled {
  opacity: 0.6;
}

.section-title {
  margin-top: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
}

.value-preview {
  display: flex;
  align-items: center;
  gap: 9px;
}

.value-preview > div {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.value-preview > svg {
  flex-shrink: 0;
  color: var(--primary);
}

.value-preview small {
  color: var(--text-muted);
  font-size: 9px;
}

.value-preview strong {
  color: var(--text-primary);
  font-size: 11px;
  overflow-wrap: anywhere;
}

.details-grid > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.details-grid span {
  color: var(--text-muted);
  font-size: 10px;
}

.details-grid strong {
  color: var(--text-primary);
  font-size: 11px;
  overflow-wrap: anywhere;
}

.error-message {
  margin: 0;
  color: var(--red);
  font-size: 11px;
}

.modal-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 11px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.6;
}

/* =========================================
   CONFIRMATION
========================================= */

.confirmation-icon {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.confirmation-icon.success-icon {
  background: var(--green-soft);
  color: var(--green);
}

.confirmation-icon.danger-icon {
  background: var(--red-soft);
  color: var(--red);
}

.confirmation-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
}

.confirmation-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.6;
}

.summary-grid,
.export-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.summary-grid > div,
.export-stats > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.summary-grid small,
.export-stats small {
  color: var(--text-muted);
  font-size: 9px;
}

.summary-grid strong,
.export-stats strong {
  color: var(--text-primary);
  font-size: 12px;
  overflow-wrap: anywhere;
}

/* =========================================
   EXPORT
========================================= */

.export-stats {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.export-heading {
  margin: 17px 0 10px;
  color: var(--text-primary);
  font-size: 11px;
}

.export-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
  margin-bottom: 12px;
}

.export-options button {
  display: flex;
  min-height: 106px;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  text-align: left;
  cursor: pointer;
}

.export-options button.active {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}

.export-options strong {
  font-size: 11px;
}

.export-options small {
  color: var(--text-muted);
  font-size: 9px;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 650px) {
  .header-actions,
  .table-footer {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid,
  .details-grid,
  .summary-grid,
  .export-stats,
  .export-options {
    grid-template-columns: 1fr;
  }

  .full {
    grid-column: auto;
  }
}
</style>
