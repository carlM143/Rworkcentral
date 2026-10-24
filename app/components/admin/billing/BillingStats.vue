<script setup lang="ts">
import {
  CalendarDays,
  Building2,
  ReceiptText,
  AlertTriangle,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    period: string
    clients: number
    amount: number
    issues: number
  }
}>()

const formatCurrency = (
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
  <div class="billing-stats">

    <StatCard
      label="Current Billing Period"
      :value="stats.period"
      description="Active billing cycle"
      :icon="CalendarDays"
      tone="blue"
    />

    <StatCard
      label="Clients for Billing"
      :value="stats.clients"
      description="Clients included in billing"
      :icon="Building2"
      tone="green"
    />

    <StatCard
      label="Estimated Billing"
      :value="formatCurrency(stats.amount)"
      description="Current billing estimate"
      :icon="ReceiptText"
      tone="purple"
    />

    <StatCard
      label="Pending Issues"
      :value="stats.issues"
      description="Requires billing review"
      :icon="AlertTriangle"
      tone="orange"
    />

  </div>
</template>

<style scoped>
.billing-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .billing-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .billing-stats {
    grid-template-columns: 1fr;
  }
}
</style>