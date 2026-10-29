
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import {
  Download,
  History,
  Eye,
  X,
  CalendarDays,
  UserRound,
  FileDown,
  ArrowRight,
  CheckCircle2,
} from 'lucide-vue-next'

import LifecycleHistoryStats from '~/components/admin/employee-lifecycle/history/LifecycleHistoryStats.vue'
import LifecycleHistoryFilters from '~/components/admin/employee-lifecycle/history/LifecycleHistoryFilters.vue'
import LifecycleHistoryTable from '~/components/admin/employee-lifecycle/history/LifecycleHistoryTable.vue'

import type { LifecycleHistoryRecord } from '~/types/lifecycleHistory'

definePageMeta({ layout: 'admin' })

const {
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

type ModalMode = 'export' | 'view' | 'timeline' | null

const modalMode = ref<ModalMode>(null)
const selectedRecord = ref<LifecycleHistoryRecord | null>(null)
const selectedEmployeeId = ref('')
const exportScope = ref<'filtered' | 'page'>('filtered')

const formatDate = (value?: string) => {
  if (!value) return '—'

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(date)
}

// ----------------------------------------------
// EMPLOYEE TIMELINE
// ----------------------------------------------

const employeeOptions = computed(() => {
  const employees = new Map<string, {
    id: string
    name: string
    department: string
  }>()

  for (const record of filteredRecords.value) {
    const id = String(record.employeeNumber)

    if (!employees.has(id)) {
      employees.set(id, {
        id,
        name: record.employeeName,
        department: record.department,
      })
    }
  }

  return [...employees.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  )
})

const selectedEmployee = computed(() =>
  employeeOptions.value.find(
    employee => employee.id === selectedEmployeeId.value,
  ),
)

const timelineRecords = computed(() =>
  filteredRecords.value
    .filter(record =>
      String(record.employeeNumber) === selectedEmployeeId.value,
    )
    .sort((a, b) =>
      (a.effectiveDate || '').localeCompare(b.effectiveDate || '') ||
      String(a.id).localeCompare(String(b.id)),
    ),
)

const timelineCount = computed(() => timelineRecords.value.length)

const eventColorClass = (event: string) => {
  if (event === 'Onboarding') return 'onboarding'
  if (event === 'Regularization') return 'regularization'
  if (event === 'Transfer') return 'transfer'
  if (event === 'Promotion') return 'promotion'
  if (event === 'Employment Change') return 'change'
  if (event === 'Offboarding') return 'offboarding'
  return 'other'
}

// ----------------------------------------------
// MODALS
// ----------------------------------------------

const closeModal = () => {
  modalMode.value = null
  selectedRecord.value = null
}

const handleView = (record: LifecycleHistoryRecord) => {
  selectedRecord.value = record
  modalMode.value = 'view'
}

const handleTimeline = (record?: LifecycleHistoryRecord) => {
  selectedEmployeeId.value = record
    ? String(record.employeeNumber)
    : employeeOptions.value[0]?.id || ''

  selectedRecord.value = null
  modalMode.value = 'timeline'
}

const handleExport = () => {
  exportScope.value = 'filtered'
  modalMode.value = 'export'
}

const goToRecord = (record: LifecycleHistoryRecord) => {
  handleView(record)
}

// ----------------------------------------------
// CSV EXPORT
// ----------------------------------------------

const csvColumns = [
  'Reference',
  'Employee Name',
  'Employee ID',
  'Department',
  'Position',
  'Event Type',
  'Event Details',
  'Previous Value',
  'New Value',
  'Effective Date',
  'Processed By',
  'Approved By',
  'Status',
  'Description',
  'Remarks',
]

const escapeCsv = (value: unknown) => {
  const text = String(value ?? '')
  const safe = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text

  return `"${safe.replace(/"/g, '""')}"`
}

const exportCsv = () => {
  const records = exportScope.value === 'page'
    ? paginatedRecords.value
    : filteredRecords.value

  const rows = records.map(record => [
    record.referenceNumber,
    record.employeeName,
    record.employeeNumber,
    record.department,
    record.position,
    record.eventType,
    record.eventTitle,
    record.previousValue,
    record.newValue,
    record.effectiveDate,
    record.processedBy,
    record.approvedBy,
    record.status,
    record.description,
    record.remarks,
  ])

  const csv = [
    csvColumns.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ].join('\r\n')

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'employee-lifecycle-history.csv'

  document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)

  closeModal()
}

