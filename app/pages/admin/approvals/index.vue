<script setup lang="ts">
import {
  Download,
  Plus,
  RefreshCw,
} from 'lucide-vue-next'
import FileApprovalRequestModal from '~/components/admin/approvals/FileApprovalRequestModal.vue'

import type {
  ApprovalRequest,
} from '~/types/approval'

const {
  success,
  error: showError,
} = useToast()

const {
  requests,
  loading,
  loadError,
  processingId,
  loadRequests,

  search,
  type,
  department,
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

  typeOptions,
  departments,
  exportRecords,

  approveRequest,
  rejectRequest,
  revertRequest,
  getErrorMessage,

  resetFilters,
} = useApprovalCenter()

const exportOpen = ref(false)
const fileRequestOpen = ref(false)
const requestOpen = ref(false)
const requestMode = ref('view')
const selectedRequest = ref<ApprovalRequest | null>(null)

const handleFileRequestSuccess = () => {
  void loadRequests()
}

const handleExport = () => {
  exportOpen.value = true
}

const handleView = (request: ApprovalRequest) => {
  selectedRequest.value = request
  requestMode.value = 'view'
  requestOpen.value = true
}

const handleApprove = async (request: ApprovalRequest) => {
  if (processingId.value !== null) return

  try {
    const message = await approveRequest(request)
    if (selectedRequest.value?.id === request.id) {
      requestOpen.value = false
    }
    success('Request Approved', message)
  } catch (problem: any) {
    showError('Approval Failed', getErrorMessage(problem))
  }
}

const handleReject = async (request: ApprovalRequest) => {
  if (processingId.value !== null) return

  try {
    const message = await rejectRequest(request)
    if (selectedRequest.value?.id === request.id) {
      requestOpen.value = false
    }
    success('Request Rejected', message)
  } catch (problem: any) {
    showError('Rejection Failed', getErrorMessage(problem))
  }
}

const handleRevert = async (request: ApprovalRequest) => {
  if (processingId.value !== null) return

  try {
    const message = await revertRequest(request)
    if (selectedRequest.value?.id === request.id) {
      requestOpen.value = false
    }
    success('Request Reverted', message)
  } catch (problem: any) {
    showError('Undo Failed', getErrorMessage(problem))
  }
}

const handleDialogApprove = async () => {
  if (!selectedRequest.value) return
  await handleApprove(selectedRequest.value)
}

const handleDialogReject = async () => {
  if (!selectedRequest.value) return
  await handleReject(selectedRequest.value)
}

const handleDialogRevert = async () => {
  if (!selectedRequest.value) return
  await handleRevert(selectedRequest.value)
}

onMounted(() => {
  void loadRequests()
})
</script>

<template>
  <section class="approval-page">

    <!-- HEADER -->
    <PageHeader
      title="Approval Center"
      description="Review and manage pending leave, overtime and undertime requests."
    >
      <div class="header-actions">
        <AppButton
          :icon="Plus"
          @click="fileRequestOpen = true"
        >
          File Request
        </AppButton>

        <AppButton
          variant="secondary"
          :icon="Download"
          @click="handleExport"
        >
          Export
        </AppButton>

        <AppButton
          variant="secondary"
          :icon="RefreshCw"
          :disabled="loading"
          @click="loadRequests"
        >
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATS -->
    <ApprovalStats
      :stats="stats"
    />

    <!-- FILTERS -->
    <ApprovalFilters
      v-model:search="search"
      v-model:type="type"
      v-model:department="department"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departments"
      :type-options="typeOptions"
      @reset="resetFilters"
    />

    <!-- LOADING / ERROR -->
    <div
      v-if="loading"
      class="directory-message"
    >
      <RefreshCw :size="15" class="loading-icon" />
      {{ requests.length ? 'Refreshing requests...' : 'Loading requests...' }}
    </div>

    <div
      v-if="loadError"
      class="directory-message error-message"
      role="alert"
    >
      <div>
        <strong>Requests Could Not Be Loaded</strong>
        <p>{{ loadError }}</p>
      </div>

      <AppButton
        variant="secondary"
        size="sm"
        :disabled="loading"
        @click="loadRequests"
      >
        Retry
      </AppButton>
    </div>

    <!-- MAIN -->
    <div class="approval-layout">

      <div class="approval-main">

        <ApprovalRequestsTable
          :requests="paginatedRequests"
          :processing-id="processingId"
          @view="handleView"
          @revert="handleRevert"
        />

        <div class="table-footer">

          <p>
            Showing

            <strong>
              {{ showingFrom }}–{{ showingTo }}
            </strong>

            of

            <strong>
              {{ filteredRequests.length }}
            </strong>

            requests
          </p>

          <AppPagination
            v-model="currentPage"
            :total-pages="totalPages"
          />

        </div>

      </div>

    </div>

    <PayrollExportDialog
      :open="exportOpen"
      title="Approval Center Requests"
      :records="exportRecords"
      :sample="false"
      :filters="{ Search: search, Type: type, Department: department, Status: status, 'Request Date From': dateFrom, 'Request Date To': dateTo }"
      @close="exportOpen = false"
    />

    <ApprovalRequestDialog
      :open="requestOpen"
      kind="Overview"
      :mode="requestMode"
      :request="selectedRequest"
      :processing="processingId !== null"
      @close="requestOpen = false"
      @approve="handleDialogApprove"
      @reject="handleDialogReject"
      @revert="handleDialogRevert"
    />

    <FileApprovalRequestModal
      :open="fileRequestOpen"
      default-type=""
      @close="fileRequestOpen = false"
      @success="handleFileRequestSuccess"
    />
  </section>
</template>

<style scoped>
.approval-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.directory-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 65px;
  margin-bottom: 14px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 11px;
}

.loading-icon {
  color: var(--primary);
  animation: spin 1s linear infinite;
}

.error-message {
  justify-content: space-between;
  border-color: var(--red);
}

.error-message strong {
  color: var(--red);
  font-size: 11px;
}

.error-message p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.approval-layout {
  display: grid;

  grid-template-columns: 1fr;

  gap: 15px;

  align-items: start;
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

  color:
    var(--text-muted);

  font-size: 10px;
}

.table-footer strong {
  color:
    var(--text-primary);

  font-weight: 650;
}

@media (max-width: 650px) {
  .table-footer {
    align-items: flex-start;

    flex-direction: column;
  }

  .error-message {
    align-items: flex-start;

    flex-direction: column;
  }
}
</style>
