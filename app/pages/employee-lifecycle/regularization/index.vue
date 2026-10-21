
<script setup lang="ts">
import {
  Download,
  UserCheck,
  X,
  Eye,
  Pencil,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Table2,
} from 'lucide-vue-next'

import type {
  EvaluationStatus,
  Recommendation,
  RegularizationRecord,
  RegularizationStatus,
} from '~/types/regularization'

import RegularizationStats from '~/components/employee-lifecycle/regularization/RegularizationStats.vue'
import RegularizationFilters from '~/components/employee-lifecycle/regularization/RegularizationFilters.vue'
import RegularizationTable from '~/components/employee-lifecycle/regularization/RegularizationTable.vue'

const { success, warning } = useToast()

const {
  records,
  search,
  department,
  evaluationStatus,
  status,
  currentPage,
  filteredRecords,
  paginatedRecords,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  departmentOptions,
  evaluationStatusOptions,
  recommendationOptions,
  statusOptions,
  resetFilters,
  updateRegularization,
} = useRegularization()

/* =========================================
   MODAL STATE
========================================= */

type ModalType =
  | 'process'
  | 'view'
  | 'edit'
  | 'status'
  | 'recommendation'
  | 'complete'
  | 'export'
  | null

const modal = ref<ModalType>(null)
const selectedId = ref<number | null>(null)
const errorMessage = ref('')

const exportFormat = ref<'excel' | 'pdf' | 'csv'>('excel')

const selected = computed(() => {
  return records.value.find(item => item.id === selectedId.value) ?? null
})

const availableRecords = computed(() => {
  return records.value.filter(
    item => item.status !== 'Regularized',
  )
})

const form = reactive({
  targetRegularizationDate: '',
  probationEndDate: '',
  probationMonths: 6,
  evaluationStatus: 'Pending' as EvaluationStatus,
  recommendation: 'Pending' as Recommendation,
  reviewedBy: '',
  approvedBy: '',
  approvalDate: '',
  effectiveDate: '',
  status: 'For Evaluation' as RegularizationStatus,
  remarks: '',
})

/* =========================================
   HELPERS
========================================= */

const formatDate = (value?: string) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const fillForm = (record: RegularizationRecord) => {
  form.targetRegularizationDate = record.targetRegularizationDate
  form.probationEndDate = record.probationEndDate
  form.probationMonths = record.probationMonths
  form.evaluationStatus = record.evaluationStatus
  form.recommendation = record.recommendation
  form.reviewedBy = record.reviewedBy ?? ''
  form.approvedBy = record.approvedBy ?? ''
  form.approvalDate = record.approvalDate ?? ''
  form.effectiveDate = record.effectiveDate ?? ''
  form.status = record.status
  form.remarks = record.remarks ?? ''
}

const selectRecord = (id: number | null) => {
  selectedId.value = id

  const record = records.value.find(item => item.id === id)

  if (record) {
    fillForm(record)
  }
}

const closeModal = () => {
  modal.value = null
  errorMessage.value = ''
}

const openProcess = () => {
  errorMessage.value = ''

  const firstRecord = availableRecords.value[0]

  selectRecord(firstRecord?.id ?? null)

  modal.value = 'process'
}

const openView = (record: RegularizationRecord) => {
  selectRecord(record.id)
  modal.value = 'view'
}

const openEdit = (record: RegularizationRecord) => {
  if (record.status === 'Regularized') return

  selectRecord(record.id)
  errorMessage.value = ''
  modal.value = 'edit'
}

const openStatus = (record: RegularizationRecord) => {
  if (record.status === 'Regularized') return

  selectRecord(record.id)
  errorMessage.value = ''
  modal.value = 'status'
}

const openRecommendation = (record: RegularizationRecord) => {
  if (record.status === 'Regularized') return

  selectRecord(record.id)
  errorMessage.value = ''
  modal.value = 'recommendation'
}

const openComplete = (record: RegularizationRecord) => {
  if (record.status !== 'Approved') return

  selectRecord(record.id)
  errorMessage.value = ''
  modal.value = 'complete'
}

