
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  Download, Plus, X, UserRound, CalendarDays,
  ClipboardCheck, Clock3, FileSpreadsheet,
  CheckCircle2, Circle, Mail, History,
  ShieldCheck, Search, Eye, ChevronRight,
  BriefcaseBusiness, FileText, AlertCircle,
} from 'lucide-vue-next'

import type { OnboardingEmployee } from '~/types/onboarding'

import OnboardingStats from '~/components/admin/employee-lifecycle/onboarding/OnboardingStats.vue'
import OnboardingFilters from '~/components/admin/employee-lifecycle/onboarding/OnboardingFilters.vue'
import OnboardingTable from '~/components/admin/employee-lifecycle/onboarding/OnboardingTable.vue'

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
} = useOnboarding()

type ModalMode = 'view' | 'progress' | 'history' | 'export' | 'create' | null
type ExportScope = 'filtered' | 'current'

const activeModal = ref<ModalMode>(null)
const selectedRecord = ref<OnboardingEmployee | null>(null)
const exportScope = ref<ExportScope>('filtered')
const formValidated = ref(false)
const formError = ref('')

const newOnboarding = reactive({
  employeeNumber: '',
  employeeName: '',
  email: '',
  department: '',
  position: '',
  employmentType: 'Probationary',
  dateHired: '',
  targetCompletionDate: '',
  assignedHr: '',
  remarks: '',
})

const resetCreateForm = () => {
  Object.assign(newOnboarding, {
    employeeNumber: '',
    employeeName: '',
    email: '',
    department: '',
    position: '',
    employmentType: 'Probationary',
    dateHired: '',
    targetCompletionDate: '',
    assignedHr: '',
    remarks: '',
  })
  formValidated.value = false
  formError.value = ''
}

const closeModal = () => {
  activeModal.value = null
  selectedRecord.value = null
  formError.value = ''
}

const openViewDetails = (record: OnboardingEmployee) => {
  selectedRecord.value = record
  activeModal.value = 'view'
}

const openProgressDetails = (record: OnboardingEmployee) => {
  selectedRecord.value = record
  activeModal.value = 'progress'
}

const openHistoryDetails = (record: OnboardingEmployee) => {
  selectedRecord.value = record
  activeModal.value = 'history'
}

const handleExport = () => {
  exportScope.value = 'filtered'
  activeModal.value = 'export'
}

const handleNewOnboarding = () => {
  resetCreateForm()
  activeModal.value = 'create'
}

const modalTitle = computed(() => {
  switch (activeModal.value) {
    case 'view': return 'Onboarding Details'
    case 'progress': return 'Onboarding Progress'
    case 'history': return 'Onboarding History'
    case 'export': return 'Export Onboarding'
    case 'create': return 'Start Employee Onboarding'
    default: return ''
  }
})

const formatDate = (value?: string | null) => {
  if (!value) return 'Not available'

  const date = new Date(
    value.includes('T') ? value : `${value}T00:00:00`
  )

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Not available'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const checklist = computed(() => {
  const record = selectedRecord.value
  if (!record) return []

  return [
    {
      key: 'documents',
      label: 'Required Documents',
      description: 'Submission of required employment documents.',
      done: record.checklist.documents,
    },
    {
      key: 'employeeProfile',
      label: 'Employee Profile',
      description: 'Complete personal and employment information.',
      done: record.checklist.employeeProfile,
    },
    {
      key: 'companyAccount',
      label: 'Company Account',
      description: 'Setup of employee system credentials.',
      done: record.checklist.companyAccount,
    },
    {
      key: 'orientation',
      label: 'Employee Orientation',
      description: 'Complete company orientation and introduction.',
      done: record.checklist.orientation,
    },
    {
      key: 'policyAcknowledgment',
      label: 'Policy Acknowledgment',
      description: 'Review and acknowledge company policies.',
      done: record.checklist.policyAcknowledgment,
    },
    {
      key: 'departmentEndorsement',
      label: 'Department Endorsement',
      description: 'Confirmation of department assignment.',
      done: record.checklist.departmentEndorsement,
    },
  ]
})

