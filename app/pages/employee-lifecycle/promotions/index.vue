
<script setup lang="ts">
import {
  Download,
  TrendingUp,
  X,
  FileSpreadsheet,
  FileText,
  Table2,
  CheckCircle2,
  CircleX,
} from 'lucide-vue-next'

import type {
  PromotionRecord,
  PromotionStatus,
  PromotionType,
} from '~/types/promotion'

import PromotionStats from '~/components/employee-lifecycle/promotions/PromotionStats.vue'
import PromotionFilters from '~/components/employee-lifecycle/promotions/PromotionFilters.vue'
import PromotionTable from '~/components/employee-lifecycle/promotions/PromotionTable.vue'

const {
  records,
  search,
  department,
  promotionType,
  status,
  currentPage,
  filteredRecords,
  paginatedRecords,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  departmentOptions,
  promotionTypeOptions,
  statusOptions,
  resetFilters,
  createPromotion,
  updatePromotion,
  changePromotionStatus,
} = usePromotions()

const { success, warning } = useToast()

type Modal =
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

const modal = ref<Modal>(null)
const selected = ref<PromotionRecord | null>(null)
const errorMessage = ref('')
const exportFormat = ref<'excel' | 'pdf' | 'csv'>('excel')

const form = reactive({
  employeeId: '',
  promotionType: 'Position Promotion' as PromotionType,
  department: '',
  currentPosition: '',
  newPosition: '',
  currentGrade: '',
  newGrade: '',
  currentSalary: 0,
  newSalary: 0,
  recommendedBy: '',
  approvedBy: '',
  recommendationDate: '',
  effectiveDate: '',
  reason: '',
  remarks: '',
})

const decision = reactive({
  approvedBy: '',
  remarks: '',
})

const employeeOptions = computed(() => {
  const unique = new Map<number, PromotionRecord>()

  records.value.forEach(item => {
    if (!unique.has(item.employeeId)) {
      unique.set(item.employeeId, item)
    }
  })

  return [...unique.values()].sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName),
  )
})

const selectedEmployee = computed(() => {
  return employeeOptions.value.find(
    item => String(item.employeeId) === form.employeeId,
  )
})

const salaryIncrease = computed(() =>
  Number(form.newSalary) - Number(form.currentSalary),
)

const increasePercentage = computed(() => {
  if (Number(form.currentSalary) <= 0) return 0

  return (salaryIncrease.value / Number(form.currentSalary)) * 100
})

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  }).format(value)

