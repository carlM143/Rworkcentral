<script setup lang="ts">
import {
  UsersRound,
  Banknote,
  Gift,
  CircleCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    employees: number
    eligibleBasicPay: number
    computedAmount: number
    releasedAmount: number
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
      maximumFractionDigits: 2,
    },
  ).format(value)
}
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Employees"
      :value="stats.employees"
      description="Employees included in computation"
      :icon="UsersRound"
      tone="blue"
    />

    <StatCard
      label="Eligible Basic Pay"
      :value="money(stats.eligibleBasicPay)"
      description="Total covered basic pay"
      :icon="Banknote"
      tone="purple"
    />

    <StatCard
      label="13th Month Amount"
      :value="money(stats.computedAmount)"
      description="Total computed amount"
      :icon="Gift"
      tone="orange"
    />

    <StatCard
      label="Released Amount"
      :value="money(stats.releasedAmount)"
      description="Amount already released"
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