const completedChecklist = computed(() =>
  checklist.value.filter(item => item.done).length
)

const progressPercentage = computed(() =>
  selectedRecord.value
    ? Math.max(0, Math.min(100, selectedRecord.value.progress))
    : 0
)

const exportRecords = computed<OnboardingEmployee[]>(() =>
  exportScope.value === 'current'
    ? paginatedRecords.value
    : filteredRecords.value
)

const csvCell = (value: unknown) => {
  const raw = String(value ?? '')
  const safe = /^[\s]*[=+\-@\t\r]/.test(raw)
    ? `'${raw}`
    : raw

  return `"${safe.replace(/"/g, '""')}"`
}

const downloadCsv = () => {
  if (!import.meta.client || exportRecords.value.length === 0) return

  const headers = [
    'Onboarding Number',
    'Employee Number',
    'Employee Name',
    'Email',
    'Department',
    'Position',
    'Employment Type',
    'Date Hired',
    'Target Completion Date',
    'Assigned HR',
    'Documents Completed',
    'Profile Completed',
    'Account Completed',
    'Orientation Completed',
    'Policy Acknowledgment',
    'Department Endorsement',
    'Completed Tasks',
    'Total Tasks',
    'Progress (%)',
    'Status',
    'Remarks',
  ]

  const rows = exportRecords.value.map(item => [
    item.onboardingNumber,
    item.employeeNumber,
    item.employeeName,
    item.email,
    item.department,
    item.position,
    item.employmentType,
    item.dateHired,
    item.targetCompletionDate,
    item.assignedHr,
    item.checklist.documents ? 'Yes' : 'No',
    item.checklist.employeeProfile ? 'Yes' : 'No',
    item.checklist.companyAccount ? 'Yes' : 'No',
    item.checklist.orientation ? 'Yes' : 'No',
    item.checklist.policyAcknowledgment ? 'Yes' : 'No',
    item.checklist.departmentEndorsement ? 'Yes' : 'No',
    item.completedTasks,
    item.totalTasks,
    item.progress,
    item.status,
    item.remarks ?? '',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(csvCell).join(','))
    .join('\r\n')

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download =
    `employee-onboarding-${new Date().toISOString().slice(0, 10)}.csv`

  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  closeModal()
}

const validateOnboarding = () => {
  formError.value = ''
  formValidated.value = false

  if (
    !newOnboarding.employeeName.trim() ||
    !newOnboarding.employeeNumber.trim() ||
    !newOnboarding.email.trim() ||
    !newOnboarding.department.trim() ||
    !newOnboarding.position.trim() ||
    !newOnboarding.dateHired ||
    !newOnboarding.targetCompletionDate ||
    !newOnboarding.assignedHr.trim()
  ) {
    formError.value = 'Please complete all required fields.'
    return
  }

  if (newOnboarding.targetCompletionDate < newOnboarding.dateHired) {
    formError.value =
      'Target completion date cannot be earlier than the date hired.'
    return
  }

  formValidated.value = true
}

const handleModalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeModal()
}
</script>

