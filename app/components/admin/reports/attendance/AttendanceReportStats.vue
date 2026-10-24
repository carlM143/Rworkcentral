<script setup lang="ts">
import {
  UsersRound,
  ChartNoAxesCombined,
  UserX,
  ClockAlert,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalEmployees: number
    averageAttendance: number
    totalAbsences: number
    lateIncidents: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Employees"
      :value="stats.totalEmployees"
      description="Employees included in report"
      :icon="UsersRound"
      tone="blue"
    />

    <StatCard
      label="Average Attendance"
      :value="`${stats.averageAttendance}%`"
      description="Average attendance rate"
      :icon="ChartNoAxesCombined"
      tone="green"
    />

    <StatCard
      label="Total Absences"
      :value="stats.totalAbsences"
      description="Absence days in report period"
      :icon="UserX"
      tone="orange"
    />

    <StatCard
      label="Late Incidents"
      :value="stats.lateIncidents"
      description="Recorded employee late occurrences"
      :icon="ClockAlert"
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