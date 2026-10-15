<script setup lang="ts">
import {
  CircleCheck,
  BadgeDollarSign,
  ReceiptText,
  WalletCards,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    completed: number
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
      maximumFractionDigits: 0,
    },
  ).format(value)
}
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Completed Payrolls"
      :value="stats.completed"
      description="Completed driver payroll records"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Total Gross Pay"
      :value="money(stats.grossPay)"
      description="Combined driver gross payroll"
      :icon="BadgeDollarSign"
      tone="blue"
    />

    <StatCard
      label="Total Deductions"
      :value="money(stats.deductions)"
      description="Government, loan and other deductions"
      :icon="ReceiptText"
      tone="orange"
    />

    <StatCard
      label="Total Net Pay"
      :value="money(stats.netPay)"
      description="Final payroll amount after deductions"
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