<template>
  <section class="onboarding-page">

    <!-- HEADER -->
    <PageHeader
      title="Employee Onboarding"
      description="Track new employee onboarding requirements, document completion, account setup, orientation and department endorsement."
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
          @click="handleNewOnboarding"
        >
          Start Onboarding
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATISTICS -->
    <OnboardingStats :stats="stats" />

    <!-- FILTERS -->
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

    <!-- TABLE -->
    <OnboardingTable
      :records="paginatedRecords"
      @view="openViewDetails"
      @details="openProgressDetails"
      @history="openHistoryDetails"
    />

    <!-- PAGINATION -->
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
        v-if="activeModal"
        class="onboard-overlay"
        @click.self="closeModal"
        @keydown="handleModalKeydown"
      >
        <section
          class="onboard-dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="modalTitle"
          tabindex="-1"
        >

          <!-- MODAL HEADER -->
          <header class="dialog-header">
            <div class="dialog-header-left">
              <span class="header-icon">
                <FileSpreadsheet
                  v-if="activeModal === 'export'"
                  :size="20"
                />
                <Plus
                  v-else-if="activeModal === 'create'"
                  :size="20"
                />
                <History
                  v-else-if="activeModal === 'history'"
                  :size="20"
                />
                <ClipboardCheck
                  v-else-if="activeModal === 'progress'"
                  :size="20"
                />
                <UserRound v-else :size="20" />
              </span>

              <div>
                <h2>{{ modalTitle }}</h2>
                <p v-if="selectedRecord">
                  {{ selectedRecord.onboardingNumber }}
                </p>
                <p v-else-if="activeModal === 'export'">
                  Download onboarding records
                </p>
                <p v-else>
                  Enter new onboarding information
                </p>
              </div>
            </div>

            <button
              type="button"
              class="close-icon"
              aria-label="Close modal"
              @click="closeModal"
            >
              <X :size="19" />
            </button>
          </header>

          <!-- VIEW DETAILS -->
          <div
            v-if="activeModal === 'view' && selectedRecord"
            class="dialog-body"
          >
            <div class="employee-summary">
              <span class="employee-avatar">
                <UserRound :size="25" />
              </span>

              <div class="employee-summary-info">
                <h3>{{ selectedRecord.employeeName }}</h3>
                <p>
                  {{ selectedRecord.employeeNumber }} ·
                  {{ selectedRecord.position }}
                </p>
                <span class="status-chip">
                  {{ selectedRecord.status }}
                </span>
              </div>
            </div>

            <div class="detail-section">
              <h4>
                <UserRound :size="16" />
                Employee Information
              </h4>

              <div class="info-grid">
                <div class="info-item">
                  <label>Employee Number</label>
                  <strong>{{ selectedRecord.employeeNumber }}</strong>
                </div>
                <div class="info-item">
                  <label>Employment Type</label>
                  <strong>{{ selectedRecord.employmentType }}</strong>
                </div>
                <div class="info-item">
                  <label>Department</label>
                  <strong>{{ selectedRecord.department }}</strong>
                </div>
                <div class="info-item">
                  <label>Position</label>
                  <strong>{{ selectedRecord.position }}</strong>
                </div>
                <div class="info-item wide">
                  <label>Email Address</label>
                  <strong>
                    <Mail :size="14" />
                    {{ selectedRecord.email }}
                  </strong>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>
                <CalendarDays :size="16" />
                Onboarding Schedule
              </h4>

              <div class="info-grid">
                <div class="info-item">
                  <label>Date Hired</label>
                  <strong>
                    {{ formatDate(selectedRecord.dateHired) }}
                  </strong>
                </div>
                <div class="info-item">
                  <label>Target Completion</label>
                  <strong>
                    {{ formatDate(selectedRecord.targetCompletionDate) }}
                  </strong>
                </div>
                <div class="info-item">
                  <label>Assigned HR</label>
                  <strong>{{ selectedRecord.assignedHr }}</strong>
                </div>
                <div class="info-item">
                  <label>Progress</label>
                  <strong>{{ selectedRecord.progress }}%</strong>
                </div>
              </div>
            </div>

            <div class="remarks-box">
              <FileText :size="17" />
              <div>
                <label>Remarks</label>
                <p>
                  {{ selectedRecord.remarks || 'No remarks available.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- PROGRESS -->
          <div
            v-else-if="activeModal === 'progress' && selectedRecord"
            class="dialog-body"
          >
            <div class="progress-summary">
              <div>
                <span class="muted-label">Employee Onboarding</span>
                <h3>{{ selectedRecord.employeeName }}</h3>
                <p>
                  {{ completedChecklist }} of
                  {{ checklist.length }} tasks completed
                </p>
              </div>

              <strong class="progress-number">
                {{ selectedRecord.progress }}%
              </strong>
            </div>

            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: `${progressPercentage}%` }"
              />
            </div>

            <div class="detail-section">
              <h4>
                <ClipboardCheck :size="16" />
                Onboarding Checklist
              </h4>

              <div class="checklist-list">
                <div
                  v-for="task in checklist"
                  :key="task.key"
                  class="checklist-row"
                >
                  <span
                    class="checklist-icon"
                    :class="{ done: task.done }"
                  >
                    <CheckCircle2 v-if="task.done" :size="19" />
                    <Circle v-else :size="19" />
                  </span>

                  <div class="checklist-content">
                    <strong>{{ task.label }}</strong>
                    <p>{{ task.description }}</p>
                  </div>

                  <span
                    class="checklist-state"
                    :class="{ done: task.done }"
                  >
                    {{ task.done ? 'Completed' : 'Pending' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="notice-card">
              <ShieldCheck :size="17" />
              <p>
                Checklist information is read-only in this view.
                Changes must be saved through the authorized
                onboarding workflow.
              </p>
            </div>
          </div>

          <!-- HISTORY -->
          <div
            v-else-if="activeModal === 'history' && selectedRecord"
            class="dialog-body"
          >
            <div class="employee-summary">
              <span class="employee-avatar">
                <History :size="24" />
              </span>

              <div class="employee-summary-info">
                <h3>{{ selectedRecord.employeeName }}</h3>
                <p>{{ selectedRecord.onboardingNumber }}</p>
              </div>
            </div>

            <div class="detail-section">
              <h4>
                <Clock3 :size="16" />
                Record Timeline
              </h4>

              <div class="history-timeline">
                <div class="history-item">
                  <span class="timeline-dot" />
                  <div>
                    <strong>Onboarding Record Created</strong>
                    <p>
                      {{ formatDateTime(selectedRecord.createdAt) }}
                    </p>
                  </div>
                </div>

                <div class="history-item">
                  <span class="timeline-dot" />
                  <div>
                    <strong>Last Record Update</strong>
                    <p>
                      {{ formatDateTime(selectedRecord.updatedAt) }}
                    </p>
                  </div>
                </div>

                <div class="history-item">
                  <span class="timeline-dot" />
                  <div>
                    <strong>Current Onboarding Status</strong>
                    <p>
                      {{ selectedRecord.status }} ·
                      {{ selectedRecord.progress }}% completed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="notice-card">
              <History :size="17" />
              <p>
                These are available record timestamps and current status,
                not a complete audit trail. Full activity history will
                require backend event logs.
              </p>
            </div>
          </div>

          <!-- EXPORT -->
          <div
            v-else-if="activeModal === 'export'"
            class="dialog-body"
          >
            <div class="export-banner">
              <span class="export-icon">
                <FileSpreadsheet :size="26" />
              </span>

              <div>
                <strong>Employee Onboarding Report</strong>
                <p>
                  Download onboarding records as a CSV file
                  compatible with Microsoft Excel.
                </p>
              </div>
            </div>

            <div class="form-field">
              <label>Records to Export</label>

              <select v-model="exportScope">
                <option value="filtered">
                  All Filtered Records
                </option>
                <option value="current">
                  Current Page Only
                </option>
              </select>
            </div>

            <div class="export-info">
              <div>
                <span>Total Selected Records</span>
                <p>Based on your selected export scope</p>
              </div>
              <strong>{{ exportRecords.length }}</strong>
            </div>

            <div class="notice-card">
              <FileText :size="17" />
              <p>
                Export includes employee information, hiring dates,
                assigned HR, checklist progress, status and remarks.
              </p>
            </div>
          </div>

          <!-- START ONBOARDING -->
          <form
            v-else-if="activeModal === 'create'"
            id="new-onboarding-form"
            class="dialog-body"
            @submit.prevent="validateOnboarding"
          >
            <div class="detail-section first-section">
              <h4>
                <UserRound :size="16" />
                Employee Information
              </h4>

              <div class="form-grid">
                <div class="form-field">
                  <label>Employee Number *</label>
                  <input
                    v-model="newOnboarding.employeeNumber"
                    required
                    placeholder="e.g. EMP-001"
                  />
                </div>

                <div class="form-field">
                  <label>Employee Name *</label>
                  <input
                    v-model="newOnboarding.employeeName"
                    required
                    placeholder="Full employee name"
                  />
                </div>

                <div class="form-field wide">
                  <label>Email Address *</label>
                  <input
                    v-model="newOnboarding.email"
                    type="email"
                    required
                    placeholder="employee@company.com"
                  />
                </div>

                <div class="form-field">
                  <label>Department *</label>
                  <input
                    v-model="newOnboarding.department"
                    required
                    placeholder="Department"
                  />
                </div>

                <div class="form-field">
                  <label>Position *</label>
                  <input
                    v-model="newOnboarding.position"
                    required
                    placeholder="Job position"
                  />
                </div>

                <div class="form-field wide">
                  <label>Employment Type *</label>
                  <select v-model="newOnboarding.employmentType">
                    <option value="Probationary">Probationary</option>
                    <option value="Regular">Regular</option>
                    <option value="Contractual">Contractual</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>
                <CalendarDays :size="16" />
                Onboarding Schedule
              </h4>

              <div class="form-grid">
                <div class="form-field">
                  <label>Date Hired *</label>
                  <input
                    v-model="newOnboarding.dateHired"
                    type="date"
                    required
                  />
                </div>

                <div class="form-field">
                  <label>Target Completion *</label>
                  <input
                    v-model="newOnboarding.targetCompletionDate"
                    type="date"
                    :min="newOnboarding.dateHired || undefined"
                    required
                  />
                </div>

                <div class="form-field wide">
                  <label>Assigned HR *</label>
                  <input
                    v-model="newOnboarding.assignedHr"
                    required
                    placeholder="Assigned HR personnel"
                  />
                </div>

                <div class="form-field wide">
                  <label>Initial Remarks</label>
                  <textarea
                    v-model="newOnboarding.remarks"
                    rows="3"
                    placeholder="Additional onboarding notes..."
                  />
                </div>
              </div>
            </div>

            <div class="notice-card">
              <AlertCircle :size="17" />
              <p>
                This form is currently a frontend preview.
                No database record will be created until
                the Laravel create endpoint is connected.
              </p>
            </div>

            <p v-if="formError" class="form-error">
              {{ formError }}
            </p>

            <div v-if="formValidated" class="form-success">
              <CheckCircle2 :size="17" />
              Form validation passed. Database saving is not connected yet.
            </div>
          </form>

          <!-- FOOTER -->
          <footer class="dialog-footer">
            <button
              type="button"
              class="secondary-button"
              @click="closeModal"
            >
              {{ activeModal === 'export' || activeModal === 'create'
                ? 'Cancel'
                : 'Close'
              }}
            </button>

            <button
              v-if="activeModal === 'view'"
              type="button"
              class="primary-button"
              @click="activeModal = 'progress'"
            >
              <ClipboardCheck :size="16" />
              View Progress
            </button>

            <button
              v-if="activeModal === 'export'"
              type="button"
              class="primary-button"
              :disabled="exportRecords.length === 0"
              @click="downloadCsv"
            >
              <Download :size="16" />
              Download CSV
            </button>

            <button
              v-if="activeModal === 'create'"
              type="submit"
              form="new-onboarding-form"
              class="primary-button"
            >
              <CheckCircle2 :size="16" />
              Validate Form
            </button>
          </footer>
        </section>
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

/* OVERLAY */
.onboard-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(3, 9, 23, .78);
  backdrop-filter: blur(5px);
}

.onboard-dialog {
  display: flex;
  width: 100%;
  max-width: 660px;
  max-height: 90vh;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 24px 70px rgba(0, 0, 0, .3);
}

/* HEADER */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 17px 20px;
  border-bottom: 1px solid var(--border);
}

.dialog-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon,
.employee-avatar,
.export-icon {
  display: flex;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
}

.dialog-header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 750;
}

