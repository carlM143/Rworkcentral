<script setup lang="ts">
import {
  Clock3,
  TimerReset,
  CircleCheck,
  TrendingDown,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    lateRecords: number
    pending: number
    approved: number
    totalMinutesAdjusted: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Late Records"
      :value="stats.lateRecords"
      description="Recorded late attendance"
      :icon="Clock3"
      tone="blue"
    />

    <StatCard
      label="Pending Adjustments"
      :value="stats.pending"
      description="Waiting for review"
      :icon="TimerReset"
      tone="orange"
    />

    <StatCard
      label="Approved"
      :value="stats.approved"
      description="Approved late adjustments"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Minutes Adjusted"
      :value="stats.totalMinutesAdjusted"
      description="Approved minutes removed"
      :icon="TrendingDown"
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