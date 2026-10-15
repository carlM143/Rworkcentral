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

interface TripTicketExportPayload {
  format: ExportFormat
  scope: ExportScope

  includeTicketInfo: boolean
  includeTripInfo: boolean
  includeEmployee: boolean
  includeClient: boolean
  includeRoute: boolean
  includeVehicle: boolean
  includeSchedule: boolean
  includeActualTimes: boolean
  includeStatus: boolean
}

const props =
  defineProps<{
    open: boolean
    recordCount: number
    client?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  }>()

const emit =
  defineEmits<{
    close: []

    export: [
      payload:
        TripTicketExportPayload,
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

const includeTicketInfo =
  ref(true)

const includeTripInfo =
  ref(true)

const includeEmployee =
  ref(true)

const includeClient =
  ref(true)

const includeRoute =
  ref(true)

const includeVehicle =
  ref(true)

const includeSchedule =
  ref(true)

const includeActualTimes =
  ref(true)

const includeStatus =
  ref(true)

/* =========================================================
   FORMAT OPTIONS
========================================================= */

const formats = [
  {
    value:
      'Excel' as const,

    label:
      'Excel',

    description:
      'Best for filtering, auditing and further trip ticket analysis.',

    icon:
      FileSpreadsheet,
  },

  {
    value:
      'PDF' as const,

    label:
      'PDF',

    description:
      'Best for printable trip ticket reports.',

    icon:
      FileText,
  },

  {
    value:
      'CSV' as const,

    label:
      'CSV',

    description:
      'Simple raw trip ticket data.',

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

  includeTicketInfo.value =
    true

  includeTripInfo.value =
    true

  includeEmployee.value =
    true

  includeClient.value =
    true

  includeRoute.value =
    true

  includeVehicle.value =
    true

  includeSchedule.value =
    true

  includeActualTimes.value =
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

      includeTicketInfo:
        includeTicketInfo.value,

      includeTripInfo:
        includeTripInfo.value,

      includeEmployee:
        includeEmployee.value,

      includeClient:
        includeClient.value,

      includeRoute:
        includeRoute.value,

      includeVehicle:
        includeVehicle.value,

      includeSchedule:
        includeSchedule.value,

      includeActualTimes:
        includeActualTimes.value,

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
                  Export Trip Tickets
                </h2>

                <p>
                  Export issued trip tickets, assigned employees, vehicles and trip information.
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
                  CLIENT
                </span>

                <strong>
                  {{
                    client ||
                    'All Clients'
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
                    Export tickets matching the current search, client, status and date filters.
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
                    Export trip tickets within the selected From and To dates.
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
                      includeTicketInfo
                    "
                    type="checkbox"
                  >

                  <div>

                    <strong>
                      Trip Ticket Information
                    </strong>

                    <span>
                      Ticket number and ticket identification details.
                    </span>

                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeTripInfo
                    "
                    type="checkbox"
                  >

                  <div>

                    <strong>
                      Trip Information
                    </strong>

                    <span>
                      Related trip number and trip reference.
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
                      Employee / Driver
                    </strong>

                    <span>
                      Employee number, name and department.
                    </span>

                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeClient
                    "
                    type="checkbox"
                  >

                  <div>

                    <strong>
                      Client Information
                    </strong>

                    <span>
                      Client assigned to the related trip.
                    </span>

                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeRoute
                    "
                    type="checkbox"
                  >

                  <div>

                    <strong>
                      Route / Destination
                    </strong>

                    <span>
                      Origin and destination information.
                    </span>

                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeVehicle
                    "
                    type="checkbox"
                  >

                  <div>

                    <strong>
                      Vehicle Information
                    </strong>

                    <span>
                      Vehicle model and plate number.
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
                      Trip Schedule
                    </strong>

                    <span>
                      Trip date and expected departure / return time.
                    </span>

                  </div>

                </label>

                <label>

                  <input
                    v-model="
                      includeActualTimes
                    "
                    type="checkbox"
                  >

                  <div>

                    <strong>
                      Actual Trip Times
                    </strong>

                    <span>
                      Actual departure and return timestamps.
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
                      Ticket Status
                    </strong>

                    <span>
                      Pending, issued, in use, completed or cancelled.
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

  max-width: 680px;

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

/* HEADER */

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
  margin:
    3px 0 0;

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

  flex-shrink: 0;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

/* BODY */

.modal-body {
  padding:
    16px 18px;
}

/* SUMMARY */

.filter-summary {
  display: grid;

  grid-template-columns:
    repeat(
      3,
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

.filter-summary div {
  min-width: 0;
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

/* DATE */

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

.date-summary >
div:last-child {
  text-align: right;
}

.date-arrow {
  color:
    var(--primary);

  font-size: 13px;
}

/* SECTION */

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

/* FORMAT */

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

/* RADIO + CHECKBOX */

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

/* FOOTER */

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
    1px solid var(--border);

  background:
    var(--bg-card);
}

/* TRANSITION */

.export-modal-enter-active,
.export-modal-leave-active {
  transition:
    opacity 0.18s ease;
}

.export-modal-enter-from,
.export-modal-leave-to {
  opacity: 0;
}

/* RESPONSIVE */

@media (max-width: 650px) {
  .modal-overlay {
    padding: 12px;
  }

  .filter-summary,
  .format-grid,
  .checkbox-grid,
  .date-summary {
    grid-template-columns:
      1fr;
  }

  .date-summary >
  div:last-child {
    text-align: left;
  }

  .date-arrow {
    transform:
      rotate(90deg);
  }

  .modal-footer {
    align-items: stretch;

    flex-direction:
      column-reverse;
  }
}
</style>