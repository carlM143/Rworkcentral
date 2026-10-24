<script setup lang="ts">
import {
  BadgeDollarSign,
  Users,
  Car,
  CircleCheck,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    employees: number
    drivers: number
    active: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Total Rate Profiles"
      :value="stats.total"
      description="Configured payroll rate profiles"
      :icon="BadgeDollarSign"
      tone="blue"
    />

    <StatCard
      label="Employee Rates"
      :value="stats.employees"
      description="Employee compensation profiles"
      :icon="Users"
      tone="purple"
    />

    <StatCard
      label="Driver Rates"
      :value="stats.drivers"
      description="Driver and trip-based profiles"
      :icon="Car"
      tone="orange"
    />

    <StatCard
      label="Active Rates"
      :value="stats.active"
      description="Rates currently in effect"
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