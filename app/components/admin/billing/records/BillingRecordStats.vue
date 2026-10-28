<script setup lang="ts">
import {
  ReceiptText,
  CircleCheck,
  TriangleAlert,
  BadgeDollarSign,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalRecords: number
    ready: number
    reviewOrIssues: number
    totalBilling: number
  }
}>()

const money = (
  value: number,
) => {
  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    },
  ).format(value)
}
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Total Billing Records"
      :value="stats.totalRecords"
      description="Billing records across all periods"
      :icon="ReceiptText"
      tone="blue"
    />

    <StatCard
      label="Ready for Billing"
      :value="stats.ready"
      description="Records ready for billing completion"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="For Review / Issues"
      :value="stats.reviewOrIssues"
      description="Records requiring billing attention"
      :icon="TriangleAlert"
      tone="orange"
    />

    <StatCard
      label="Total Billing Amount"
      :value="
        money(
          stats.totalBilling,
        )
      "
      description="Combined amount of displayed records"
      :icon="BadgeDollarSign"
      tone="purple"
    />

  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 14px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns:
      1fr;
  }
}
</style>