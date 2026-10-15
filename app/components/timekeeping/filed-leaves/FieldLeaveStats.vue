<script setup lang="ts">
import {
  MapPin,
  Clock3,
  CircleCheck,
  BadgeCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    today: number
    pending: number
    approved: number
    completed: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Field Leave Today"
      :value="stats.today"
      description="Employees currently scheduled"
      :icon="MapPin"
      tone="blue"
    />

    <StatCard
      label="Pending Requests"
      :value="stats.pending"
      description="Waiting for approval"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Approved"
      :value="stats.approved"
      description="Approved field assignments"
      :icon="BadgeCheck"
      tone="purple"
    />

    <StatCard
      label="Completed"
      :value="stats.completed"
      description="Completed field leaves"
      :icon="CircleCheck"
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