<script setup lang="ts">
import {
  BriefcaseBusiness,
  CircleCheck,
  Users,
  UserPlus,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalPositions: number
    activePositions: number
    totalHeadcount: number
    vacancies: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Total Positions"
      :value="stats.totalPositions"
      description="Configured positions and designations"
      :icon="BriefcaseBusiness"
      tone="blue"
    />

    <StatCard
      label="Active Positions"
      :value="stats.activePositions"
      description="Positions currently available"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Current Headcount"
      :value="stats.totalHeadcount"
      description="Employees assigned to active positions"
      :icon="Users"
      tone="purple"
    />

    <StatCard
      label="Open Vacancies"
      :value="stats.vacancies"
      description="Available slots based on approved headcount"
      :icon="UserPlus"
      tone="orange"
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