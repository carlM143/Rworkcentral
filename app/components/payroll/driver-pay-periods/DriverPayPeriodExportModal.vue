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
  | 'All Periods'

interface ExportPayload {
  format: ExportFormat
  scope: ExportScope

  includePeriodCode: boolean
  includePeriodName: boolean
  includePayrollType: boolean
  includeDates: boolean
  includeCutoff: boolean
  includePayDate: boolean
  includeDriverCounts: boolean
  includeGross: boolean
  includeDeductions: boolean
  includeNet: boolean
  includeStatus: boolean
}

const props =
  defineProps<{
    open: boolean

    recordCount: number

    status?: string
    year?: string
    month?: string
    dateFrom?: string
    dateTo?: string
  }>()

const emit =
  defineEmits<{
    close: []

    export: [
      payload:
        ExportPayload,
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

const includePeriodCode =
  ref(true)

const includePeriodName =
  ref(true)

const includePayrollType =
  ref(true)

const includeDates =
  ref(true)

const includeCutoff =
  ref(true)

const includePayDate =
  ref(true)

const includeDriverCounts =
  ref(true)

const includeGross =
  ref(true)

const includeDeductions =
  ref(true)

const includeNet =
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
      'Best for payroll analysis and reconciliation.',

    icon:
      FileSpreadsheet,
  },

  {
    value:
      'PDF' as const,

    label:
      'PDF',

    description:
      'Best for printable driver payroll period reports.',

    icon:
      FileText,
  },

  {
    value:
      'CSV' as const,

    label:
      'CSV',

    description:
      'Raw period data for spreadsheets or other systems.',

    icon:
      Table2,
  },
]

const resetForm = () => {
  format.value =
    'Excel'

  scope.value =
    'Current Filters'

  includePeriodCode.value =
    true

  includePeriodName.value =
    true

  includePayrollType.value =
    true

  includeDates.value =
    true

  includeCutoff.value =
    true

  includePayDate.value =
    true

  includeDriverCounts.value =
    true

  includeGross.value =
    true

  includeDeductions.value =
    true

  includeNet.value =
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

      includePeriodCode:
        includePeriodCode.value,

      includePeriodName:
        includePeriodName.value,

      includePayrollType:
        includePayrollType.value,

      includeDates:
        includeDates.value,

      includeCutoff:
        includeCutoff.value,

      includePayDate:
        includePayDate.value,

      includeDriverCounts:
        includeDriverCounts.value,

      includeGross:
        includeGross.value,

      includeDeductions:
        includeDeductions.value,

      includeNet:
        includeNet.value,

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

          <header class="modal-header">

            <div class="header-main">

              <div class="header-icon">
                <Download :size="18" />
              </div>

              <div>
                <h2>
                  Export Driver Pay Periods
                </h2>

                <p>
                  Configure the driver payroll period report before exporting.
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

          <div class="modal-body">

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
                  STATUS
                </span>

                <strong>
                  {{
                    status ||
                    'All Status'
                  }}
                </strong>
              </div>

              <div>
                <span>
                  YEAR
                </span>

                <strong>
                  {{
                    year ||
                    'All Years'
                  }}
                </strong>
              </div>

              <div>
                <span>
                  MONTH
                </span>

                <strong>
                  {{
                    month ||
                    'All Months'
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
                    Current Filtered Periods
                  </strong>

                  <span>
                    Export periods matching the current status, year, month and date filters.
                  </span>
                </div>

              </label>

              <label class="radio-card">

                <input
                  v-model="scope"
                  type="radio"
                  value="All Periods"
                >

                <div>
                  <strong>
                    All Driver Pay Periods
                  </strong>

                  <span>
                    Export all driver payroll periods regardless of the current filters.
                  </span>
                </div>

              </label>

            </section>

            <section class="form-section">

              <div class="section-title">
                Include in Report
              </div>

              <div class="checkbox-grid">

                <label>
                  <input
                    v-model="
                      includePeriodCode
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Period Code
                    </strong>

                    <span>
                      Driver payroll period reference.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includePeriodName
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Payroll Period
                    </strong>

                    <span>
                      Period name and cutoff coverage.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includePayrollType
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Payroll Type
                    </strong>

                    <span>
                      Driver payroll classification.
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
                      Period Dates
                    </strong>

                    <span>
                      Start and end dates.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeCutoff
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Cutoff Date
                    </strong>

                    <span>
                      Payroll cutoff date.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includePayDate
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Pay Date
                    </strong>

                    <span>
                      Scheduled payroll release date.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeDriverCounts
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Driver Counts
                    </strong>

                    <span>
                      Total, pending, processed and completed drivers.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeGross
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Gross Amount
                    </strong>

                    <span>
                      Total gross driver payroll.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeDeductions
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Total Deductions
                    </strong>

                    <span>
                      Total deductions for the period.
                    </span>
                  </div>
                </label>

                <label>
                  <input
                    v-model="
                      includeNet
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Net Amount
                    </strong>

                    <span>
                      Total net payroll amount.
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
                      Draft, Open, Processing, Closed or Cancelled.
                    </span>
                  </div>
                </label>

              </div>

            </section>

          </div>

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
    grid-template-columns:
      1fr;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction:
      column-reverse;
  }
}
</style>