<script setup lang="ts">
import {
  CalendarDays,
  Navigation,
  CircleCheck,
  Clock3,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    today: number
    ongoing: number
    completed: number
    pending: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Trips Today"
      :value="stats.today"
      description="Scheduled trips today"
      :icon="CalendarDays"
      tone="blue"
    />

    <StatCard
      label="Ongoing Trips"
      :value="stats.ongoing"
      description="Currently on trip"
      :icon="Navigation"
      tone="orange"
    />

    <StatCard
      label="Completed Trips"
      :value="stats.completed"
      description="Successfully completed"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Pending Trips"
      :value="stats.pending"
      description="Waiting to start"
      :icon="Clock3"
      tone="purple"
    />

  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>