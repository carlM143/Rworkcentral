<script setup lang="ts">
import {
  Download,
  TrendingUp,
} from 'lucide-vue-next'

import PromotionStats from '~/components/employee-lifecycle/promotions/PromotionStats.vue'
import PromotionFilters from '~/components/employee-lifecycle/promotions/PromotionFilters.vue'
import PromotionTable from '~/components/employee-lifecycle/promotions/PromotionTable.vue'

const {
  search,
  department,
  promotionType,
  status,

  currentPage,

  filteredRecords,
  paginatedRecords,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  departmentOptions,
  promotionTypeOptions,
  statusOptions,

  resetFilters,
} = usePromotions()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Promotions',
    'Employee promotion export functionality will be connected later.',
  )
}

const handleNewPromotion = () => {
  info(
    'New Promotion',
    'Employee promotion workflow will be added later.',
  )
}
</script>

<template>
  <section class="promotions-page">

    <PageHeader
      title="Employee Promotions"
      description="Manage employee position, grade and salary advancement with recommendation, approval and effective-date tracking."
    >

      <div class="header-actions">

        <AppButton
          variant="secondary"
          :icon="Download"
          @click="handleExport"
        >
          Export
        </AppButton>

        <AppButton
          :icon="TrendingUp"
          @click="handleNewPromotion"
        >
          New Promotion
        </AppButton>

      </div>

    </PageHeader>

    <PromotionStats
      :stats="stats"
    />

    <PromotionFilters
      v-model:search="search"
      v-model:department="department"
      v-model:promotion-type="promotionType"
      v-model:status="status"
      :departments="departmentOptions"
      :promotion-types="promotionTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <PromotionTable
      :records="paginatedRecords"
    />

    <div class="table-footer">

      <p>
        Showing

        <strong>
          {{ showingFrom }}–{{ showingTo }}
        </strong>

        of

        <strong>
          {{ filteredRecords.length }}
        </strong>

        promotion records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

  </section>
</template>

<style scoped>
.promotions-page {
  width: 100%;

  max-width: 1680px;

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