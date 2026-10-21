
<script setup lang="ts">
import {
  Download,
  CalendarRange,
  X,
  FileSpreadsheet,
} from 'lucide-vue-next'

import type {
  WfhApproval,
} from '~/types/wfhApproval'

import WfhApprovalStats from '~/components/approvals/wfh/WfhApprovalStats.vue'
import WfhApprovalFilters from '~/components/approvals/wfh/WfhApprovalFilters.vue'
import WfhApprovalTable from '~/components/approvals/wfh/WfhApprovalTable.vue'
import WfhApprovalModal from '~/components/approvals/wfh/WfhApprovalModal.vue'
import WfhScheduleModal from '~/components/approvals/WfhScheduleModal.vue'
import WfhScheduleModal from '~/components/approvals/wfh/WfhScheduleModal.vue'

type ModalMode = 'view' | 'review' | 'approve' | 'reject'

const {
  requests,

  search,
  department,
  requestType,
  status,
  dateFrom,
  dateTo,

  currentPage,

  filteredRequests,
  paginatedRequests,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  departmentOptions,
  requestTypeOptions,
  statusOptions,

  approveRequest,
  rejectRequest,
  getApprovedRequests,

  resetFilters,
} = useWfhApprovals()

const {
  success,
  warning,
  info,
} = useToast()

/* =========================================
   MODAL STATES
========================================= */

const selectedRequest = ref<WfhApproval | null>(null)
const modalMode = ref<ModalMode>('view')

const approvalModalOpen = ref(false)
const scheduleModalOpen = ref(false)
const exportModalOpen = ref(false)

const exportScope = ref<'filtered' | 'all'>('filtered')

/* =========================================
   APPROVAL MODAL
========================================= */

const openApprovalModal = (
  mode: ModalMode,
  request: WfhApproval,
) => {
  selectedRequest.value = request
  modalMode.value = mode
  approvalModalOpen.value = true
}

const closeApprovalModal = () => {
  approvalModalOpen.value = false
  selectedRequest.value = null
}

/* =========================================
   APPROVAL ACTIONS
========================================= */

const handleApprove = (
  request: WfhApproval,
  remarks: string,
) => {
  const result = approveRequest(request, remarks)

  if (!result) {
    warning(
      'Unable to Approve',
      'This request is no longer available for approval.',
    )
    closeApprovalModal()
    return
  }

  success(
    'WFH Request Approved',
    `${request.requestNumber} has been approved successfully.`,
  )

  closeApprovalModal()
}

const handleReject = (
  request: WfhApproval,
  remarks: string,
) => {
  const result = rejectRequest(request, remarks)

  if (!result) {
    warning(
      'Unable to Reject',
      'Please check the request status and rejection reason.',
    )
    closeApprovalModal()
    return
  }

  warning(
    'WFH Request Rejected',
    `${request.requestNumber} has been rejected.`,
  )

  closeApprovalModal()
}

/* =========================================
   WFH SCHEDULE
========================================= */

const handleSchedule = () => {
  scheduleModalOpen.value = true
}

/* =========================================
   EXPORT
========================================= */

const handleExport = () => {
  exportModalOpen.value = true
}

const csvValue = (value: unknown) => {
  const text = String(value ?? '')

  // Prevent spreadsheet formula execution.
  const safe = /^[\s]*[=+\-@\t\r]/.test(text)
    ? `'${text}`
    : text

  return `"${safe.replace(/"/g, '""')}"`
}

const exportRecords = computed(() => {
  return exportScope.value === 'all'
    ? requests.value
    : filteredRequests.value
})

const downloadCsv = () => {
  if (!import.meta.client) return

  const headers = [
    'Request Number',
    'Employee Number',
    'Employee Name',
    'Department',
    'Position',
    'WFH Type',
    'Start Date',
    'End Date',
    'Total Days',
    'Work Location',
    'Reason',
    'Work Plan',
    'Supervisor',
    'Filed Date',
    'Status',
    'Reviewed By',
    'Reviewed Date',
    'Remarks',
  ]

  const rows = exportRecords.value.map(item => [
    item.requestNumber,
    item.employeeNumber,
    item.employeeName,
    item.department,
    item.position,
    item.requestType,
    item.startDate,
    item.endDate,
    item.totalDays,
    item.workLocation,
    item.reason,
    item.workPlan,
    item.immediateSupervisor,
    item.filedAt,
    item.status,
    item.reviewedBy ?? '',
    item.reviewedAt ?? '',
    item.remarks ?? '',
  ])

  const csv = [
    headers,
    ...rows,
  ]
    .map(row => row.map(csvValue).join(','))
    .join('\r\n')

  const blob = new Blob(
    ['\uFEFF', csv],
    {
      type: 'text/csv;charset=utf-8;',
    },
  )

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = `wfh-approvals-${new Date().toISOString().slice(0, 10)}.csv`

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)

  exportModalOpen.value = false

  success(
    'Export Complete',
    `${rows.length} WFH approval records exported as CSV.`,
  )
}
</script>

