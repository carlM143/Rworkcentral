<script setup lang="ts">
import {
  Download,
  LogIn,
} from 'lucide-vue-next'

import TimeLogExportModal from '~/components/timekeeping/time-logs/TimeLogExportModal.vue'

type TimeLogExportPayload = {
  format:
    | 'Excel'
    | 'PDF'
    | 'CSV'

  scope:
    | 'Current Filters'
    | 'Selected Date Range'

  includeEmployee:
    boolean

  includeAssignment:
    boolean

  includeSchedule:
    boolean

  includeTimeEntries:
    boolean

  includeBreaks:
    boolean

  includeIssues:
    boolean

  includeWorkedHours:
    boolean

  includeSource:
    boolean

  includeStatus:
    boolean
}

const {
  search,

  workScope,
  client,
  workLocation,

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
  scopeCounts,

  departments,
  clients,
  workLocations,
  attendanceSources,
  statusOptions,

  resetFilters,
} = useTimeLogs()

const router =
  useRouter()

const route =
  useRoute()

const {
  info,
} = useToast()

/* =========================================================
   QUERY FILTERS
========================================================= */

/*
Allows other modules such as Payroll
to redirect here already filtered
by employee/date.
*/

watch(
  () =>
    route.query.employee,
  value => {
    if (
      typeof value ===
        'string' &&
      value
    ) {
      search.value =
        value
    }
  },
  {
    immediate:
      true,
  },
)

watch(
  () =>
    route.query.dateFrom,
  value => {
    if (
      typeof value ===
        'string' &&
      value
    ) {
      dateFrom.value =
        value
    }
  },
  {
    immediate:
      true,
  },
)

watch(
  () =>
    route.query.dateTo,
  value => {
    if (
      typeof value ===
        'string' &&
      value
    ) {
      dateTo.value =
        value
    }
  },
  {
    immediate:
      true,
  },
)

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
  payload:
    TimeLogExportPayload,
) => {
  info(
    `Export ${payload.format}`,
    `${filteredLogs.value.length} time log record(s) are ready for export. Actual file generation will be connected during backend integration.`,
  )
}

/* =========================================================
   MANUAL TIME
========================================================= */

const handleManualTimeLog =
  () => {
    router.push(
      '/manual-time-in-out',
    )
  }
</script>

<template>
  <section class="time-logs-page">

    <!-- HEADER -->

    <PageHeader
      title="Time Logs"
      description="Review centralized attendance records for internal and client-assigned RWorkCentral employees."
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
          :icon="LogIn"
          @click="
            handleManualTimeLog
          "
        >
          Manual Time In / Out
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <TimeLogStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <TimeLogFilters
      v-model:search="
        search
      "
      v-model:work-scope="
        workScope
      "
      v-model:client="
        client
      "
      v-model:work-location="
        workLocation
      "
      v-model:department="
        department
      "
      v-model:attendance-source="
        attendanceSource
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
      :departments="
        departments
      "
      :clients="
        clients
      "
      :work-locations="
        workLocations
      "
      :attendance-sources="
        attendanceSources
      "
      :status-options="
        statusOptions
      "
      :scope-counts="
        scopeCounts
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <TimeLogTable
      :logs="
        paginatedLogs
      "
    />

    <!-- PAGINATION -->

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
            filteredLogs.length
          }}
        </strong>

        time logs
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

    <!-- EXPORT MODAL -->

    <TimeLogExportModal
      :open="
        exportOpen
      "
      :record-count="
        filteredLogs.length
      "
      :work-scope="
        workScope
      "
      :client="
        client
      "
      :work-location="
        workLocation
      "
      :department="
        department
      "
      :attendance-source="
        attendanceSource
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
        exportOpen =
          false
      "
      @export="
        handleExportSubmit
      "
    />

  </section>
</template>

<style scoped>
.time-logs-page {
  width: 100%;

  max-width: 1660px;

  margin:
    0 auto;
}

.header-actions {
  display: flex;

  align-items: center;

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

  font-weight: 600;
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;

    align-items: stretch;

    flex-direction: column;
  }

  .table-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>