
<script setup lang="ts">
import {
  ArrowLeftRight,
  CheckCircle2,
  CircleX,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Pencil,
  Plus,
  Table2,
  X,
} from 'lucide-vue-next'

import type {
  LifecycleTransfer,
  LifecycleTransferStatus,
  LifecycleTransferType,
} from '~/types/lifecycleTransfer'

import LifecycleTransferStats from '~/components/employee-lifecycle/transfers/LifecycleTransferStats.vue'
import LifecycleTransferFilters from '~/components/employee-lifecycle/transfers/LifecycleTransferFilters.vue'
import LifecycleTransferTable from '~/components/employee-lifecycle/transfers/LifecycleTransferTable.vue'

const {
  records,
  search,
  transferType,
  destinationDepartment,
  status,
  currentPage,
  filteredRecords,
  paginatedRecords,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  transferTypeOptions,
  destinationDepartmentOptions,
  statusOptions,
  resetFilters,
  createTransfer,
  updateTransfer,
  changeTransferStatus,
} = useLifecycleTransfers()

const { success, warning } = useToast()

/* =========================================
   MODAL STATE
========================================= */

type ModalType =
  | 'create'
  | 'view'
  | 'edit'
  | 'status'
  | 'approve'
  | 'complete'
  | 'cancel'
  | 'export'
  | null

const modal = ref<ModalType>(null)
const selected = ref<LifecycleTransfer | null>(null)
const errorMessage = ref('')

const exportFormat = ref<'excel' | 'pdf' | 'csv'>('excel')

/* =========================================
   FORM
========================================= */

const form = reactive({
  employeeId: '',
  transferType: 'Department Transfer' as LifecycleTransferType,
  newDepartment: '',
  newPosition: '',
  newBranch: '',
  requestedDate: '',
  effectiveDate: '',
  requestedBy: '',
  approvedBy: '',
  reason: '',
  remarks: '',
})

const statusForm = reactive({
  status: 'Draft' as LifecycleTransferStatus,
  approvedBy: '',
  remarks: '',
})

/* =========================================
   EMPLOYEE OPTIONS
========================================= */

const employeeOptions = computed(() => {
  const unique = new Map<number, LifecycleTransfer>()

  for (const record of records.value) {
    if (!unique.has(record.employeeId)) {
      unique.set(record.employeeId, record)
    }
  }

  return [...unique.values()].sort((a, b) => {
    return a.employeeName.localeCompare(b.employeeName)
  })
})

const selectedEmployee = computed(() => {
  return employeeOptions.value.find(
    item => String(item.employeeId) === form.employeeId,
  )
})

const departmentOptions = computed(() => {
  return [
    ...new Set(
      records.value.flatMap(item => [
        item.currentDepartment,
        item.newDepartment,
      ]),
    ),
  ].sort()
})

const branchOptions = computed(() => {
  return [
    ...new Set(
      records.value.flatMap(item => [
        item.currentBranch,
        item.newBranch,
      ]),
    ),
  ].sort()
})

/* =========================================
   HELPERS
========================================= */

const today = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

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

const closeModal = () => {
  modal.value = null
  errorMessage.value = ''
}

const clearForm = () => {
  form.employeeId = ''
  form.transferType = 'Department Transfer'
  form.newDepartment = ''
  form.newPosition = ''
  form.newBranch = ''
  form.requestedDate = today()
  form.effectiveDate = ''
  form.requestedBy = ''
  form.approvedBy = ''
  form.reason = ''
  form.remarks = ''

  errorMessage.value = ''
}

const fillForm = (record: LifecycleTransfer) => {
  form.employeeId = String(record.employeeId)
  form.transferType = record.transferType
  form.newDepartment = record.newDepartment
  form.newPosition = record.newPosition
  form.newBranch = record.newBranch
  form.requestedDate = record.requestedDate
  form.effectiveDate = record.effectiveDate
  form.requestedBy = record.requestedBy
  form.approvedBy = record.approvedBy ?? ''
  form.reason = record.reason
  form.remarks = record.remarks ?? ''
}

