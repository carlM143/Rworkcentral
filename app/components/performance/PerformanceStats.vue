<script setup lang="ts">
import {
  ClipboardCheck,
  BadgeCheck,
  Clock3,
  Star,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    completed: number
    ongoing: number
    overdue: number
    averageScore: number
  }
}>()
</script>

<template>
  <div class="performance-stats">

    <StatCard
      label="Total Evaluations"
      :value="stats.total"
      description="Current evaluation cycle"
      :icon="ClipboardCheck"
      tone="blue"
    />

    <StatCard
      label="Completed"
      :value="stats.completed"
      description="Finished employee evaluations"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="In Progress"
      :value="stats.ongoing"
      description="Evaluations currently ongoing"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Average Score"
      :value="`${stats.averageScore}%`"
      :description="`${stats.overdue} overdue evaluation(s)`"
      :icon="Star"
      tone="purple"
    />

  </div>
</template>

<style scoped>
.performance-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .performance-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .performance-stats {
    grid-template-columns: 1fr;
  }
}
</style>