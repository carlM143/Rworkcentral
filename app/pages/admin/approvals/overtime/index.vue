<script setup lang="ts">
import {
  CheckCircle2,
  Download,
} from 'lucide-vue-next'

import OvertimeApprovalStats from '~/components/admin/approvals/overtime/OvertimeApprovalStats.vue'
import OvertimeApprovalFilters from '~/components/admin/approvals/overtime/OvertimeApprovalFilters.vue'
import OvertimeApprovalTable from '~/components/admin/approvals/overtime/OvertimeApprovalTable.vue'

const router =
  useRouter()

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
} = useOvertimeApprovals()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export OT Approvals',
    'Overtime approval export functionality will be connected later.',
  )
}

const handleApprovedOvertime = () => {
  router.push(
    '/admin/approved-overtime',
  )
}
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

    <OvertimeApprovalTable
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