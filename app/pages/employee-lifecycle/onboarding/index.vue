
<script setup lang="ts">
import {
  Download,
  Plus,
  X,
  Eye,
  Pencil,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Table2,
} from 'lucide-vue-next'

import type {
  EmploymentType,
  OnboardingEmployee,
  OnboardingStatus,
} from '~/types/onboarding'

import OnboardingStats from '~/components/employee-lifecycle/onboarding/OnboardingStats.vue'
import OnboardingFilters from '~/components/employee-lifecycle/onboarding/OnboardingFilters.vue'
import OnboardingTable from '~/components/employee-lifecycle/onboarding/OnboardingTable.vue'

const { employees } = useEmployees()
const { success, warning } = useToast()

const {
  search,
  department,
  employmentType,
  status,
  currentPage,
  filteredRecords,
  paginatedRecords,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  departmentOptions,
  employmentTypeOptions,
  statusOptions,
  resetFilters,
  createOnboarding,
  updateOnboarding,
  updateOnboardingStatus,
} = useOnboarding()

/* =========================================
   MODAL STATE
========================================= */

type ModalType =
  | 'create'
  | 'view'
  | 'edit'
  | 'status'
  | 'complete'
  | 'export'
  | null

const modal = ref<ModalType>(null)
const selected = ref<OnboardingEmployee | null>(null)

const exportFormat = ref<'excel' | 'pdf' | 'csv'>('excel')
const errorMessage = ref('')

const form = reactive({
  employeeId: '',
  employmentType: 'Probationary' as EmploymentType,
  dateHired: '',
  onboardingStartDate: '',
  targetCompletionDate: '',
  remarks: '',
})

const statusForm = reactive({
  status: 'Not Started' as OnboardingStatus,
  remarks: '',
})

/* =========================================
   EMPLOYEE OPTIONS
========================================= */

const employeeOptions = computed(() => {
  return employees.value.map(employee => ({
    id: employee.id,
    employeeNumber: employee.employeeNumber,
    employeeName: [
      employee.firstName,
      employee.middleName,
      employee.lastName,
    ].filter(Boolean).join(' '),
    email: employee.email ?? '',
    department: employee.department,
    position: employee.position,
  }))
})

const selectedEmployee = computed(() => {
  return employeeOptions.value.find(
    employee => String(employee.id) === form.employeeId,
  )
})

const employmentOptions: EmploymentType[] = [
  'Regular',
  'Probationary',
  'Contractual',
  'Project-Based',
]

/* =========================================
   HELPERS
========================================= */

const formatDate = (value: string) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const clearForm = () => {
  form.employeeId = ''
  form.employmentType = 'Probationary'
  form.dateHired = ''
  form.onboardingStartDate = ''
  form.targetCompletionDate = ''
  form.remarks = ''

  errorMessage.value = ''
}

const closeModal = () => {
  modal.value = null
  errorMessage.value = ''
}

const openCreate = () => {
  selected.value = null
  clearForm()
  modal.value = 'create'
}

const openView = (record: OnboardingEmployee) => {
  selected.value = record
  modal.value = 'view'
}

const openEdit = (record: OnboardingEmployee) => {
  if (record.status === 'Completed') return

  selected.value = record
  clearForm()

  form.employeeId = String(record.employeeId)
  form.employmentType = record.employmentType
  form.dateHired = record.dateHired
  form.onboardingStartDate = record.onboardingStartDate
  form.targetCompletionDate = record.targetCompletionDate
  form.remarks = record.remarks ?? ''

  modal.value = 'edit'
}

const openStatus = (record: OnboardingEmployee) => {
  if (record.status === 'Completed') return

  selected.value = record
  statusForm.status = record.status
  statusForm.remarks = record.remarks ?? ''

  modal.value = 'status'
}

const openComplete = (record: OnboardingEmployee) => {
  if (record.status === 'Completed') return

  selected.value = record
  statusForm.status = 'Completed'
  statusForm.remarks = record.remarks ?? ''

  modal.value = 'complete'
}


/* =========================================
   FORM VALIDATION
========================================= */

const validateForm = () => {
  errorMessage.value = ''

  if (
    !form.employeeId ||
    !form.dateHired ||
    !form.onboardingStartDate ||
    !form.targetCompletionDate
  ) {
    errorMessage.value = 'Please complete all required fields.'
    return false
  }

  if (form.onboardingStartDate < form.dateHired) {
    errorMessage.value =
      'Onboarding start date cannot be earlier than date hired.'
    return false
  }

  if (form.targetCompletionDate < form.onboardingStartDate) {
    errorMessage.value =
      'Target completion must be on or after onboarding start date.'
    return false
  }

  return true
}

