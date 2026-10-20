
<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  FileClock,
  X,
  FileSpreadsheet,
  FileText,
  Table2,
} from 'lucide-vue-next'

import ApprovedOvertimeStats from '~/components/overtime/approved/ApprovedOvertimeStats.vue'
import ApprovedOvertimeFilters from '~/components/overtime/approved/ApprovedOvertimeFilters.vue'
import ApprovedOvertimeTable from '~/components/overtime/approved/ApprovedOvertimeTable.vue'

const router = useRouter()

const {
  search,
  department,
  overtimeType,
  payrollStatus,
  dateFrom,
  dateTo,
  currentPage,
  filteredRecords,
  paginatedRecords,
  totalPages,
  showingFrom,
  showingTo,
  stats,
  departmentOptions,
  overtimeTypeOptions,
  payrollStatusOptions,
  resetFilters,
} = useApprovedOvertime()

// EXPORT MODAL
type ExportFormat = 'excel' | 'pdf' | 'csv'

const showExportModal = ref(false)
const selectedExportFormat = ref<ExportFormat>('excel')

const exportFormats = [
  {
    value: 'excel' as const,
    label: 'Excel',
    description: 'Best for HR overtime reports and analysis.',
    icon: FileSpreadsheet,
  },
  {
    value: 'pdf' as const,
    label: 'PDF',
    description: 'Printable approved overtime report.',
    icon: FileText,
  },
  {
    value: 'csv' as const,
    label: 'CSV',
    description: 'Raw overtime data for external processing.',
    icon: Table2,
  },
]

const openExportModal = () => {
  selectedExportFormat.value = 'excel'
  showExportModal.value = true
}

const closeExportModal = () => {
  showExportModal.value = false
}

// ROUTES
const handleBack = () => {
  router.push('/overtime')
}

const handleViewRequests = () => {
  router.push('/ot-requests')
}
</script>

<template>
  <section class="approved-overtime-page">

    <!-- BACK -->
    <button
      type="button"
      class="back-button"
      @click="handleBack"
    >
      <ArrowLeft :size="16" />
      Back to Overtime
    </button>

    <!-- HEADER -->
    <PageHeader
      title="Approved Overtime"
      description="Review approved overtime hours, payroll readiness and overtime records already included in payroll."
    >
      <div class="header-actions">
        <AppButton
          variant="secondary"
          :icon="Download"
          @click="openExportModal"
        >
          Export
        </AppButton>

        <AppButton
          :icon="FileClock"
          @click="handleViewRequests"
        >
          View OT Requests
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS -->
    <ApprovedOvertimeStats :stats="stats" />

    <!-- FILTERS -->
    <ApprovedOvertimeFilters
      v-model:search="search"
      v-model:department="department"
      v-model:overtime-type="overtimeType"
      v-model:payroll-status="payrollStatus"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departmentOptions"
      :overtime-types="overtimeTypeOptions"
      :payroll-statuses="payrollStatusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE -->
    <ApprovedOvertimeTable
      :records="paginatedRecords"
    />

    <!-- PAGINATION -->
    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ filteredRecords.length }}</strong>
        approved overtime records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- EXPORT MODAL -->
    <Teleport to="body">
      <Transition name="export-modal">
        <div
          v-if="showExportModal"
          class="export-overlay"
          @click.self="closeExportModal"
        >
          <div
            class="export-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approved-export-title"
          >

            <!-- MODAL HEADER -->
            <div class="export-dialog-header">
              <div class="export-header-left">
                <div class="export-header-icon">
                  <Download :size="19" />
                </div>

                <div class="export-header-text">
                  <h2 id="approved-export-title">
                    Export Approved Overtime
                  </h2>
                  <p>
                    Export approved employee overtime and payroll records.
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="export-close-button"
                aria-label="Close export modal"
                @click="closeExportModal"
              >
                <X :size="17" />
              </button>
            </div>

            <!-- BODY -->
            <div class="export-dialog-body">

              <!-- SUMMARY -->
              <div class="export-stats">
                <div class="export-stat">
                  <span>Approved OT</span>
                  <strong>{{ stats.approvedRequests }}</strong>
                </div>

                <div class="export-stat">
                  <span>Approved Hours</span>
                  <strong>{{ stats.approvedHours }} hrs</strong>
                </div>

                <div class="export-stat">
                  <span>Ready for Payroll</span>
                  <strong>{{ stats.readyForPayroll }}</strong>
                </div>

                <div class="export-stat">
                  <span>Processed</span>
                  <strong>{{ stats.processed }}</strong>
                </div>
              </div>

              <!-- EXPORT FORMAT -->
              <div class="export-section">
                <h3 class="export-section-title">
                  Export Format
                </h3>

                <div class="export-format-grid">
                  <button
                    v-for="format in exportFormats"
                    :key="format.value"
                    type="button"
                    class="export-format-card"
                    :class="{
                      selected: selectedExportFormat === format.value
                    }"
                    :aria-pressed="selectedExportFormat === format.value"
                    @click="selectedExportFormat = format.value"
                  >
                    <component
                      :is="format.icon"
                      :size="20"
                      class="format-icon"
                    />

                    <strong>{{ format.label }}</strong>
                    <span>{{ format.description }}</span>
                  </button>
                </div>
              </div>

              <!-- INCLUDED DATA -->
              <div class="export-included-data">
                <strong>Included Data</strong>
                <p>
                  OT request number, employee name, employee number,
                  department, position, overtime date, schedule,
                  overtime type, requested hours, approved hours,
                  reason, approved by, approval date, payroll period,
                  payroll status and remarks.
                </p>
              </div>

              <p class="export-note">
                Export functionality will be connected later.
                The selected format is for preview only.
              </p>

            </div>

            <!-- FOOTER -->
            <div class="export-dialog-footer">
              <button
                type="button"
                class="export-cancel-button"
                @click="closeExportModal"
              >
                Cancel
              </button>

              <button
                type="button"
                class="export-submit-button"
                disabled
              >
                <Download :size="16" />
                Export
                {{
                  selectedExportFormat === 'excel'
                    ? 'Excel'
                    : selectedExportFormat === 'pdf'
                      ? 'PDF'
                      : 'CSV'
                }}
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </section>
</template>

