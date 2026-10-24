<script setup lang="ts">
import {
  UsersRound,
  Banknote,
  CircleMinus,
  WalletCards,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    employees: number
    grossPay: number
    deductions: number
    netPay: number
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
      description="Employees included in payroll"
      :icon="UsersRound"
      tone="blue"
    />

    <StatCard
      label="Gross Payroll"
      :value="money(stats.grossPay)"
      description="Total earnings before deductions"
      :icon="Banknote"
      tone="green"
    />

    <StatCard
      label="Total Deductions"
      :value="money(stats.deductions)"
      description="Statutory and other deductions"
      :icon="CircleMinus"
      tone="orange"
    />

    <StatCard
      label="Net Payroll"
      :value="money(stats.netPay)"
      description="Total employee take-home pay"
      :icon="WalletCards"
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