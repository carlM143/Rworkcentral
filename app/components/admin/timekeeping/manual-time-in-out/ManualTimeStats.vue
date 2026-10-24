<script setup lang="ts">
import {
  CalendarClock,
  Clock3,
  CircleCheck,
  FileWarning,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    today: number
    pending: number
    completed: number
    missingLogs: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Manual Entries Today"
      :value="stats.today"
      description="Entries encoded today"
      :icon="CalendarClock"
      tone="blue"
    />

    <StatCard
      label="Pending Validation"
      :value="stats.pending"
      description="Waiting for validation"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Completed Entries"
      :value="stats.completed"
      description="Validated manual entries"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Missing Log Entries"
      :value="stats.missingLogs"
      description="Pending time in or out"
      :icon="FileWarning"
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