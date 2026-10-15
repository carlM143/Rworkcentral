<script setup lang="ts">
import {
  History,
  ArrowLeftRight,
  FilePenLine,
  CircleCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    movement: number
    employmentChanges: number
    completed: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Lifecycle Events"
      :value="stats.total"
      description="Historical employee lifecycle records"
      :icon="History"
      tone="blue"
    />

    <StatCard
      label="Transfers & Promotions"
      :value="stats.movement"
      description="Employee movement and advancement"
      :icon="ArrowLeftRight"
      tone="purple"
    />

    <StatCard
      label="Employment Changes"
      :value="stats.employmentChanges"
      description="Regularization and employment updates"
      :icon="FilePenLine"
      tone="orange"
    />

    <StatCard
      label="Completed Events"
      :value="stats.completed"
      description="Completed or effective lifecycle events"
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