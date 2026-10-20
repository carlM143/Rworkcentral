<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
  X,
  CircleCheck,
  CircleX,
  Play,
  CheckCheck,
} from 'lucide-vue-next'

import LoanStats from '~/components/payroll/loans/LoanStats.vue'
import LoanFilters from '~/components/payroll/loans/LoanFilters.vue'
import LoanTable from '~/components/payroll/loans/LoanTable.vue'
import AddEditLoanModal from '~/components/payroll/loans/AddEditLoanModal.vue'
import LoanDetailsModal from '~/components/payroll/loans/LoanDetailsModal.vue'
import LoanPaymentHistoryModal from '~/components/payroll/loans/LoanPaymentHistoryModal.vue'

import LoanExportModal from '~/components/payroll/loans/LoanExportModal.vue'

import type {
  LoanFormData,
  LoanRecord,
  LoanStatusAction,
} from '~/types/loan'

const router =
  useRouter()

const {
  employees,
} = useEmployees()

const {
  search,
  loanType,
  department,
  status,
  dateFrom,
  dateTo,

  currentPage,

  filteredLoans,
  paginatedLoans,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  loanTypeOptions,
  statusOptions,
  departmentOptions,

  createLoan,
  updateLoan,

  approveLoan,
  rejectLoan,
  activateLoan,
  completeLoan,
  cancelLoan,

  getLoanPayments,

  resetFilters,
} = useLoans()

const {
  info,
  success,
  error,
} = useToast()

/* =========================================================
   FORM
========================================================= */

const formOpen =
  ref(false)

const editingLoan =
  ref<LoanRecord | null>(
    null,
  )

const handleAdd = () => {
  editingLoan.value =
    null

  formOpen.value =
    true
}

const handleEdit = (
  loan:
    LoanRecord,
) => {
  editingLoan.value =
    loan

  formOpen.value =
    true
}

const closeForm = () => {
  formOpen.value =
    false

  editingLoan.value =
    null
}

const handleSave = (
  data:
    LoanFormData,
) => {
  if (
    editingLoan.value
  ) {
    const updated =
      updateLoan(
        editingLoan.value.id,
        data,
      )

    if (!updated) {
      info(
        'Unable to Update Loan',
        'The selected loan could not be updated.',
      )

      return
    }

    closeForm()

    success(
      'Loan Updated',
      `${updated.loanNumber} has been updated.`,
    )

    return
  }

  const created =
    createLoan(data)

  if (!created) {
    info(
      'Unable to Create Loan',
      'Please verify the employee and loan information.',
    )

    return
  }

  closeForm()

  success(
    'Loan Submitted',
    `${created.loanNumber} has been submitted for approval.`,
  )
}

/* =========================================================
   DETAILS
========================================================= */

const detailsOpen =
  ref(false)

const selectedLoan =
  ref<LoanRecord | null>(
    null,
  )

const handleView = (
  loan:
    LoanRecord,
) => {
  selectedLoan.value =
    loan

  detailsOpen.value =
    true
}

/* =========================================================
   PAYMENT HISTORY
========================================================= */

const historyOpen =
  ref(false)

const historyLoan =
  ref<LoanRecord | null>(
    null,
  )

const historyPayments =
  computed(() => {
    if (
      !historyLoan.value
    ) {
      return []
    }

    return getLoanPayments(
      historyLoan.value.id,
    )
  })

const handleHistory = (
  loan:
    LoanRecord,
) => {
  historyLoan.value =
    loan

  historyOpen.value =
    true
}

/* =========================================================
   EMPLOYEE
========================================================= */

const handleEmployee = (
  loan:
    LoanRecord,
) => {
  router.push(
    `/employees/${loan.employeeId}`,
  )
}

/* =========================================================
   STATUS CONFIRMATION MODAL
========================================================= */

const statusOpen =
  ref(false)

const statusLoan =
  ref<LoanRecord | null>(
    null,
  )

const statusAction =
  ref<LoanStatusAction>(
    'approve',
  )

const statusNotes =
  ref('')

