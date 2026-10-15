<script setup lang="ts">
import {
  AlertTriangle,
  CalendarClock,
  Clock3,
  Download,
  FilePenLine,
  LogIn,
  TimerReset,
  UserX,
} from 'lucide-vue-next'

import TimekeepingExportModal from '~/components/timekeeping/overview/TimekeepingExportModal.vue'
import AttendanceDetailsModal from '~/components/timekeeping/overview/AttendanceDetailsModal.vue'
import AttendanceIssueModal from '~/components/timekeeping/overview/AttendanceIssueModal.vue'

import type {
  AttendanceRecord,
} from '~/types/timekeeping'

type AttendanceIssueType =
  | 'missing-time-out'
  | 'late'
  | 'absent'

const router =
  useRouter()

const {
  search,
  department,
  status,
  date,

  currentPage,

  paginatedRecords,
  filteredRecords,

  totalPages,

  showingFrom,
  showingTo,

  stats,
  issues,

  departments,
  statusOptions,

  resetFilters,
} = useTimekeeping()

const {
  info,
} = useToast()

/* =========================================================
   MODALS
========================================================= */

const exportModalOpen =
  ref(false)

const attendanceModalOpen =
  ref(false)

const issueModalOpen =
  ref(false)

const selectedRecord =
  ref<AttendanceRecord | null>(
    null,
  )

const activeIssueType =
  ref<AttendanceIssueType>(
    'missing-time-out',
  )

/* =========================================================
   DATE LABEL
========================================================= */

const formattedSelectedDate =
  computed(() => {
    if (!date.value) {
      return ''
    }

    return new Intl.DateTimeFormat(
      'en-US',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    ).format(
      new Date(
        `${date.value}T00:00:00`,
      ),
    )
  })

/* =========================================================
   ISSUE RECORDS
========================================================= */

const activeIssueRecords =
  computed(() => {
    if (
      activeIssueType.value ===
      'missing-time-out'
    ) {
      return filteredRecords.value.filter(
        record =>
          Boolean(
            record.timeIn,
          ) &&
          !record.timeOut &&
          record.status !==
            'Absent',
      )
    }

    if (
      activeIssueType.value ===
      'late'
    ) {
      return filteredRecords.value.filter(
        record =>
          record.lateMinutes >
            0 ||
          record.status ===
            'Late',
      )
    }

    return filteredRecords.value.filter(
      record =>
        record.status ===
        'Absent',
    )
  })

/* =========================================================
   HEADER ACTIONS
========================================================= */

const handleExport = () => {
  exportModalOpen.value =
    true
}

const handleManualTimeLog =
  async () => {
    await router.push(
      '/manual-time-in-out',
    )
  }

/* =========================================================
   QUICK ACTIONS
========================================================= */

const handleCorrection =
  async () => {
    await router.push(
      '/timekeeping/time-log-correction-requests',
    )
  }

const handleSchedules =
  async () => {
    await router.push(
      '/timekeeping/work-schedules',
    )
  }

/* =========================================================
   ATTENDANCE DETAILS
========================================================= */

const handleViewAttendance = (
  record: AttendanceRecord,
) => {
  selectedRecord.value =
    record

  attendanceModalOpen.value =
    true
}

const handleViewTimeLogs =
  async (
    record:
      AttendanceRecord,
  ) => {
    await router.push({
      path:
        '/time-logs',

      query: {
        employee:
          record.employeeNumber,

        date:
          record.date,
      },
    })
  }

const handleAttendanceCorrection =
  async (
    record:
      AttendanceRecord,
  ) => {
    await router.push({
      path:
        '/timekeeping/time-log-correction-requests',

      query: {
        employee:
          record.employeeNumber,

        date:
          record.date,
      },
    })
  }

/* =========================================================
   ATTENDANCE ISSUES
========================================================= */

const handleOpenIssue = (
  type:
    AttendanceIssueType,
) => {
  activeIssueType.value =
    type

  issueModalOpen.value =
    true
}

const handleIssueReview =
  async (
    type:
      AttendanceIssueType,
  ) => {
    if (
      type ===
      'late'
    ) {
      await router.push(
        '/late-adjustment',
      )

      return
    }

    if (
      type ===
      'missing-time-out'
    ) {
      await router.push(
        '/timekeeping/time-log-correction-requests',
      )

      return
    }

    await router.push(
      '/time-logs',
    )
  }