.dialog-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.close-icon {
  display: grid;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.close-icon:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

/* BODY */
.dialog-body {
  overflow-y: auto;
  padding: 20px;
}

.employee-summary {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
}

.employee-summary-info {
  min-width: 0;
}

.employee-summary h3 {
  margin: 0;
  font-size: 14px;
}

.employee-summary p {
  margin: 5px 0 8px;
  color: var(--text-muted);
  font-size: 11px;
}

.status-chip {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 20px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
  font-weight: 700;
}

.detail-section {
  margin-top: 22px;
}

.detail-section.first-section {
  margin-top: 0;
}

.detail-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 15px;
  padding-bottom: 11px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
}

.detail-section h4 svg {
  color: var(--primary);
}

.info-grid,
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.info-item,
.form-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
}

.info-item.wide,
.form-field.wide {
  grid-column: 1 / -1;
}

.info-item label,
.form-field label,
.remarks-box label,
.muted-label {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 600;
}

.info-item strong {
  display: flex;
  align-items: center;
  gap: 7px;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 650;
}

/* REMARKS */
.remarks-box {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-top: 21px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.remarks-box > svg {
  flex-shrink: 0;
  color: var(--primary);
}

.remarks-box p {
  margin: 7px 0 0;
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.65;
}

/* PROGRESS */
.progress-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
}

