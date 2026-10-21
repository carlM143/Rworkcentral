
<script setup lang="ts">
import {
  Download,
  Plus,
  RotateCcw,
  X,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Table2,
} from 'lucide-vue-next'

import type {
  LifecycleTransaction,
  LifecycleTransactionStatus,
  LifecycleTransactionType,
} from '~/types/employeeLifecycle'

const router = useRouter()
const { employees } = useEmployees()
const { success, warning } = useToast()

const {
  search,
  type,
  status,
  currentPage,
  filteredTransactions,
  paginatedTransactions,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  upcomingActions,
  transactionSummary,
  recentActivity,
  typeOptions,
  statusOptions,
  resetFilters,
  addTransaction,
  updateTransactionStatus,
} = useEmployeeLifecycle()

/* =========================================
   MODAL STATE
========================================= */

type ModalType = 'create' | 'view' | 'status' | 'export' | null

const modal = ref<ModalType>(null)
const selected = ref<LifecycleTransaction | null>(null)

const exportFormat = ref<'excel' | 'pdf' | 'csv'>('excel')
const errorMessage = ref('')
const statusRemarks = ref('')

const nextStatus = ref<LifecycleTransactionStatus>('In Progress')

/* =========================================
   CREATE FORM
========================================= */

const form = reactive({
  employeeId: '',
  type: 'Regularization' as LifecycleTransactionType,
  currentValue: '',
  newValue: '',
  effectiveDate: '',
  status: 'Pending' as LifecycleTransactionStatus,
  requestedBy: 'HR Administrator',
  remarks: '',
})

const employeeOptions = computed(() => {
  return employees.value.map(employee => ({
    value: String(employee.id),
    name: [
      employee.firstName,
      employee.middleName,
      employee.lastName,
    ].filter(Boolean).join(' '),
    number: employee.employeeNumber,
  }))
})

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

/* =========================================
   OPEN MODALS
========================================= */

const openCreate = () => {
  Object.assign(form, {
    employeeId: '',
    type: 'Regularization',
    currentValue: '',
    newValue: '',
    effectiveDate: '',
    status: 'Pending',
    requestedBy: 'HR Administrator',
    remarks: '',
  })

  selected.value = null
  errorMessage.value = ''
  modal.value = 'create'
}

const openView = (transaction: LifecycleTransaction) => {
  selected.value = transaction
  modal.value = 'view'
}

const openStatus = () => {
  if (!selected.value) return

  if (['Completed', 'Cancelled'].includes(selected.value.status)) {
    return
  }

  nextStatus.value = selected.value.status
  statusRemarks.value = selected.value.remarks ?? ''

  modal.value = 'status'
}

const closeModal = () => {
  modal.value = null
  errorMessage.value = ''
}

/* =========================================
   CREATE TRANSACTION
========================================= */

const submitTransaction = () => {
  errorMessage.value = ''

  if (
    !form.employeeId ||
    !form.effectiveDate ||
    !form.requestedBy.trim()
  ) {
    errorMessage.value =
      'Employee, effective date, and requested by are required.'
    return
  }

  try {
    addTransaction({
      employeeId: Number(form.employeeId),
      type: form.type,
      effectiveDate: form.effectiveDate,
      requestedBy: form.requestedBy.trim(),
      status: form.status,
      currentValue: form.currentValue.trim() || undefined,
      newValue: form.newValue.trim() || undefined,
      remarks: form.remarks.trim() || undefined,
    })

    success(
      'Transaction Created',
      'Lifecycle transaction was added to mock records.',
    )

    closeModal()
  } catch {
    errorMessage.value = 'Selected employee could not be found.'
  }
}

/* =========================================
   UPDATE STATUS
========================================= */

const saveStatus = () => {
  if (!selected.value) return

  const saved = updateTransactionStatus(
    selected.value.id,
    nextStatus.value,
    statusRemarks.value,
  )

  if (!saved) {
    warning(
      'Update Unavailable',
      'This transaction can no longer be changed.',
    )
    return
  }

  success(
    'Status Updated',
    'The lifecycle record has been updated.',
  )

  closeModal()
}

/* =========================================
   QUICK ACTION NAVIGATION
========================================= */

const goTo = (path: string) => {
  router.push(path)
}