/* =========================================
   VALIDATION
========================================= */

const validateForm = () => {
  errorMessage.value = ''

  if (!selected.value) {
    errorMessage.value = 'Please select an employee record.'
    return false
  }

  if (!form.probationEndDate || !form.targetRegularizationDate) {
    errorMessage.value = 'Please complete the required dates.'
    return false
  }

  if (form.probationMonths < 1) {
    errorMessage.value = 'Probation months must be valid.'
    return false
  }

  if (form.probationEndDate < selected.value.dateHired) {
    errorMessage.value =
      'Probation end cannot be earlier than the hiring date.'
    return false
  }

  if (form.targetRegularizationDate < selected.value.dateHired) {
    errorMessage.value =
      'Target date cannot be earlier than the hiring date.'
    return false
  }

  if (
    ['Recommended', 'Approved', 'Regularized'].includes(form.status) &&
    form.recommendation !== 'For Regularization'
  ) {
    errorMessage.value =
      'A For Regularization recommendation is required for this status.'
    return false
  }

  if (
    ['Approved', 'Regularized', 'Extended'].includes(form.status) &&
    (!form.approvedBy.trim() || !form.approvalDate)
  ) {
    errorMessage.value =
      'Approver name and approval date are required.'
    return false
  }

  if (form.status === 'Regularized') {
    if (selected.value.status !== 'Approved') {
      errorMessage.value =
        'The record must be Approved before regularization.'
      return false
    }

    if (!form.effectiveDate) {
      errorMessage.value =
        'Effective date is required to complete regularization.'
      return false
    }
  }

  return true
}

/* =========================================
   SAVE ACTIONS
========================================= */

const saveRegularization = () => {
  if (!validateForm() || !selected.value) return

  const updated = updateRegularization(selected.value.id, {
    probationEndDate: form.probationEndDate,
    targetRegularizationDate: form.targetRegularizationDate,
    probationMonths: Number(form.probationMonths),
    evaluationStatus: form.evaluationStatus,
    recommendation: form.recommendation,
    reviewedBy: form.reviewedBy.trim() || undefined,
    approvedBy: form.approvedBy.trim() || undefined,
    approvalDate: form.approvalDate || undefined,
    effectiveDate: form.effectiveDate || undefined,
    status: form.status,
    remarks: form.remarks.trim() || undefined,
  })

  if (!updated) {
    warning(
      'Update Failed',
      'This regularization record could not be updated.',
    )
    return
  }

  success(
    'Regularization Updated',
    `${selected.value.regularizationNumber} has been updated.`,
  )

  closeModal()
}

const saveStatus = () => {
  saveRegularization()
}

const saveRecommendation = () => {
  if (!selected.value) return

  if (
    form.recommendation !== 'Pending' &&
    !form.reviewedBy.trim()
  ) {
    errorMessage.value = 'Reviewer name is required.'
    return
  }

  if (
    form.recommendation === 'Extend Probation' &&
    !form.remarks.trim()
  ) {
    errorMessage.value =
      'Please provide the reason for probation extension.'
    return
  }

  const nextStatus: RegularizationStatus =
    form.recommendation === 'For Regularization'
      ? 'Recommended'
      : form.recommendation === 'Extend Probation'
        ? 'For Review'
        : form.recommendation === 'Not Recommended'
          ? 'Not Recommended'
          : 'For Review'

  const updated = updateRegularization(selected.value.id, {
    recommendation: form.recommendation,
    reviewedBy: form.reviewedBy.trim() || undefined,
    status: nextStatus,
    remarks: form.remarks.trim() || undefined,
  })

  if (!updated) {
    warning('Update Failed', 'Unable to save recommendation.')
    return
  }

  success(
    'Recommendation Saved',
    'HR recommendation has been recorded.',
  )

  closeModal()
}

