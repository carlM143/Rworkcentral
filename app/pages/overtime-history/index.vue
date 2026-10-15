<script setup lang="ts">
import {
  ArrowLeft,
  CheckCircle2,
  Download,
} from 'lucide-vue-next'

import OvertimeHistoryStats from '~/components/overtime/history/OvertimeHistoryStats.vue'
import OvertimeHistoryFilters from '~/components/overtime/history/OvertimeHistoryFilters.vue'
import OvertimeHistoryTable from '~/components/overtime/history/OvertimeHistoryTable.vue'

const router =
  useRouter()

const {
  search,
  department,
  overtimeType,
  status,
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
  statusOptions,
  payrollStatusOptions,

  resetFilters,
} = useOvertimeHistory()

const {
  info,
} = useToast()

const handleBack = () => {
  router.push(
    '/overtime',
  )
}

const handleExport = () => {
  info(
    'Export Overtime History',
    'Overtime history export functionality will be connected later.',
  )
}

const handleApprovedOvertime = () => {
  router.push(
    '/approved-overtime',
  )
}
</script>

<template>
  <section class="overtime-history-page">

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
      title="Overtime History"
      description="Review finalized overtime requests, historical approval results and payroll processing status."
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

    <OvertimeHistoryStats
      :stats="
        stats
      "
    />

    <!-- FILTER -->

    <OvertimeHistoryFilters
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
      :statuses="
        statusOptions
      "
      :payroll-statuses="
        payrollStatusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <OvertimeHistoryTable
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

        overtime history records
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
.overtime-history-page {
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