.progress-summary h3 {
  margin: 6px 0;
  font-size: 14px;
}

.progress-summary p {
  margin: 0;
  color: var(--text-muted);
  font-size: 11px;
}

.progress-number {
  color: var(--primary);
  font-size: 27px;
}

.progress-track {
  height: 9px;
  overflow: hidden;
  margin-top: 15px;
  border-radius: 20px;
  background: var(--border-soft);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--primary);
  transition: width .2s ease;
}

.checklist-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checklist-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.checklist-icon {
  flex-shrink: 0;
  color: var(--text-muted);
}

.checklist-icon.done {
  color: var(--green);
}

.checklist-content {
  min-width: 0;
  flex: 1;
}

.checklist-content strong {
  color: var(--text-primary);
  font-size: 11px;
}

.checklist-content p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.checklist-state {
  color: var(--orange);
  font-size: 10px;
  font-weight: 700;
}

.checklist-state.done {
  color: var(--green);
}

/* HISTORY */
.history-timeline {
  padding: 5px 0 0 7px;
}

.history-item {
  display: flex;
  gap: 15px;
  min-height: 65px;
  padding: 0 0 20px;
  border-left: 1px solid var(--border);
}

.timeline-dot {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  margin-left: -7px;
  border: 3px solid var(--primary-soft);
  border-radius: 50%;
  background: var(--primary);
}

