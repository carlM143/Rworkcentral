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
  | 'Selected Date'

const props =
  defineProps<{
    open: boolean
    selectedDate: string
    department: string
    status: string
    recordCount: number
  }>()

const emit =
  defineEmits<{
    close: []
    export: [
      payload: {
        format: ExportFormat
        scope: ExportScope
        includeSummary: boolean
        includeIssues: boolean
      },
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

const includeSummary =
  ref(true)

const includeIssues =
  ref(true)

const formats = [
  {
    value: 'Excel',
    label: 'Excel',
    description:
      'Best for further analysis and filtering.',
    icon: FileSpreadsheet,
  },
  {
    value: 'PDF',
    label: 'PDF',
    description:
      'Best for printing and formal reports.',
    icon: FileText,
  },
  {
    value: 'CSV',
    label: 'CSV',
    description:
      'Simple raw attendance data.',
    icon: Table2,
  },
] as const

const formatDate = (
  value: string,
) => {
  if (!value) {
    return 'All Dates'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}

const handleSubmit = () => {
  emit(
    'export',
    {
      format:
        format.value,

      scope:
        scope.value,

      includeSummary:
        includeSummary.value,

      includeIssues:
        includeIssues.value,
    },
  )

  emit('close')
}

watch(
  () => props.open,
  value => {
    if (!value) {
      return
    }

    format.value =
      'Excel'

    scope.value =
      'Current Filters'

    includeSummary.value =
      true

    includeIssues.value =
      true
  },
)
</script>

<template>
  <Teleport to="body">

    <Transition name="modal-fade">

      <div
        v-if="open"
        class="modal-overlay"
        @click.self="emit('close')"
      >

        <div class="modal-card">

          <!-- HEADER -->

          <div class="modal-header">

            <div class="header-content">

              <div class="header-icon">
                <Download
                  :size="19"
                />
              </div>

              <div>

                <h2>
                  Export Attendance
                </h2>

                <p>
                  Configure the attendance report before export.
                </p>

              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="emit('close')"
            >
              <X :size="18" />
            </button>

          </div>

          <!-- BODY -->

          <div class="modal-body">

            <!-- CURRENT FILTERS -->

            <div class="report-context">

              <div class="context-item">

                <span>
                  DATE
                </span>

                <strong>
                  {{
                    formatDate(
                      selectedDate,
                    )
                  }}
                </strong>

              </div>

              <div class="context-item">

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

              <div class="context-item">

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

              <div class="context-item">

                <span>
                  RECORDS
                </span>

                <strong>
                  {{ recordCount }}
                </strong>

              </div>

            </div>

            <!-- FORMAT -->

            <div class="form-section">

              <label class="section-label">
                Export Format
              </label>

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

                  <div>

                    <strong>
                      {{ item.label }}
                    </strong>

                    <span>
                      {{ item.description }}
                    </span>

                  </div>

                </button>

              </div>

            </div>

            <!-- SCOPE -->

            <div class="form-section">

              <label class="section-label">
                Export Scope
              </label>

              <div class="radio-list">

                <label class="radio-option">

                  <input
                    v-model="scope"
                    type="radio"
                    value="Current Filters"
                  >

                  <div>

                    <strong>
                      Current Filters
                    </strong>

                    <span>
                      Export the records currently shown using the selected filters.
                    </span>

                  </div>

                </label>

                <label class="radio-option">

                  <input
                    v-model="scope"
                    type="radio"
                    value="Selected Date"
                  >

                  <div>

                    <strong>
                      Entire Selected Date
                    </strong>

                    <span>
                      Export all attendance records for the selected date.
                    </span>

                  </div>

                </label>

              </div>

            </div>

            <!-- OPTIONS -->

            <div class="form-section">

              <label class="section-label">
                Additional Information
              </label>

              <div class="check-list">

                <label>

                  <input
                    v-model="includeSummary"
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Include Attendance Summary
                    </strong>

                    <span>
                      Present, late, absent and employee totals.
                    </span>
                  </div>

                </label>

                <label>

                  <input
                    v-model="includeIssues"
                    type="checkbox"
                  >

                  <div>
                    <strong>
                      Include Attendance Issues
                    </strong>

                    <span>
                      Missing time-out, late and absence summary.
                    </span>
                  </div>

                </label>

              </div>

            </div>

          </div>

          <!-- FOOTER -->

          <div class="modal-footer">

            <AppButton
              variant="secondary"
              @click="emit('close')"
            >
              Cancel
            </AppButton>

            <AppButton
              :icon="Download"
              @click="handleSubmit"
            >
              Export {{ format }}
            </AppButton>

          </div>

        </div>

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

  padding: 24px;

  background:
    rgba(3, 10, 24, 0.7);

  backdrop-filter:
    blur(3px);
}

.modal-card {
  width: 100%;
  max-width: 650px;

  max-height:
    calc(100vh - 48px);

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
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 20px;

  padding:
    18px 19px;

  border-bottom:
    1px solid var(--border);
}

.header-content {
  display: flex;

  align-items: center;

  gap: 11px;
}

.header-icon {
  display: flex;

  width: 40px;
  height: 40px;

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

  font-size: 15px;
}

.modal-header p {
  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 9.5px;
}

.close-button {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-muted);

  cursor: pointer;
}

.close-button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

.modal-body {
  padding:
    18px 19px;
}

.report-context {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;

  padding: 11px;

  border:
    1px solid var(--border-soft);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.context-item span,
.context-item strong {
  display: block;
}

.context-item span {
  color:
    var(--text-muted);

  font-size: 7.5px;
  font-weight: 700;
}

.context-item strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 9px;

  word-break:
    break-word;
}

.form-section {
  margin-top: 18px;
}

.section-label {
  display: block;

  margin-bottom: 8px;

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 700;
}

.format-grid {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.format-option {
  display: flex;

  align-items: flex-start;

  gap: 8px;

  padding: 11px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  text-align: left;

  cursor: pointer;
}

.format-option:hover,
.format-option.active {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);
}

.format-icon {
  display: flex;

  width: 31px;
  height: 31px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

.format-option strong,
.format-option span {
  display: block;
}

.format-option strong {
  color:
    var(--text-primary);

  font-size: 9.5px;
}

.format-option span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;

  line-height: 1.45;
}

.radio-list,
.check-list {
  display: grid;

  gap: 7px;
}

.radio-option,
.check-list label {
  display: flex;

  align-items: flex-start;

  gap: 9px;

  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);

  cursor: pointer;
}

.radio-option input,
.check-list input {
  margin-top: 3px;

  accent-color:
    var(--primary);
}

.radio-option strong,
.radio-option span,
.check-list strong,
.check-list span {
  display: block;
}

.radio-option strong,
.check-list strong {
  color:
    var(--text-primary);

  font-size: 9.5px;
}

.radio-option span,
.check-list span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 8.5px;
}

.modal-footer {
  display: flex;

  align-items: center;
  justify-content: flex-end;

  gap: 8px;

  padding:
    14px 19px;

  border-top:
    1px solid var(--border);

  background:
    var(--bg-card-soft);
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

  .report-context,
  .format-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction: column-reverse;
  }
}
</style>