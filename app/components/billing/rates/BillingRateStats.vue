<script setup lang="ts">
import {
  ReceiptText,
  CircleCheck,
  CalendarClock,
  Building2,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalRates: number
    activeRates: number
    scheduledRates: number
    clientsWithRates: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Total Billing Rates"
      :value="stats.totalRates"
      description="Configured billing rates"
      :icon="ReceiptText"
      tone="blue"
    />

    <StatCard
      label="Active Rates"
      :value="stats.activeRates"
      description="Rates currently used in billing"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Scheduled Rates"
      :value="stats.scheduledRates"
      description="Rates with future effectivity"
      :icon="CalendarClock"
      tone="orange"
    />

    <StatCard
      label="Clients With Rates"
      :value="stats.clientsWithRates"
      description="Clients with billing configuration"
      :icon="Building2"
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