<style scoped>
.approved-overtime-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 11px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.back-button:hover {
  color: var(--primary-dark);
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

/* EXPORT MODAL */
.export-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 12, 29, 0.78);
  backdrop-filter: blur(5px);
}

.export-dialog {
  width: 100%;
  max-width: 565px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--bg-card);
  box-shadow: 0 25px 65px rgba(0, 0, 0, .25);
}

.export-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 15px 16px;
  border-bottom: 1px solid var(--border);
}

.export-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.export-header-icon {
  display: flex;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.export-header-text h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
}

.export-header-text p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 8px;
}

.export-close-button {
  display: flex;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.export-close-button:hover {
  background: var(--red-soft);
  color: var(--red);
}

.export-dialog-body {
  padding: 15px 16px;
}

.export-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 15px;
}

.export-stat {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 43px;
  padding: 9px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
}

.export-stat span {
  color: var(--text-muted);
  font-size: 7px;
  text-transform: uppercase;
}

.export-stat strong {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.export-section {
  margin-bottom: 11px;
}

.export-section-title {
  margin: 0 0 7px;
  color: var(--text-primary);
  font-size: 9px;
  font-weight: 700;
}

.export-format-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.export-format-card {
  display: flex;
  min-width: 0;
  min-height: 95px;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  padding: 11px 9px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: all .18s ease;
}

.export-format-card:hover {
  border-color: var(--primary);
}

.export-format-card.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.format-icon {
  color: var(--text-muted);
}

.export-format-card.selected .format-icon {
  color: var(--primary);
}

.export-format-card strong {
  font-size: 9px;
  font-weight: 700;
}

.export-format-card span {
  color: var(--text-muted);
  font-size: 7px;
  line-height: 1.5;
}

.export-included-data {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.export-included-data strong {
  color: var(--text-primary);
  font-size: 9px;
}

.export-included-data p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 8px;
  line-height: 1.6;
}

.export-note {
  margin: 10px 0 0;
  color: var(--text-muted);
  font-size: 9px;
}

.export-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
}

.export-cancel-button,
.export-submit-button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.export-cancel-button {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-primary);
}

.export-cancel-button:hover {
  background: var(--bg-card-soft);
}

.export-submit-button {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: white;
}

.export-submit-button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.export-modal-enter-active,
.export-modal-leave-active {
  transition: opacity .2s ease;
}

.export-modal-enter-active .export-dialog,
.export-modal-leave-active .export-dialog {
  transition: transform .2s ease;
}

.export-modal-enter-from,
.export-modal-leave-to {
  opacity: 0;
}

.export-modal-enter-from .export-dialog,
.export-modal-leave-to .export-dialog {
  transform: translateY(10px) scale(.98);
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

@media (max-width: 480px) {
  .export-format-grid {
    grid-template-columns: 1fr;
  }

  .export-format-card {
    min-height: auto;
  }

  .export-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .export-dialog-header,
  .export-dialog-body,
  .export-dialog-footer {
    padding: 12px;
  }
}
</style>
