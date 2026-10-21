
<script setup lang="ts">
import {
  Download,
  UserMinus,
  X,
  ClipboardCheck,
  CheckCircle2,
  CircleX,
  FileSpreadsheet,
  FileText,
  Table2,
  WalletCards,
} from 'lucide-vue-next'

import type {
  OffboardingChecklist,
  OffboardingRecord,
  OffboardingStatus,
  OffboardingType,
  FinalPayStatus,
} from '~/types/offboarding'

import OffboardingStats from '~/components/employee-lifecycle/offboarding/OffboardingStats.vue'
import OffboardingFilters from '~/components/employee-lifecycle/offboarding/OffboardingFilters.vue'
import OffboardingTable from '~/components/employee-lifecycle/offboarding/OffboardingTable.vue'

const {
  records,
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
  createOffboarding,
  updateOffboarding,
  updateOffboardingClearance,
  updateOffboardingFinalPay,
  changeOffboardingStatus,
} = useOffboarding()

const { success, warning } = useToast()

/* =========================================
   MODAL STATE
========================================= */

type ModalType =
  | 'create'
  | 'edit'
  | 'view'
  | 'export'
  | 'clearance'
  | 'start'
  | 'review'
  | 'ready'
  | 'complete'
  | 'cancel'
  | 'final-pay'
  | null

type ActionType =
  | 'start'
  | 'review'
  | 'ready'
  | 'complete'
  | 'cancel'

const modal = ref<ModalType>(null)
const selectedId = ref<number | null>(null)
const errorMessage = ref('')
const exportFormat = ref<'excel' | 'pdf' | 'csv'>('excel')

const selected = computed(() => {
  return records.value.find(
    record => record.id === selectedId.value,
  ) ?? null
})

/* =========================================
   FORM STATE
========================================= */

const form = reactive({
  employeeId: '',
  offboardingType: 'Resignation' as OffboardingType,
  noticeDate: '',
  lastWorkingDay: '',
  separationDate: '',
  initiatedBy: '',
  reason: '',
  remarks: '',
  exitInterviewDate: '',
})

const approval = reactive({
  approvedBy: '',
  remarks: '',
})

const clearance = reactive<OffboardingChecklist>({
  hrClearance: false,
  departmentClearance: false,
  financeClearance: false,
  itClearance: false,
  assetReturn: false,
  exitInterview: false,
})

const checklistFields: {
  key: keyof OffboardingChecklist
  label: string
  description: string
}[] = [
  {
    key: 'hrClearance',
    label: 'HR Clearance',
    description: 'HR requirements and employee documents',
  },
  {
    key: 'departmentClearance',
    label: 'Department Clearance',
    description: 'Department endorsement and turnover',
  },
  {
    key: 'financeClearance',
    label: 'Finance Clearance',
    description: 'Financial obligations and accountabilities',
  },
  {
    key: 'itClearance',
    label: 'IT Clearance',
    description: 'System access and account deactivation',
  },
  {
    key: 'assetReturn',
    label: 'Asset Return',
    description: 'Company assets and equipment returned',
  },
  {
    key: 'exitInterview',
    label: 'Exit Interview',
    description: 'Employee exit interview completed',
  },
]

const checkedCount = computed(() => {
  return checklistFields.filter(
    field => clearance[field.key],
  ).length
})

/* =========================================
   EMPLOYEE OPTIONS
========================================= */

const employeeOptions = computed(() => {
  const unique = new Map<number, OffboardingRecord>()

  records.value.forEach(record => {
    if (!unique.has(record.employeeId)) {
      unique.set(record.employeeId, record)
    }
  })

  return [...unique.values()].sort(
    (a, b) => a.employeeName.localeCompare(b.employeeName),
  )
})

const selectedEmployee = computed(() => {
  return employeeOptions.value.find(
    employee => String(employee.employeeId) === form.employeeId,
  )
})

/* =========================================
   HELPERS
========================================= */

