<script setup lang="ts">
import {
  CalendarClock,
  BadgeCheck,
  Users,
  CalendarDays,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    active: number
    employees: number
    restDayConfigurations: number
  }
}>()
</script>

<template>
  <div class="schedule-stats">

    <StatCard
      label="Total Schedules"
      :value="stats.total"
      description="Configured work schedules"
      :icon="CalendarClock"
      tone="blue"
    />

    <StatCard
      label="Active Schedules"
      :value="stats.active"
      description="Schedules currently in use"
      :icon="BadgeCheck"
      tone="green"
    />

    <StatCard
      label="Assigned Employees"
      :value="stats.employees"
      description="Employees with work schedules"
      :icon="Users"
      tone="purple"
    />

    <StatCard
      label="Rest Day Setup"
      :value="stats.restDayConfigurations"
      description="Schedules with rest days"
      :icon="CalendarDays"
      tone="orange"
    />

  </div>
</template>

<style scoped>
.schedule-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 14px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .schedule-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .schedule-stats {
    grid-template-columns: 1fr;
  }
}
</style>