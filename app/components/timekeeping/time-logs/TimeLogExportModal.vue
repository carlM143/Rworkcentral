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
  | 'Selected Date Range'

interface TimeLogExportPayload {
  format: ExportFormat

  scope: ExportScope

  includeEmployee: boolean

  includeSchedule: boolean

  includeTimeEntries: boolean

  includeBreaks: boolean

  includeIssues: boolean

  includeWorkedHours: boolean

  includeStatus: boolean
}

const props =
  defineProps<{
    open: boolean

    recordCount: number

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
        TimeLogExportPayload,
    ]
  }>()

/* =========================================================
   FORM
========================================================= */

const format =
  ref<ExportFormat>(
    'Excel',
  )

const scope =
  ref<ExportScope>(
    'Current Filters',
  )

const includeEmployee =
  ref(true)

const includeSchedule =
  ref(true)

const includeTimeEntries =
  ref(true)

const includeBreaks =
  ref(true)

const includeIssues =
  ref(true)

const includeWorkedHours =
  ref(true)

const includeStatus =
  ref(true)

/* =========================================================
   FORMATS
========================================================= */

const formats = [
  {
    value:
      'Excel' as const,

    label:
      'Excel',

    description:
      'Best for attendance analysis, filtering and calculations.',

    icon:
      FileSpreadsheet,
  },

  {
    value:
      'PDF' as const,

    label:
      'PDF',

    description:
      'Best for printable DTR and attendance reports.',

    icon:
      FileText,
  },

  {
    value:
      'CSV' as const,

    label:
      'CSV',

    description:
      'Simple raw employee time log data.',

    icon:
      Table2,
  },
]

/* =========================================================
   DATE FORMAT
========================================================= */

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return 'Not Selected'
  }

  const date =
    new Date(
      `${value}T00:00:00`,
    )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month:
        'short',

      day:
        'numeric',

      year:
        'numeric',
    },
  ).format(date)
}

/* =========================================================
   RESET
========================================================= */

const resetModal = () => {
  format.value =
    'Excel'

  scope.value =
    'Current Filters'

  includeEmployee.value =
    true

  includeSchedule.value =
    true

  includeTimeEntries.value =
    true

  includeBreaks.value =
    true

  includeIssues.value =
    true

  includeWorkedHours.value =
    true

  includeStatus.value =
    true
}

watch(
  () => props.open,
  value => {
    if (value) {
      resetModal()
    }
  },
)

/* =========================================================
   EXPORT
========================================================= */

const handleExport = () => {
  emit(
    'export',
    {
      format:
        format.value,

      scope:
        scope.value,

      includeEmployee:
        includeEmployee.value,

      includeSchedule:
        includeSchedule.value,

      includeTimeEntries:
        includeTimeEntries.value,

      includeBreaks:
        includeBreaks.value,

      includeIssues:
        includeIssues.value,

      includeWorkedHours:
        includeWorkedHours.value,

      includeStatus:
        includeStatus.value,
    },
  )

  emit('close')
}
</script>

