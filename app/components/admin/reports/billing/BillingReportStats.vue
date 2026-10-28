<script setup lang="ts">
import {
  Building2,
  ReceiptText,
  CircleMinus,
  WalletCards,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    clients: number
    grossBilling: number
    deductions: number
    netBilling: number
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
      label="Clients Billed"
      :value="stats.clients"
      description="Clients included in report"
      :icon="Building2"
      tone="blue"
    />

    <StatCard
      label="Gross Billing"
      :value="money(stats.grossBilling)"
      description="Total billable amount"
      :icon="ReceiptText"
      tone="green"
    />

    <StatCard
      label="Deductions / Credits"
      :value="money(stats.deductions)"
      description="Billing deductions and credits"
      :icon="CircleMinus"
      tone="orange"
    />

    <StatCard
      label="Net Billing"
      :value="money(stats.netBilling)"
      description="Total amount after adjustments"
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