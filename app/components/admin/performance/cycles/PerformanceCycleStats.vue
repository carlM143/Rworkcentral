<script setup lang="ts">
import {
  CalendarRange,
  PlayCircle,
  CalendarClock,
  Gauge,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalCycles: number
    activeCycles: number
    scheduledCycles: number
    completionRate: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Evaluation Cycles"
      :value="stats.totalCycles"
      description="Performance cycles on record"
      :icon="CalendarRange"
      tone="blue"
    />

    <StatCard
      label="Active Cycles"
      :value="stats.activeCycles"
      description="Evaluation periods currently ongoing"
      :icon="PlayCircle"
      tone="green"
    />

    <StatCard
      label="Scheduled Cycles"
      :value="stats.scheduledCycles"
      description="Upcoming performance evaluations"
      :icon="CalendarClock"
      tone="orange"
    />

    <StatCard
      label="Active Completion"
      :value="`${stats.completionRate}%`"
      description="Completion across active cycles"
      :icon="Gauge"
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