const openStatus = (
  loan:
    LoanRecord,

  action:
    LoanStatusAction,
) => {
  statusLoan.value =
    loan

  statusAction.value =
    action

  statusNotes.value =
    ''

  statusOpen.value =
    true
}

const closeStatus = () => {
  statusOpen.value =
    false

  statusLoan.value =
    null

  statusNotes.value =
    ''
}

const statusTitle =
  computed(() => {
    switch (
      statusAction.value
    ) {
      case 'approve':
        return 'Approve Loan'

      case 'reject':
        return 'Reject Loan'

      case 'activate':
        return 'Activate Loan'

      case 'complete':
        return 'Complete Loan'

      default:
        return 'Cancel Loan'
    }
  })

const statusDescription =
  computed(() => {
    switch (
      statusAction.value
    ) {
      case 'approve':
        return 'Approve this employee loan application.'

      case 'reject':
        return 'Reject this loan application and provide a reason.'

      case 'activate':
        return 'Activate this approved loan for payroll deduction.'

      case 'complete':
        return 'Mark this loan as fully paid and completed.'

      default:
        return 'Cancel this loan and provide the cancellation reason.'
    }
  })

const statusIcon =
  computed(() => {
    switch (
      statusAction.value
    ) {
      case 'approve':
        return CircleCheck

      case 'activate':
        return Play

      case 'complete':
        return CheckCheck

      default:
        return CircleX
    }
  })

const requiresNotes =
  computed(() => {
    return (
      statusAction.value ===
        'reject' ||
      statusAction.value ===
        'cancel'
    )
  })

const handleStatusSave = () => {
  if (
    !statusLoan.value
  ) {
    return
  }

  if (
    requiresNotes.value &&
    !statusNotes.value.trim()
  ) {
    error(
      'Reason Required',
      'Please provide a reason before continuing.',
    )

    return
  }

  let updated:
    LoanRecord | null =
      null

  if (
    statusAction.value ===
    'approve'
  ) {
    updated =
      approveLoan(
        statusLoan.value.id,
        statusNotes.value,
      )
  }

  if (
    statusAction.value ===
    'reject'
  ) {
    updated =
      rejectLoan(
        statusLoan.value.id,
        statusNotes.value,
      )
  }

  if (
    statusAction.value ===
    'activate'
  ) {
    updated =
      activateLoan(
        statusLoan.value.id,
      )
  }

  if (
    statusAction.value ===
    'complete'
  ) {
    updated =
      completeLoan(
        statusLoan.value.id,
      )
  }

  if (
    statusAction.value ===
    'cancel'
  ) {
    updated =
      cancelLoan(
        statusLoan.value.id,
        statusNotes.value,
      )
  }

  if (!updated) {
    return
  }

  const messages = {
    approve:
      'Loan Approved',

    reject:
      'Loan Rejected',

    activate:
      'Loan Activated',

    complete:
      'Loan Completed',

    cancel:
      'Loan Cancelled',
  }

  success(
    messages[
      statusAction.value
    ],
    `${updated.loanNumber} has been updated successfully.`,
  )

  closeStatus()
}

/* =========================================================
   EXPORT
========================================================= */

const exportOpen =
  ref(false)

const handleExport = () => {
  exportOpen.value =
    true
}

const handleExportSubmit = (
  payload: {
    format:
      | 'Excel'
      | 'PDF'
      | 'CSV'

    scope:
      | 'Current Filters'
      | 'All Loan Records'

    includeLoanNumber:
      boolean

    includeEmployee:
      boolean

    includeDepartment:
      boolean

    includeLoanType:
      boolean

    includePrincipal:
      boolean

    includeMonthlyDeduction:
      boolean

    includeTotalPaid:
      boolean

    includeOutstanding:
      boolean

    includeDates:
      boolean

    includeStatus:
      boolean
  },
) => {
  info(
    `Export ${payload.format}`,
    `${filteredLoans.value.length} loan record(s) are ready for export. Actual file generation will be connected during backend integration.`,
  )
} 

const handleBack = () => {
  router.push(
    '/payroll',
  )
}
</script>