// ----------------------------------------------
// KEYBOARD / BACKDROP
// ----------------------------------------------

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && modalMode.value) {
    closeModal()
  }
}

watch(modalMode, value => {
  if (!import.meta.client) return

  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="history-page">
    <!-- PAGE HEADER -->
    <PageHeader
      title="Lifecycle History"
      description="Review the consolidated history of employee onboarding, regularization, transfers, promotions, employment changes and offboarding."
    >
      <div class="header-actions">
        <AppButton
          variant="secondary"
          :icon="Download"
          @click="handleExport"
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
    />

    <!-- PAGINATION -->
    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ filteredRecords.length }}</strong>
        lifecycle events
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- MODALS -->
    <Teleport to="body">
      <div
        v-if="modalMode"
        class="lh-modal-overlay"
        @click.self="closeModal"
      >
        <div
          class="lh-modal"
          :class="{ 'lh-timeline-modal': modalMode === 'timeline' }"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lh-modal-heading"
        >
          <!-- MODAL HEADER -->
          <div class="lh-modal-header">
            <div class="lh-modal-heading-group">
              <div class="lh-modal-icon">
                <FileDown v-if="modalMode === 'export'" :size="19" />
                <Eye v-else-if="modalMode === 'view'" :size="19" />
                <History v-else :size="19" />
              </div>

              <div>
                <h2 id="lh-modal-heading">
                  {{
                    modalMode === 'export'
                      ? 'Export Lifecycle History'
                      : modalMode === 'view'
                        ? 'Lifecycle History Details'
                        : 'Employee Lifecycle Timeline'
                  }}
                </h2>

                <p>
                  {{
                    modalMode === 'export'
                      ? 'Download historical lifecycle records.'
                      : modalMode === 'view'
                        ? 'Review the selected lifecycle event.'
                        : 'View the recorded lifecycle events of an employee.'
                  }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="lh-modal-close"
              aria-label="Close modal"
              @click="closeModal"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- VIEW DETAILS -->
          <div
            v-if="modalMode === 'view' && selectedRecord"
            class="lh-modal-body"
          >
            <div class="lh-record-banner">
              <div class="lh-record-icon">
                <History :size="20" />
              </div>

              <div>
                <strong>{{ selectedRecord.eventTitle }}</strong>
                <span>{{ selectedRecord.referenceNumber }}</span>
              </div>

              <span class="lh-record-status">
                {{ selectedRecord.status }}
              </span>
            </div>

            <div class="lh-details-grid">
              <div
                v-for="field in [
                  { label: 'Reference Number', value: selectedRecord.referenceNumber },
                  { label: 'Employee Name', value: selectedRecord.employeeName },
                  { label: 'Employee ID', value: selectedRecord.employeeNumber },
                  { label: 'Department', value: selectedRecord.department },
                  { label: 'Position', value: selectedRecord.position },
                  { label: 'Lifecycle Event', value: selectedRecord.eventType },
                  { label: 'Event Details', value: selectedRecord.eventTitle },
                  { label: 'Effective Date', value: formatDate(selectedRecord.effectiveDate) },
                  { label: 'Processed By', value: selectedRecord.processedBy },
                  { label: 'Approved By', value: selectedRecord.approvedBy || 'Pending' },
                  { label: 'Previous Value', value: selectedRecord.previousValue || '—' },
                  { label: 'New Value', value: selectedRecord.newValue || '—' },
                ]"
                :key="field.label"
                class="lh-detail"
              >
                <span>{{ field.label }}</span>
                <strong>{{ field.value || '—' }}</strong>
              </div>

              <div class="lh-detail full-width">
                <span>Description</span>
                <strong>{{ selectedRecord.description || '—' }}</strong>
              </div>

              <div class="lh-detail full-width">
                <span>Remarks</span>
                <strong>{{ selectedRecord.remarks || 'No remarks' }}</strong>
              </div>
            </div>
          </div>

          <!-- EMPLOYEE TIMELINE -->
          <div v-else-if="modalMode === 'timeline'" class="lh-modal-body">
            <div class="lh-employee-selector">
              <label for="lh-employee-select">Select Employee</label>

              <select
                id="lh-employee-select"
                v-model="selectedEmployeeId"
              >
                <option
                  v-for="employee in employeeOptions"
                  :key="employee.id"
                  :value="employee.id"
                >
                  {{ employee.name }} ({{ employee.id }})
                </option>
              </select>
            </div>

            <div v-if="selectedEmployee" class="lh-employee-summary">
              <div class="lh-employee-avatar">
                <UserRound :size="23" />
              </div>

              <div class="lh-employee-summary-info">
                <strong>{{ selectedEmployee.name }}</strong>
                <span>
                  {{ selectedEmployee.id }} · {{ selectedEmployee.department }}
                </span>
              </div>

              <span class="lh-event-count">
                {{ timelineCount }} events
              </span>
            </div>

            <div v-if="timelineRecords.length" class="lh-timeline">
              <div
                v-for="(record, index) in timelineRecords"
                :key="record.id"
                class="lh-timeline-item"
              >
                <div class="lh-timeline-track">
                  <span
                    class="lh-timeline-dot"
                    :class="eventColorClass(record.eventType)"
                  >
                    <CheckCircle2 :size="13" />
                  </span>

                  <span
                    v-if="index < timelineRecords.length - 1"
                    class="lh-timeline-line"
                  />
                </div>

                <div class="lh-timeline-content">
                  <div class="lh-timeline-top">
                    <div>
                      <span class="lh-event-category">
                        {{ record.eventType }}
                      </span>

                      <h3>{{ record.eventTitle }}</h3>
                    </div>

                    <span class="lh-timeline-date">
                      <CalendarDays :size="13" />
                      {{ formatDate(record.effectiveDate) }}
                    </span>
                  </div>

                  <p>{{ record.description || 'No description available.' }}</p>

                  <div
                    v-if="record.previousValue || record.newValue"
                    class="lh-change-summary"
                  >
                    <span>{{ record.previousValue || '—' }}</span>
                    <ArrowRight :size="14" />
                    <strong>{{ record.newValue || '—' }}</strong>
                  </div>

                  <div class="lh-timeline-meta">
                    <span>{{ record.referenceNumber }}</span>
                    <span>{{ record.status }}</span>
                    <span>Processed by {{ record.processedBy }}</span>
                  </div>

                  <button
                    type="button"
                    class="lh-timeline-view"
                    @click="goToRecord(record)"
                  >
                    <Eye :size="14" />
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="lh-empty">
              <History :size="30" />
              <strong>No timeline events available</strong>
              <span>
                No matching history records were found for this employee.
              </span>
            </div>
          </div>

          <!-- EXPORT -->
          <div v-else-if="modalMode === 'export'" class="lh-modal-body">
            <p class="lh-export-description">
              Choose which lifecycle history records to export in CSV format.
            </p>

            <label class="lh-export-option">
              <input
                v-model="exportScope"
                type="radio"
                value="filtered"
              />

              <span>
                <strong>All Filtered Records</strong>
                <small>
                  Export {{ filteredRecords.length }} matching records.
                </small>
              </span>
            </label>

            <label class="lh-export-option">
              <input
                v-model="exportScope"
                type="radio"
                value="page"
              />

              <span>
                <strong>Current Page Only</strong>
                <small>
                  Export {{ paginatedRecords.length }} visible records.
                </small>
              </span>
            </label>

            <p class="lh-export-note">
              CSV includes records currently available from the frontend
              data source.
            </p>
          </div>

          <!-- MODAL FOOTER -->
          <div class="lh-modal-footer">
            <button
              type="button"
              class="lh-secondary-button"
              @click="closeModal"
            >
              Close
            </button>

            <button
              v-if="modalMode === 'view' && selectedRecord"
              type="button"
              class="lh-primary-button"
              @click="handleTimeline(selectedRecord)"
            >
              <History :size="15" />
              Employee Timeline
            </button>

            <button
              v-if="modalMode === 'export'"
              type="button"
              class="lh-primary-button"
              @click="exportCsv"
            >
              <Download :size="15" />
              Export CSV
            </button>
          </div>
        </div>
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
    flex-direction: column;
    align-items: stretch;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<style>
