
<script setup lang="ts">
import {
  Download,
  LogIn,
  Upload,
} from 'lucide-vue-next'

import TimeLogExportModal from '~/components/timekeeping/time-logs/TimeLogExportModal.vue'
import TimeLogImportModal from '~/components/timekeeping/time-logs/TimeLogImportModal.vue'
import TimeLogFilters from '~/components/timekeeping/time-logs/TimeLogFilters.vue'

import type {
  AttendanceImportSummary,
} from '~/types/attendanceImport'

type TimeLogExportPayload = {
  format: 'Excel' | 'PDF' | 'CSV'
  scope: 'Current Filters' | 'Selected Date Range'
  includeEmployee: boolean
  includeAssignment: boolean
  includeSchedule: boolean
  includeTimeEntries: boolean
  includeBreaks: boolean
  includeIssues: boolean
  includeWorkedHours: boolean
  includeSource: boolean
  includeStatus: boolean
}

const {
  search,
  department,
  attendanceSource,
  status,
  dateFrom,
  dateTo,
  currentPage,
  filteredLogs,
  paginatedLogs,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  departments,
  attendanceSources,
  statusOptions,
  resetFilters,
} = useTimeLogs()

const router = useRouter()
const route = useRoute()

const { info } = useToast()

/* =========================================
   QUERY FILTERS
========================================= */

watch(
  () => route.query.employee,
  value => {
    if (typeof value === 'string' && value) {
      search.value = value
    }
  },
  { immediate: true },
)

watch(
  () => route.query.dateFrom,
  value => {
    if (typeof value === 'string' && value) {
      dateFrom.value = value
    }
  },
  { immediate: true },
)

watch(
  () => route.query.dateTo,
  value => {
    if (typeof value === 'string' && value) {
      dateTo.value = value
    }
  },
  { immediate: true },
)

/* =========================================
   MODALS
========================================= */

const exportOpen = ref(false)
const importOpen = ref(false)

/* =========================================
   EXPORT
========================================= */

const handleExport = () => {
  exportOpen.value = true
}

const handleExportSubmit = (
  payload: TimeLogExportPayload,
) => {
  exportOpen.value = false

  info(
    `Export ${payload.format}`,
    `${filteredLogs.value.length} time log record(s) ready for export. Backend integration will be added later.`,
  )
}

/* =========================================
   IMPORT ATTENDANCE
========================================= */

const handleImportAttendance = () => {
  importOpen.value = true
}

const handleImportComplete = (
  result: AttendanceImportSummary,
) => {
  importOpen.value = false

  if (result.imported > 0) {
    search.value = ''
    department.value = ''
    attendanceSource.value = ''
    status.value = ''

    dateFrom.value =
      result.earliestDate ?? dateFrom.value

    dateTo.value =
      result.latestDate ?? dateTo.value

    currentPage.value = 1
  }

  info(
    'Attendance Import Completed',
    `${result.imported} imported, ${result.duplicates} duplicates, ${result.invalid} invalid records.`,
  )
}

/* =========================================
   MANUAL TIME
========================================= */

const handleManualTimeLog = () => {
  router.push('/manual-time-in-out')
}
</script>

<template>
  <section class="time-logs-page">

    <PageHeader
      title="Time Logs"
      description="Review employee attendance, biometric records, work schedules, late minutes, undertime and worked hours."
    >
      <div class="header-actions">

        <AppButton
          variant="secondary"
          :icon="Upload"
          @click="handleImportAttendance"
        >
          Import Attendance
        </AppButton>

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

      </div>
    </PageHeader>

    <!-- STATS -->

    <TimeLogStats :stats="stats" />

    <!-- FILTERS -->

    <TimeLogFilters
      v-model:search="search"
      v-model:department="department"
      v-model:attendance-source="attendanceSource"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departments"
      :attendance-sources="attendanceSources"
      :status-options="statusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE -->

    <TimeLogTable
      :logs="paginatedLogs"
    />

    <!-- PAGINATION -->

    <div class="table-footer">

      <p>
        Showing
        <strong>
          {{ showingFrom }}–{{ showingTo }}
        </strong>
        of
        <strong>
          {{ filteredLogs.length }}
        </strong>
        time logs
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

    <!-- EXPORT MODAL -->

    <TimeLogExportModal
      :open="exportOpen"
      :record-count="filteredLogs.length"
      :department="department"
      :attendance-source="attendanceSource"
      :status="status"
      :date-from="dateFrom"
      :date-to="dateTo"
      @close="exportOpen = false"
      @export="handleExportSubmit"
    />

    <!-- IMPORT MODAL -->

    <TimeLogImportModal
      :open="importOpen"
      @close="importOpen = false"
      @imported="handleImportComplete"
    />

  </section>
</template>

<style scoped>
.time-logs-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 13px 3px 0;
}

.table-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-footer strong {
  color: var(--text-primary);
  font-weight: 600;
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