/* =========================================
   OPEN MODALS
========================================= */

const openCreate = () => {
  selected.value = null
  clearForm()
  modal.value = 'create'
}

const openView = (record: LifecycleTransfer) => {
  selected.value = record
  modal.value = 'view'
}

const openEdit = (record: LifecycleTransfer) => {
  selected.value = record
  fillForm(record)
  errorMessage.value = ''
  modal.value = 'edit'
}

const openStatus = (record: LifecycleTransfer) => {
  selected.value = record
  statusForm.status = record.status
  statusForm.approvedBy = record.approvedBy ?? ''
  statusForm.remarks = record.remarks ?? ''
  errorMessage.value = ''
  modal.value = 'status'
}

const openApprove = (record: LifecycleTransfer) => {
  selected.value = record
  statusForm.approvedBy = record.approvedBy ?? ''
  statusForm.remarks = record.remarks ?? ''
  errorMessage.value = ''
  modal.value = 'approve'
}

const openComplete = (record: LifecycleTransfer) => {
  selected.value = record
  statusForm.remarks = record.remarks ?? ''
  errorMessage.value = ''
  modal.value = 'complete'
}

const openCancel = (record: LifecycleTransfer) => {
  selected.value = record
  statusForm.remarks = ''
  errorMessage.value = ''
  modal.value = 'cancel'
}

/* =========================================
   VALIDATION
========================================= */

const validateForm = () => {
  errorMessage.value = ''

  if (
    !form.employeeId ||
    !form.newDepartment.trim() ||
    !form.newPosition.trim() ||
    !form.newBranch.trim() ||
    !form.requestedDate ||
    !form.effectiveDate ||
    !form.requestedBy.trim() ||
    !form.reason.trim()
  ) {
    errorMessage.value = 'Please complete all required fields.'
    return false
  }

  if (form.effectiveDate < form.requestedDate) {
    errorMessage.value =
      'Effective date cannot be earlier than requested date.'
    return false
  }

  return true
}

/* =========================================
   CREATE / EDIT
========================================= */

const saveTransfer = () => {
  if (!validateForm()) return

  if (modal.value === 'create') {
    const employee = selectedEmployee.value

    if (!employee) {
      errorMessage.value = 'Please select a valid employee.'
      return
    }

    const record = createTransfer({
      employeeId: employee.employeeId,
      employeeNumber: employee.employeeNumber,
      employeeName: employee.employeeName,

      transferType: form.transferType,

      currentDepartment: employee.currentDepartment,
      currentPosition: employee.currentPosition,
      currentBranch: employee.currentBranch,

      newDepartment: form.newDepartment.trim(),
      newPosition: form.newPosition.trim(),
      newBranch: form.newBranch.trim(),

      requestedDate: form.requestedDate,
      effectiveDate: form.effectiveDate,
      requestedBy: form.requestedBy.trim(),
      reason: form.reason.trim(),
      remarks: form.remarks.trim(),
    })

    if (!record) {
      warning('Creation Failed', 'Unable to create transfer.')
      return
    }

    success(
      'Transfer Created',
      `${record.transferNumber} has been created.`,
    )
  }

  if (modal.value === 'edit' && selected.value) {
    const updated = updateTransfer(selected.value.id, {
      transferType: form.transferType,
      newDepartment: form.newDepartment.trim(),
      newPosition: form.newPosition.trim(),
      newBranch: form.newBranch.trim(),
      requestedDate: form.requestedDate,
      effectiveDate: form.effectiveDate,
      requestedBy: form.requestedBy.trim(),
      reason: form.reason.trim(),
      remarks: form.remarks.trim(),
    })

    if (!updated) {
      warning('Update Failed', 'Unable to update transfer.')
      return
    }

    success(
      'Transfer Updated',
      `${selected.value.transferNumber} has been updated.`,
    )
  }

  closeModal()
}

