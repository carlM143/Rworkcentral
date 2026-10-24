<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  FileBarChart,
} from 'lucide-vue-next'

import CompletedBillingStats from '~/components/admin/billing/completed/CompletedBillingStats.vue'
import CompletedBillingFilters from '~/components/admin/billing/completed/CompletedBillingFilters.vue'
import CompletedBillingTable from '~/components/admin/billing/completed/CompletedBillingTable.vue'

const router =
  useRouter()

const route =
  useRoute()

const {
  search,
  batch,
  client,
  paymentStatus,
  dateFrom,
  dateTo,

  currentPage,

  filteredBillings,
  paginatedBillings,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  batchOptions,
  clientOptions,
  paymentStatusOptions,

  resetFilters,
} = useCompletedBilling()

const {
  info,
} = useToast()

/* =========================================================
   QUERY FILTERS

   /admin/completed-billing?batch=BILL-2026-08-B

   /admin/completed-billing?client=Davao Logistics Corp.
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
    'Export Completed Billing',
    'Completed billing export functionality will be connected later.',
  )
}

const handleSummary = () => {
  info(
    'Billing Summary',
    'Completed billing summary and reporting will be connected later.',
  )
}

const handleBack = () => {
  router.push(
    '/admin/billing',
  )
}
</script>

<template>
  <section class="completed-billing-page">

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
      title="Completed Billing"
      description="Review finalized client billing records, payments received, outstanding balances and invoice references."
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
          :icon="FileBarChart"
          @click="
            handleSummary
          "
        >
          Billing Summary
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <CompletedBillingStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <CompletedBillingFilters
      v-model:search="
        search
      "
      v-model:batch="
        batch
      "
      v-model:client="
        client
      "
      v-model:payment-status="
        paymentStatus
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
      :payment-statuses="
        paymentStatusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <CompletedBillingTable
      :billings="
        paginatedBillings
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
            filteredBillings.length
          }}
        </strong>

        completed billing records
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
.completed-billing-page {
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