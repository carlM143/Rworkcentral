<script setup lang="ts">
import {
  CircleCheck,
  BadgeDollarSign,
  WalletCards,
  CircleAlert,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    completedBillings: number
    totalBilling: number
    paidAmount: number
    outstandingAmount: number
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
      label="Completed Billings"
      :value="
        stats.completedBillings
      "
      description="Finalized billing records"
      :icon="CircleCheck"
      tone="blue"
    />

    <StatCard
      label="Total Billing Amount"
      :value="
        money(
          stats.totalBilling,
        )
      "
      description="Total value of completed billings"
      :icon="BadgeDollarSign"
      tone="purple"
    />

    <StatCard
      label="Paid / Settled"
      :value="
        money(
          stats.paidAmount,
        )
      "
      description="Total payments received"
      :icon="WalletCards"
      tone="green"
    />

    <StatCard
      label="Outstanding Amount"
      :value="
        money(
          stats.outstandingAmount,
        )
      "
      description="Remaining client receivables"
      :icon="CircleAlert"
      tone="orange"
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