<template>
  <Teleport to="body">

    <Transition name="export-modal">

      <div
        v-if="open"
        class="modal-overlay"
        @click.self="
          emit('close')
        "
      >

        <article class="modal-card">

          <!-- HEADER -->

          <header class="modal-header">

            <div class="header-main">

              <div class="header-icon">
                <Download
                  :size="18"
                />
              </div>

              <div>

                <h2>
                  Export Time Logs
                </h2>

                <p>
                  Export employee attendance and detailed time log records.
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

            <!-- FILTER SUMMARY -->

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

            <!-- DATE -->

            <section class="date-summary">

              <div>

                <span>
                  DATE FROM
                </span>

                <strong>
                  {{
                    formatDate(
                      dateFrom,
                    )
                  }}
                </strong>

              </div>

              <div class="date-arrow">
                →
              </div>

              <div>

                <span>
                  DATE TO
                </span>

                <strong>
                  {{
                    formatDate(
                      dateTo,
                    )
                  }}
                </strong>

              </div>

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

              <label class="radio-option">

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
                    Export records matching the current employee, department, status and date filters.
                  </span>

                </div>

              </label>

              <label class="radio-option">

                <input
                  v-model="scope"
                  type="radio"
                  value="Selected Date Range"
                >

                <div>

                  <strong>
                    Selected Date Range
                  </strong>

                  <span>
                    Export all time logs within the selected From and To dates.
                  </span>

                </div>

              </label>

            </section>

            <!-- INCLUDE -->

            <section class="form-section">

              <div class="section-title">
                Include in Report
              </div>

              <div class="checkbox-grid">

                <label>

                  <input
                    v-model="
                      includeEmployee
                    "
                    type="checkbox"
                  >

                  <div>

                    <strong>
                      Employee Information
                    </strong>

                    <span>
                      Employee number, name and department.
                    </span>

                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeSchedule
                    "
                    type="checkbox"
                  >

                  <div>

                    <strong>
                      Work Schedule
                    </strong>

                    <span>
                      Assigned employee work schedule.
                    </span>

                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeTimeEntries
                    "
                    type="checkbox"
                  >

                  <div>

                    <strong>
                      Time In / Time Out
                    </strong>

                    <span>
                      Employee attendance entry and exit times.
                    </span>

                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeBreaks
                    "
                    type="checkbox"
                  >

                  <div>

                    <strong>
                      Break Logs
                    </strong>

                    <span>
                      Break Out and Break In timestamps.
                    </span>

                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeIssues
                    "
                    type="checkbox"
                  >

                  <div>

                    <strong>
                      Late / Undertime
                    </strong>

                    <span>
                      Late and undertime minutes recorded.
                    </span>

                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeWorkedHours
                    "
                    type="checkbox"
                  >

                  <div>

                    <strong>
                      Worked Hours
                    </strong>

                    <span>
                      Computed total employee working hours.
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
                      Attendance Status
                    </strong>

                    <span>
                      Complete, incomplete, missing log and other statuses.
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

  padding: 22px;

  background:
    rgba(3, 10, 24, 0.76);

  backdrop-filter:
    blur(4px);
}

.modal-card {
  width: 100%;
  max-width: 660px;

  max-height:
    calc(100vh - 44px);

  overflow-y: auto;

  border:
    1px solid var(--border);

  border-radius: 14px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px
    rgba(0, 0, 0, 0.3);
}

.modal-header {
  position: sticky;
  z-index: 5;
  top: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 16px 18px;

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

.modal-body {
  padding: 16px 18px;
}

.filter-summary {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

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

  color:
    var(--text-primary);

  font-size: 8px;
}

.date-summary {
  display: grid;

  grid-template-columns:
    1fr auto 1fr;

  align-items: center;

  gap: 10px;

  margin-top: 8px;

  padding: 9px 10px;

  border-radius: 8px;

  background:
    var(--primary-soft);
}

.date-summary span,
.date-summary strong {
  display: block;
}

.date-summary span {
  color:
    var(--text-muted);

  font-size: 6.5px;
  font-weight: 700;
}

.date-summary strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.date-summary > div:last-child {
  text-align: right;
}

.date-arrow {
  color:
    var(--primary);

  font-size: 13px;
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
    repeat(3, minmax(0, 1fr));

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

  color:
    var(--text-secondary);

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

  color:
    var(--primary);
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

.radio-option {
  display: flex;

  align-items: flex-start;

  gap: 8px;

  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  cursor: pointer;
}

.radio-option +
.radio-option {
  margin-top: 6px;
}

.radio-option input,
.checkbox-grid input {
  margin-top: 3px;

  accent-color:
    var(--primary);
}

.radio-option strong,
.radio-option span,
.checkbox-grid strong,
.checkbox-grid span {
  display: block;
}

.radio-option strong,
.checkbox-grid strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.radio-option span,
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
    repeat(2, minmax(0, 1fr));

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

.export-modal-enter-active,
.export-modal-leave-active {
  transition:
    opacity 0.18s ease;
}

.export-modal-enter-from,
.export-modal-leave-to {
  opacity: 0;
}

@media (max-width: 650px) {
  .modal-overlay {
    padding: 12px;
  }

  .filter-summary,
  .format-grid,
  .checkbox-grid,
  .date-summary {
    grid-template-columns: 1fr;
  }

  .date-summary >
  div:last-child {
    text-align: left;
  }

  .date-arrow {
    transform: rotate(90deg);
  }

  .modal-footer {
    align-items: stretch;
    flex-direction: column-reverse;
  }
}
</style>