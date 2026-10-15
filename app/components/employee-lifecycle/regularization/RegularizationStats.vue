<script setup lang="ts">
import {
  BadgeCheck,
  ClipboardClock,
  ClipboardCheck,
  UsersRound,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    dueSoon: number
    recommended: number
    regularized: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Regularization Records"
      :value="stats.total"
      description="Employees being monitored"
      :icon="UsersRound"
      tone="blue"
    />

    <StatCard
      label="For Evaluation / Review"
      :value="stats.dueSoon"
      description="Requires HR or supervisor action"
      :icon="ClipboardClock"
      tone="orange"
    />

    <StatCard
      label="Recommended / Approved"
      :value="stats.recommended"
      description="Employees qualified for regularization"
      :icon="ClipboardCheck"
      tone="purple"
    />

    <StatCard
      label="Regularized"
      :value="stats.regularized"
      description="Completed employee regularizations"
      :icon="BadgeCheck"
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