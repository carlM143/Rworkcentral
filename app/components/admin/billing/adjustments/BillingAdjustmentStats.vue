<script setup lang="ts">
import {
  SlidersHorizontal,
  Clock3,
  CircleCheck,
  BadgeDollarSign,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalAdjustments: number
    pendingReview: number
    approved: number
    netAdjustment: number
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
      label="Total Adjustments"
      :value="
        stats.totalAdjustments
      "
      description="Billing adjustment records"
      :icon="SlidersHorizontal"
      tone="blue"
    />

    <StatCard
      label="Pending Review"
      :value="
        stats.pendingReview
      "
      description="Adjustments requiring review"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Approved Adjustments"
      :value="
        stats.approved
      "
      description="Approved or applied adjustments"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Net Adjustment Amount"
      :value="
        money(
          stats.netAdjustment,
        )
      "
      description="Net non-rejected adjustment amount"
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