/* =========================================
   KEYBOARD EVENTS
========================================= */

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <section class="lifecycle-page">

    <!-- HEADER -->
    <PageHeader
      title="Employee Lifecycle"
      description="Monitor onboarding, regularization, transfers, promotions, employment changes and offboarding."
    >
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
        New Transaction
      </AppButton>
    </PageHeader>

    <!-- STATS -->
    <LifecycleStats :stats="stats" />

    <!-- FILTERS -->
    <div class="lifecycle-filters">
      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search employee, employee ID or reference..."
      />

      <AppSelect
        v-model="type"
        :options="typeOptions"
        placeholder="All Transaction Types"
      />

      <AppSelect
        v-model="status"
        :options="statusOptions"
        placeholder="All Status"
      />

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="resetFilters"
      >
        Reset
      </AppButton>
    </div>

    <!-- MAIN CONTENT -->
    <div class="lifecycle-layout">

      <div class="lifecycle-main">

        <LifecycleTransactionsTable
          :transactions="paginatedTransactions"
          @view="openView"
        />

        <!-- PAGINATION -->
        <div class="table-footer">
          <p>
            Showing
            <strong>{{ showingFrom }}–{{ showingTo }}</strong>
            of
            <strong>{{ filteredTransactions.length }}</strong>
            transactions
          </p>

          <AppPagination
            v-model="currentPage"
            :total-pages="totalPages"
          />
        </div>

        <!-- RECENT ACTIVITIES -->
        <RecentLifecycleActivity
          :activities="recentActivity"
        />
      </div>

      <!-- SIDE PANEL -->
      <LifecycleSidePanel
        :upcoming-actions="upcomingActions"
        :summary="transactionSummary"
        @onboarding="goTo('/employee-lifecycle/onboarding')"
        @transfer="goTo('/employee-lifecycle/transfers')"
        @regularization="goTo('/employee-lifecycle/regularization')"
        @offboarding="goTo('/employee-lifecycle/offboarding')"
      />
    </div>

    <!-- MODALS -->
    <Teleport to="body">
      <div
        v-if="modal"
        class="lifecycle-modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="lifecycle-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Lifecycle action"
        >

          <!-- MODAL HEADER -->
          <header class="modal-header">
            <div>
              <h2>
                {{
                  modal === 'create'
                    ? 'New Lifecycle Transaction'
                    : modal === 'view'
                      ? 'Transaction Details'
                      : modal === 'status'
                        ? 'Update Transaction Status'
                        : 'Export Lifecycle Records'
                }}
              </h2>

              <p>Employee lifecycle monitoring and status tracking</p>
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

          <!-- CREATE MODAL -->
          <form
            v-if="modal === 'create'"
            @submit.prevent="submitTransaction"
          >
            <div class="modal-body field-grid">

              <label class="field full">
                <span>Employee *</span>

                <select v-model="form.employeeId" required>
                  <option value="" disabled>
                    Select employee
                  </option>

                  <option
                    v-for="employee in employeeOptions"
                    :key="employee.value"
                    :value="employee.value"
                  >
                    {{ employee.name }} ({{ employee.number }})
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Transaction Type *</span>

                <select v-model="form.type">
                  <option
                    v-for="option in typeOptions"
                    :key="option"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Effective Date *</span>

                <input
                  v-model="form.effectiveDate"
                  type="date"
                  required
                />
              </label>

              <label class="field">
                <span>Current Value</span>

                <input
                  v-model="form.currentValue"
                  placeholder="e.g. Probationary"
                />
              </label>

              <label class="field">
                <span>New Value</span>

                <input
                  v-model="form.newValue"
                  placeholder="e.g. Regular"
                />
              </label>

              <label class="field">
                <span>Requested By *</span>

                <input
                  v-model="form.requestedBy"
                  required
                />
              </label>

              <label class="field">
                <span>Status</span>

                <select v-model="form.status">
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </label>

              <label class="field full">
                <span>Remarks</span>

                <textarea
                  v-model="form.remarks"
                  rows="3"
                  placeholder="Additional details..."
                />
              </label>

              <p v-if="errorMessage" class="form-error full">
                {{ errorMessage }}
              </p>

              <p class="modal-note full">
                Mock data only. This does not update official
                employee records or payroll.
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
                <Plus :size="15" />
                Create Transaction
              </button>
            </footer>
          </form>

          <!-- VIEW MODAL -->
          <template v-else-if="modal === 'view' && selected">
            <div class="modal-body">
              <div class="details-grid">

                <div>
                  <span>Reference</span>
                  <strong>{{ selected.reference }}</strong>
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
                  <span>Transaction</span>
                  <strong>{{ selected.type }}</strong>
                </div>

                <div>
                  <span>Effective Date</span>
                  <strong>{{ formatDate(selected.effectiveDate) }}</strong>
                </div>

                <div>
                  <span>Current Value</span>
                  <strong>{{ selected.currentValue || '—' }}</strong>
                </div>

                <div>
                  <span>New Value</span>
                  <strong>{{ selected.newValue || '—' }}</strong>
                </div>

                <div>
                  <span>Requested By</span>
                  <strong>{{ selected.requestedBy }}</strong>
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
                v-if="
                  selected.status !== 'Completed' &&
                  selected.status !== 'Cancelled'
                "
                type="button"
                class="ui-button primary"
                @click="openStatus"
              >
                <CheckCircle2 :size="15" />
                Update Status
              </button>
            </footer>
          </template>

          <!-- UPDATE STATUS MODAL -->
          <template v-else-if="modal === 'status' && selected">
            <div class="modal-body field-grid">

              <p class="modal-note full">
                {{ selected.reference }} — {{ selected.employeeName }}
              </p>

              <label class="field full">
                <span>New Status</span>

                <select v-model="nextStatus">
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
                  v-model="statusRemarks"
                  rows="3"
                />
              </label>

              <p class="modal-note full">
                Completing a lifecycle record does not automatically
                change employee department, employment type or payroll.
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

          <!-- EXPORT MODAL -->
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
                {{ filteredTransactions.length }} records match
                the current filters. Export will be connected later.
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
.lifecycle-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.lifecycle-filters {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 220px 190px auto;
  gap: 8px;
  margin-bottom: 14px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.lifecycle-filters :deep(input),
.lifecycle-filters :deep(select) {
  font-size: 11px;
}

.lifecycle-filters :deep(button) {
  font-size: 10px;
}

.lifecycle-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 14px;
}

.lifecycle-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 14px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 2px 3px 0;
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

.lifecycle-modal-overlay {
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

.lifecycle-modal {
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
  background: var(--primary);
  border-color: var(--primary);
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
  flex-direction: column;
  min-width: 0;
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
  outline: 0;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 11px;
}

.full {
  grid-column: 1 / -1;
}

/* DETAILS */

.details-grid > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
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

/* EXPORT */

.export-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin-bottom: 12px;
}

.export-options button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  min-height: 100px;
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

@media (max-width: 1100px) {
  .lifecycle-layout {
    grid-template-columns: 1fr;
  }

  .lifecycle-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .lifecycle-filters,
  .field-grid,
  .details-grid {
    grid-template-columns: 1fr;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .export-options {
    grid-template-columns: 1fr;
  }
}
</style>
