<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  FileText,
  Table2,
  X,
} from 'lucide-vue-next'

type ExportFormat =
  | 'Excel'
  | 'PDF'
  | 'CSV'

type ExportScope =
  | 'Current Filters'
  | 'All Loan Records'

interface LoanExportPayload {
  format: ExportFormat
  scope: ExportScope

  includeLoanNumber: boolean
  includeEmployee: boolean
  includeDepartment: boolean
  includeLoanType: boolean
  includePrincipal: boolean
  includeMonthlyDeduction: boolean
  includeTotalPaid: boolean
  includeOutstanding: boolean
  includeDates: boolean
  includeStatus: boolean
}

const props =
  defineProps<{
    open: boolean

    recordCount: number

    loanType?: string
    department?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  }>()

const emit =
  defineEmits<{
    close: []

    export: [
      payload:
        LoanExportPayload,
    ]
  }>()

const format =
  ref<ExportFormat>(
    'Excel',
  )

const scope =
  ref<ExportScope>(
    'Current Filters',
  )

const includeLoanNumber =
  ref(true)

const includeEmployee =
  ref(true)

const includeDepartment =
  ref(true)

const includeLoanType =
  ref(true)

const includePrincipal =
  ref(true)

const includeMonthlyDeduction =
  ref(true)

const includeTotalPaid =
  ref(true)

const includeOutstanding =
  ref(true)

const includeDates =
  ref(true)

const includeStatus =
  ref(true)

const formats = [
  {
    value:
      'Excel' as const,

    label:
      'Excel',

    description:
      'Best for loan analysis and payroll reconciliation.',

    icon:
      FileSpreadsheet,
  },

  {
    value:
      'PDF' as const,

    label:
      'PDF',

    description:
      'Best for printable employee loan reports.',

    icon:
      FileText,
  },

  {
    value:
      'CSV' as const,

    label:
      'CSV',

    description:
      'Raw loan data for spreadsheets and external systems.',

    icon:
      Table2,
  },
]

const resetForm = () => {
  format.value =
    'Excel'

  scope.value =
    'Current Filters'

  includeLoanNumber.value =
    true

  includeEmployee.value =
    true

  includeDepartment.value =
    true

  includeLoanType.value =
    true

  includePrincipal.value =
    true

  includeMonthlyDeduction.value =
    true

  includeTotalPaid.value =
    true

  includeOutstanding.value =
    true

  includeDates.value =
    true

  includeStatus.value =
    true
}

watch(
  () => props.open,
  value => {
    if (value) {
      resetForm()
    }
  },
)

const handleExport = () => {
  emit(
    'export',
    {
      format:
        format.value,

      scope:
        scope.value,

      includeLoanNumber:
        includeLoanNumber.value,

      includeEmployee:
        includeEmployee.value,

      includeDepartment:
        includeDepartment.value,

      includeLoanType:
        includeLoanType.value,

      includePrincipal:
        includePrincipal.value,

      includeMonthlyDeduction:
        includeMonthlyDeduction.value,

      includeTotalPaid:
        includeTotalPaid.value,

      includeOutstanding:
        includeOutstanding.value,

      includeDates:
        includeDates.value,

      includeStatus:
        includeStatus.value,
    },
  )

  emit('close')
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal-fade">

      <div
        v-if="open"
        class="modal-overlay"
        @click.self="
          emit('close')
        "
      >

        <article class="export-modal">

          <!-- HEADER -->

          <header class="modal-header">

            <div class="header-main">

              <div class="header-icon">
                <Download :size="18" />
              </div>

              <div>

                <h2>
                  Export Loans
                </h2>

                <p>
                  Configure the employee loan report before exporting.
                </p>

              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="
                emit('close')
              "
            >
              <X :size="18" />
            </button>

          </header>

          <!-- BODY -->

          <div class="modal-body">

            <!-- CURRENT FILTER SUMMARY -->

            <section class="filter-summary">

              <div>
                <span>
                  RECORDS
                </span>

                <strong>
                  {{ recordCount }}
                </strong>
              </div>

              <div>
                <span>
                  LOAN TYPE
                </span>

                <strong>
                  {{
                    loanType ||
                    'All Loan Types'
                  }}
                </strong>
              </div>

              <div>
                <span>
                  DEPARTMENT
                </span>

                <strong>
                  {{
                    department ||
                    'All Departments'
                  }}
                </strong>
              </div>

              <div>
                <span>
                  STATUS
                </span>

                <strong>
                  {{
                    status ||
                    'All Status'
                  }}
                </strong>
              </div>

            </section>

            <section
              v-if="
                dateFrom ||
                dateTo
              "
              class="date-summary"
            >
              <span>
                Selected Date Range
              </span>

              <strong>
                {{
                  dateFrom ||
                  'Beginning'
                }}
                →
                {{
                  dateTo ||
                  'Latest'
                }}
              </strong>
            </section>

            <!-- FORMAT -->

            <section class="form-section">

              <div class="section-title">
                Export Format
              </div>

              <div class="format-grid">

                <button
                  v-for="item in formats"
                  :key="item.value"
                  type="button"
                  class="format-option"
                  :class="{
                    active:
                      format ===
                      item.value,
                  }"
                  @click="
                    format =
                      item.value
                  "
                >

                  <div class="format-icon">
                    <component
                      :is="item.icon"
                      :size="18"
                    />
                  </div>

                  <strong>
                    {{ item.label }}
                  </strong>

                  <span>
                    {{ item.description }}
                  </span>

                </button>

              </div>

            </section>

            <!-- SCOPE -->

            <section class="form-section">

              <div class="section-title">
                Export Scope
              </div>

              <label class="radio-card">

                <input
                  v-model="scope"
                  type="radio"
                  value="Current Filters"
                >

                <div>
                  <strong>
                    Current Filtered Records
                  </strong>

                  <span>
                    Export loans matching the current search, filters and date range.
                  </span>
                </div>

              </label>

              <label class="radio-card">

                <input
                  v-model="scope"
                  type="radio"
                  value="All Loan Records"
                >

                <div>
                  <strong>
                    All Loan Records
                  </strong>

                  <span>
                    Export all employee loan records regardless of the current filters.
                  </span>
                </div>

              </label>

            </section>

            <!-- COLUMNS -->

            <section class="form-section">

              <div class="section-title">
                Include in Report
              </div>

              <div class="checkbox-grid">

                <label>
                  <input
                    v-model="
                      includeLoanNumber
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Loan Number
                    </strong>

                    <span>
                      Loan reference number.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeEmployee
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Employee
                    </strong>

                    <span>
                      Employee name and number.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeDepartment
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Department
                    </strong>

                    <span>
                      Employee department assignment.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeLoanType
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Loan Type
                    </strong>

                    <span>
                      Salary, SSS, Pag-IBIG, emergency and other loans.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includePrincipal
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Principal Amount
                    </strong>

                    <span>
                      Original approved loan amount.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeMonthlyDeduction
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Payroll Deduction
                    </strong>

                    <span>
                      Scheduled loan deduction.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeTotalPaid
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Total Paid
                    </strong>

                    <span>
                      Total amount already deducted.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeOutstanding
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Outstanding Balance
                    </strong>

                    <span>
                      Remaining loan balance.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeDates
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Loan Period
                    </strong>

                    <span>
                      Start and end dates.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeStatus
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Status
                    </strong>

                    <span>
                      Pending, approved, active, completed or cancelled.
                    </span>
                  </div>
                </label>

              </div>

            </section>

          </div>

          <!-- FOOTER -->

          <footer class="modal-footer">

            <AppButton
              variant="secondary"
              @click="
                emit('close')
              "
            >
              Cancel
            </AppButton>

            <AppButton
              :icon="Download"
              @click="
                handleExport
              "
            >
              Export {{ format }}
            </AppButton>

          </footer>

        </article>

      </div>

    </Transition>

  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 99990;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 9, 22, 0.76);

  backdrop-filter:
    blur(4px);
}

