
<script setup lang="ts">
import {
  Download,
  Upload,
  LogIn,
  RefreshCw,
} from 'lucide-vue-next'

import TimeLogImportModal from '~/components/admin/timekeeping/TimeLogImportModal.vue'

import type {
  AttendanceImportSummary,
} from '~/types/attendanceImport'

definePageMeta({
  layout: 'admin',
})

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

  loading,
  error,
  fetchTimeLogs,
  resetFilters,
} = useTimeLogs()

const router = useRouter()

const { info } = useToast()

const showImportModal = ref(false)

// =====================================================
// INITIAL API FETCH
// =====================================================

onMounted(async () => {
  await fetchTimeLogs()
})

// =====================================================
// REFRESH
// =====================================================

const handleRefresh = async () => {
  await fetchTimeLogs()

  if (!error.value) {
    info(
      'Time Logs Updated',
      'Employee attendance records refreshed successfully.',
    )
  }
}

// =====================================================
// CSV EXPORT
// =====================================================

const escapeCsv = (value: unknown): string => {
  const text = String(value ?? '')

  // Prevent spreadsheet formula execution.
  const safeText = /^[\s]*[=+\-@]/.test(text)
    ? `'${text}`
    : text

  return `"${safeText.replace(/"/g, '""')}"`
}

const handleExport = () => {
  const logs = filteredLogs.value

  if (!logs.length) {
    info(
      'No Records',
      'There are no time logs available to export.',
    )
    return
  }

  const headers = [
    'Employee ID',
    'Employee Name',
    'Department',
    'Date',
    'Schedule',
    'Time In',
    'Break Out',
    'Break In',
    'Time Out',
    'Late Minutes',
    'Undertime Minutes',
    'Hours Worked',
    'Status',
  ]

  const rows = logs.map(log => [
    log.employeeNumber,
    log.employeeName,
    log.department,
    log.date,
    log.schedule,
    log.timeIn ?? '',
    log.breakOut ?? '',
    log.breakIn ?? '',
    log.timeOut ?? '',
    log.lateMinutes,
    log.undertimeMinutes,
    log.hoursWorked ?? '',
    log.status,
  ])

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row =>
      row.map(escapeCsv).join(','),
    ),
  ].join('\r\n')

  const blob = new Blob(
    ['\uFEFF', csvContent],
    {
      type: 'text/csv;charset=utf-8;',
    },
  )

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'time-logs.csv'

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)

  info(
    'Export Completed',
    `${logs.length} time log records exported successfully.`,
  )
}

// =====================================================
// IMPORT
// =====================================================

const handleImport = () => {
  showImportModal.value = true
}

const closeImportModal = () => {
  showImportModal.value = false
}

const handleImportSuccess = async (
  result: AttendanceImportSummary,
) => {
  await fetchTimeLogs()

  if (error.value) {
    info(
      'Attendance Imported',
      'Import completed, but the table could not be refreshed.',
    )
    return
  }

  info(
    'Attendance Import Completed',
    `${result.imported} new records imported. The time logs table has been refreshed.`,
  )
}

// =====================================================
// MANUAL TIME LOG
// =====================================================

const handleManualTimeLog = () => {
  router.push('/admin/manual-time-in-out')
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
          :icon="RefreshCw"
          :disabled="loading"
          @click="handleRefresh"
        >
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </AppButton>

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

    <!-- API ERROR -->
    <div
      v-if="error"
      class="api-error"
    >
      <div>
        <strong>Unable to load Time Logs</strong>
        <p>{{ error }}</p>
      </div>

      <AppButton
        variant="secondary"
        :icon="RefreshCw"
        @click="handleRefresh"
      >
        Retry
      </AppButton>
    </div>

    <!-- STATISTICS -->
    <TimeLogStats :stats="stats" />

    <!-- FILTERS -->
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

    <!-- LOADING -->
    <div
      v-if="loading"
      class="loading-state"
    >
      <RefreshCw
        :size="19"
        class="loading-spinner"
      />

      <span>Loading employee time logs...</span>
    </div>

    <!-- EXISTING TABLE -->
    <TimeLogTable
      v-else
      :logs="paginatedLogs"
    />

    <!-- PAGINATION -->
    <BaseTableFooter
        v-model="currentPage"
        :showing-from="showingFrom"
        :showing-to="showingTo"
        :total-items="filteredLogs.length"
        :total-pages="totalPages"
        item-label="time logs"
      />

    <!-- IMPORT MODAL -->
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.api-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  margin-bottom: 14px;
  padding: 14px 16px;

  border: 1px solid var(--red);
  border-radius: 10px;

  background: var(--red-soft);
  color: var(--red);
}

.api-error strong {
  font-size: 12px;
}

.api-error p {
  margin: 5px 0 0;
  font-size: 11px;
}

.loading-state {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  gap: 10px;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);
  color: var(--text-secondary);

  font-size: 12px;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

  .api-error {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
