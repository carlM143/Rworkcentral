<script setup lang="ts">
import {
  Download,
  Upload,
  LogIn,
} from 'lucide-vue-next'

import TimeLogImportModal from '~/components/admin/timekeeping/TimeLogImportModal.vue'

import type {
  AttendanceImportSummary,
} from '~/types/attendanceImport'

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

const handleExport = () => {
  info(
    'Export Time Logs',
    'Time log export will be connected later.',
  )
}

const showImportModal = ref(false)

const handleImport = () => {
  showImportModal.value = true
}

const closeImportModal = () => {
  showImportModal.value = false
}

const handleImportSuccess = (result: AttendanceImportSummary) => {
  closeImportModal()

  info(
    'Attendance Import Completed',
    `${result.imported} records imported, ${result.duplicates} duplicates, ${result.invalid} invalid records.`,
  )
}

const handleManualTimeLog =
  () => {
    router.push(
      '/admin/manual-time-in-out',
    )
  }
</script>

<template>
  <section class="time-logs-page">

    <PageHeader
      title="Time Logs"
      description="Review detailed employee attendance, time entries, late, undertime and missing logs."
    >
      <div class="header-actions">

      <AppButton
        variant="secondary"
        :icon="Upload"
        @click="handleImport"
      >
        Import
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

      <TimeLogImportModal
          :open="showImportModal"
          @close="closeImportModal"
          @imported="handleImportSuccess"
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>