<template>
  <section class="loans-page">

    <button
      class="back-button"
      @click="
        handleBack
      "
    >
      <ArrowLeft :size="15" />

      Back to Payroll
    </button>

    <PageHeader
      title="Loans"
      description="Manage employee loans, payroll deductions, outstanding balances and payment history."
    >

      <div class="header-actions">

        <AppButton
          variant="secondary"
          :icon="Download"
          @click="
            handleExport
          "
        >
          Export
        </AppButton>

        <AppButton
          :icon="Plus"
          @click="
            handleAdd
          "
        >
          Add Loan
        </AppButton>

      </div>

    </PageHeader>

    <LoanStats
      :stats="
        stats
      "
    />

    <LoanFilters
      v-model:search="
        search
      "
      v-model:loan-type="
        loanType
      "
      v-model:department="
        department
      "
      v-model:status="
        status
      "
      v-model:date-from="
        dateFrom
      "
      v-model:date-to="
        dateTo
      "
      :loan-types="
        loanTypeOptions
      "
      :departments="
        departmentOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <LoanTable
      :loans="
        paginatedLoans
      "
      @view="
        handleView
      "
      @edit="
        handleEdit
      "
      @approve="
        loan =>
          openStatus(
            loan,
            'approve',
          )
      "
      @reject="
        loan =>
          openStatus(
            loan,
            'reject',
          )
      "
      @activate="
        loan =>
          openStatus(
            loan,
            'activate',
          )
      "
      @employee="
        handleEmployee
      "
      @history="
        handleHistory
      "
      @complete="
        loan =>
          openStatus(
            loan,
            'complete',
          )
      "
      @cancel="
        loan =>
          openStatus(
            loan,
            'cancel',
          )
      "
    />

    <div class="table-footer">

      <p>
        Showing

        <strong>
          {{
            showingFrom
          }}–{{
            showingTo
          }}
        </strong>

        of

        <strong>
          {{
            filteredLoans.length
          }}
        </strong>

        loan records
      </p>

      <AppPagination
        v-model="
          currentPage
        "
        :total-pages="
          totalPages
        "
      />

    </div>

    <AddEditLoanModal
      :open="
        formOpen
      "
      :loan="
        editingLoan
      "
      :employees="
        employees
      "
      :loan-types="
        loanTypeOptions
      "
      @close="
        closeForm
      "
      @save="
        handleSave
      "
    />

    <LoanDetailsModal
      :open="
        detailsOpen
      "
      :loan="
        selectedLoan
      "
      @close="
        detailsOpen = false
      "
    />

    <LoanPaymentHistoryModal
  :open="
    historyOpen
  "
  :loan="
    historyLoan
  "
  :payments="
    historyPayments
  "
  @close="
    historyOpen = false
  "
/>

<!-- EXPORT -->

  <LoanExportModal
    :open="
      exportOpen
    "
    :record-count="
      filteredLoans.length
    "
    :loan-type="
      loanType
    "
    :department="
      department
    "
    :status="
      status
    "
    :date-from="
      dateFrom
    "
    :date-to="
      dateTo
    "
    @close="
      exportOpen = false
    "
    @export="
      handleExportSubmit
    "
  />

    <!-- STATUS CONFIRMATION -->

    <Teleport to="body">

      <div
        v-if="
          statusOpen &&
          statusLoan
        "
        class="confirm-backdrop"
        @click.self="
          closeStatus
        "
      >

        <div class="confirm-card">

          <div class="confirm-header">

            <div class="confirm-title">

              <div
                class="confirm-icon"
                :class="
                  statusAction
                "
              >
                <component
                  :is="
                    statusIcon
                  "
                  :size="19"
                />
              </div>

              <div>

                <h3>
                  {{ statusTitle }}
                </h3>

                <p>
                  {{ statusDescription }}
                </p>

              </div>

            </div>

            <button
              class="confirm-close"
              @click="
                closeStatus
              "
            >
              <X :size="17" />
            </button>

          </div>

          <div class="confirm-body">

            <div class="loan-summary">

              <div>
                <span>Loan No.</span>
                <strong>{{ statusLoan.loanNumber }}</strong>
              </div>

              <div>
                <span>Employee</span>
                <strong>{{ statusLoan.employeeName }}</strong>
              </div>

              <div>
                <span>Loan Type</span>
                <strong>{{ statusLoan.loanType }}</strong>
              </div>

              <div>
                <span>Current Status</span>
                <StatusBadge :status="statusLoan.status" />
              </div>

            </div>

            <div
              v-if="
                statusAction ===
                  'approve' ||
                requiresNotes
              "
              class="notes-field"
            >

              <label>
                {{
                  statusAction ===
                  'approve'
                    ? 'Approval Notes'
                    : statusAction ===
                        'reject'
                      ? 'Rejection Reason *'
                      : 'Cancellation Reason *'
                }}
              </label>

              <textarea
                v-model="
                  statusNotes
                "
                rows="4"
                :placeholder="
                  requiresNotes
                    ? 'Enter reason...'
                    : 'Optional approval notes...'
                "
              />

            </div>

          </div>

          <div class="confirm-footer">

            <AppButton
              variant="secondary"
              @click="
                closeStatus
              "
            >
              Back
            </AppButton>

            <button
              class="confirm-action"
              :class="
                statusAction
              "
              @click="
                handleStatusSave
              "
            >

              <component
                :is="
                  statusIcon
                "
                :size="15"
              />

              {{ statusTitle }}

            </button>

          </div>

        </div>

      </div>

    </Teleport>

  </section>
