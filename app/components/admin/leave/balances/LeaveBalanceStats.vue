<script setup lang="ts">
import {
  Users,
  CalendarCheck2,
  TriangleAlert,
  CircleX,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    employees: number
    availableCredits: number
    lowBalance: number
    exhausted: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Employees"
      :value="stats.employees"
      description="Employees with leave credits"
      :icon="Users"
      tone="blue"
    />

    <StatCard
      label="Available Leave Credits"
      :value="stats.availableCredits"
      description="Combined remaining leave credits"
      :icon="CalendarCheck2"
      tone="green"
    />

    <StatCard
      label="Low Balance"
      :value="stats.lowBalance"
      description="Employees running low on credits"
      :icon="TriangleAlert"
      tone="orange"
    />

    <StatCard
      label="Exhausted"
      :value="stats.exhausted"
      description="Employees with nearly no credits"
      :icon="CircleX"
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