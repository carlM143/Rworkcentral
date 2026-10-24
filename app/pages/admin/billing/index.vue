<script setup lang="ts">
import {
  Download,
  Calculator,
} from 'lucide-vue-next'

const {
  currentPeriod,

  billingRecords,

  stats,

  statusBreakdown,

  issues,

  recentRuns,
} = useBillingOverview()

const router =
  useRouter()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Billing',
    'Billing export will be connected later.',
  )
}

const handleCreateBilling = () => {
  info(
    'Create Billing',
    'Billing generation workflow will be implemented in the billing processing module.',
  )
}

const handleRates = () => {
  router.push(
    '/admin/billing-rates',
  )
}

const handleHistory = () => {
  router.push(
    '/admin/completed-billing',
  )
}
</script>

<template>
  <section class="billing-page">

    <PageHeader
      title="Billing"
      description="Monitor billing periods, client computations, billing issues and recent billing activity."
    >

      <AppButton
        variant="secondary"
        :icon="Download"
        @click="handleExport"
      >
        Export
      </AppButton>

      <AppButton
        :icon="Calculator"
        @click="handleCreateBilling"
      >
        Create Billing
      </AppButton>

    </PageHeader>

    <BillingStats
      :stats="stats"
    />

    <BillingPeriodCard
      :period="currentPeriod"
      :breakdown="statusBreakdown"
    />

    <div class="billing-layout">

      <div class="billing-main">

        <BillingPreviewTable
          :records="billingRecords"
        />

      </div>

      <aside class="billing-right">

        <BillingSidePanel
          :issues="issues"
          @create-billing="handleCreateBilling"
          @rates="handleRates"
          @history="handleHistory"
        />

        <RecentBillingRuns
          :runs="recentRuns"
        />

      </aside>

    </div>

  </section>
</template>

<style scoped>
.billing-page {
  width: 100%;
  max-width: 1660px;

  margin: 0 auto;
}

.billing-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    290px;

  gap: 12px;
}

.billing-main {
  min-width: 0;
}

.billing-right {
  display: flex;

  flex-direction: column;

  gap: 12px;
}

@media (max-width: 1100px) {
  .billing-layout {
    grid-template-columns: 1fr;
  }
}
</style>