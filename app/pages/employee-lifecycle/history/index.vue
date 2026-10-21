
<script setup lang="ts">
import {
  Download,
  FileSpreadsheet,
  FileText,
  History,
  Table2,
  X,
} from 'lucide-vue-next'

import type {
  LifecycleHistoryRecord,
} from '~/types/lifecycleHistory'

import LifecycleHistoryStats from '~/components/employee-lifecycle/history/LifecycleHistoryStats.vue'
import LifecycleHistoryFilters from '~/components/employee-lifecycle/history/LifecycleHistoryFilters.vue'
import LifecycleHistoryTable from '~/components/employee-lifecycle/history/LifecycleHistoryTable.vue'
import LifecycleHistoryModal from '~/components/employee-lifecycle/history/LifecycleHistoryModal.vue'

const {
  records,
  search,
  eventType,
  department,
  status,
  dateFrom,
  dateTo,
  currentPage,
  filteredRecords,
  paginatedRecords,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  eventTypeOptions,
  departmentOptions,
  statusOptions,
  resetFilters,
} = useLifecycleHistory()

const {
  success,
  warning,
} = useToast()

/* =========================================
   MODAL STATE
========================================= */

type HistoryModal = 'details' | 'timeline' | null
type ExportFormat = 'excel' | 'pdf' | 'csv'

const historyModal = ref<HistoryModal>(null)
const selectedRecord = ref<LifecycleHistoryRecord | null>(null)
const selectedEmployeeId = ref<number | null>(null)

const exportOpen = ref(false)
const exportFormat = ref<ExportFormat>('excel')

const exportScope = ref<'filtered' | 'all'>('filtered')

const exportRecords = computed(() => {
  return exportScope.value === 'all'
    ? records.value
    : filteredRecords.value
})

/* =========================================
   HISTORY ACTIONS
========================================= */

const handleView = (record: LifecycleHistoryRecord) => {
  selectedRecord.value = record
  historyModal.value = 'details'
}

const handleTimeline = (
  record?: LifecycleHistoryRecord,
) => {
  selectedRecord.value = record ?? null
  selectedEmployeeId.value = record?.employeeId ?? null
  historyModal.value = 'timeline'
}

const closeHistoryModal = () => {
  historyModal.value = null
  selectedRecord.value = null
}

const handleCopy = async (record: LifecycleHistoryRecord) => {
  try {
    await navigator.clipboard.writeText(
      record.referenceNumber,
    )

    success(
      'Reference Copied',
      `${record.referenceNumber} copied to clipboard.`,
    )
  } catch {
    warning(
      'Copy Failed',
      'Unable to copy the reference number.',
    )
  }
}

/* =========================================
   EXPORT HELPERS
========================================= */

const columns: {
  label: string
  key: keyof LifecycleHistoryRecord
}[] = [
  { label: 'Reference', key: 'referenceNumber' },
  { label: 'Employee Number', key: 'employeeNumber' },
  { label: 'Employee Name', key: 'employeeName' },
  { label: 'Department', key: 'department' },
  { label: 'Position', key: 'position' },
  { label: 'Event Type', key: 'eventType' },
  { label: 'Event Title', key: 'eventTitle' },
  { label: 'Previous Value', key: 'previousValue' },
  { label: 'New Value', key: 'newValue' },
  { label: 'Effective Date', key: 'effectiveDate' },
  { label: 'Processed By', key: 'processedBy' },
  { label: 'Approved By', key: 'approvedBy' },
  { label: 'Status', key: 'status' },
  { label: 'Description', key: 'description' },
  { label: 'Remarks', key: 'remarks' },
  { label: 'Recorded At', key: 'createdAt' },
]

const getCellValue = (
  record: LifecycleHistoryRecord,
  key: keyof LifecycleHistoryRecord,
) => {
  const value = record[key]

  return value == null ? '' : String(value)
}

