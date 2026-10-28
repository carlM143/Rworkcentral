<script setup lang="ts">
import {
  CalendarRange,
  CircleDot,
  LoaderCircle,
  CircleCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    open: number
    processing: number
    closed: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Total Periods"
      :value="stats.total"
      description="Driver payroll periods created"
      :icon="CalendarRange"
      tone="blue"
    />

    <StatCard
      label="Open Periods"
      :value="stats.open"
      description="Accepting driver payroll records"
      :icon="CircleDot"
      tone="orange"
    />

    <StatCard
      label="Processing"
      :value="stats.processing"
      description="Currently being processed"
      :icon="LoaderCircle"
      tone="purple"
    />

    <StatCard
      label="Closed Periods"
      :value="stats.closed"
      description="Completed and locked periods"
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