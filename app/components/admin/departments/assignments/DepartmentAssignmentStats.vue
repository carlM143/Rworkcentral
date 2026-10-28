<script setup lang="ts">
import {
  Users,
  CircleCheck,
  Clock3,
  Building2,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalAssignments: number
    activeAssignments: number
    temporaryAssignments: number
    departmentsCovered: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Total Assignments"
      :value="stats.totalAssignments"
      description="Department assignment records"
      :icon="Users"
      tone="blue"
    />

    <StatCard
      label="Active Assignments"
      :value="stats.activeAssignments"
      description="Current primary assignments"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Temporary / Acting"
      :value="stats.temporaryAssignments"
      description="Temporary employee assignments"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Departments Covered"
      :value="stats.departmentsCovered"
      description="Departments with assigned employees"
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