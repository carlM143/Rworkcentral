<script setup lang="ts">
import {
  Download,
  FileText,
} from 'lucide-vue-next'

import LeaveApprovalStats from '~/components/admin/approvals/leaves/LeaveApprovalStats.vue'
import LeaveApprovalFilters from '~/components/admin/approvals/leaves/LeaveApprovalFilters.vue'
import LeaveApprovalTable from '~/components/admin/approvals/leaves/LeaveApprovalTable.vue'

const router =
  useRouter()

const {
  search,
  department,
  leaveType,
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
  leaveTypeOptions,
  statusOptions,

  resetFilters,
} = useLeaveApprovals()

const exportOpen = ref(false)
const requestOpen = ref(false)
const requestMode = ref('view')
const selectedRequest = ref<Record<string, any> | null>(null)
const openRequest = (mode: string, request: Record<string, any>) => { selectedRequest.value = request; requestMode.value = mode; requestOpen.value = true }

const handleExport = () => { exportOpen.value = true }

const handleFiledLeaves = () => {
  router.push(
    '/admin/filed-leaves',
  )
}
</script>

<template>
  <section class="leave-approval-page">

    <!-- HEADER -->

    <PageHeader
      title="Leave Approvals"
      description="Review employee leave requests, available leave balances, requested dates and approval status."
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
          :icon="FileText"
          @click="
            handleFiledLeaves
          "
        >
          View Filed Leaves
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <LeaveApprovalStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <LeaveApprovalFilters
      v-model:search="
        search
      "
      v-model:department="
        department
      "
      v-model:leave-type="
        leaveType
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
      :leave-types="
        leaveTypeOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <LeaveApprovalTable @action="openRequest"
      :requests="
        paginatedRequests
      "
    />

    <!-- PAGINATION -->

    <div class="table-footer">

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

        leave approval requests
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

    <PayrollExportDialog :open="exportOpen" title="Leave Approvals" :records="filteredRequests" :sample="false" :date-from="dateFrom" :date-to="dateTo" :filters="{ Search: search, Department: department, Type: leaveType, Status: status }" @close="exportOpen = false" />
    <ApprovalRequestDialog :open="requestOpen" kind="Leave" :mode="requestMode" :request="selectedRequest" @close="requestOpen = false" />
  </section>
</template>

<style scoped>
.leave-approval-page {
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