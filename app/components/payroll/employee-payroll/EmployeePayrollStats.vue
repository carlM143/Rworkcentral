<script setup lang="ts">
import {
  Files,
  BadgeDollarSign,
  ReceiptText,
  WalletCards,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalRecords: number
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
      label="Total Payroll Records"
      :value="stats.totalRecords"
      description="Employee payroll records displayed"
      :icon="Files"
      tone="blue"
    />

    <StatCard
      label="Total Gross Pay"
      :value="
        money(
          stats.grossPay,
        )
      "
      description="Combined gross payroll amount"
      :icon="BadgeDollarSign"
      tone="purple"
    />

    <StatCard
      label="Total Deductions"
      :value="
        money(
          stats.deductions,
        )
      "
      description="Combined payroll deductions"
      :icon="ReceiptText"
      tone="orange"
    />

    <StatCard
      label="Total Net Pay"
      :value="
        money(
          stats.netPay,
        )
      "
      description="Combined employee net payroll"
      :icon="WalletCards"
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