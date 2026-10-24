<script setup lang="ts">
import {
  Users,
  UserCheck,
  Clock3,
  UserX,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    total: number
    present: number
    late: number
    absent: number
  }
}>()
</script>

<template>
  <div class="timekeeping-stats">

    <StatCard
      label="Total Employees"
      :value="stats.total"
      description="Expected attendance today"
      :icon="Users"
      tone="blue"
    />

    <StatCard
      label="Present Today"
      :value="stats.present"
      description="Includes late employees"
      :icon="UserCheck"
      tone="green"
    />

    <StatCard
      label="Late"
      :value="stats.late"
      description="Employees with late time-in"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Absent"
      :value="stats.absent"
      description="No attendance recorded"
      :icon="UserX"
      tone="purple"
    />

  </div>
</template>

<style scoped>
.timekeeping-stats {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 12px;

  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .timekeeping-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .timekeeping-stats {
    grid-template-columns: 1fr;
  }
}
</style>