/* =========================================================
   EXPORT PREVIEW
========================================================= */

const handleExportConfirm = (
  payload: {
    format:
      'Excel' |
      'PDF' |
      'CSV'

    scope:
      'Current Filters' |
      'Selected Date'

    includeSummary:
      boolean

    includeIssues:
      boolean
  },
) => {
  info(
    `Export ${payload.format}`,
    `${payload.scope} attendance export is ready for backend integration.`,
  )
}
</script>

<template>
  <section class="timekeeping-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <PageHeader
      title="Timekeeping"
      description="Monitor daily attendance, employee time logs, late records and attendance issues."
    >

      <AppButton
        variant="secondary"
        :icon="Download"
        @click="handleExport"
      >
        Export
      </AppButton>

      <AppButton
        :icon="LogIn"
        @click="handleManualTimeLog"
      >
        Manual Time In / Out
      </AppButton>

    </PageHeader>

    <!-- =====================================================
         DATE
    ====================================================== -->

    <div class="date-heading">

      <CalendarClock
        :size="15"
      />

      <span>
        {{ formattedSelectedDate }}
      </span>

    </div>

    <!-- =====================================================
         STATS
    ====================================================== -->

    <TimekeepingStats
      :stats="stats"
    />

    <!-- =====================================================
         FILTERS
    ====================================================== -->

    <TimekeepingFilters
      v-model:search="search"
      v-model:department="department"
      v-model:status="status"
      v-model:date="date"
      :departments="departments"
      :status-options="statusOptions"
      @reset="resetFilters"
    />

    <!-- =====================================================
         MAIN GRID
    ====================================================== -->

    <div class="timekeeping-layout">

      <!-- ===================================================
           LEFT
      ==================================================== -->

      <div class="attendance-section">

        <AttendanceTable
          :records="paginatedRecords"
          @view="handleViewAttendance"
        />

        <div class="table-footer">

          <p>
            Showing

            <strong>
              {{ showingFrom }}–{{ showingTo }}
            </strong>

            of

            <strong>
              {{ filteredRecords.length }}
            </strong>

            attendance records
          </p>

          <AppPagination
            v-model="currentPage"
            :total-pages="totalPages"
          />

        </div>

      </div>

      <!-- ===================================================
           RIGHT SIDEBAR
      ==================================================== -->

      <aside class="timekeeping-sidebar">

        <!-- ===============================================
             ATTENDANCE ISSUES
        ================================================ -->

        <article class="dashboard-card">

          <div class="card-heading">

            <div class="card-icon orange">

              <AlertTriangle
                :size="17"
              />

            </div>

            <div>

              <h3>
                Attendance Issues
              </h3>

              <p>
                Records requiring review.
              </p>

            </div>

          </div>

          <div class="issue-list">

            <!-- MISSING TIME OUT -->

            <button
              type="button"
              class="issue-row"
              @click="
                handleOpenIssue(
                  'missing-time-out',
                )
              "
            >

              <div>

                <Clock3
                  :size="14"
                />

                <span>
                  Missing Time Out
                </span>

              </div>

              <strong>
                {{ issues.missingTimeOut }}
              </strong>

            </button>

            <!-- LATE -->

            <button
              type="button"
              class="issue-row"
              @click="
                handleOpenIssue(
                  'late',
                )
              "
            >

              <div>

                <TimerReset
                  :size="14"
                />

                <span>
                  Late Records
                </span>

              </div>

              <strong class="orange">
                {{ issues.late }}
              </strong>

            </button>

            <!-- ABSENT -->

            <button
              type="button"
              class="issue-row"
              @click="
                handleOpenIssue(
                  'absent',
                )
              "
            >

              <div>

                <UserX
                  :size="14"
                />

                <span>
                  Absences
                </span>

              </div>

              <strong class="danger">
                {{ issues.absent }}
              </strong>

            </button>

          </div>

        </article>

        <!-- ===============================================
             QUICK ACTIONS
        ================================================ -->

        <article class="dashboard-card">

          <div class="card-heading">

            <div class="card-icon blue">

              <Clock3
                :size="17"
              />

            </div>

            <div>

              <h3>
                Quick Actions
              </h3>

              <p>
                Common timekeeping actions.
              </p>

            </div>

          </div>

          <div class="quick-actions">

            <button
              type="button"
              @click="
                handleManualTimeLog
              "
            >

              <LogIn
                :size="15"
              />

              <span>
                Manual Time In / Out
              </span>

            </button>

            <button
              type="button"
              @click="
                handleCorrection
              "
            >

              <FilePenLine
                :size="15"
              />

              <span>
                File Time Correction
              </span>

            </button>

            <button
              type="button"
              @click="
                handleSchedules
              "
            >

              <CalendarClock
                :size="15"
              />

              <span>
                View Work Schedules
              </span>

            </button>

          </div>

        </article>

      </aside>

    </div>

    <!-- =====================================================
         EXPORT MODAL
    ====================================================== -->

    <TimekeepingExportModal
      :open="exportModalOpen"
      :selected-date="date"
      :department="department"
      :status="status"
      :record-count="filteredRecords.length"
      @close="
        exportModalOpen = false
      "
      @export="
        handleExportConfirm
      "
    />

    <!-- =====================================================
         ATTENDANCE DETAILS
    ====================================================== -->

    <AttendanceDetailsModal
      :open="attendanceModalOpen"
      :record="selectedRecord"
      @close="
        attendanceModalOpen = false
      "
      @view-logs="
        handleViewTimeLogs
      "
      @correction="
        handleAttendanceCorrection
      "
    />

    <!-- =====================================================
         ISSUE MODAL
    ====================================================== -->

    <AttendanceIssueModal
      :open="issueModalOpen"
      :issue-type="activeIssueType"
      :records="activeIssueRecords"
      @close="
        issueModalOpen = false
      "
      @review="
        handleIssueReview
      "
    />

  </section>
