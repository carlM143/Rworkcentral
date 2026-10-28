<script setup lang="ts">
import {
  Download,
  FileClock,
} from 'lucide-vue-next'

import TimeLogApprovalStats from '~/components/admin/approvals/time-logs/TimeLogApprovalStats.vue'
import TimeLogApprovalFilters from '~/components/admin/approvals/time-logs/TimeLogApprovalFilters.vue'
import TimeLogApprovalTable from '~/components/admin/approvals/time-logs/TimeLogApprovalTable.vue'

const router =
  useRouter()

const {
  search,
  department,
  correctionType,
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
  correctionTypeOptions,
  statusOptions,

  resetFilters,
} = useTimeLogApprovals()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Time Log Corrections',
    'Time log correction export functionality will be connected later.',
  )
}

const handleViewRequests = () => {
  router.push(
    '/admin/timekeeping/time-log-correction-requests',
  )
}
</script>

<template>
  <section class="time-log-approval-page">

    <!-- HEADER -->

    <PageHeader
      title="Time Log Corrections"
      description="Review employee attendance correction requests before applying changes to official timekeeping records."
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
          :icon="FileClock"
          @click="
            handleViewRequests
          "
        >
          View Correction Requests
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <TimeLogApprovalStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <TimeLogApprovalFilters
      v-model:search="
        search
      "
      v-model:department="
        department
      "
      v-model:correction-type="
        correctionType
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
      :correction-types="
        correctionTypeOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <TimeLogApprovalTable
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

        time log correction requests
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
.time-log-approval-page {
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