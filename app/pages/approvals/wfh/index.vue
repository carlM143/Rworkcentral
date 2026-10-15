<script setup lang="ts">
import {
  Download,
  CalendarRange,
} from 'lucide-vue-next'

import WfhApprovalStats from '~/components/approvals/wfh/WfhApprovalStats.vue'
import WfhApprovalFilters from '~/components/approvals/wfh/WfhApprovalFilters.vue'
import WfhApprovalTable from '~/components/approvals/wfh/WfhApprovalTable.vue'

const {
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

  resetFilters,
} = useWfhApprovals()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export WFH Approvals',
    'WFH approval export functionality will be connected later.',
  )
}

const handleSchedule = () => {
  info(
    'WFH Schedule',
    'WFH schedule view will be connected later.',
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
          @click="
            handleExport
          "
        >
          Export
        </AppButton>

        <AppButton
          :icon="CalendarRange"
          @click="
            handleSchedule
          "
        >
          WFH Schedule
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <WfhApprovalStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <WfhApprovalFilters
      v-model:search="
        search
      "
      v-model:department="
        department
      "
      v-model:request-type="
        requestType
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
      :request-types="
        requestTypeOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <WfhApprovalTable
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

        WFH approval requests
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

  </section>
</template>

<style scoped>
.wfh-approval-page {
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