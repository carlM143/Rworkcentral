<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import LeaveTypeStats from '~/components/admin/leave/types/LeaveTypeStats.vue'
import LeaveTypeFilters from '~/components/admin/leave/types/LeaveTypeFilters.vue'
import LeaveTypeTable from '~/components/admin/leave/types/LeaveTypeTable.vue'

const router =
  useRouter()

const {
  search,
  category,
  payStatus,
  status,

  currentPage,

  filteredLeaveTypes,
  paginatedLeaveTypes,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  categoryOptions,
  payStatusOptions,
  statusOptions,

  resetFilters,
} = useLeaveTypes()

const {
  info,
} = useToast()

const handleBack = () => {
  router.push(
    '/admin/leave-management',
  )
}

const handleExport = () => {
  info(
    'Export Leave Types',
    'Leave type export functionality will be connected later.',
  )
}

const handleAddLeaveType = () => {
  info(
    'Add Leave Type',
    'Leave type creation form will be added later.',
  )
}
</script>

<template>
  <section class="leave-types-page">

    <!-- BACK -->

    <button
      type="button"
      class="back-button"
      @click="
        handleBack
      "
    >

      <ArrowLeft
        :size="15"
      />

      Back to Leave Management

    </button>

    <!-- HEADER -->

    <PageHeader
      title="Leave Types"
      description="Manage company leave categories, default credits, pay treatment, approval requirements and leave policies."
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
            handleAddLeaveType
          "
        >
          Add Leave Type
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <LeaveTypeStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <LeaveTypeFilters
      v-model:search="
        search
      "
      v-model:category="
        category
      "
      v-model:pay-status="
        payStatus
      "
      v-model:status="
        status
      "
      :categories="
        categoryOptions
      "
      :pay-statuses="
        payStatusOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <LeaveTypeTable
      :leave-types="
        paginatedLeaveTypes
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
            filteredLeaveTypes.length
          }}
        </strong>

        leave types
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
.leave-types-page {
  width: 100%;

  max-width: 1660px;

  margin:
    0 auto;
}

.back-button {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 10px;

  padding: 0;

  border: 0;

  background:
    transparent;

  color:
    var(--primary);

  font-size: 10px;
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
    13px 3px 0;
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