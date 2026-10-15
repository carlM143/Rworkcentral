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

interface ExportPayload {
  format: ExportFormat
  scope: ExportScope

  includeEmployeeInfo: boolean
  includeLogs: boolean
  includeReason: boolean
  includeApproval: boolean
  includeAttachment: boolean
}

const props =
  defineProps<{
    open: boolean

    recordCount: number

    department?: string
    status?: string
    correctionType?: string

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

const includeEmployeeInfo =
  ref(true)

const includeLogs =
  ref(true)

const includeReason =
  ref(true)

const includeApproval =
  ref(true)

const includeAttachment =
  ref(true)

/* =========================================================
   OPTIONS
========================================================= */

const formats = [
  {
    value:
      'Excel' as const,

    label:
      'Excel',

    description:
      'Best for filtering, sorting and further analysis.',

    icon:
      FileSpreadsheet,
  },
  {
    value:
      'PDF' as const,

    label:
      'PDF',

    description:
      'Best for printing and formal reports.',

    icon:
      FileText,
  },
  {
    value:
      'CSV' as const,

    label:
      'CSV',

    description:
      'Simple raw correction request data.',

    icon:
      Table2,
  },
]

/* =========================================================
   DATE
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

  includeEmployeeInfo.value =
    true

  includeLogs.value =
    true

  includeReason.value =
    true

  includeApproval.value =
    true

  includeAttachment.value =
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
   SUBMIT
========================================================= */

const handleExport = () => {
  emit(
    'export',
    {
      format:
        format.value,

      scope:
        scope.value,

      includeEmployeeInfo:
        includeEmployeeInfo.value,

      includeLogs:
        includeLogs.value,

      includeReason:
        includeReason.value,

      includeApproval:
        includeApproval.value,

      includeAttachment:
        includeAttachment.value,
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

        <article class="export-modal-card">

          <!-- =================================================
               HEADER
          ================================================== -->

          <header class="modal-header">

            <div class="header-main">

              <div class="header-icon">

                <Download
                  :size="18"
                />

              </div>

              <div>

                <h2>
                  Export Correction Requests
                </h2>

                <p>
                  Export filtered time log correction request records.
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

          <!-- =================================================
               BODY
          ================================================== -->

          <div class="modal-body">

            <!-- CURRENT FILTERS -->

            <section class="filter-summary">

              <div class="summary-item">

                <span>
                  RECORDS
                </span>

                <strong>
                  {{ recordCount }}
                </strong>

              </div>

              <div class="summary-item">

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

              <div class="summary-item">

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

              <div class="summary-item">

                <span>
                  TYPE
                </span>

                <strong>
                  {{
                    correctionType ||
                    'All Types'
                  }}
                </strong>

              </div>

            </section>

            <!-- DATE RANGE -->

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

            <!-- EXPORT FORMAT -->

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

            <!-- EXPORT SCOPE -->

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
                    Export only records matching the current department, status, correction type and date filters.
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
                    Export correction requests within the selected From and To dates.
                  </span>

                </div>

              </label>

            </section>

            <!-- INCLUDE FIELDS -->

            <section class="form-section">

              <div class="section-title">
                Include in Report
              </div>

              <div class="checkbox-list">

                <label>

                  <input
                    v-model="
                      includeEmployeeInfo
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
                      includeLogs
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Original & Requested Logs
                    </strong>

                    <span>
                      Original attendance logs and requested corrected logs.
                    </span>
                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeReason
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Correction Reason
                    </strong>

                    <span>
                      Reason submitted for each correction request.
                    </span>
                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeApproval
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Approval Information
                    </strong>

                    <span>
                      Pending, approved and rejected status information.
                    </span>
                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeAttachment
                    "
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Attachment Information
                    </strong>

                    <span>
                      Indicate whether supporting evidence was attached.
                    </span>
                  </div>

                </label>

              </div>

            </section>

          </div>

          <!-- =================================================
               FOOTER
          ================================================== -->

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

.export-modal-card {
  width: 100%;

  max-width: 650px;

  max-height:
    calc(100vh - 44px);

  overflow-y: auto;

  border:
    1px solid
    var(--border);

  border-radius:
    14px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px
    rgba(0, 0, 0, 0.3);
}

/* =========================================================
   HEADER
========================================================= */

.modal-header {
  position: sticky;

  z-index: 5;

  top: 0;

  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding:
    16px 18px;

  border-bottom:
    1px solid
    var(--border);

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

  border-radius:
    9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size:
    14px;
}

.modal-header p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size:
    8px;
}

.close-button {
  display: flex;

  width: 31px;
  height: 31px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border:
    1px solid
    var(--border);

  border-radius:
    7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.close-button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

/* =========================================================
   BODY
========================================================= */

.modal-body {
  padding:
    16px 18px;
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
    1px solid
    var(--border-soft);

  border-radius:
    8px;

  background:
    var(--bg-card-soft);
}

.summary-item {
  min-width: 0;
}

.summary-item span,
.summary-item strong {
  display: block;
}

.summary-item span {
  color:
    var(--text-muted);

  font-size:
    6.5px;

  font-weight: 700;
}

.summary-item strong {
  margin-top: 3px;

  overflow: hidden;

  color:
    var(--text-primary);

  font-size:
    8px;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}

/* DATE */

.date-summary {
  display: grid;

  grid-template-columns:
    1fr
    auto
    1fr;

  align-items: center;

  gap: 10px;

  margin-top: 8px;

  padding: 9px 10px;

  border-radius:
    8px;

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

  font-size:
    6.5px;

  font-weight: 700;
}

.date-summary strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size:
    8px;
}

.date-summary > div:last-child {
  text-align: right;
}

.date-arrow {
  color:
    var(--primary);

  font-size:
    13px;
}

/* =========================================================
   SECTION
========================================================= */

.form-section {
  margin-top: 16px;
}

.section-title {
  margin-bottom: 7px;

  color:
    var(--text-primary);

  font-size:
    9px;

  font-weight: 700;
}

/* =========================================================
   FORMAT
========================================================= */

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
    1px solid
    var(--border);

  border-radius:
    8px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  text-align: left;

  cursor: pointer;

  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.format-option:hover {
  border-color:
    var(--primary);
}

.format-option.active {
  border-color:
    var(--primary);

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

  border-radius:
    7px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.format-option strong {
  color:
    var(--text-primary);

  font-size:
    8.5px;
}

.format-option span {
  color:
    var(--text-muted);

  font-size:
    7px;

  line-height:
    1.45;
}

/* =========================================================
   RADIO
========================================================= */

.radio-option {
  display: flex;

  align-items: flex-start;

  gap: 8px;

  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius:
    7px;

  cursor: pointer;
}

.radio-option +
.radio-option {
  margin-top: 6px;
}

.radio-option input {
  margin-top: 3px;

  accent-color:
    var(--primary);
}

.radio-option strong,
.radio-option span {
  display: block;
}

.radio-option strong {
  color:
    var(--text-primary);

  font-size:
    8.5px;
}

.radio-option span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size:
    7.5px;

  line-height:
    1.45;
}

/* =========================================================
   CHECKBOX
========================================================= */

.checkbox-list {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 6px;
}

.checkbox-list label {
  display: flex;

  align-items: flex-start;

  gap: 7px;

  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius:
    7px;

  background:
    var(--bg-card-soft);

  cursor: pointer;
}

.checkbox-list input {
  margin-top: 3px;

  accent-color:
    var(--primary);
}

.checkbox-list strong,
.checkbox-list span {
  display: block;
}

.checkbox-list strong {
  color:
    var(--text-primary);

  font-size:
    8px;
}

.checkbox-list span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size:
    7px;

  line-height:
    1.4;
}

/* =========================================================
   FOOTER
========================================================= */

.modal-footer {
  position: sticky;

  z-index: 5;

  bottom: 0;

  display: flex;

  align-items: center;
  justify-content: flex-end;

  gap: 7px;

  padding:
    13px 18px;

  border-top:
    1px solid
    var(--border);

  background:
    var(--bg-card);
}

/* =========================================================
   TRANSITION
========================================================= */

.export-modal-enter-active,
.export-modal-leave-active {
  transition:
    opacity 0.18s ease;
}

.export-modal-enter-from,
.export-modal-leave-to {
  opacity: 0;
}

/* =========================================================
   MOBILE
========================================================= */

@media (
  max-width: 650px
) {
  .modal-overlay {
    padding: 12px;
  }

  .filter-summary,
  .format-grid,
  .checkbox-list {
    grid-template-columns:
      1fr;
  }

  .date-summary {
    grid-template-columns:
      1fr;
  }

  .date-summary > div:last-child {
    text-align: left;
  }

  .date-arrow {
    transform:
      rotate(90deg);
  }

  .modal-footer {
    align-items:
      stretch;

    flex-direction:
      column-reverse;
  }
}
</style>