.export-modal {
  width: 100%;
  max-width: 720px;

  max-height:
    calc(100vh - 40px);

  overflow-y: auto;

  border:
    1px solid var(--border);

  border-radius: 14px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px
    rgba(0, 0, 0, 0.32);
}

.modal-header {
  position: sticky;
  z-index: 5;
  top: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 15px 18px;

  border-bottom:
    1px solid var(--border);

  background:
    var(--bg-card);
}

.header-main {
  display: flex;
  align-items: center;

  gap: 10px;
}

.header-icon {
  display: flex;

  width: 39px;
  height: 39px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.modal-header p {
  margin: 3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close-button {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.close-button:hover {
  background:
    var(--bg-card-soft);
}

.modal-body {
  padding: 16px 18px;
}

.filter-summary {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 7px;

  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.filter-summary span,
.filter-summary strong {
  display: block;
}

.filter-summary span {
  color:
    var(--text-muted);

  font-size: 6.5px;
  font-weight: 700;
}

.filter-summary strong {
  margin-top: 3px;

  overflow: hidden;

  color:
    var(--text-primary);

  font-size: 8px;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.date-summary {
  margin-top: 7px;

  padding: 9px 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.date-summary span,
.date-summary strong {
  display: block;
}

.date-summary span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.date-summary strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.form-section {
  margin-top: 16px;
}

.section-title {
  margin-bottom: 7px;

  color:
    var(--text-primary);

  font-size: 9px;
  font-weight: 700;
}

.format-grid {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 7px;
}

.format-option {
  display: flex;

  min-height: 105px;

  flex-direction: column;
  align-items: flex-start;

  gap: 5px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card-soft);

  text-align: left;

  cursor: pointer;
}

.format-option:hover,
.format-option.active {
  border-color:
    var(--primary);
}

.format-option.active {
  background:
    var(--primary-soft);
}

.format-icon {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.format-option strong {
  color:
    var(--text-primary);

  font-size: 8.5px;
}

.format-option span {
  color:
    var(--text-muted);

  font-size: 7px;

  line-height: 1.45;
}

.radio-card {
  display: flex;

  align-items: flex-start;

  gap: 8px;

  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  cursor: pointer;
}

.radio-card +
.radio-card {
  margin-top: 6px;
}

.radio-card input,
.checkbox-grid input {
  margin-top: 3px;

  accent-color:
    var(--primary);
}

.radio-card strong,
.radio-card span,
.checkbox-grid strong,
.checkbox-grid span {
  display: block;
}

.radio-card strong,
.checkbox-grid strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.radio-card span,
.checkbox-grid span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;

  line-height: 1.4;
}

.checkbox-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 6px;
}

.checkbox-grid label {
  display: flex;

  align-items: flex-start;

  gap: 7px;

  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  cursor: pointer;
}

.modal-footer {
  position: sticky;
  z-index: 5;
  bottom: 0;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: 7px;

  padding: 13px 18px;

  border-top:
    1px solid var(--border);

  background:
    var(--bg-card);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 650px) {
  .modal-overlay {
    padding: 12px;
  }

  .filter-summary,
  .format-grid,
  .checkbox-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction:
      column-reverse;
  }
}
</style>