const formatDate = (value?: string) => {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const localDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/* =========================================
   FORM AND MODAL HELPERS
========================================= */

const clearForm = () => {
  Object.assign(form, {
    employeeId: '',
    promotionType: 'Position Promotion',
    department: '',
    currentPosition: '',
    newPosition: '',
    currentGrade: '',
    newGrade: '',
    currentSalary: 0,
    newSalary: 0,
    recommendedBy: '',
    approvedBy: '',
    recommendationDate: localDate(),
    effectiveDate: '',
    reason: '',
    remarks: '',
  })

  errorMessage.value = ''
}

const fillForm = (record: PromotionRecord) => {
  Object.assign(form, {
    employeeId: String(record.employeeId),
    promotionType: record.promotionType,
    department: record.department,
    currentPosition: record.currentPosition,
    newPosition: record.newPosition,
    currentGrade: record.currentGrade,
    newGrade: record.newGrade,
    currentSalary: record.currentSalary,
    newSalary: record.newSalary,
    recommendedBy: record.recommendedBy,
    approvedBy: record.approvedBy ?? '',
    recommendationDate: record.recommendationDate,
    effectiveDate: record.effectiveDate,
    reason: record.reason,
    remarks: record.remarks ?? '',
  })
}

const closeModal = () => {
  modal.value = null
  selected.value = null
  errorMessage.value = ''
}

const openCreate = () => {
  selected.value = null
  clearForm()
  modal.value = 'create'
}

const openView = (record: PromotionRecord) => {
  selected.value = record
  errorMessage.value = ''
  modal.value = 'view'
}

const openEdit = (record: PromotionRecord) => {
  selected.value = record
  fillForm(record)
  errorMessage.value = ''
  modal.value = 'edit'
}

const openAction = (
  action: Exclude<Modal, 'create' | 'edit' | 'view' | 'export' | null>,
  record: PromotionRecord,
) => {
  selected.value = record
  decision.approvedBy = record.approvedBy ?? ''
  decision.remarks = ''
  errorMessage.value = ''
  modal.value = action
}

watch(
  () => form.employeeId,
  value => {
    if (modal.value !== 'create' || !value) return

    const employee = selectedEmployee.value
    if (!employee) return

    form.department = employee.department
    form.currentPosition = employee.currentPosition
    form.newPosition = employee.currentPosition
    form.currentGrade = employee.currentGrade
    form.newGrade = employee.currentGrade
    form.currentSalary = employee.currentSalary
    form.newSalary = employee.currentSalary
  },
)

/* =========================================
   CREATE / EDIT
========================================= */

const savePromotion = () => {
  errorMessage.value = ''

  if (
    !form.employeeId ||
    !form.department.trim() ||
    !form.newPosition.trim() ||
    !form.newGrade.trim() ||
    !form.recommendedBy.trim() ||
    !form.recommendationDate ||
    !form.effectiveDate ||
    !form.reason.trim()
  ) {
    errorMessage.value = 'Please complete all required fields.'
    return
  }

  if (form.effectiveDate < form.recommendationDate) {
    errorMessage.value =
      'Effective date cannot be earlier than recommendation date.'
    return
  }

  if (
    !Number.isFinite(Number(form.newSalary)) ||
    Number(form.currentSalary) < 0 ||
    Number(form.newSalary) < Number(form.currentSalary)
  ) {
    errorMessage.value = 'New salary must be equal to or higher than current salary.'
    return
  }

  if (modal.value === 'create') {
    const employee = selectedEmployee.value

    if (!employee) {
      errorMessage.value = 'Please select an employee.'
      return
    }

    const created = createPromotion({
      employeeId: employee.employeeId,
      employeeNumber: employee.employeeNumber,
      employeeName: employee.employeeName,
      department: form.department,
      currentPosition: form.currentPosition,
      newPosition: form.newPosition,
      currentGrade: form.currentGrade,
      newGrade: form.newGrade,
      currentSalary: Number(form.currentSalary),
      newSalary: Number(form.newSalary),
      promotionType: form.promotionType,
      recommendedBy: form.recommendedBy,
      recommendationDate: form.recommendationDate,
      effectiveDate: form.effectiveDate,
      reason: form.reason,
      remarks: form.remarks,
    })

    if (!created) {
      errorMessage.value = 'Unable to create this promotion.'
      return
    }

    success('Promotion Created', `${created.promotionNumber} saved as Draft.`)
  }

  if (modal.value === 'edit' && selected.value) {
    const updated = updatePromotion(selected.value.id, {
      department: form.department,
      newPosition: form.newPosition,
      newGrade: form.newGrade,
      newSalary: Number(form.newSalary),
      promotionType: form.promotionType,
      recommendedBy: form.recommendedBy,
      recommendationDate: form.recommendationDate,
      effectiveDate: form.effectiveDate,
      reason: form.reason,
      remarks: form.remarks,
    })

    if (!updated) {
      errorMessage.value = 'Unable to update this promotion.'
      return
    }

    success('Promotion Updated', 'Promotion details have been updated.')
  }

  closeModal()
}

/* =========================================
   PROMOTION STATUS ACTIONS
========================================= */

const confirmAction = () => {
  if (!selected.value || !modal.value) return

  const action = modal.value

  const statusMap: Partial<Record<NonNullable<Modal>, PromotionStatus>> = {
    submit: selected.value.status === 'Draft'
      ? 'For Review'
      : 'Pending Approval',
    approve: 'Approved',
    schedule: 'Scheduled',
    effective: 'Effective',
    reject: 'Rejected',
    cancel: 'Cancelled',
  }

  const nextStatus = statusMap[action]
  if (!nextStatus) return

  if (action === 'approve' && !decision.approvedBy.trim()) {
    errorMessage.value = 'Authorized approver is required.'
    return
  }

  if (
    ['reject', 'cancel'].includes(action) &&
    !decision.remarks.trim()
  ) {
    errorMessage.value = 'A reason is required.'
    return
  }

  const updated = changePromotionStatus(
    selected.value.id,
    nextStatus,
    decision.remarks,
    decision.approvedBy,
  )

  if (!updated) {
    warning('Action Not Allowed', 'This status transition is not permitted.')
    return
  }

  success(
    'Promotion Updated',
    `${selected.value.promotionNumber} is now ${nextStatus}.`,
  )

  closeModal()
}

const actionTitle = computed(() => {
  const titles: Record<string, string> = {
    submit: 'Submit Promotion',
    approve: 'Approve Promotion',
    schedule: 'Schedule Promotion',
    effective: 'Mark Promotion as Effective',
    reject: 'Reject Promotion',
    cancel: 'Cancel Promotion',
  }

  return titles[modal.value ?? ''] ?? ''
})
</script>

<template>
  <section class="promotions-page">
    <PageHeader
      title="Employee Promotions"
      description="Manage employee position, grade and salary advancement with recommendation, approval and effective-date tracking."
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
          :icon="TrendingUp"
          @click="openCreate"
        >
          New Promotion
        </AppButton>
      </div>
    </PageHeader>

    <PromotionStats :stats="stats" />

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

    <PromotionTable
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
        promotion records
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
        class="promotion-overlay"
        @click.self="closeModal"
      >
        <div
          class="promotion-modal"
          role="dialog"
          aria-modal="true"
        >
          <header class="modal-header">
            <div class="modal-title">
              <div class="modal-icon">
                <TrendingUp :size="18" />
              </div>

              <div>
                <h2>
                  {{
                    modal === 'create'
                      ? 'New Employee Promotion'
                      : modal === 'edit'
                        ? 'Edit Employee Promotion'
                        : modal === 'view'
                          ? 'Promotion Details'
                          : modal === 'export'
                            ? 'Export Promotions'
                            : actionTitle
                  }}
                </h2>

                <p>Employee promotion management</p>
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

          <!-- CREATE / EDIT -->
          <form
            v-if="modal === 'create' || modal === 'edit'"
            @submit.prevent="savePromotion"
          >
            <div class="modal-body form-grid">
              <label class="field full">
                <span>Employee *</span>

                <select
                  v-model="form.employeeId"
                  :disabled="modal === 'edit'"
                  required
                >
                  <option value="" disabled>Select employee</option>

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

              <div class="section-title full">Promotion Information</div>

              <label class="field">
                <span>Department *</span>
                <input v-model="form.department" required />
              </label>

              <label class="field">
                <span>Promotion Type *</span>

                <select v-model="form.promotionType" required>
                  <option
                    v-for="option in promotionTypeOptions"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <div class="section-title full">Position & Grade Changes</div>

              <label class="field">
                <span>Current Position</span>
                <input v-model="form.currentPosition" disabled />
              </label>

              <label class="field">
                <span>New Position *</span>
                <input
                  v-model="form.newPosition"
                  placeholder="Enter new position"
                  required
                />
              </label>

              <label class="field">
                <span>Current Grade</span>
                <input v-model="form.currentGrade" disabled />
              </label>

              <label class="field">
                <span>New Grade *</span>
                <input
                  v-model="form.newGrade"
                  placeholder="e.g. G6"
                  required
                />
              </label>

              <div class="section-title full">Salary Adjustment</div>

              <label class="field">
                <span>Current Salary</span>
                <input
                  v-model.number="form.currentSalary"
                  type="number"
                  disabled
                />
              </label>

              <label class="field">
                <span>New Salary (PHP) *</span>
                <input
                  v-model.number="form.newSalary"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <div class="salary-preview full">
                <div>
                  <small>Salary Increase</small>
                  <strong>{{ formatMoney(salaryIncrease) }}</strong>
                </div>

                <div>
                  <small>Increase Percentage</small>
                  <strong>{{ increasePercentage.toFixed(2) }}%</strong>
                </div>
              </div>

              <div class="section-title full">Recommendation Details</div>

              <label class="field full">
                <span>Recommended By *</span>
                <input
                  v-model="form.recommendedBy"
                  placeholder="Supervisor or manager"
                  required
                />
              </label>

              <label class="field">
                <span>Recommendation Date *</span>
                <input
                  v-model="form.recommendationDate"
                  type="date"
                  required
                />
              </label>

              <label class="field">
                <span>Effective Date *</span>
                <input
                  v-model="form.effectiveDate"
                  type="date"
                  :min="form.recommendationDate || undefined"
                  required
                />
              </label>

              <label class="field full">
                <span>Reason for Promotion *</span>
                <textarea
                  v-model="form.reason"
                  rows="3"
                  placeholder="Enter promotion justification..."
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
                Promotion records are saved as Draft.
                Changes will not automatically update employee salary or payroll.
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

              <button type="submit" class="ui-btn primary">
                {{ modal === 'create' ? 'Create Promotion' : 'Save Changes' }}
              </button>
            </footer>
          </form>

          <!-- VIEW DETAILS -->
          <template v-else-if="modal === 'view' && selected">
            <div class="modal-body">
              <div class="details-grid">
                <div>
                  <span>Promotion Number</span>
                  <strong>{{ selected.promotionNumber }}</strong>
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
                  <span>Department</span>
                  <strong>{{ selected.department }}</strong>
                </div>

                <div>
                  <span>Promotion Type</span>
                  <strong>{{ selected.promotionType }}</strong>
                </div>

                <div>
                  <span>Employee Number</span>
                  <strong>{{ selected.employeeNumber }}</strong>
                </div>

                <div>
                  <span>Current Position</span>
                  <strong>{{ selected.currentPosition }}</strong>
                </div>

                <div>
                  <span>New Position</span>
                  <strong>{{ selected.newPosition }}</strong>
                </div>

                <div>
                  <span>Current Grade</span>
                  <strong>{{ selected.currentGrade }}</strong>
                </div>

                <div>
                  <span>New Grade</span>
                  <strong>{{ selected.newGrade }}</strong>
                </div>

                <div>
                  <span>Current Salary</span>
                  <strong>{{ formatMoney(selected.currentSalary) }}</strong>
                </div>

                <div>
                  <span>New Salary</span>
                  <strong>{{ formatMoney(selected.newSalary) }}</strong>
                </div>

                <div>
                  <span>Salary Increase</span>
                  <strong>{{ formatMoney(selected.salaryIncrease) }}</strong>
                </div>

                <div>
                  <span>Increase Percentage</span>
                  <strong>{{ selected.increasePercentage.toFixed(2) }}%</strong>
                </div>

                <div>
                  <span>Recommended By</span>
                  <strong>{{ selected.recommendedBy }}</strong>
                </div>

                <div>
                  <span>Approved By</span>
                  <strong>{{ selected.approvedBy || 'Pending' }}</strong>
                </div>

                <div>
                  <span>Recommendation Date</span>
                  <strong>{{ formatDate(selected.recommendationDate) }}</strong>
                </div>

                <div>
                  <span>Effective Date</span>
                  <strong>{{ formatDate(selected.effectiveDate) }}</strong>
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
                class="ui-btn"
                @click="closeModal"
              >
                Close
              </button>

              <button
                v-if="!['Effective', 'Rejected', 'Cancelled'].includes(selected.status)"
                type="button"
                class="ui-btn primary"
                @click="openEdit(selected)"
              >
                Edit Promotion
              </button>
            </footer>
          </template>

          <!-- STATUS CONFIRMATIONS -->
          <template
            v-else-if="
              selected &&
              ['submit', 'approve', 'schedule', 'effective', 'reject', 'cancel'].includes(modal)
            "
          >
            <div class="modal-body form-grid">
              <div
                class="confirmation-icon full"
                :class="['reject', 'cancel'].includes(modal) ? 'danger-icon' : 'success-icon'"
              >
                <CircleX
                  v-if="['reject', 'cancel'].includes(modal)"
                  :size="24"
                />

                <CheckCircle2 v-else :size="24" />
              </div>

              <h3 class="confirmation-title full">
                {{ actionTitle }}?
              </h3>

              <p class="confirmation-text full">
                Employee: <strong>{{ selected.employeeName }}</strong>
                <span>{{ selected.promotionNumber }}</span>
              </p>

              <div class="summary-box full">
                <div>
                  <small>Current Position</small>
                  <strong>{{ selected.currentPosition }}</strong>
                </div>

                <div>
                  <small>New Position</small>
                  <strong>{{ selected.newPosition }}</strong>
                </div>

                <div>
                  <small>New Salary</small>
                  <strong>{{ formatMoney(selected.newSalary) }}</strong>
                </div>

                <div>
                  <small>Effective Date</small>
                  <strong>{{ formatDate(selected.effectiveDate) }}</strong>
                </div>
              </div>

              <label v-if="modal === 'approve'" class="field full">
                <span>Approved By *</span>
                <input
                  v-model="decision.approvedBy"
                  placeholder="Enter authorized approver"
                />
              </label>

              <label class="field full">
                <span>
                  {{
                    modal === 'reject' || modal === 'cancel'
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
                This action updates promotion tracking only.
                It does not automatically update employee compensation.
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
                :class="['reject', 'cancel'].includes(modal) ? 'danger' : 'primary'"
                @click="confirmAction"
              >
                Confirm Action
              </button>
            </footer>
          </template>

          <!-- EXPORT -->
          <template v-else-if="modal === 'export'">
            <div class="modal-body">
              <div class="export-stats">
                <div>
                  <small>Total</small>
                  <strong>{{ stats.total }}</strong>
                </div>

                <div>
                  <small>For Review / Approval</small>
                  <strong>{{ stats.pending }}</strong>
                </div>

                <div>
                  <small>Approved / Scheduled</small>
                  <strong>{{ stats.approved }}</strong>
                </div>

                <div>
                  <small>Effective</small>
                  <strong>{{ stats.effective }}</strong>
                </div>
              </div>

              <h4 class="export-heading">Export Format</h4>

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
                  <small>Raw promotion data</small>
                </button>
              </div>

              <div class="modal-note">
                Included data: Employee, Department, Promotion Type,
                Position, Grade, Salary, Recommendation, Approval,
                Effective Date, Status and Reason.

                Actual exporting will be connected later.
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
.promotions-page {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.header-actions,
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.table-footer {
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

.promotion-overlay {
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

.promotion-modal {
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

.salary-preview,
.summary-box,
.export-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.salary-preview > div,
.summary-box > div,
.export-stats > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.salary-preview small,
.summary-box small,
.export-stats small {
  color: var(--text-muted);
  font-size: 9px;
}

.salary-preview strong,
.summary-box strong,
.export-stats strong {
  color: var(--text-primary);
  font-size: 13px;
}

.salary-preview strong {
  color: var(--green);
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
  padding: 11px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.6;
}

/* =========================================
   CONFIRMATIONS
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
}

.confirmation-text span {
  display: block;
  margin-top: 5px;
  color: var(--primary);
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
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin-bottom: 12px;
}

.export-options button {
  display: flex;
  min-height: 108px;
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

@media (max-width: 650px) {
  .header-actions,
  .table-footer {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid,
  .details-grid,
  .salary-preview,
  .summary-box,
  .export-stats,
  .export-options {
    grid-template-columns: 1fr;
  }

  .full {
    grid-column: auto;
  }
}
</style>
