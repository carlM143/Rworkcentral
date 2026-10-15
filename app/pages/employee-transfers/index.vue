<script setup lang="ts">
import {
  Download,
  Plus,
} from 'lucide-vue-next'

import EmployeeTransferStats from '~/components/departments/transfers/EmployeeTransferStats.vue'
import EmployeeTransferFilters from '~/components/departments/transfers/EmployeeTransferFilters.vue'
import EmployeeTransferTable from '~/components/departments/transfers/EmployeeTransferTable.vue'

const {
  search,

  fromDepartment,
  toDepartment,

  transferType,
  status,

  dateFrom,
  dateTo,

  currentPage,

  filteredTransfers,
  paginatedTransfers,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  departmentOptions,
  transferTypeOptions,
  statusOptions,

  resetFilters,
} = useEmployeeTransfers()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Employee Transfers',
    'Employee transfer export functionality will be connected later.',
  )
}

const handleNewTransfer = () => {
  info(
    'New Employee Transfer',
    'Employee transfer request form will be added later.',
  )
}
</script>

<template>
  <section class="employee-transfers-page">

    <!-- HEADER -->

    <PageHeader
      title="Employee Transfers"
      description="Track employee department and position movements, transfer requests, effective dates and completed internal transfers."
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
          :icon="Plus"
          @click="
            handleNewTransfer
          "
        >
          New Transfer
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <EmployeeTransferStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <EmployeeTransferFilters
      v-model:search="
        search
      "
      v-model:from-department="
        fromDepartment
      "
      v-model:to-department="
        toDepartment
      "
      v-model:transfer-type="
        transferType
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
      :transfer-types="
        transferTypeOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <EmployeeTransferTable
      :transfers="
        paginatedTransfers
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
            filteredTransfers.length
          }}
        </strong>

        employee transfers
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
.employee-transfers-page {
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