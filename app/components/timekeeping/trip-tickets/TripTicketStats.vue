<script setup lang="ts">
import {
  Ticket,
  Clock3,
  Navigation,
  CircleCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    pending: number
    inUse: number
    completed: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Total Tickets"
      :value="stats.total"
      description="Registered trip tickets"
      :icon="Ticket"
      tone="blue"
    />

    <StatCard
      label="Pending"
      :value="stats.pending"
      description="Waiting to be issued"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="In Use"
      :value="stats.inUse"
      description="Currently active tickets"
      :icon="Navigation"
      tone="purple"
    />

    <StatCard
      label="Completed"
      :value="stats.completed"
      description="Completed trip tickets"
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