const completeRegularization = () => {
  if (!selected.value || selected.value.status !== 'Approved') {
    return
  }

  errorMessage.value = ''

  if (!form.effectiveDate) {
    errorMessage.value = 'Please select an effective date.'
    return
  }

  if (
    !selected.value.approvedBy ||
    !selected.value.approvalDate ||
    selected.value.recommendation !== 'For Regularization'
  ) {
    errorMessage.value =
      'Approved regularization details are incomplete.'
    return
  }

  const updated = updateRegularization(selected.value.id, {
    effectiveDate: form.effectiveDate,
    status: 'Regularized',
    remarks: form.remarks.trim() || selected.value.remarks,
  })

  if (!updated) {
    warning('Action Failed', 'Unable to complete regularization.')
    return
  }

  success(
    'Regularization Completed',
    `${selected.value.employeeName} has been marked Regularized.`,
  )

  closeModal()
}
</script>

<template>
  <section class="regularization-page">
    <!-- HEADER -->
    <PageHeader
      title="Employee Regularization"
      description="Monitor probationary employees, milestone reviews, recommendations, approvals and effective regularization dates."
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
          :icon="UserCheck"
          @click="openProcess"
        >
          Process Regularization
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS -->
    <RegularizationStats :stats="stats" />

    <!-- FILTERS -->
    <RegularizationFilters
      v-model:search="search"
      v-model:department="department"
      v-model:evaluation-status="evaluationStatus"
      v-model:status="status"
      :departments="departmentOptions"
      :evaluation-statuses="evaluationStatusOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE -->
    <RegularizationTable
      :records="paginatedRecords"
      @view="openView"
      @edit="openEdit"
      @status="openStatus"
      @recommendation="openRecommendation"
      @complete="openComplete"
    />

    <!-- PAGINATION -->
    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ filteredRecords.length }}</strong>
        regularization records
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
        class="regularization-modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="regularization-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Regularization action"
        >
          <!-- HEADER -->
          <header class="modal-header">
            <div>
              <h2>
                {{
                  modal === 'process'
                    ? 'Process Regularization'
                    : modal === 'view'
                      ? 'Regularization Details'
                      : modal === 'edit'
                        ? 'Edit Regularization'
                        : modal === 'status'
                          ? 'Update Regularization Status'
                          : modal === 'recommendation'
                            ? 'Record HR Recommendation'
                            : modal === 'complete'
                              ? 'Complete Regularization'
                              : 'Export Regularization Records'
                }}
              </h2>

              <p>
                Employee regularization monitoring and manual HR processing
              </p>
            </div>

            <button
              type="button"
              class="icon-button"
              aria-label="Close"
              @click="closeModal"
            >
              <X :size="17" />
            </button>
          </header>

          <!-- PROCESS AND EDIT -->
          <form
            v-if="modal === 'process' || modal === 'edit'"
            @submit.prevent="saveRegularization"
          >
            <div class="modal-body field-grid">
              <label
                v-if="modal === 'process'"
                class="field full"
              >
                <span>Employee Regularization Record *</span>

                <select
                  :value="selectedId ?? ''"
                  required
                  @change="
                    selectRecord(
                      Number(($event.target as HTMLSelectElement).value)
                    )
                  "
                >
                  <option value="" disabled>
                    Select employee
                  </option>

                  <option
                    v-for="item in availableRecords"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.employeeName }}
                    — {{ item.regularizationNumber }}
                  </option>
                </select>
              </label>

              <div v-if="selected" class="record-summary full">
                <strong>{{ selected.employeeName }}</strong>

                <span>
                  {{ selected.employeeNumber }} ·
                  {{ selected.department }} ·
                  {{ selected.position }}
                </span>

                <small>
                  Date Hired: {{ formatDate(selected.dateHired) }}
                </small>
              </div>

              <label class="field">
                <span>Probation End *</span>
                <input
                  v-model="form.probationEndDate"
                  type="date"
                  required
                />
              </label>

              <label class="field">
                <span>Target Regularization *</span>
                <input
                  v-model="form.targetRegularizationDate"
                  type="date"
                  required
                />
              </label>

              <label class="field">
                <span>Probation Months</span>
                <input
                  v-model.number="form.probationMonths"
                  type="number"
                  min="1"
                  max="24"
                />
              </label>

              <label class="field">
                <span>Evaluation Tracking</span>
                <select v-model="form.evaluationStatus">
                  <option
                    v-for="option in evaluationStatusOptions"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Recommendation</span>
                <select v-model="form.recommendation">
                  <option
                    v-for="option in recommendationOptions"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Status</span>
                <select v-model="form.status">
                  <option
                    v-for="option in statusOptions.filter(
                      item => item !== 'Regularized'
                    )"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Reviewed By</span>
                <input
                  v-model="form.reviewedBy"
                  placeholder="Reviewer name"
                />
              </label>

              <label class="field">
                <span>Approved By</span>
                <input
                  v-model="form.approvedBy"
                  placeholder="Authorized approver"
                />
              </label>

              <label class="field">
                <span>Approval Date</span>
                <input
                  v-model="form.approvalDate"
                  type="date"
                />
              </label>

              <label class="field">
                <span>Effective Date</span>
                <input
                  v-model="form.effectiveDate"
                  type="date"
                />
              </label>

              <label class="field full">
                <span>Remarks</span>
                <textarea
                  v-model="form.remarks"
                  rows="3"
                  placeholder="Enter HR remarks..."
                />
              </label>

              <p v-if="errorMessage" class="form-error full">
                {{ errorMessage }}
              </p>

              <p class="modal-note full">
                This form updates the selected regularization record only.
                It does not modify official employee or payroll information.
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
                type="submit"
                class="ui-button primary"
                :disabled="!selected"
              >
                <UserCheck :size="15" />
                Save Regularization
              </button>
            </footer>
          </form>

          <!-- VIEW -->
          <template v-else-if="modal === 'view' && selected">
            <div class="modal-body">
              <div class="details-grid">
                <div>
                  <span>Regularization No.</span>
                  <strong>{{ selected.regularizationNumber }}</strong>
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

                <div>
                  <span>Date Hired</span>
                  <strong>{{ formatDate(selected.dateHired) }}</strong>
                </div>

                <div>
                  <span>Probation End</span>
                  <strong>{{ formatDate(selected.probationEndDate) }}</strong>
                </div>

                <div>
                  <span>Target Regularization</span>
                  <strong>
                    {{ formatDate(selected.targetRegularizationDate) }}
                  </strong>
                </div>

                <div>
                  <span>Evaluation Tracking</span>
                  <strong>{{ selected.evaluationStatus }}</strong>
                </div>

                <div>
                  <span>Recommendation</span>
                  <strong>{{ selected.recommendation }}</strong>
                </div>

                <div>
                  <span>Probation Duration</span>
                  <strong>{{ selected.probationMonths }} months</strong>
                </div>

                <div>
                  <span>Reviewed By</span>
                  <strong>{{ selected.reviewedBy || 'Not assigned' }}</strong>
                </div>

                <div>
                  <span>Approved By</span>
                  <strong>{{ selected.approvedBy || 'Pending' }}</strong>
                </div>

                <div>
                  <span>Approval Date</span>
                  <strong>{{ formatDate(selected.approvalDate) }}</strong>
                </div>

                <div>
                  <span>Effective Date</span>
                  <strong>{{ formatDate(selected.effectiveDate) }}</strong>
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
                v-if="selected.status !== 'Regularized'"
                type="button"
                class="ui-button primary"
                @click="openEdit(selected)"
              >
                <Pencil :size="15" />
                Edit Record
              </button>
            </footer>
          </template>

          <!-- STATUS -->
          <template v-else-if="modal === 'status' && selected">
            <div class="modal-body field-grid">
              <div class="record-summary full">
                <strong>{{ selected.employeeName }}</strong>
                <span>{{ selected.regularizationNumber }}</span>
              </div>

              <label class="field full">
                <span>Regularization Status *</span>

                <select v-model="form.status">
                  <option
                    v-for="option in statusOptions.filter(
                      item => item !== 'Regularized'
                    )"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <template v-if="form.status === 'Approved' || form.status === 'Extended'">
                <label class="field">
                  <span>Approved By *</span>
                  <input
                    v-model="form.approvedBy"
                    placeholder="Authorized approver"
                  />
                </label>

                <label class="field">
                  <span>Approval Date *</span>
                  <input
                    v-model="form.approvalDate"
                    type="date"
                  />
                </label>
              </template>

              <label class="field full">
                <span>Remarks</span>
                <textarea
                  v-model="form.remarks"
                  rows="3"
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

          <!-- RECOMMENDATION -->
          <template v-else-if="modal === 'recommendation' && selected">
            <div class="modal-body field-grid">
              <div class="record-summary full">
                <strong>{{ selected.employeeName }}</strong>
                <span>{{ selected.regularizationNumber }}</span>
              </div>

              <label class="field full">
                <span>HR Recommendation *</span>

                <select v-model="form.recommendation">
                  <option
                    v-for="option in recommendationOptions"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <label class="field full">
                <span>Reviewed By *</span>
                <input
                  v-model="form.reviewedBy"
                  placeholder="HR or supervisor name"
                />
              </label>

              <label class="field full">
                <span>Reason / Remarks</span>
                <textarea
                  v-model="form.remarks"
                  rows="3"
                  placeholder="Enter recommendation details..."
                />
              </label>

              <p v-if="errorMessage" class="form-error full">
                {{ errorMessage }}
              </p>

              <p class="modal-note full">
                A recommendation does not automatically approve or
                regularize an employee.
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
                @click="saveRecommendation"
              >
                <ClipboardCheck :size="15" />
                Save Recommendation
              </button>
            </footer>
          </template>

          <!-- COMPLETE -->
          <template v-else-if="modal === 'complete' && selected">
            <div class="modal-body field-grid">
              <div class="confirmation-icon full">
                <CheckCircle2 :size="24" />
              </div>

              <h3 class="confirm-title full">
                Complete Employee Regularization?
              </h3>

              <p class="confirm-description full">
                Mark the approved regularization of
                <strong>{{ selected.employeeName }}</strong>
                as completed.
              </p>

              <label class="field full">
                <span>Effective Regularization Date *</span>
                <input
                  v-model="form.effectiveDate"
                  type="date"
                />
              </label>

              <label class="field full">
                <span>Final Remarks</span>
                <textarea
                  v-model="form.remarks"
                  rows="3"
                />
              </label>

              <p v-if="errorMessage" class="form-error full">
                {{ errorMessage }}
              </p>

              <p class="modal-note full">
                This manually marks the HRIS tracking record as
                Regularized. It does not automatically update the
                employee master record or payroll.
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
                @click="completeRegularization"
              >
                <CheckCircle2 :size="15" />
                Confirm Regularization
              </button>
            </footer>
          </template>

          <!-- EXPORT -->
          <template v-else-if="modal === 'export'">
            <div class="modal-body">
              <p class="field-title">Export Format</p>

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
                  <small>Raw data</small>
                </button>
              </div>

              <p class="modal-note">
                {{ filteredRecords.length }} regularization records
                match the current filters. Actual exporting will be
                implemented later.
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
.regularization-page {
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

/* MODAL */

.regularization-modal-overlay {
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

.regularization-modal {
  width: 100%;
  max-width: 620px;
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

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.modal-header p {
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

.icon-button,
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
  cursor: pointer;
}

.icon-button {
  width: 30px;
  min-height: 30px;
  padding: 0;
}

.ui-button.primary {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}

.ui-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* FORM */

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

.field span,
.field-title {
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
  outline: 0;
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

.full {
  grid-column: 1 / -1;
}

.record-summary {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.record-summary strong {
  color: var(--text-primary);
  font-size: 12px;
}

.record-summary span,
.record-summary small {
  color: var(--text-muted);
  font-size: 10px;
}

/* DETAILS */

.details-grid > div {
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

/* MESSAGES */

.modal-note {
  padding: 10px;
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.5;
}

.form-error {
  margin: 0;
  color: var(--red);
  font-size: 11px;
}

.confirmation-icon {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--green-soft);
  color: var(--green);
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

/* EXPORT */

.export-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin: 12px 0;
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

/* RESPONSIVE */

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
  .export-options {
    grid-template-columns: 1fr;
  }

  .full {
    grid-column: auto;
  }
}
</style>