/* =========================================
   STATUS
========================================= */

const saveStatus = () => {
  if (!selected.value) return

  const nextStatus = statusForm.status

  if (['Effective', 'Rejected', 'Cancelled'].includes(nextStatus)) {
    errorMessage.value =
      'Use the appropriate approval, completion or cancellation action.'
    return
  }

  if (
    nextStatus === 'Approved' &&
    !statusForm.approvedBy.trim()
  ) {
    errorMessage.value = 'Approver name is required.'
    return
  }

  const updated = changeTransferStatus(
    selected.value.id,
    nextStatus,
    statusForm.remarks,
    statusForm.approvedBy,
  )

  if (!updated) {
    errorMessage.value = 'This status transition is not allowed.'
    return
  }

  success('Status Updated', 'Transfer status has been updated.')
  closeModal()
}

/* =========================================
   APPROVE
========================================= */

const approveTransfer = () => {
  if (!selected.value) return

  errorMessage.value = ''

  if (!statusForm.approvedBy.trim()) {
    errorMessage.value = 'Please enter the authorized approver.'
    return
  }

  const updated = changeTransferStatus(
    selected.value.id,
    'Approved',
    statusForm.remarks,
    statusForm.approvedBy.trim(),
  )

  if (!updated) {
    errorMessage.value = 'Unable to approve this transfer.'
    return
  }

  success(
    'Transfer Approved',
    `${selected.value.transferNumber} has been approved.`,
  )

  closeModal()
}

/* =========================================
   COMPLETE
========================================= */

const completeTransfer = () => {
  if (!selected.value) return

  const updated = changeTransferStatus(
    selected.value.id,
    'Effective',
    statusForm.remarks,
  )

  if (!updated) {
    warning(
      'Action Failed',
      'Only approved or scheduled transfers can be completed.',
    )
    return
  }

  success(
    'Transfer Completed',
    `${selected.value.employeeName} transfer has been marked Effective.`,
  )

  closeModal()
}

/* =========================================
   CANCEL
========================================= */

const cancelTransfer = () => {
  if (!selected.value) return

  errorMessage.value = ''

  if (!statusForm.remarks.trim()) {
    errorMessage.value = 'Cancellation reason is required.'
    return
  }

  const updated = changeTransferStatus(
    selected.value.id,
    'Cancelled',
    statusForm.remarks,
  )

  if (!updated) {
    errorMessage.value = 'Unable to cancel this transfer.'
    return
  }

  success(
    'Transfer Cancelled',
    `${selected.value.transferNumber} has been cancelled.`,
  )

  closeModal()
}
</script>