const escapeCsv = (value: string) => {
  // Prevent spreadsheet formula execution.
  const safe = /^[\s]*[=+\-@\t\r]/.test(value)
    ? `'${value}`
    : value

  return `"${safe.replace(/"/g, '""')}"`
}

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const downloadBlob = (
  content: string,
  mimeType: string,
  fileName: string,
) => {
  const blob = new Blob([content], {
    type: mimeType,
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}

/* =========================================
   CSV EXPORT
========================================= */

const exportCsv = () => {
  const header = columns.map(
    column => escapeCsv(column.label),
  ).join(',')

  const rows = exportRecords.value.map(record => {
    return columns.map(column => {
      return escapeCsv(
        getCellValue(record, column.key),
      )
    }).join(',')
  })

  const csv = '\uFEFF' + [header, ...rows].join('\r\n')

  downloadBlob(
    csv,
    'text/csv;charset=utf-8',
    'lifecycle-history.csv',
  )
}

/* =========================================
   EXCEL-COMPATIBLE EXPORT
========================================= */

const exportExcel = () => {
  const headings = columns.map(column => {
    return `<th>${escapeHtml(column.label)}</th>`
  }).join('')

  const rows = exportRecords.value.map(record => {
    const cells = columns.map(column => {
      const value = getCellValue(record, column.key)

      const safeValue = /^[\s]*[=+\-@]/.test(value)
        ? `'${value}`
        : value

      return `<td style="mso-number-format:'\\@'">${escapeHtml(safeValue)}</td>`
    }).join('')

    return `<tr>${cells}</tr>`
  }).join('')

  const html = `
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <table border="1">
          <thead><tr>${headings}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `

  downloadBlob(
    '\uFEFF' + html,
    'application/vnd.ms-excel;charset=utf-8',
    'lifecycle-history.xls',
  )
}

/* =========================================
   PRINTABLE PDF REPORT
========================================= */

const exportPdf = () => {
  const printWindow = window.open(
    '',
    '_blank',
  )

  if (!printWindow) {
    warning(
      'Pop-up Blocked',
      'Allow pop-ups to open the printable report.',
    )

    return false
  }

  const headings = columns.map(column => {
    return `<th>${escapeHtml(column.label)}</th>`
  }).join('')

  const rows = exportRecords.value.map(record => {
    const cells = columns.map(column => {
      return `<td>${escapeHtml(getCellValue(record, column.key))}</td>`
    }).join('')

    return `<tr>${cells}</tr>`
  }).join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Employee Lifecycle History</title>
        <style>
          @page {
            size: A3 landscape;
            margin: 10mm;
          }

          body {
            font-family: Arial, sans-serif;
            color: #172033;
            padding: 12px;
          }

          h1 {
            font-size: 20px;
            margin-bottom: 5px;
          }

          p {
            font-size: 11px;
            color: #667085;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            border: 1px solid #d8dee8;
            padding: 6px;
            font-size: 8px;
            text-align: left;
            vertical-align: top;
            overflow-wrap: anywhere;
          }

          th {
            background: #eef2f8;
          }

          tr {
            break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <h1>Employee Lifecycle History</h1>
        <p>RWorkCentral HRIS — Historical Lifecycle Report</p>
        <p>Total Records: ${exportRecords.value.length}</p>

        <table>
          <thead>
            <tr>${headings}</tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <script>
          window.addEventListener('load', function () {
            window.print();
          });
        <\/script>
      </body>
    </html>
  `

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()

  return true
}

/* =========================================
   EXECUTE EXPORT
========================================= */

const handleExport = () => {
  if (!exportRecords.value.length) {
    warning(
      'No Records',
      'There are no lifecycle history records to export.',
    )

    return
  }

  if (exportFormat.value === 'pdf') {
    const opened = exportPdf()

    if (opened) {
      exportOpen.value = false
    }

    return
  }

  if (exportFormat.value === 'csv') {
    exportCsv()
  } else {
    exportExcel()
  }

  success(
    'Export Prepared',
    `${exportRecords.value.length} lifecycle records exported.`,
  )

  exportOpen.value = false
}
</script>

<template>
  <section class="history-page">
    <!-- HEADER -->

    <PageHeader
      title="Lifecycle History"
      description="Review the consolidated history of employee onboarding, regularization, transfers, promotions, employment changes and offboarding."
    >
      <div class="header-actions">
        <AppButton
          variant="secondary"
          :icon="Download"
          @click="exportOpen = true"
        >
          Export
        </AppButton>

        <AppButton
          :icon="History"
          @click="handleTimeline()"
        >
          Employee Timeline
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS -->

    <LifecycleHistoryStats :stats="stats" />

    <!-- FILTERS -->

    <LifecycleHistoryFilters
      v-model:search="search"
      v-model:event-type="eventType"
      v-model:department="department"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :event-types="eventTypeOptions"
      :departments="departmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE -->

    <LifecycleHistoryTable
      :records="paginatedRecords"
      @view="handleView"
      @timeline="handleTimeline"
      @copy="handleCopy"
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
          {{ filteredRecords.length }}
        </strong>

        lifecycle events
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- HISTORY MODALS -->

    <LifecycleHistoryModal
      :open="historyModal !== null"
      :mode="historyModal || 'details'"
      :records="records"
      :selected-record="selectedRecord"
      :employee-id="selectedEmployeeId"
      @update:employee-id="selectedEmployeeId = $event"
      @close="closeHistoryModal"
    />

    <!-- EXPORT MODAL -->

    <Teleport to="body">
      <div
        v-if="exportOpen"
        class="history-export-overlay"
        @click.self="exportOpen = false"
      >
        <section
          class="history-export-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Export Lifecycle History"
        >
          <header class="export-header">
            <div class="export-heading">
              <span class="export-icon">
                <Download :size="18" />
              </span>

              <div>
                <h2>Export Lifecycle History</h2>
                <p>Generate employee lifecycle history report.</p>
              </div>
            </div>

            <button
              type="button"
              class="close-button"
              aria-label="Close"
              @click="exportOpen = false"
            >
              <X :size="17" />
            </button>
          </header>

          <div class="export-body">
            <div class="export-summary">
              <div>
                <small>Total Records</small>
                <strong>{{ records.length }}</strong>
              </div>

              <div>
                <small>Filtered Records</small>
                <strong>{{ filteredRecords.length }}</strong>
              </div>
            </div>

            <h3>Records to Export</h3>

            <div class="scope-options">
              <label>
                <input
                  v-model="exportScope"
                  type="radio"
                  value="filtered"
                />

                Current Filtered Records
              </label>

              <label>
                <input
                  v-model="exportScope"
                  type="radio"
                  value="all"
                />

                All Lifecycle Records
              </label>
            </div>

            <h3>Select Export Format</h3>

            <div class="export-options">
              <button
                type="button"
                :class="{ active: exportFormat === 'excel' }"
                @click="exportFormat = 'excel'"
              >
                <FileSpreadsheet :size="20" />
                <strong>Excel</strong>
                <small>Excel-compatible XLS</small>
              </button>

              <button
                type="button"
                :class="{ active: exportFormat === 'pdf' }"
                @click="exportFormat = 'pdf'"
              >
                <FileText :size="20" />
                <strong>PDF</strong>
                <small>Print / Save as PDF</small>
              </button>

              <button
                type="button"
                :class="{ active: exportFormat === 'csv' }"
                @click="exportFormat = 'csv'"
              >
                <Table2 :size="20" />
                <strong>CSV</strong>
                <small>Comma-separated data</small>
              </button>
            </div>

            <div class="export-note">
              Only the selected records will be exported.
              Lifecycle history records are read-only.
            </div>
          </div>

          <footer class="export-footer">
            <button
              type="button"
              class="secondary-button"
              @click="exportOpen = false"
            >
              Cancel
            </button>

            <button
              type="button"
              class="primary-button"
              :disabled="!exportRecords.length"
              @click="handleExport"
            >
              <Download :size="15" />
              Export {{ exportFormat.toUpperCase() }}
            </button>
          </footer>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.history-page {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
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
  padding: 14px 3px 0;
}

.table-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 11px;
}

.table-footer strong {
  color: var(--text-primary);
  font-weight: 650;
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;
    align-items: stretch;
    flex-direction: column;
  }

  .table-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

<style>
.history-export-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(2, 9, 22, 0.76);
  backdrop-filter: blur(5px);
}

.history-export-modal {
  width: 100%;
  max-width: 540px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

.history-export-modal .export-header,
.history-export-modal .export-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 17px;
}

.history-export-modal .export-header {
  border-bottom: 1px solid var(--border);
}

.history-export-modal .export-footer {
  justify-content: flex-end;
  border-top: 1px solid var(--border);
}

.history-export-modal .export-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.history-export-modal .export-icon {
  display: flex;
  width: 37px;
  height: 37px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.history-export-modal h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
}

.history-export-modal .export-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.history-export-modal .close-button {
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.history-export-modal .export-body {
  padding: 17px;
}

.history-export-modal .export-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.history-export-modal .export-summary > div {
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.history-export-modal .export-summary small,
.history-export-modal .export-summary strong {
  display: block;
}

.history-export-modal .export-summary small {
  color: var(--text-muted);
  font-size: 9px;
}

.history-export-modal .export-summary strong {
  margin-top: 8px;
  color: var(--text-primary);
  font-size: 17px;
}

.history-export-modal .export-body h3 {
  margin: 19px 0 10px;
  color: var(--text-primary);
  font-size: 11px;
}

.history-export-modal .scope-options {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.history-export-modal .scope-options label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-secondary);
  font-size: 10px;
  cursor: pointer;
}

.history-export-modal .scope-options input {
  accent-color: var(--primary);
}

.history-export-modal .export-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
}

.history-export-modal .export-options button {
  display: flex;
  min-height: 103px;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  text-align: left;
  cursor: pointer;
}

.history-export-modal .export-options button.active {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}

.history-export-modal .export-options strong {
  font-size: 11px;
}

.history-export-modal .export-options small {
  color: var(--text-muted);
  font-size: 9px;
}

.history-export-modal .export-note {
  margin-top: 15px;
  padding: 11px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.6;
}

.history-export-modal .secondary-button,
.history-export-modal .primary-button {
  display: inline-flex;
  min-height: 35px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.history-export-modal .primary-button {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.history-export-modal .primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 500px) {
  .history-export-modal .export-options {
    grid-template-columns: 1fr;
  }
}
</style>