.history-item strong {
  color: var(--text-primary);
  font-size: 11px;
}

.history-item p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

/* EXPORT */
.export-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
}

.export-banner strong {
  font-size: 12px;
}

.export-banner p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.6;
}

.export-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.export-info span {
  color: var(--text-secondary);
  font-size: 11px;
}

.export-info p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.export-info strong {
  color: var(--primary);
  font-size: 23px;
}

/* FORM */
.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  min-height: 41px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
}

.form-field textarea {
  resize: vertical;
  line-height: 1.6;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: var(--primary);
}

.notice-card {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-top: 19px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--primary-soft);
}

.notice-card svg {
  flex-shrink: 0;
  color: var(--primary);
}

.notice-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.7;
}

.form-error {
  margin-top: 12px;
  color: var(--red);
  font-size: 11px;
}

.form-success {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--green-soft);
  color: var(--green);
  font-size: 11px;
}

/* FOOTER */
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  padding: 15px 20px;
  border-top: 1px solid var(--border);
}

.secondary-button,
.primary-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
}

.primary-button {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}

.primary-button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

/* RESPONSIVE */
@media (max-width: 650px) {
  .header-actions {
    width: 100%;
    align-items: stretch;
    flex-direction: column;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .dialog-header,
  .dialog-body,
  .dialog-footer {
    padding: 15px;
  }

  .dialog-header h2 {
    font-size: 14px;
  }
}
</style>