.lh-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 9, 22, 0.67);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.lh-modal {
  width: 100%;
  max-width: 740px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

.lh-timeline-modal {
  max-width: 820px;
}

.lh-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.lh-modal-heading-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lh-modal-icon {
  display: flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
}

.lh-modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 700;
}

.lh-modal-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.lh-modal-close {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.lh-modal-close:hover {
  border-color: var(--border);
  background: var(--bg-card-soft);
}

.lh-modal-body {
  padding: 24px;
}

.lh-record-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
}

.lh-record-icon,
.lh-employee-avatar {
  display: flex;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary);
}

.lh-record-banner > div:nth-child(2) {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
}

.lh-record-banner strong {
  font-size: 13px;
}

.lh-record-banner span {
  color: var(--text-muted);
  font-size: 10px;
}

.lh-record-status {
  padding: 6px 10px;
  border-radius: 20px;
  background: var(--green-soft);
  color: var(--green) !important;
  font-size: 10px !important;
  font-weight: 650;
}

.lh-details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.lh-detail {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.lh-detail > span {
  color: var(--text-muted);
  font-size: 11px;
}

.lh-detail > strong {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.lh-detail.full-width {
  grid-column: 1 / -1;
}

.lh-employee-selector {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 18px;
}

.lh-employee-selector label {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.lh-employee-selector select {
  width: 100%;
  min-height: 41px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
  outline: none;
}

.lh-employee-selector select:focus {
  border-color: var(--primary);
}

.lh-employee-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
}

.lh-employee-summary-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
}

.lh-employee-summary-info strong {
  color: var(--text-primary);
  font-size: 13px;
}

.lh-employee-summary-info span {
  color: var(--text-muted);
  font-size: 10px;
}

.lh-event-count {
  padding: 6px 10px;
  border-radius: 7px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
  font-weight: 650;
}

.lh-timeline {
  display: flex;
  flex-direction: column;
}

.lh-timeline-item {
  display: flex;
  gap: 16px;
}

.lh-timeline-track {
  display: flex;
  width: 30px;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
}

.lh-timeline-dot {
  display: flex;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
}

.lh-timeline-dot.regularization,
.lh-timeline-dot.onboarding {
  background: var(--green-soft);
  color: var(--green);
}

.lh-timeline-dot.promotion {
  background: var(--orange-soft);
  color: var(--orange);
}

.lh-timeline-dot.transfer {
  background: var(--purple-soft);
  color: var(--purple);
}

.lh-timeline-dot.offboarding {
  background: var(--red-soft);
  color: var(--red);
}

.lh-timeline-line {
  width: 2px;
  min-height: 25px;
  flex: 1;
  background: var(--border);
}

.lh-timeline-content {
  flex: 1;
  min-width: 0;
  margin-bottom: 19px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card-soft);
}