/* =========================================
   SAVE ONBOARDING
========================================= */

const saveOnboarding = () => {
  if (!validateForm()) return

  if (modal.value === 'create') {
    const employee = selectedEmployee.value

    if (!employee) {
      errorMessage.value = 'Please select a valid employee.'
      return
    }

    const result = createOnboarding({
      employeeId: employee.id,
      employeeNumber: employee.employeeNumber,
      employeeName: employee.employeeName,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      employmentType: form.employmentType,
      dateHired: form.dateHired,
      onboardingStartDate: form.onboardingStartDate,
      targetCompletionDate: form.targetCompletionDate,
      remarks: form.remarks,
    })

    if (!result) {
      errorMessage.value =
        'This employee already has an onboarding record.'
      return
    }

    success(
      'Onboarding Created',
      `New onboarding record ${result.onboardingNumber} was created.`,
    )
  } else if (modal.value === 'edit' && selected.value) {
    const updated = updateOnboarding(selected.value.id, {
      employmentType: form.employmentType,
      dateHired: form.dateHired,
      onboardingStartDate: form.onboardingStartDate,
      targetCompletionDate: form.targetCompletionDate,
      remarks: form.remarks,
    })

    if (!updated) {
      errorMessage.value = 'Unable to update this onboarding record.'
      return
    }

    success(
      'Onboarding Updated',
      'Onboarding details were updated successfully.',
    )
  }

  closeModal()
}

/* =========================================
   STATUS ACTIONS
========================================= */

const saveStatus = () => {
  if (!selected.value) return

  if (statusForm.status === 'Completed') {
    modal.value = 'complete'
    return
  }

  const updated = updateOnboardingStatus(
    selected.value.id,
    statusForm.status,
    statusForm.remarks,
  )

  if (!updated) {
    warning('Update Failed', 'Unable to update onboarding status.')
    return
  }

  success('Status Updated', 'Onboarding status has been updated.')
  closeModal()
}

const completeOnboarding = () => {
  if (!selected.value) return

  const completed = updateOnboardingStatus(
    selected.value.id,
    'Completed',
    statusForm.remarks || selected.value.remarks,
  )

  if (!completed) {
    warning('Action Failed', 'Onboarding could not be completed.')
    return
  }

  success(
    'Onboarding Completed',
    `${selected.value.employeeName} has been marked as completed.`,
  )

  closeModal()
}
</script>

