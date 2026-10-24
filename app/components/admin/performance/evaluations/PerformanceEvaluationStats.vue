<script setup lang="ts">
import {
  ClipboardCheck,
  Clock3,
  CircleCheck,
  Star,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalEvaluations: number
    inProgress: number
    completed: number
    averageScore: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Total Evaluations"
      :value="stats.totalEvaluations"
      description="Performance evaluations on record"
      :icon="ClipboardCheck"
      tone="blue"
    />

    <StatCard
      label="In Progress"
      :value="stats.inProgress"
      description="Evaluations still being processed"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Completed"
      :value="stats.completed"
      description="Completed or acknowledged reviews"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Average Score"
      :value="`${stats.averageScore} / 5`"
      description="Average score of evaluated employees"
      :icon="Star"
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