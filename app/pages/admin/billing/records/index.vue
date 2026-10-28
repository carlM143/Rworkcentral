<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import BillingRecordStats from '~/components/admin/billing/records/BillingRecordStats.vue'
import BillingRecordFilters from '~/components/admin/billing/records/BillingRecordFilters.vue'
import BillingRecordTable from '~/components/admin/billing/records/BillingRecordTable.vue'

const router =
  useRouter()

const route =
  useRoute()

const {
  search,
  batch,
  client,
  status,
  dateFrom,
  dateTo,

  currentPage,

  filteredRecords,
  paginatedRecords,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  batchOptions,
  clientOptions,
  statusOptions,

  resetFilters,
} = useBillingRecords()

const {
  info,
} = useToast()

/* =========================================================
   QUERY FILTERS

   Examples:
   /admin/billing/records?batch=BILL-2026-09-A
   /admin/billing/records?client=Davao Logistics Corp.
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
    'Export Billing Records',
    'Billing record export functionality will be connected later.',
  )
}

const handleCreateBilling = () => {
  info(
    'Create Billing',
    'Billing generation workflow will be added after the Billing submenu UIs are completed.',
  )
}

const handleBack = () => {
  router.push(
    '/admin/billing',
  )
}
</script>

<template>
  <section class="billing-records-page">

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
      title="Billing Records"
      description="Review client billing computations, work hours, adjustments, issues and billing records awaiting completion."
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
            handleCreateBilling
          "
        >
          Create Billing
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <BillingRecordStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <BillingRecordFilters
      v-model:search="
        search
      "
      v-model:batch="
        batch
      "
      v-model:client="
        client
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
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <BillingRecordTable
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

        billing records
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
.billing-records-page {
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