<template>
  <section class="lifecycle-transfers-page">
    <!-- HEADER -->
    <PageHeader
      title="Employee Transfers"
      description="Track employee department, position, branch and assignment movements throughout the employee lifecycle."
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
          :icon="ArrowLeftRight"
          @click="openCreate"
        >
          New Transfer
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS -->
    <LifecycleTransferStats :stats="stats" />

    <!-- FILTERS -->
    <LifecycleTransferFilters
      v-model:search="search"
      v-model:transfer-type="transferType"
      v-model:destination-department="destinationDepartment"
      v-model:status="status"
      :transfer-types="transferTypeOptions"
      :departments="destinationDepartmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE -->
    <LifecycleTransferTable
      :records="paginatedRecords"
      @view="openView"
      @edit="openEdit"
      @status="openStatus"
      @approve="openApprove"
      @complete="openComplete"
      @cancel="openCancel"
    />

    <!-- PAGINATION -->
    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ filteredRecords.length }}</strong>
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
        v-if="modal"
        class="transfer-modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="transfer-modal"
          role="dialog"
          aria-modal="true"
        >
          <!-- MODAL HEADER -->
          <header class="modal-header">
            <div class="modal-heading">
              <div class="modal-icon">
                <ArrowLeftRight :size="18" />
              </div>

              <div>
                <h2>
                  {{
                    modal === 'create'
                      ? 'New Employee Transfer'
                      : modal === 'edit'
                        ? 'Edit Employee Transfer'
                        : modal === 'view'
                          ? 'Employee Transfer Details'
                          : modal === 'status'
                            ? 'Update Transfer Status'
                            : modal === 'approve'
                              ? 'Approve Employee Transfer'
                              : modal === 'complete'
                                ? 'Complete Employee Transfer'
                                : modal === 'cancel'
                                  ? 'Cancel Employee Transfer'
                                  : 'Export Employee Transfers'
                  }}
                </h2>

                <p>
                  Employee lifecycle transfer management
                </p>
              </div>
            </div>

            <button
              type="button"
              class="close-button"
              aria-label="Close modal"
              @click="closeModal"
            >
              <X :size="17" />
            </button>
          </header>

          <!-- CREATE / EDIT -->
          <form
            v-if="modal === 'create' || modal === 'edit'"
            @submit.prevent="saveTransfer"
          >
            <div class="modal-body field-grid">
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

              <!-- CURRENT ASSIGNMENT -->
              <div v-if="selectedEmployee" class="current-summary full">
                <h4>Current Assignment</h4>

                <div class="summary-grid">
                  <div>
                    <span>Department</span>
                    <strong>{{ selectedEmployee.currentDepartment }}</strong>
                  </div>

                  <div>
                    <span>Position</span>
                    <strong>{{ selectedEmployee.currentPosition }}</strong>
                  </div>

                  <div>
                    <span>Branch</span>
                    <strong>{{ selectedEmployee.currentBranch }}</strong>
                  </div>
                </div>
              </div>

              <label class="field full">
                <span>Transfer Type *</span>

                <select v-model="form.transferType" required>
                  <option
                    v-for="option in transferTypeOptions"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <div class="section-heading full">
                <h4>New Assignment</h4>
                <p>Enter the employee's destination assignment.</p>
              </div>

              <label class="field">
                <span>Destination Department *</span>

                <input
                  v-model="form.newDepartment"
                  list="transfer-departments"
                  placeholder="Select or enter department"
                  required
                />

                <datalist id="transfer-departments">
                  <option
                    v-for="option in departmentOptions"
                    :key="option"
                    :value="option"
                  />
                </datalist>
              </label>

              <label class="field">
                <span>New Position *</span>

                <input
                  v-model="form.newPosition"
                  placeholder="Enter new position"
                  required
                />
              </label>

              <label class="field full">
                <span>Destination Branch / Assignment *</span>

                <input
                  v-model="form.newBranch"
                  list="transfer-branches"
                  placeholder="Select or enter branch"
                  required
                />

                <datalist id="transfer-branches">
                  <option
                    v-for="option in branchOptions"
                    :key="option"
                    :value="option"
                  />
                </datalist>
              </label>

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
                  placeholder="Enter requestor name"
                  required
                />
              </label>

              <label class="field full">
                <span>Reason for Transfer *</span>

                <textarea
                  v-model="form.reason"
                  rows="3"
                  placeholder="Explain the reason for the transfer..."
                  required
                />
              </label>

              <label class="field full">
                <span>Remarks</span>

                <textarea
                  v-model="form.remarks"
                  rows="3"
                  placeholder="Additional transfer notes..."
                />
              </label>

              <p v-if="errorMessage" class="form-error full">
                {{ errorMessage }}
              </p>

              <div class="modal-note full">
                New transfer requests will be saved as Draft.
                This does not automatically update employee records.
              </div>
            </div>

            <footer class="modal-footer">
              <button
                type="button"
                class="ui-button"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="ui-button primary"
              >
                <Plus v-if="modal === 'create'" :size="15" />
                <Pencil v-else :size="15" />

                {{ modal === 'create' ? 'Create Transfer' : 'Save Changes' }}
              </button>
            </footer>
          </form>

          <!-- VIEW -->
          <template v-else-if="modal === 'view' && selected">
            <div class="modal-body">
              <div class="details-grid">
                <div>
                  <span>Transfer Number</span>
                  <strong>{{ selected.transferNumber }}</strong>
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

                <div class="detail-section full">
                  Current Assignment
                </div>

                <div>
                  <span>Current Department</span>
                  <strong>{{ selected.currentDepartment }}</strong>
                </div>

                <div>
                  <span>Current Position</span>
                  <strong>{{ selected.currentPosition }}</strong>
                </div>

                <div class="full">
                  <span>Current Branch</span>
                  <strong>{{ selected.currentBranch }}</strong>
                </div>

                <div class="detail-section full">
                  New Assignment
                </div>

                <div>
                  <span>New Department</span>
                  <strong>{{ selected.newDepartment }}</strong>
                </div>

                <div>
                  <span>New Position</span>
                  <strong>{{ selected.newPosition }}</strong>
                </div>

                <div class="full">
                  <span>New Branch</span>
                  <strong>{{ selected.newBranch }}</strong>
                </div>

                <div>
                  <span>Transfer Type</span>
                  <strong>{{ selected.transferType }}</strong>
                </div>

                <div>
                  <span>Requested By</span>
                  <strong>{{ selected.requestedBy }}</strong>
                </div>

                <div>
                  <span>Requested Date</span>
                  <strong>{{ formatDate(selected.requestedDate) }}</strong>
                </div>

                <div>
                  <span>Effective Date</span>
                  <strong>{{ formatDate(selected.effectiveDate) }}</strong>
                </div>

                <div class="full">
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
              </div>
            </div>

            <footer class="modal-footer">
              <button
                type="button"
                class="ui-button"
                @click="closeModal"
              >
                Close
              </button>

              <button
                v-if="!['Effective', 'Rejected', 'Cancelled'].includes(selected.status)"
                type="button"
                class="ui-button primary"
                @click="openEdit(selected)"
              >
                <Pencil :size="15" />
                Edit Transfer
              </button>
            </footer>
          </template>

          <!-- UPDATE STATUS -->
          <template v-else-if="modal === 'status' && selected">
            <div class="modal-body field-grid">
              <div class="record-summary full">
                <strong>{{ selected.employeeName }}</strong>
                <span>{{ selected.transferNumber }}</span>
              </div>

              <label class="field full">
                <span>Transfer Status *</span>

                <select v-model="statusForm.status">
                  <option
                    v-for="option in statusOptions.filter(
                      value => !['Effective', 'Rejected', 'Cancelled'].includes(value)
                    )"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <label
                v-if="['Approved', 'Scheduled'].includes(statusForm.status)"
                class="field full"
              >
                <span>Approved By *</span>

                <input
                  v-model="statusForm.approvedBy"
                  placeholder="Authorized approver"
                />
              </label>

              <label class="field full">
                <span>Remarks</span>

                <textarea
                  v-model="statusForm.remarks"
                  rows="3"
                  placeholder="Enter status remarks..."
                />
              </label>

              <p v-if="errorMessage" class="form-error full">
                {{ errorMessage }}
              </p>
            </div>

            <footer class="modal-footer">
              <button
                type="button"
                class="ui-button"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="button"
                class="ui-button primary"
                @click="saveStatus"
              >
                Save Status
              </button>
            </footer>
          </template>

          <!-- APPROVE -->
          <template v-else-if="modal === 'approve' && selected">
            <div class="modal-body field-grid">
              <div class="confirmation-icon success-icon full">
                <CheckCircle2 :size="24" />
              </div>

              <h3 class="confirm-title full">
                Approve this employee transfer?
              </h3>

              <p class="confirm-description full">
                You are approving transfer
                <strong>{{ selected.transferNumber }}</strong>
                for <strong>{{ selected.employeeName }}</strong>.
              </p>

              <label class="field full">
                <span>Approved By *</span>

                <input
                  v-model="statusForm.approvedBy"
                  placeholder="Authorized approver"
                />
              </label>

              <label class="field full">
                <span>Approval Remarks</span>

                <textarea
                  v-model="statusForm.remarks"
                  rows="3"
                />
              </label>

              <p v-if="errorMessage" class="form-error full">
                {{ errorMessage }}
              </p>

              <div class="modal-note full">
                Approval records a manual HR decision.
                It does not apply the transfer automatically.
              </div>
            </div>

            <footer class="modal-footer">
              <button
                type="button"
                class="ui-button"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="button"
                class="ui-button primary"
                @click="approveTransfer"
              >
                <CheckCircle2 :size="15" />
                Approve Transfer
              </button>
            </footer>
          </template>

          <!-- COMPLETE -->
          <template v-else-if="modal === 'complete' && selected">
            <div class="modal-body field-grid">
              <div class="confirmation-icon success-icon full">
                <CheckCircle2 :size="24" />
              </div>

              <h3 class="confirm-title full">
                Complete Employee Transfer?
              </h3>

              <p class="confirm-description full">
                Mark the transfer of
                <strong>{{ selected.employeeName }}</strong>
                as Effective.
              </p>

              <div class="record-summary full">
                <strong>{{ selected.newDepartment }}</strong>

                <span>{{ selected.newPosition }}</span>

                <small>
                  {{ selected.newBranch }}
                  · Effective Date: {{ formatDate(selected.effectiveDate) }}
                </small>
              </div>

              <label class="field full">
                <span>Completion Remarks</span>

                <textarea
                  v-model="statusForm.remarks"
                  rows="3"
                />
              </label>

              <div class="modal-note full">
                This updates transfer tracking only and will not
                automatically modify the employee master record.
              </div>
            </div>

            <footer class="modal-footer">
              <button
                type="button"
                class="ui-button"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="button"
                class="ui-button primary"
                @click="completeTransfer"
              >
                <CheckCircle2 :size="15" />
                Confirm Completion
              </button>
            </footer>
          </template>

          <!-- CANCEL TRANSFER -->
          <template v-else-if="modal === 'cancel' && selected">
            <div class="modal-body field-grid">
              <div class="confirmation-icon danger-icon full">
                <CircleX :size="24" />
              </div>

              <h3 class="confirm-title full">
                Cancel Employee Transfer?
              </h3>

              <p class="confirm-description full">
                Cancel transfer
                <strong>{{ selected.transferNumber }}</strong>
                for <strong>{{ selected.employeeName }}</strong>.
              </p>

              <label class="field full">
                <span>Cancellation Reason *</span>

                <textarea
                  v-model="statusForm.remarks"
                  rows="3"
                  placeholder="Explain why this transfer is cancelled..."
                />
              </label>

              <p v-if="errorMessage" class="form-error full">
                {{ errorMessage }}
              </p>

              <div class="modal-note full">
                Cancelled transfers will remain in the record
                for HR monitoring and history.
              </div>
            </div>

            <footer class="modal-footer">
              <button
                type="button"
                class="ui-button"
                @click="closeModal"
              >
                Back
              </button>

              <button
                type="button"
                class="ui-button danger"
                @click="cancelTransfer"
              >
                <CircleX :size="15" />
                Confirm Cancellation
              </button>
            </footer>
          </template>

          <!-- EXPORT -->
          <template v-else-if="modal === 'export'">
            <div class="modal-body">
              <div class="export-stats">
                <div>
                  <span>Total Records</span>
                  <strong>{{ records.length }}</strong>
                </div>

                <div>
                  <span>Filtered Records</span>
                  <strong>{{ filteredRecords.length }}</strong>
                </div>

                <div>
                  <span>Effective Transfers</span>
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
                  <FileSpreadsheet :size="20" />
                  <strong>Excel</strong>
                  <small>Spreadsheet report</small>
                </button>

                <button
                  type="button"
                  :class="{ active: exportFormat === 'pdf' }"
                  @click="exportFormat = 'pdf'"
                >
                  <FileText :size="20" />
                  <strong>PDF</strong>
                  <small>Printable report</small>
                </button>

                <button
                  type="button"
                  :class="{ active: exportFormat === 'csv' }"
                  @click="exportFormat = 'csv'"
                >
                  <Table2 :size="20" />
                  <strong>CSV</strong>
                  <small>Raw transfer data</small>
                </button>
              </div>

              <div class="modal-note">
                Included data: Employee, Transfer Number, Transfer Type,
                Current Assignment, New Assignment, Dates, Requestor,
                Approver, Status, Reason and Remarks.

                Actual file exporting will be connected later.
              </div>
            </div>

            <footer class="modal-footer">
              <button
                type="button"
                class="ui-button"
                @click="closeModal"
              >
                Cancel
              </button>

              <button
                type="button"
                class="ui-button primary"
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
.lifecycle-transfers-page {
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
   MODAL OVERLAY
========================================= */

.transfer-modal-overlay {
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

.transfer-modal {
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.3);
}

/* =========================================
   HEADER / FOOTER
========================================= */

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 17px;
  border-bottom: 1px solid var(--border);
}