</template>

<style scoped>
.timekeeping-page {
  width: 100%;
  max-width: 1660px;

  margin: 0 auto;
}

/* =========================================================
   DATE
========================================================= */

.date-heading {
  display: flex;

  align-items: center;

  gap: 7px;

  margin:
    -8px 0 14px;

  color:
    var(--text-secondary);

  font-size: 10px;
  font-weight: 600;
}

/* =========================================================
   LAYOUT
========================================================= */

.timekeeping-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    280px;

  gap: 12px;
}

.attendance-section {
  min-width: 0;
}

.timekeeping-sidebar {
  display: flex;

  flex-direction: column;

  gap: 12px;
}

/* =========================================================
   SIDEBAR CARDS
========================================================= */

.dashboard-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.card-heading {
  display: flex;

  align-items: center;

  gap: 9px;

  padding:
    12px 13px;

  border-bottom:
    1px solid var(--border-soft);
}

.card-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.card-icon.orange {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.card-icon.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.card-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 700;
}

.card-heading p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 7px;
}

/* =========================================================
   ATTENDANCE ISSUES
========================================================= */

.issue-list {
  padding:
    5px 13px 10px;
}

.issue-row {
  display: flex;

  width: 100%;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding:
    10px 0;

  border: 0;

  border-bottom:
    1px solid var(--border-soft);

  background:
    transparent;

  color:
    inherit;

  font-family: inherit;

  text-align: left;

  cursor: pointer;
}

.issue-row:last-child {
  border-bottom: 0;
}

.issue-row:hover {
  color:
    var(--primary);
}

.issue-row > div {
  display: flex;

  align-items: center;

  gap: 7px;

  color:
    var(--text-secondary);
}

.issue-row:hover > div {
  color:
    var(--primary);
}

.issue-row span {
  font-size: 8px;
}

.issue-row strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.issue-row strong.orange {
  color:
    var(--orange);
}

.issue-row strong.danger {
  color:
    var(--red);
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

.quick-actions {
  padding: 7px;
}

.quick-actions button {
  display: flex;

  width: 100%;
  min-height: 38px;

  align-items: center;

  gap: 9px;

  padding:
    0 9px;

  border: 0;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  font-family: inherit;

  font-size: 8px;

  text-align: left;

  cursor: pointer;
}

.quick-actions button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

/* =========================================================
   TABLE FOOTER
========================================================= */

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

  font-weight: 600;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {
  .timekeeping-layout {
    grid-template-columns:
      1fr;
  }

  .timekeeping-sidebar {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 650px) {
  .timekeeping-sidebar {
    grid-template-columns:
      1fr;
  }

  .table-footer {
    flex-direction:
      column;

    align-items:
      flex-start;
  }
}
</style>