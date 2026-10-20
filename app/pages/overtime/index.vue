
<script setup lang="ts">
import {
  Download,
  Plus,
  X,
  FileSpreadsheet,
  FileText,
  Table2,
} from 'lucide-vue-next'

const {
  stats,
  pendingRequests,
  todayOvertime,
  recentRequests,
  departmentSummary,
} = useOvertimeManagement()

const router = useRouter()

// EXPORT MODAL
const showExportModal = ref(false)
const selectedExportFormat = ref<'excel' | 'pdf' | 'csv'>('excel')

const openExportModal = () => {
  selectedExportFormat.value = 'excel'
  showExportModal.value = true
}

const closeExportModal = () => {
  showExportModal.value = false
}

const handleExport = () => {
  // UI ONLY - export functionality will be added later.
}

// EXPORT FORMAT OPTIONS
const exportFormats = [
  {
    value: 'excel' as const,
    label: 'Excel',
    description: 'Best for HR leave reports and analysis.',
    icon: FileSpreadsheet,
  },
  {
    value: 'pdf' as const,
    label: 'PDF',
    description: 'Printable overtime request report.',
    icon: FileText,
  },
  {
    value: 'csv' as const,
    label: 'CSV',
    description: 'Raw overtime data for external processing.',
    icon: Table2,
  },
]

// ROUTES
const handleFileOvertime = () => {
  router.push('/ot-requests')
}

const handleApproved = () => {
  router.push('/approved-overtime')
}

const handleHistory = () => {
  router.push('/overtime-history')
}
</script>

<template>
  <section class="overtime-page">

    <!-- HEADER -->
    <PageHeader
      title="Overtime"
      description="Monitor overtime requests, approvals, approved hours and employee overtime activity."
    >
      <AppButton
        variant="secondary"
        :icon="Download"
        @click="openExportModal"
      >
        Export
      </AppButton>

      <AppButton
        :icon="Plus"
        @click="handleFileOvertime"
      >
        File Overtime
      </AppButton>
    </PageHeader>

    <!-- STATS -->
    <OvertimeStats :stats="stats" />

    <!-- MAIN CONTENT -->
    <div class="overtime-layout">

      <!-- LEFT -->
      <div class="overtime-main">

        <OvertimeRequestsTable
          :requests="recentRequests"
        />

        <OvertimeDepartmentSummary
          :departments="departmentSummary"
        />

      </div>

      <!-- RIGHT -->
      <OvertimeSidePanel
        :pending-requests="pendingRequests"
        :today-overtime="todayOvertime"
        @file-overtime="handleFileOvertime"
        @approved="handleApproved"
        @history="handleHistory"
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
            aria-labelledby="export-modal-title"
          >

            <!-- MODAL HEADER -->
            <div class="export-dialog-header">

              <div class="export-header-left">
                <div class="export-header-icon">
                  <Download :size="19" />
                </div>

                <div class="export-header-text">
                  <h2 id="export-modal-title">
                    Export Overtime Records
                  </h2>
                  <p>
                    Export employee overtime records and request status.
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

            <!-- MODAL BODY -->
            <div class="export-dialog-body">

              <!-- SUMMARY -->
              <div class="export-stats">

                <div class="export-stat">
                  <span>Total</span>
                  <strong>{{ recentRequests.length }}</strong>
                </div>

                <div class="export-stat">
                  <span>Pending</span>
                  <strong>
                    {{
                      recentRequests.filter(
                        request => request.status === 'Pending'
                      ).length
                    }}
                  </strong>
                </div>

                <div class="export-stat">
                  <span>Approved</span>
                  <strong>
                    {{
                      recentRequests.filter(
                        request => request.status === 'Approved'
                      ).length
                    }}
                  </strong>
                </div>

                <div class="export-stat">
                  <span>Rejected</span>
                  <strong>
                    {{
                      recentRequests.filter(
                        request => request.status === 'Rejected'
                      ).length
                    }}
                  </strong>
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
                  Employee, employee number, department, overtime date,
                  time in, time out, overtime hours, reason,
                  request status and approved by.
                </p>
              </div>

            </div>

            <!-- MODAL FOOTER -->
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
                @click="handleExport"
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
/* PAGE */
.overtime-page {
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.overtime-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 12px;
}

.overtime-main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}

/* MODAL OVERLAY */
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

/* MODAL */
.export-dialog {
  width: 100%;
  max-width: 565px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--bg-card);
  box-shadow: 0 25px 65px rgba(0, 0, 0, 0.25);
}

/* HEADER */
.export-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 15px 16px;
  border-bottom: 1px solid var(--border);
}

.export-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
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

/* BODY */
.export-dialog-body {
  padding: 15px 16px;
}

/* STATS */
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

/* EXPORT FORMAT */
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
  transition: all 0.18s ease;
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

/* INCLUDED DATA */
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

/* FOOTER */
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
  box-shadow: 0 4px 12px rgba(36, 107, 253, 0.15);
}

.export-submit-button:hover {
  background: var(--primary-dark);
}

/* ANIMATION */
.export-modal-enter-active,
.export-modal-leave-active {
  transition: opacity 0.2s ease;
}

.export-modal-enter-active .export-dialog,
.export-modal-leave-active .export-dialog {
  transition: transform 0.2s ease;
}

.export-modal-enter-from,
.export-modal-leave-to {
  opacity: 0;
}

.export-modal-enter-from .export-dialog,
.export-modal-leave-to .export-dialog {
  transform: translateY(10px) scale(0.98);
}

/* RESPONSIVE */
@media (max-width: 1100px) {
  .overtime-layout {
    grid-template-columns: 1fr;
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
