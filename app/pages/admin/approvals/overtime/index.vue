<script setup lang="ts">
import {
  Download,
  Plus,
  RefreshCw,
} from 'lucide-vue-next'

import OvertimeApprovalStats from '~/components/admin/approvals/overtime/OvertimeApprovalStats.vue'
import OvertimeApprovalFilters from '~/components/admin/approvals/overtime/OvertimeApprovalFilters.vue'
import OvertimeApprovalTable from '~/components/admin/approvals/overtime/OvertimeApprovalTable.vue'
import FileApprovalRequestModal from '~/components/admin/approvals/FileApprovalRequestModal.vue'
import { useOvertimeApprovals } from '~/composables/admin/approvals/useOvertimeApprovals'

const {
  success,
  warning,
} = useToast()

const {
  search,
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

  departmentOptions,
  statusOptions,
  exportRecords,

  resetFilters,
  loading,
  loadError,
  approvingId,
  loadRequests,
  approveRequest,
  rejectRequest,
  revertRequest,
} = useOvertimeApprovals()

const exportOpen = ref(false)
const fileRequestOpen = ref(false)
const requestOpen = ref(false)
const requestMode = ref('view')
const selectedRequest = ref<Record<string, any> | null>(null)
const handleFileRequestSuccess = () => { void loadRequests() }
const apiError = (problem: any) => (
  problem?.data?.errors?.status?.[0]
  ?? problem?.data?.errors?.end_at?.[0]
  ?? problem?.data?.message
  ?? problem?.response?._data?.message
  ?? problem?.message
  ?? 'Unable to process the overtime request.'
)

const openRequest = async (mode: string, request: Record<string, any>) => {
  if (mode === 'approve') {
    if (approvingId.value !== null) return

    try {
      const message = await approveRequest(Number(request.id))
      success('Overtime Approved', message)
    } catch (problem: any) {
      warning('Approval Failed', apiError(problem))
    }
    return
  }

  if (mode === 'reject') {
    if (approvingId.value !== null) return

    try {
      const message = await rejectRequest(Number(request.id))
      success('Overtime Rejected', message)
    } catch (problem: any) {
      warning('Rejection Failed', apiError(problem))
    }
    return
  }

  if (mode === 'revert') {
    if (approvingId.value !== null) return

    try {
      const message = await revertRequest(Number(request.id))
      success('Overtime Reverted', message)
    } catch (problem: any) {
      warning('Undo Failed', apiError(problem))
    }
    return
  }

  selectedRequest.value = request
  requestMode.value = mode === 'review' ? 'view' : mode
  requestOpen.value = true
}

const handleDialogApprove = async () => {
  if (!selectedRequest.value || approvingId.value !== null) return
  try {
    const message = await approveRequest(Number(selectedRequest.value.id))
    requestOpen.value = false
    success('Overtime Approved', message)
  } catch (problem: any) {
    warning('Approval Failed', apiError(problem))
  }
}

const handleDialogReject = async () => {
  if (!selectedRequest.value || approvingId.value !== null) return
  try {
    const message = await rejectRequest(Number(selectedRequest.value.id))
    requestOpen.value = false
    success('Overtime Rejected', message)
  } catch (problem: any) {
    warning('Rejection Failed', apiError(problem))
  }
}

const handleDialogRevert = async () => {
  if (!selectedRequest.value || approvingId.value !== null) return
  try {
    const message = await revertRequest(Number(selectedRequest.value.id))
    requestOpen.value = false
    success('Overtime Reverted', message)
  } catch (problem: any) {
    warning('Undo Failed', apiError(problem))
  }
}

const handleExport = () => { exportOpen.value = true }

onMounted(() => { void loadRequests() })
</script>

<template>
  <section class="overtime-approval-page">

    <!-- HEADER -->

    <PageHeader
      title="OT Approvals"
      description="Review employee overtime requests, requested hours, schedules, justification and approval status."
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
          @click="
            handleExport
          "
        >
          Export
        </AppButton>

        <AppButton
          variant="secondary"
          :icon="RefreshCw"
          :disabled="loading"
          @click="
            loadRequests
          "
        >
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <OvertimeApprovalStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <OvertimeApprovalFilters
      v-model:search="
        search
      "
      v-model:department="
        department
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
        departmentOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <div v-if="loading" class="request-message">
      Loading overtime approvals...
    </div>

    <div v-else-if="loadError" class="request-message request-error" role="alert">
      <span>{{ loadError }}</span>
      <AppButton variant="secondary" size="sm" @click="loadRequests">Retry</AppButton>
    </div>

    <OvertimeApprovalTable v-else @action="openRequest"
      :requests="
        paginatedRequests
      "
    />

    <!-- PAGINATION -->

    <div v-if="!loading && !loadError" class="table-footer">

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
            filteredRequests.length
          }}
        </strong>

        overtime approval requests
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

    <PayrollExportDialog :open="exportOpen" title="OT Approvals" :records="exportRecords" :sample="false" :date-from="dateFrom" :date-to="dateTo" :filters="{ Search: search, Department: department, Status: status }" @close="exportOpen = false" />
    <ApprovalRequestDialog
      :open="requestOpen"
      kind="Overtime"
      :mode="requestMode"
      :request="selectedRequest"
      :processing="approvingId !== null"
      @close="requestOpen = false"
      @approve="handleDialogApprove"
      @reject="handleDialogReject"
      @revert="handleDialogRevert"
    />
    <FileApprovalRequestModal
      :open="fileRequestOpen"
      default-type="Overtime"
      @close="fileRequestOpen = false"
      @success="handleFileRequestSuccess"
    />
  </section>
</template>

<style scoped>
.overtime-approval-page {
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
    14px 3px 0;
}

.table-footer p {
  margin: 0;

  color:
    var(--text-muted);

  font-size: 11px;
}

.table-footer strong {
  color:
    var(--text-primary);

  font-weight: 650;
}

.request-message {
  display: flex;
  min-height: 130px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 11px;
}

.request-error {
  color: var(--red);
}

@media (max-width: 650px) {
  .table-footer {
    align-items: flex-start;

    flex-direction: column;
  }
}
</style>
