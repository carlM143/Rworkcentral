<script setup lang="ts">
import {
  CalendarDays,
  CircleCheck,
  CalendarClock,
  Building2,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    leaveEvents: number
    approvedDays: number
    upcomingLeaves: number
    departmentsAffected: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Leave Events"
      :value="stats.leaveEvents"
      description="Leave records this month"
      :icon="CalendarDays"
      tone="blue"
    />

    <StatCard
      label="Approved Leave Days"
      :value="stats.approvedDays"
      description="Approved leave days this month"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Upcoming Leaves"
      :value="stats.upcomingLeaves"
      description="Approved upcoming employee leaves"
      :icon="CalendarClock"
      tone="orange"
    />

    <StatCard
      label="Departments Affected"
      :value="stats.departmentsAffected"
      description="Departments with approved leaves"
      :icon="Building2"
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