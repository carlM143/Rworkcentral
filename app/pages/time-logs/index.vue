<script setup lang="ts">
import {
  Download,
  LogIn,
} from 'lucide-vue-next'

import TimeLogExportModal from '~/components/timekeeping/time-logs/TimeLogExportModal.vue'

const {
  search,
  department,
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
  statusOptions,

  resetFilters,
} = useTimeLogs()

const router =
  useRouter()

const {
  info,
} = useToast()

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
      | 'Selected Date Range'

    includeEmployee:
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

    includeStatus:
      boolean
  },
) => {
  info(
    `Export ${payload.format}`,
    `${filteredLogs.value.length} time log record(s) are ready for export. Actual file generation will be connected during backend integration.`,
  )
}

const handleManualTimeLog =
  () => {
    router.push(
      '/manual-time-in-out',
    )
  }
</script>

<template>
  <section class="time-logs-page">

    <PageHeader
      title="Time Logs"
      description="Review detailed employee attendance, time entries, late, undertime and missing logs."
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

    <TimeLogStats
      :stats="stats"
    />

    <TimeLogFilters
      v-model:search="search"
      v-model:department="department"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departments"
      :status-options="statusOptions"
      @reset="resetFilters"
    />

    <TimeLogTable
      :logs="paginatedLogs"
    />

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

      <TimeLogExportModal
        :open="
          exportOpen
        "
        :record-count="
          filteredLogs.length
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
  </section>
</template>

<style scoped>
.time-logs-page {
  width: 100%;
  max-width: 1660px;

  margin: 0 auto;
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
  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>