const today = () => {
  const date = new Date()

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

const formatDate = (value?: string) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const isFinal = (record: OffboardingRecord) => {
  return ['Completed', 'Cancelled'].includes(record.status)
}

const nextFinalPay = (
  value: FinalPayStatus,
): FinalPayStatus | null => {
  const steps: FinalPayStatus[] = [
    'Not Started',
    'For Processing',
    'For Review',
    'Ready for Release',
    'Released',
  ]

  const index = steps.indexOf(value)

  return steps[index + 1] ?? null
}

const actionTitle = computed(() => {
  const labels: Record<ActionType, string> = {
    start: 'Start Employee Clearance',
    review: 'Submit for Review',
    ready: 'Mark Ready for Final Pay',
    complete: 'Complete Offboarding',
    cancel: 'Cancel Offboarding',
  }

  const name = modal.value as ActionType

  return labels[name] ?? ''
})

/* =========================================
   RESET / CLOSE
========================================= */

const clearForm = () => {
  Object.assign(form, {
    employeeId: '',
    offboardingType: 'Resignation',
    noticeDate: today(),
    lastWorkingDay: '',
    separationDate: '',
    initiatedBy: '',
    reason: '',
    remarks: '',
    exitInterviewDate: '',
  })

  errorMessage.value = ''
}

const closeModal = () => {
  modal.value = null
  selectedId.value = null
  errorMessage.value = ''
}

/* =========================================
   OPEN MODALS
========================================= */

const openCreate = () => {
  clearForm()
  selectedId.value = null
  modal.value = 'create'
}

const openView = (record: OffboardingRecord) => {
  selectedId.value = record.id
  modal.value = 'view'
}

const openEdit = (record: OffboardingRecord) => {
  if (isFinal(record)) return

  selectedId.value = record.id

  Object.assign(form, {
    employeeId: String(record.employeeId),
    offboardingType: record.offboardingType,
    noticeDate: record.noticeDate,
    lastWorkingDay: record.lastWorkingDay,
    separationDate: record.separationDate,
    initiatedBy: record.initiatedBy,
    reason: record.reason,
    remarks: record.remarks ?? '',
    exitInterviewDate: record.exitInterviewDate ?? '',
  })

  errorMessage.value = ''
  modal.value = 'edit'
}

const openClearance = (record: OffboardingRecord) => {
  selectedId.value = record.id
  Object.assign(clearance, record.checklist)
  errorMessage.value = ''
  modal.value = 'clearance'
}

const openAction = (
  action: ActionType,
  record: OffboardingRecord,
) => {
  selectedId.value = record.id

  approval.approvedBy = record.approvedBy ?? ''
  approval.remarks = ''

  errorMessage.value = ''
  modal.value = action
}

const openFinalPay = (record: OffboardingRecord) => {
  if (record.status !== 'Ready for Final Pay') return

  selectedId.value = record.id
  modal.value = 'final-pay'
}

/* =========================================
   SAVE CREATE / EDIT
========================================= */

const saveOffboarding = () => {
  errorMessage.value = ''

  if (
    !form.employeeId ||
    !form.noticeDate ||
    !form.lastWorkingDay ||
    !form.separationDate ||
    !form.initiatedBy.trim() ||
    !form.reason.trim()
  ) {
    errorMessage.value = 'Please complete all required fields.'
    return
  }

  if (
    form.noticeDate > form.lastWorkingDay ||
    form.lastWorkingDay > form.separationDate
  ) {
    errorMessage.value =
      'Notice Date must be on or before Last Working Day, and Separation Date must not be earlier than Last Working Day.'
    return
  }

  if (modal.value === 'create') {
    const employee = selectedEmployee.value

    if (!employee) {
      errorMessage.value = 'Please select an employee.'
      return
    }

    const created = createOffboarding({
      employeeId: employee.employeeId,
      employeeNumber: employee.employeeNumber,
      employeeName: employee.employeeName,
      department: employee.department,
      position: employee.position,
      offboardingType: form.offboardingType,
      noticeDate: form.noticeDate,
      lastWorkingDay: form.lastWorkingDay,
      separationDate: form.separationDate,
      initiatedBy: form.initiatedBy,
      reason: form.reason,
      remarks: form.remarks,
    })

    if (!created) {
      errorMessage.value = 'Unable to create offboarding record.'
      return
    }

    success(
      'Offboarding Created',
      `${created.offboardingNumber} has been saved as Draft.`,
    )

    closeModal()
    return
  }

  if (modal.value === 'edit' && selected.value) {
    const updated = updateOffboarding(selected.value.id, {
      offboardingType: form.offboardingType,
      noticeDate: form.noticeDate,
      lastWorkingDay: form.lastWorkingDay,
      separationDate: form.separationDate,
      initiatedBy: form.initiatedBy,
      reason: form.reason,
      remarks: form.remarks,
      exitInterviewDate: form.exitInterviewDate || undefined,
    })

    if (!updated) {
      errorMessage.value = 'Unable to update offboarding record.'
      return
    }

    success(
      'Offboarding Updated',
      'Employee separation information has been updated.',
    )

    closeModal()
  }
}

/* =========================================
   SAVE CLEARANCE
========================================= */

const saveClearance = () => {
  if (!selected.value) return

  const updated = updateOffboardingClearance(
    selected.value.id,
    { ...clearance },
  )

  if (!updated) {
    warning(
      'Unable to Save',
      'Clearance cannot be updated in its current status.',
    )
    return
  }

  success(
    'Clearance Updated',
    'Employee clearance requirements have been updated.',
  )

  closeModal()
}

/* =========================================
   STATUS ACTIONS
========================================= */

const confirmAction = () => {
  if (!selected.value) return

  const record = selected.value
  const action = modal.value

  let nextStatus: OffboardingStatus | null = null

  if (action === 'start') {
    nextStatus = 'Pending Clearance'
  }

  if (action === 'review') {
    nextStatus = 'For Review'
  }

  if (action === 'ready') {
    nextStatus = 'Ready for Final Pay'
  }

  if (action === 'complete') {
    nextStatus = 'Completed'
  }

  if (action === 'cancel') {
    nextStatus = 'Cancelled'
  }

  if (!nextStatus) return

  if (
    ['review', 'ready', 'complete'].includes(action ?? '') &&
    record.completedTasks !== record.totalTasks
  ) {
    errorMessage.value =
      'All clearance requirements must be completed first.'
    return
  }

  if (
    action === 'ready' &&
    !approval.approvedBy.trim()
  ) {
    errorMessage.value = 'Approved By is required.'
    return
  }

  if (
    action === 'complete' &&
    record.finalPayStatus !== 'Released'
  ) {
    errorMessage.value =
      'Final pay must be marked Released before completing offboarding.'
    return
  }

  if (
    action === 'cancel' &&
    !approval.remarks.trim()
  ) {
    errorMessage.value = 'Please provide a cancellation reason.'
    return
  }

  const updated = changeOffboardingStatus(
    record.id,
    nextStatus,
    {
      approvedBy: approval.approvedBy,
      remarks: approval.remarks,
    },
  )

  if (!updated) {
    errorMessage.value =
      'This action is not allowed for the current offboarding status.'
    return
  }

  success(
    'Offboarding Updated',
    `${record.offboardingNumber} is now ${nextStatus}.`,
  )

  closeModal()
}

/* =========================================
   FINAL PAY TRACKING
========================================= */

const advanceFinalPay = () => {
  if (!selected.value) return

  const next = nextFinalPay(
    selected.value.finalPayStatus,
  )

  if (!next) return

  const updated = updateOffboardingFinalPay(
    selected.value.id,
    next,
  )

  if (!updated) {
    warning(
      'Update Not Allowed',
      'The final pay status cannot be updated.',
    )
    return
  }

  success(
    'Final Pay Status Updated',
    `Final pay tracking status is now ${next}.`,
  )

  closeModal()
}
</script>

<template>
  <section class="offboarding-page">

    <!-- HEADER -->

    <PageHeader
      title="Employee Offboarding"
      description="Manage employee separation, clearance, asset return, exit interviews and final pay preparation."
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
          :icon="UserMinus"
          @click="openCreate"
        >
          Start Offboarding
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS -->

    <OffboardingStats :stats="stats" />

    <!-- FILTERS -->

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

    <!-- TABLE -->

    <OffboardingTable
      :records="paginatedRecords"
      @view="openView"
      @edit="openEdit"
      @start="openAction('start', $event)"
      @clearance="openClearance"
      @review="openAction('review', $event)"
      @ready="openAction('ready', $event)"
      @complete="openAction('complete', $event)"
      @cancel="openAction('cancel', $event)"
    />

    <!-- PAGINATION -->

    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ filteredRecords.length }}</strong>
        offboarding records
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
        class="offboarding-overlay"
        @click.self="closeModal"
      >
        <div
          class="offboarding-modal"
          role="dialog"
          aria-modal="true"
        >
          <header class="modal-header">
            <div class="modal-heading">
              <div class="modal-icon">
                <UserMinus :size="18" />
              </div>

              <div>
                <h2>
                  {{
                    modal === 'create'
                      ? 'Start Employee Offboarding'
                      : modal === 'edit'
                        ? 'Edit Employee Offboarding'
                        : modal === 'view'
                          ? 'Offboarding Details'
                          : modal === 'clearance'
                            ? 'Manage Employee Clearance'
                            : modal === 'final-pay'
                              ? 'Final Pay Tracking'
                              : modal === 'export'
                                ? 'Export Offboarding Records'
                                : actionTitle
                  }}
                </h2>

                <p>
                  Employee Lifecycle · Offboarding
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
            @submit.prevent="saveOffboarding"
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
                    Select Employee
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

              <div class="detail-box">
                <small>Department</small>
                <strong>
                  {{
                    modal === 'edit'
                      ? selected?.department
                      : selectedEmployee?.department || '—'
                  }}
                </strong>
              </div>

              <div class="detail-box">
                <small>Position</small>
                <strong>
                  {{
                    modal === 'edit'
                      ? selected?.position
                      : selectedEmployee?.position || '—'
                  }}
                </strong>
              </div>

              <div class="section-title full">
                Separation Information
              </div>

              <label class="field full">
                <span>Offboarding Type *</span>

                <select
                  v-model="form.offboardingType"
                  required
                >
                  <option
                    v-for="typeOption in offboardingTypeOptions"
                    :key="typeOption"
                    :value="typeOption"
                  >
                    {{ typeOption }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Notice Date *</span>

                <input
                  v-model="form.noticeDate"
                  type="date"
                  required
                />
              </label>

              <label class="field">
                <span>Last Working Day *</span>

                <input
                  v-model="form.lastWorkingDay"
                  type="date"
                  :min="form.noticeDate || undefined"
                  required
                />
              </label>

              <label class="field">
                <span>Separation Date *</span>

                <input
                  v-model="form.separationDate"
                  type="date"
                  :min="form.lastWorkingDay || undefined"
                  required
                />
              </label>

              <label class="field">
                <span>Initiated By *</span>

                <input
                  v-model="form.initiatedBy"
                  placeholder="Enter HR or authorized staff"
                  required
                />
              </label>

              <label
                v-if="modal === 'edit'"
                class="field full"
              >
                <span>Exit Interview Date</span>

                <input
                  v-model="form.exitInterviewDate"
                  type="date"
                />
              </label>

              <label class="field full">
                <span>Reason for Separation *</span>

                <textarea
                  v-model="form.reason"
                  rows="3"
                  placeholder="Enter the reason for employee separation..."
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

              <p
                v-if="errorMessage"
                class="error-message full"
              >
                {{ errorMessage }}
              </p>

              <div class="modal-note full">
                Newly created offboarding records start as Draft.
                Clearance and final pay can be tracked afterward.
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
                {{
                  modal === 'create'
                    ? 'Create Offboarding'
                    : 'Save Changes'
                }}
              </button>
            </footer>
          </form>

          <!-- VIEW -->

          <template
            v-else-if="modal === 'view' && selected"
          >
            <div class="modal-body">
              <div class="details-grid">
                <div class="detail-box">
                  <small>Offboarding No.</small>
                  <strong>{{ selected.offboardingNumber }}</strong>
                </div>

                <div class="detail-box">
                  <small>Status</small>
                  <strong>{{ selected.status }}</strong>
                </div>

                <div class="detail-box">
                  <small>Employee</small>
                  <strong>{{ selected.employeeName }}</strong>
                </div>

                <div class="detail-box">
                  <small>Employee Number</small>
                  <strong>{{ selected.employeeNumber }}</strong>
                </div>

                <div class="detail-box">
                  <small>Department</small>
                  <strong>{{ selected.department }}</strong>
                </div>

                <div class="detail-box">
                  <small>Position</small>
                  <strong>{{ selected.position }}</strong>
                </div>

                <div class="detail-box">
                  <small>Offboarding Type</small>
                  <strong>{{ selected.offboardingType }}</strong>
                </div>

                <div class="detail-box">
                  <small>Notice Date</small>
                  <strong>{{ formatDate(selected.noticeDate) }}</strong>
                </div>

                <div class="detail-box">
                  <small>Last Working Day</small>
                  <strong>{{ formatDate(selected.lastWorkingDay) }}</strong>
                </div>

                <div class="detail-box">
                  <small>Separation Date</small>
                  <strong>{{ formatDate(selected.separationDate) }}</strong>
                </div>

                <div class="detail-box">
                  <small>Exit Interview</small>
                  <strong>
                    {{ formatDate(selected.exitInterviewDate) }}
                  </strong>
                </div>

                <div class="detail-box">
                  <small>Final Pay</small>
                  <strong>{{ selected.finalPayStatus }}</strong>
                </div>

                <div class="detail-box">
                  <small>Initiated By</small>
                  <strong>{{ selected.initiatedBy }}</strong>
                </div>

                <div class="detail-box">
                  <small>Approved By</small>
                  <strong>{{ selected.approvedBy || 'Pending' }}</strong>
                </div>

                <div class="detail-box full">
                  <small>Reason</small>
                  <strong>{{ selected.reason }}</strong>
                </div>

                <div class="detail-box full">
                  <small>Remarks</small>
                  <strong>{{ selected.remarks || 'No remarks' }}</strong>
                </div>

                <div class="section-title full">
                  Clearance Requirements
                  ({{ selected.completedTasks }}/{{ selected.totalTasks }})
                </div>

                <div
                  v-for="field in checklistFields"
                  :key="field.key"
                  class="checklist-row"
                >
                  <span>{{ field.label }}</span>

                  <strong
                    :class="{
                      checked: selected.checklist[field.key],
                    }"
                  >
                    {{
                      selected.checklist[field.key]
                        ? 'Completed'
                        : 'Pending'
                    }}
                  </strong>
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
                v-if="!isFinal(selected)"
                type="button"
                class="ui-button primary"
                @click="openEdit(selected)"
              >
                Edit Offboarding
              </button>

              <button
                v-if="selected.status === 'Ready for Final Pay'"
                type="button"
                class="ui-button primary"
                @click="openFinalPay(selected)"
              >
                Manage Final Pay
              </button>
            </footer>
          </template>

          <!-- CLEARANCE -->

          <template
            v-else-if="modal === 'clearance' && selected"
          >
            <div class="modal-body">
              <div class="summary-banner">
                <strong>{{ selected.employeeName }}</strong>
                <span>{{ selected.offboardingNumber }}</span>
              </div>

              <div class="clearance-progress">
                <div>
                  <strong>Clearance Completion</strong>
                  <span>{{ checkedCount }} / 6 Completed</span>
                </div>

                <div class="progress-track">
                  <div
                    class="progress-fill"
                    :style="{
                      width: `${(checkedCount / 6) * 100}%`,
                    }"
                  ></div>
                </div>
              </div>

              <div class="clearance-list">
                <label
                  v-for="field in checklistFields"
                  :key="field.key"
                  class="clearance-item"
                >
                  <input
                    v-model="clearance[field.key]"
                    type="checkbox"
                  />

                  <span>
                    <strong>{{ field.label }}</strong>
                    <small>{{ field.description }}</small>
                  </span>

                  <CheckCircle2
                    v-if="clearance[field.key]"
                    :size="17"
                    class="completed-icon"
                  />
                </label>
              </div>

              <div class="modal-note">
                Once all clearance requirements are completed,
                the record becomes For Review.
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
                @click="saveClearance"
              >
                <ClipboardCheck :size="15" />
                Save Clearance
              </button>
            </footer>
          </template>

          <!-- ACTION CONFIRMATION -->

          <template
            v-else-if="
              selected &&
              (
                modal === 'start' ||
                modal === 'review' ||
                modal === 'ready' ||
                modal === 'complete' ||
                modal === 'cancel'
              )
            "
          >
            <div class="modal-body">
              <div
                class="confirmation-icon"
                :class="{ danger: modal === 'cancel' }"
              >
                <CircleX
                  v-if="modal === 'cancel'"
                  :size="26"
                />

                <CheckCircle2 v-else :size="26" />
              </div>

              <h3 class="confirmation-title">
                {{ actionTitle }}?
              </h3>

              <p class="confirmation-text">
                Confirm this action for
                <strong>{{ selected.employeeName }}</strong>
                under {{ selected.offboardingNumber }}.
              </p>

              <div class="details-grid">
                <div class="detail-box">
                  <small>Current Status</small>
                  <strong>{{ selected.status }}</strong>
                </div>

                <div class="detail-box">
                  <small>Final Pay</small>
                  <strong>{{ selected.finalPayStatus }}</strong>
                </div>
              </div>

              <label
                v-if="modal === 'ready'"
                class="field action-field"
              >
                <span>Approved By *</span>

                <input
                  v-model="approval.approvedBy"
                  placeholder="Enter authorized approver"
                />
              </label>

              <label class="field action-field">
                <span>
                  {{
                    modal === 'cancel'
                      ? 'Cancellation Reason *'
                      : 'Remarks'
                  }}
                </span>

                <textarea
                  v-model="approval.remarks"
                  rows="3"
                  placeholder="Enter remarks..."
                />
              </label>

              <p v-if="errorMessage" class="error-message">
                {{ errorMessage }}
              </p>

              <div class="modal-note">
                This action updates offboarding tracking only.
                It does not automatically update employee records
                or process payroll.
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
                class="ui-button"
                :class="modal === 'cancel' ? 'danger' : 'primary'"
                @click="confirmAction"
              >
                Confirm Action
              </button>
            </footer>
          </template>

          <!-- FINAL PAY -->

          <template
            v-else-if="modal === 'final-pay' && selected"
          >
            <div class="modal-body">
              <div class="summary-banner">
                <strong>{{ selected.employeeName }}</strong>
                <span>{{ selected.offboardingNumber }}</span>
              </div>

              <div class="detail-box final-pay-detail">
                <small>Current Final Pay Status</small>
                <strong>{{ selected.finalPayStatus }}</strong>
              </div>

              <div class="detail-box final-pay-detail">
                <small>Next Tracking Status</small>
                <strong>
                  {{ nextFinalPay(selected.finalPayStatus) || 'Completed' }}
                </strong>
              </div>

              <div class="modal-note">
                This records a manual final pay status update
                for the frontend prototype only. It does not
                calculate or release money.
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
                :disabled="!nextFinalPay(selected.finalPayStatus)"
                @click="advanceFinalPay"
              >
                <WalletCards :size="15" />
                Update Status
              </button>
            </footer>
          </template>

          <!-- EXPORT -->

          <template v-else-if="modal === 'export'">
            <div class="modal-body">
              <div class="export-summary">
                <div>
                  <small>Records</small>
                  <strong>{{ stats.total }}</strong>
                </div>

                <div>
                  <small>Active Clearance</small>
                  <strong>{{ stats.active }}</strong>
                </div>

                <div>
                  <small>Ready for Final Pay</small>
                  <strong>{{ stats.finalPay }}</strong>
                </div>

                <div>
                  <small>Completed</small>
                  <strong>{{ stats.completed }}</strong>
                </div>
              </div>

              <h3 class="export-label">Select Export Format</h3>

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

              <div class="modal-note">
                Export functionality is not connected yet.
                The format selection is UI-only.
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
</style>

