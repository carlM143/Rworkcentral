<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import BillingAdjustmentStats from '~/components/admin/billing/adjustments/BillingAdjustmentStats.vue'
import BillingAdjustmentFilters from '~/components/admin/billing/adjustments/BillingAdjustmentFilters.vue'
import BillingAdjustmentTable from '~/components/admin/billing/adjustments/BillingAdjustmentTable.vue'

const router =
  useRouter()

const route =
  useRoute()

const {
  search,
  batch,
  client,
  adjustmentType,
  status,
  dateFrom,
  dateTo,

  currentPage,

  filteredAdjustments,
  paginatedAdjustments,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  batchOptions,
  clientOptions,
  typeOptions,
  statusOptions,

  resetFilters,
} = useBillingAdjustments()

const {
  info,
} = useToast()

/* =========================================================
   QUERY FILTERS

   Examples:
   /admin/billing-adjustments?batch=BILL-2026-09-A
   /admin/billing-adjustments?client=Davao Logistics Corp.
========================================================= */

watch(
  () =>
    route.query.batch,
  value => {
    if (
      typeof value ===
        'string' &&
      value
    ) {
      batch.value =
        value
    }
  },
  {
    immediate: true,
  },
)

watch(
  () =>
    route.query.client,
  value => {
    if (
      typeof value ===
        'string' &&
      value
    ) {
      client.value =
        value
    }
  },
  {
    immediate: true,
  },
)

/* =========================================================
   UI ONLY
========================================================= */

const handleExport = () => {
  info(
    'Export Billing Adjustments',
    'Billing adjustment export functionality will be connected later.',
  )
}

const handleCreateAdjustment = () => {
  info(
    'Create Billing Adjustment',
    'Adjustment creation and approval workflow will be added later.',
  )
}

const handleBack = () => {
  router.push(
    '/admin/billing',
  )
}
</script>

<template>
  <section class="billing-adjustments-page">

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

      Back to Billing

    </button>

    <!-- HEADER -->

    <PageHeader
      title="Billing Adjustments"
      description="Review billing additions, deductions, rate corrections and manual adjustments before final billing completion."
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
            handleCreateAdjustment
          "
        >
          Create Adjustment
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <BillingAdjustmentStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <BillingAdjustmentFilters
      v-model:search="
        search
      "
      v-model:batch="
        batch
      "
      v-model:client="
        client
      "
      v-model:adjustment-type="
        adjustmentType
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
      :batches="
        batchOptions
      "
      :clients="
        clientOptions
      "
      :adjustment-types="
        typeOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <BillingAdjustmentTable
      :adjustments="
        paginatedAdjustments
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
            filteredAdjustments.length
          }}
        </strong>

        billing adjustments
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
.billing-adjustments-page {
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

  font-family:
    inherit;

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

    align-items:
      stretch;

    flex-direction:
      column;
  }

  .table-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>