<script setup lang="ts">
import {
  CheckCircle2,
  Download,
} from 'lucide-vue-next'

import OvertimeApprovalStats from '~/components/admin/approvals/overtime/OvertimeApprovalStats.vue'
import OvertimeApprovalFilters from '~/components/admin/approvals/overtime/OvertimeApprovalFilters.vue'
import OvertimeApprovalTable from '~/components/admin/approvals/overtime/OvertimeApprovalTable.vue'
import { useOvertimeApprovals } from '~/composables/admin/approvals/useOvertimeApprovals'

const router =
  useRouter()

const {
  success,
  warning,
} = useToast()

const {
  search,
  department,
  overtimeType,
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
  overtimeTypeOptions,
  statusOptions,

  resetFilters,
  loading,
  loadError,
  approvingId,
  loadRequests,
  approveRequest,
} = useOvertimeApprovals()

const exportOpen = ref(false)
const requestOpen = ref(false)
const requestMode = ref('view')
const selectedRequest = ref<Record<string, any> | null>(null)
const apiError = (problem: any) => (
  problem?.data?.errors?.status?.[0]
  ?? problem?.data?.errors?.end_at?.[0]
  ?? problem?.data?.message
  ?? problem?.response?._data?.message
  ?? problem?.message
  ?? 'Unable to approve the overtime request.'
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
    warning('Reject Not Available', 'The backend currently provides an approve endpoint only.')
    return
  }

  selectedRequest.value = request
  requestMode.value = mode === 'review' ? 'view' : mode
  requestOpen.value = true
}

const handleExport = () => { exportOpen.value = true }

const handleApprovedOvertime = () => {
  router.push(
    '/admin/approved-overtime',
  )
}

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
          variant="secondary"
          :icon="Download"
          @click="
            handleExport
          "
        >
          Export
        </AppButton>

        <AppButton
          :icon="CheckCircle2"
          @click="
            handleApprovedOvertime
          "
        >
          Approved Overtime
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
      v-model:overtime-type="
        overtimeType
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
      :overtime-types="
        overtimeTypeOptions
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

    <PayrollExportDialog :open="exportOpen" title="OT Approvals" :records="filteredRequests" :sample="false" :date-from="dateFrom" :date-to="dateTo" :filters="{ Search: search, Department: department, Type: overtimeType, Status: status }" @close="exportOpen = false" />
    <ApprovalRequestDialog :open="requestOpen" kind="Overtime" :mode="requestMode" :request="selectedRequest" @close="requestOpen = false" />
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
  gap: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 12px;
}

.request-error {
  color: var(--red);
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