<style>
/* =========================================
   OFFBOARDING MODALS
========================================= */

.offboarding-overlay {
  position: fixed;
  inset: 0;
  z-index: 10010;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(2, 9, 22, 0.76);
  backdrop-filter: blur(5px);
}

.offboarding-modal {
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

.offboarding-modal form {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.offboarding-modal .modal-header,
.offboarding-modal .modal-footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 17px;
}

.offboarding-modal .modal-header {
  border-bottom: 1px solid var(--border);
}

.offboarding-modal .modal-footer {
  justify-content: flex-end;
  border-top: 1px solid var(--border);
}

.offboarding-modal .modal-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.offboarding-modal .modal-icon {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.offboarding-modal .modal-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.offboarding-modal .modal-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.offboarding-modal .close-button {
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

.offboarding-modal .modal-body {
  min-height: 0;
  padding: 17px;
  overflow-y: auto;
}

.offboarding-modal .form-grid,
.offboarding-modal .details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.offboarding-modal .full {
  grid-column: 1 / -1;
}

.offboarding-modal .section-title {
  margin-top: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
}

.offboarding-modal .field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.offboarding-modal .field span {
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 650;
}

.offboarding-modal .field input,
.offboarding-modal .field select,
.offboarding-modal .field textarea {
  width: 100%;
  min-height: 38px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
  outline: none;
}

.offboarding-modal .field textarea {
  resize: vertical;
}

.offboarding-modal .field input:focus,
.offboarding-modal .field select:focus,
.offboarding-modal .field textarea:focus {
  border-color: var(--primary);
}

.offboarding-modal .field input:disabled,
.offboarding-modal .field select:disabled {
  opacity: 0.6;
}

.offboarding-modal .detail-box {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.offboarding-modal .detail-box small {
  color: var(--text-muted);
  font-size: 9px;
}

.offboarding-modal .detail-box strong {
  color: var(--text-primary);
  font-size: 11px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.offboarding-modal .ui-button {
  display: inline-flex;
  min-height: 35px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 13px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.offboarding-modal .ui-button.primary {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.offboarding-modal .ui-button.danger {
  border-color: var(--red);
  background: var(--red);
  color: white;
}

.offboarding-modal .ui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.offboarding-modal .error-message {
  margin: 0;
  color: var(--red);
  font-size: 11px;
}

.offboarding-modal .modal-note {
  margin-top: 12px;
  padding: 11px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.6;
}

.offboarding-modal .summary-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.offboarding-modal .summary-banner strong {
  color: var(--text-primary);
  font-size: 12px;
}

.offboarding-modal .summary-banner span {
  color: var(--primary);
  font-size: 10px;
}

.offboarding-modal .checklist-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
  color: var(--text-secondary);
  font-size: 10px;
}

.offboarding-modal .checklist-row strong {
  color: var(--orange);
  font-size: 10px;
}

.offboarding-modal .checklist-row strong.checked {
  color: var(--green);
}

.offboarding-modal .clearance-progress {
  margin-bottom: 15px;
}

.offboarding-modal .clearance-progress > div:first-child {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.offboarding-modal .clearance-progress strong {
  color: var(--text-primary);
  font-size: 11px;
}

.offboarding-modal .clearance-progress span {
  color: var(--text-muted);
  font-size: 10px;
}

.offboarding-modal .progress-track {
  height: 7px;
  overflow: hidden;
  border-radius: 20px;
  background: var(--border-soft);
}

.offboarding-modal .progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--green);
  transition: width 0.2s ease;
}

.offboarding-modal .clearance-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.offboarding-modal .clearance-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 58px;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.offboarding-modal .clearance-item:hover {
  background: var(--bg-card-soft);
}

.offboarding-modal .clearance-item input {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  accent-color: var(--primary);
}

.offboarding-modal .clearance-item > span {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
}

.offboarding-modal .clearance-item strong {
  color: var(--text-primary);
  font-size: 11px;
}

.offboarding-modal .clearance-item small {
  color: var(--text-muted);
  font-size: 9px;
}

.offboarding-modal .completed-icon {
  color: var(--green);
}

.offboarding-modal .confirmation-icon {
  display: flex;
  width: 50px;
  height: 50px;
  align-items: center;
  justify-content: center;
  margin-bottom: 13px;
  border-radius: 12px;
  background: var(--green-soft);
  color: var(--green);
}

.offboarding-modal .confirmation-icon.danger {
  background: var(--red-soft);
  color: var(--red);
}

.offboarding-modal .confirmation-title {
  margin: 0 0 8px;
  color: var(--text-primary);
  font-size: 15px;
}

.offboarding-modal .confirmation-text {
  margin: 0 0 15px;
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.6;
}

.offboarding-modal .confirmation-text strong {
  color: var(--text-primary);
}

.offboarding-modal .action-field {
  margin-top: 13px;
}

.offboarding-modal .final-pay-detail {
  margin-bottom: 10px;
}

/* =========================================
   EXPORT
========================================= */

.offboarding-modal .export-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.offboarding-modal .export-summary > div {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.offboarding-modal .export-summary small {
  color: var(--text-muted);
  font-size: 9px;
}

.offboarding-modal .export-summary strong {
  color: var(--text-primary);
  font-size: 15px;
}

.offboarding-modal .export-label {
  margin: 18px 0 10px;
  color: var(--text-primary);
  font-size: 11px;
}

.offboarding-modal .export-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
}

.offboarding-modal .export-options button {
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

.offboarding-modal .export-options button.active {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}

.offboarding-modal .export-options strong {
  font-size: 11px;
}

.offboarding-modal .export-options small {
  color: var(--text-muted);
  font-size: 9px;
}

@media (max-width: 650px) {
  .offboarding-modal .form-grid,
  .offboarding-modal .details-grid,
  .offboarding-modal .export-summary,
  .offboarding-modal .export-options {
    grid-template-columns: 1fr;
  }

  .offboarding-modal .full {
    grid-column: auto;
  }

  .offboarding-page .header-actions,
  .offboarding-page .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
