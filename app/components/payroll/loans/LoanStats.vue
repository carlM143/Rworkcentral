<script setup lang="ts">
import {
  WalletCards,
  Clock3,
  BadgeDollarSign,
  CircleCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    active: number
    pending: number
    outstanding: number
    completed: number
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
      label="Active Loans"
      :value="stats.active"
      description="Currently deducted through payroll"
      :icon="WalletCards"
      tone="blue"
    />

    <StatCard
      label="Pending Applications"
      :value="stats.pending"
      description="Waiting for review and approval"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Outstanding Balance"
      :value="money(stats.outstanding)"
      description="Remaining approved loan balance"
      :icon="BadgeDollarSign"
      tone="purple"
    />

    <StatCard
      label="Completed Loans"
      :value="stats.completed"
      description="Fully paid loan records"
      :icon="CircleCheck"
      tone="green"
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