.lh-timeline-top {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.lh-event-category {
  color: var(--primary);
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.lh-timeline-top h3 {
  margin: 6px 0 0;
  color: var(--text-primary);
  font-size: 13px;
}

.lh-timeline-date {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-muted);
  font-size: 10px;
  white-space: nowrap;
}

.lh-timeline-content > p {
  margin: 12px 0;
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.6;
}

.lh-change-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 0;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  font-size: 11px;
}

.lh-change-summary > span {
  color: var(--text-muted);
}

.lh-change-summary > svg,
.lh-change-summary > strong {
  color: var(--green);
}

.lh-timeline-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 14px;
}

.lh-timeline-meta span {
  color: var(--text-muted);
  font-size: 9px;
}

.lh-timeline-view {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--primary);
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.lh-timeline-view:hover {
  background: var(--primary-soft);
}

.lh-empty {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-muted);
  text-align: center;
}

.lh-empty strong {
  color: var(--text-primary);
  font-size: 13px;
}

.lh-empty span {
  font-size: 11px;
}

.lh-export-description {
  margin: 0 0 18px;
  color: var(--text-secondary);
  font-size: 12px;
}

.lh-export-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 10px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  cursor: pointer;
}

.lh-export-option input {
  margin-top: 3px;
  accent-color: var(--primary);
}

.lh-export-option > span {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lh-export-option strong {
  color: var(--text-primary);
  font-size: 12px;
}

.lh-export-option small,
.lh-export-note {
  color: var(--text-muted);
  font-size: 10px;
}

.lh-export-note {
  margin: 16px 0 0;
}

.lh-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.lh-secondary-button,
.lh-primary-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 17px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.lh-secondary-button {
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.lh-primary-button {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
}

.lh-secondary-button:hover {
  background: var(--primary-soft);
}

.lh-primary-button:hover {
  filter: brightness(1.08);
}

@media (max-width: 650px) {
  .lh-modal-overlay {
    padding: 12px;
  }

  .lh-modal {
    max-height: 94vh;
  }

  .lh-modal-body,
  .lh-modal-header {
    padding: 17px;
  }

  .lh-details-grid {
    grid-template-columns: 1fr;
  }

  .lh-record-banner,
  .lh-employee-summary,
  .lh-timeline-top {
    flex-wrap: wrap;
  }

  .lh-event-count {
    margin-left: auto;
  }

  .lh-timeline-top {
    flex-direction: column;
  }

  .lh-modal-footer {
    flex-wrap: wrap;
  }
}
</style>