.modal-heading {
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

.modal-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.modal-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.modal-footer {
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  border-bottom: 0;
}

.modal-body {
  padding: 17px;
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

.close-button:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

/* =========================================
   BUTTONS
========================================= */

.ui-button {
  display: inline-flex;
  min-height: 35px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.ui-button.primary {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}

.ui-button.danger {
  border-color: var(--red);
  background: var(--red);
  color: #fff;
}

.ui-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* =========================================
   FORM FIELDS
========================================= */

.field-grid,
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
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
  min-height: 37px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 11px;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--primary);
}

.field input:disabled,
.field select:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.full {
  grid-column: 1 / -1;
}

/* =========================================
   ASSIGNMENT SUMMARY
========================================= */

.current-summary,
.record-summary {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.current-summary h4,
.section-heading h4 {
  margin: 0 0 10px;
  color: var(--text-primary);
  font-size: 11px;
}

.section-heading {
  padding-top: 5px;
  border-top: 1px solid var(--border-soft);
}

.section-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.summary-grid div,
.record-summary {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.summary-grid span,
.record-summary span,
.record-summary small {
  color: var(--text-muted);
  font-size: 10px;
}

.summary-grid strong,
.record-summary strong {
  color: var(--text-primary);
  font-size: 11px;
}

/* =========================================
   DETAILS
========================================= */

.details-grid > div:not(.detail-section) {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
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

.detail-section {
  margin-top: 5px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-soft);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
}

/* =========================================
   MESSAGES
========================================= */

.modal-note {
  padding: 11px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.6;
}

.form-error {
  margin: 0;
  color: var(--red);
  font-size: 11px;
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

.success-icon {
  background: var(--green-soft);
  color: var(--green);
}

.danger-icon {
  background: var(--red-soft);
  color: var(--red);
}

.confirm-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
}

.confirm-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.6;
}

/* =========================================
   EXPORT
========================================= */

.export-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.export-stats div {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.export-stats span {
  color: var(--text-muted);
  font-size: 9px;
}

.export-stats strong {
  color: var(--text-primary);
  font-size: 16px;
}

.export-heading {
  margin: 17px 0 10px;
  color: var(--text-primary);
  font-size: 11px;
}

.export-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin-bottom: 12px;
}

.export-options button {
  display: flex;
  min-height: 105px;
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
  .header-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .field-grid,
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