</template>

<style scoped>
.loans-page {
  width: 100%;

  max-width: 1660px;

  margin:
    0 auto;
}

.back-button {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 10px;

  padding: 0;

  border: 0;

  background:
    transparent;

  color:
    var(--primary);

  font-family:
    inherit;

  font-size: 10px;
  font-weight: 600;
}

.header-actions {
  display: flex;

  gap: 8px;
}

.table-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding:
    13px 3px 0;
}

.table-footer p {
  margin: 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

.table-footer strong {
  color:
    var(--text-primary);
}

/* CONFIRM */

.confirm-backdrop {
  position: fixed;
  inset: 0;

  z-index: 10000;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 8, 18, 0.76);

  backdrop-filter:
    blur(3px);
}

.confirm-card {
  width: 100%;
  max-width: 570px;

  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 12px;

  background:
    var(--bg-card);
}

.confirm-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding:
    15px 17px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.confirm-title {
  display: flex;

  align-items: center;

  gap: 9px;
}

.confirm-icon {
  display: flex;

  width: 39px;
  height: 39px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--green-soft);

  color:
    var(--green);
}

.confirm-icon.reject,
.confirm-icon.cancel {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.confirm-title h3 {
  margin: 0;

  font-size: 14px;
}

.confirm-title p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.confirm-close {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 6px;

  background:
    transparent;

  color:
    var(--text-muted);
}

.confirm-body {
  padding:
    15px 17px;
}

.loan-summary {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.loan-summary > div {
  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.loan-summary span,
.loan-summary strong {
  display: block;
}

.loan-summary span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.loan-summary strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.notes-field {
  margin-top: 11px;
}

.notes-field label {
  display: block;

  margin-bottom: 6px;

  color:
    var(--text-primary);

  font-size: 9px;
  font-weight: 600;
}

.notes-field textarea {
  width: 100%;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  outline: 0;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-family:
    inherit;

  font-size: 10px;

  resize: vertical;
}

.confirm-footer {
  display: flex;

  justify-content: flex-end;

  gap: 8px;

  padding:
    12px 17px;

  border-top:
    1px solid
    var(--border-soft);

  background:
    var(--bg-card-soft);
}

.confirm-action {
  display: inline-flex;

  min-height: 36px;

  align-items: center;

  gap: 6px;

  padding:
    0 13px;

  border: 0;

  border-radius: 7px;

  background:
    var(--green);

  color: white;

  font-family:
    inherit;

  font-size: 9px;
  font-weight: 600;
}

.confirm-action.reject,
.confirm-action.cancel {
  background:
    var(--red);
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;

    flex-direction:
      column;
  }

  .table-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }

  .loan-summary {
    grid-template-columns:
      1fr;
  }
}
</style>