<template>
  <section class="onboarding-page">
    <PageHeader
      title="Employee Onboarding"
      description="Track new employees, onboarding dates, employment information and completion status."
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
          :icon="Plus"
          @click="openCreate"
        >
          Start Onboarding
        </AppButton>
      </div>
    </PageHeader>

    <OnboardingStats :stats="stats" />

    <OnboardingFilters
      v-model:search="search"
      v-model:department="department"
      v-model:employment-type="employmentType"
      v-model:status="status"
      :departments="departmentOptions"
      :employment-types="employmentTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <OnboardingTable
      :records="paginatedRecords"
      @view="openView"
      @edit="openEdit"
      @status="openStatus"
      @complete="openComplete"
    />

    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ filteredRecords.length }}</strong>
        onboarding records
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
        class="onboarding-modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="onboarding-modal"
          role="dialog"
          aria-modal="true"
        >
          <header class="modal-header">
            <div>
              <h2>
                {{
                  modal === 'create'
                    ? 'Start Employee Onboarding'
                    : modal === 'edit'
                      ? 'Edit Onboarding'
                      : modal === 'view'
                        ? 'Onboarding Details'
                        : modal === 'status'
                          ? 'Update Onboarding Status'
                          : modal === 'complete'
                            ? 'Complete Onboarding'
                            : 'Export Onboarding Records'
                }}
              </h2>

              <p>Employee onboarding management</p>
            </div>

            <button
              type="button"
              class="icon-button"
              aria-label="Close modal"
              @click="closeModal"
            >
              <X :size="17" />
            </button>
          </header>

          <!-- CREATE AND EDIT -->
          <form
            v-if="modal === 'create' || modal === 'edit'"
            @submit.prevent="saveOnboarding"
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
                    Select Employee
                  </option>

                  <option
                    v-for="employee in employeeOptions"
                    :key="employee.id"
                    :value="String(employee.id)"
                  >
                    {{ employee.employeeName }}
                    ({{ employee.employeeNumber }})
                  </option>

                  <option
                    v-if="
                      modal === 'edit' &&
                      selected &&
                      !employeeOptions.some(
                        employee => employee.id === selected?.employeeId
                      )
                    "
                    :value="String(selected.employeeId)"
                  >
                    {{ selected.employeeName }}
                    ({{ selected.employeeNumber }})
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Employment Type *</span>

                <select v-model="form.employmentType">
                  <option
                    v-for="option in employmentOptions"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Date Hired *</span>
                <input
                  v-model="form.dateHired"
                  type="date"
                  required
                />
              </label>

              <label class="field">
                <span>Onboarding Start *</span>
                <input
                  v-model="form.onboardingStartDate"
                  type="date"
                  required
                />
              </label>

              <label class="field">
                <span>Target Completion *</span>
                <input
                  v-model="form.targetCompletionDate"
                  type="date"
                  required
                />
              </label>

              <label class="field full">
                <span>Remarks</span>
                <textarea
                  v-model="form.remarks"
                  rows="3"
                  placeholder="Enter remarks..."
                />
              </label>

              <p
                v-if="errorMessage"
                class="form-error full"
              >
                {{ errorMessage }}
              </p>

              <p class="modal-note full">
                New onboarding records are created with Not Started status.
                Frontend mock data only; no Laravel database changes.
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
              >
                <Plus
                  v-if="modal === 'create'"
                  :size="15"
                />
                <Pencil
                  v-else
                  :size="15"
                />

                {{ modal === 'create' ? 'Start Onboarding' : 'Save Changes' }}
              </button>
            </footer>
          </form>

          <!-- VIEW -->
          <template v-else-if="modal === 'view' && selected">
            <div class="modal-body">
              <div class="details-grid">
                <div>
                  <span>Onboarding No.</span>
                  <strong>{{ selected.onboardingNumber }}</strong>
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
                  <span>Employee ID</span>
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
                  <span>Employment</span>
                  <strong>{{ selected.employmentType }}</strong>
                </div>

                <div>
                  <span>Date Hired</span>
                  <strong>{{ formatDate(selected.dateHired) }}</strong>
                </div>

                <div>
                  <span>Onboarding Start</span>
                  <strong>
                    {{ formatDate(selected.onboardingStartDate) }}
                  </strong>
                </div>

                <div>
                  <span>Target Completion</span>
                  <strong>
                    {{ formatDate(selected.targetCompletionDate) }}
                  </strong>
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
                v-if="selected.status !== 'Completed'"
                type="button"
                class="ui-button primary"
                @click="openEdit(selected)"
              >
                <Pencil :size="15" />
                Edit Onboarding
              </button>
            </footer>
          </template>

          <!-- UPDATE STATUS -->
          <template v-else-if="modal === 'status' && selected">
            <div class="modal-body field-grid">
              <p class="modal-note full">
                {{ selected.onboardingNumber }}
                — {{ selected.employeeName }}
              </p>

              <label class="field full">
                <span>New Status *</span>

                <select v-model="statusForm.status">
                  <option
                    v-for="option in statusOptions"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <label class="field full">
                <span>Remarks</span>
                <textarea
                  v-model="statusForm.remarks"
                  rows="3"
                />
              </label>
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

          <!-- COMPLETE -->
          <template v-else-if="modal === 'complete' && selected">
            <div class="modal-body">
              <div class="confirmation-icon">
                <CheckCircle2 :size="24" />
              </div>

              <h3 class="confirm-title">
                Complete this onboarding?
              </h3>

              <p class="confirm-description">
                Mark the onboarding record of
                <strong>{{ selected.employeeName }}</strong>
                as completed.
              </p>

              <p class="modal-note">
                This is a manual HR confirmation.
                It will not change official employee or payroll records.
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
                @click="completeOnboarding"
              >
                <CheckCircle2 :size="15" />
                Confirm Completion
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
                {{ filteredRecords.length }} records match
                the current filters.
                Actual exporting will be implemented later.
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
.onboarding-page {
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

.onboarding-modal-overlay {
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

.onboarding-modal {
  width: 100%;
  max-width: 590px;
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
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 35px;
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

/* FORMS */

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
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 11px;
}

.field input:disabled,
.field select:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.full {
  grid-column: 1 / -1;
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

/* CONFIRMATION */

.confirmation-icon {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border-radius: 12px;
  background: var(--green-soft);
  color: var(--green);
}

.confirm-title {
  margin: 0 0 8px;
  color: var(--text-primary);
  font-size: 15px;
}

.confirm-description {
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
  .details-grid {
    grid-template-columns: 1fr;
  }

  .export-options {
    grid-template-columns: 1fr;
  }
}
</style>
