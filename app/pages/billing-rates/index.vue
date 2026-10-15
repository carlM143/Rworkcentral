<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import BillingRateStats from '~/components/billing/rates/BillingRateStats.vue'
import BillingRateFilters from '~/components/billing/rates/BillingRateFilters.vue'
import BillingRateTable from '~/components/billing/rates/BillingRateTable.vue'

const router =
  useRouter()

const route =
  useRoute()

const {
  search,
  client,
  rateType,
  status,
  effectiveDate,

  currentPage,

  filteredRates,
  paginatedRates,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  clientOptions,
  rateTypeOptions,
  statusOptions,

  resetFilters,
} = useBillingRates()

const {
  info,
} = useToast()

/* =========================================================
   QUERY FILTER

   Example:
   /billing-rates?client=Davao Logistics Corp.
========================================================= */

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
    'Export Billing Rates',
    'Billing rate export functionality will be connected later.',
  )
}

const handleAddRate = () => {
  info(
    'Add Billing Rate',
    'Billing rate creation form will be added after the Billing submenu UIs are completed.',
  )
}

const handleBack = () => {
  router.push(
    '/billing',
  )
}
</script>

<template>
  <section class="billing-rates-page">

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
      title="Billing Rates"
      description="Manage master client billing rates by position, service, billing type and effective period."
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
            handleAddRate
          "
        >
          Add Billing Rate
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <BillingRateStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <BillingRateFilters
      v-model:search="
        search
      "
      v-model:client="
        client
      "
      v-model:rate-type="
        rateType
      "
      v-model:status="
        status
      "
      v-model:effective-date="
        effectiveDate
      "
      :clients="
        clientOptions
      "
      :rate-types="
        rateTypeOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <BillingRateTable
      :rates="
        paginatedRates
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
            filteredRates.length
          }}
        </strong>

        billing rates
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
.billing-rates-page {
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