<template>
  <section class="wfh-approval-page">
    <!-- HEADER -->

    <PageHeader
      title="WFH Approvals"
      description="Review employee work-from-home requests, remote work schedules, work plans and approval status."
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
          :icon="CalendarRange"
          @click="handleSchedule"
        >
          WFH Schedule
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS -->

    <WfhApprovalStats
      :stats="stats"
    />

    <!-- FILTERS -->

    <WfhApprovalFilters
      v-model:search="search"
      v-model:department="department"
      v-model:request-type="requestType"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departmentOptions"
      :request-types="requestTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE -->

    <WfhApprovalTable
      :requests="paginatedRequests"
      @view="openApprovalModal('view', $event)"
      @review="openApprovalModal('review', $event)"
      @approve="openApprovalModal('approve', $event)"
      @reject="openApprovalModal('reject', $event)"
    />

    <!-- PAGINATION -->

    <div class="table-footer">
      <p>
        Showing
        <strong>{{ showingFrom }}–{{ showingTo }}</strong>
        of
        <strong>{{ filteredRequests.length }}</strong>
        WFH approval requests
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- APPROVAL MODAL -->

    <WfhApprovalModal
      :open="approvalModalOpen"
      :request="selectedRequest"
      :mode="modalMode"
      @close="closeApprovalModal"
      @approve="handleApprove"
      @reject="handleReject"
    />

    <!-- WFH SCHEDULE -->

    <WfhScheduleModal
      :open="scheduleModalOpen"
      :requests="getApprovedRequests"
      @close="scheduleModalOpen = false"
    />

    <!-- EXPORT MODAL -->

    <Teleport to="body">
      <div
        v-if="exportModalOpen"
        class="export-overlay"
        @click.self="exportModalOpen = false"
      >
        <section
          class="export-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Export WFH Approvals"
        >
          <div class="export-heading">
            <div class="heading-content">
              <span class="heading-icon">
                <FileSpreadsheet :size="18" />
              </span>

              <div>
                <h3>Export WFH Approvals</h3>
                <p>Download employee WFH approval records.</p>
              </div>
            </div>

            <button
              type="button"
              class="close-button"
              aria-label="Close export"
              @click="exportModalOpen = false"
            >
              <X :size="17" />
            </button>
          </div>

          <div class="export-body">
            <label>Records to Export</label>

            <select v-model="exportScope">
              <option value="filtered">
                Current Filtered Records
              </option>

              <option value="all">
                All WFH Requests
              </option>
            </select>

            <p class="export-count">
              {{ exportRecords.length }} records selected
            </p>

            <div class="export-notice">
              File Format: CSV (compatible with Microsoft Excel).
            </div>
          </div>

          <div class="export-footer">
            <button
              type="button"
              class="cancel-button"
              @click="exportModalOpen = false"
            >
              Cancel
            </button>

            <button
              type="button"
              class="download-button"
              :disabled="exportRecords.length === 0"
              @click="downloadCsv"
            >
              <Download :size="15" />
              Download CSV
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.wfh-approval-page {
  width: 100%;
  max-width: 1660px;
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
.export-overlay {
  position: fixed;
  inset: 0;
  z-index: 10060;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: rgba(3, 9, 23, 0.76);
  backdrop-filter: blur(5px);
}

.export-modal {
  width: 100%;
  max-width: 450px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
}

.export-heading,
.export-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px;
  border-bottom: 1px solid var(--border);
}

.heading-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.heading-icon {
  display: flex;
  width: 37px;
  height: 37px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.export-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
}

.export-heading p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.close-button {
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.export-body {
  padding: 16px;
}

.export-body label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
}

.export-body select {
  width: 100%;
  height: 39px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 11px;
}

.export-count {
  margin: 9px 0;
  color: var(--primary);
  font-size: 10px;
}

.export-notice {
  padding: 11px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
  color: var(--text-muted);
  font-size: 10px;
}

.export-footer {
  justify-content: flex-end;
  border-top: 1px solid var(--border);
  border-bottom: 0;
}

.cancel-button,
.download-button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 13px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.download-button {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.download-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
