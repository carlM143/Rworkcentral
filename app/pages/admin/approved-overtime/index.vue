<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  FileClock,
} from 'lucide-vue-next'

import ApprovedOvertimeStats from '~/components/admin/overtime/approved/ApprovedOvertimeStats.vue'
import ApprovedOvertimeFilters from '~/components/admin/overtime/approved/ApprovedOvertimeFilters.vue'
import ApprovedOvertimeTable from '~/components/admin/overtime/approved/ApprovedOvertimeTable.vue'

const router =
  useRouter()

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

const {
  info,
} = useToast()

const handleBack = () => {
  router.push(
    '/admin/overtime',
  )
}

const handleExport = () => {
  info(
    'Export Approved Overtime',
    'Approved overtime export functionality will be connected later.',
  )
}

const handleViewRequests = () => {
  router.push(
    '/admin/ot-requests',
  )
}
</script>

<template>
  <section class="approved-overtime-page">

    <!-- BACK -->

    <button
      type="button"
      class="back-button"
      @click="
        handleBack
      "
    >

      <ArrowLeft
        :size="16"
      />

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
          View OT Requests
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <ApprovedOvertimeStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <ApprovedOvertimeFilters
      v-model:search="
        search
      "
      v-model:department="
        department
      "
      v-model:overtime-type="
        overtimeType
      "
      v-model:payroll-status="
        payrollStatus
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
      :payroll-statuses="
        payrollStatusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <ApprovedOvertimeTable
      :records="
        paginatedRecords
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
            filteredRecords.length
          }}
        </strong>

        approved overtime records
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
.approved-overtime-page {
  width: 100%;

  max-width: 1660px;

  margin:
    0 auto;
}

.back-button {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 11px;

  padding: 0;

  border: 0;

  background:
    transparent;

  color:
    var(--primary);

  font-size: 11px;
  font-weight: 600;

  cursor: pointer;
}

.back-button:hover {
  color:
    var(--primary-dark);
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