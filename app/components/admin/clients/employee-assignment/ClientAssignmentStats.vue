<script setup lang="ts">
import {
  UsersRound,
  CircleCheck,
  Clock3,
  Building2,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalAssignments: number
    activeAssignments: number
    pendingAssignments: number
    assignedClients: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Total Assignments"
      :value="stats.totalAssignments"
      description="Employee client assignment records"
      :icon="UsersRound"
      tone="blue"
    />

    <StatCard
      label="Active Assignments"
      :value="stats.activeAssignments"
      description="Currently deployed employees"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Pending Assignments"
      :value="stats.pendingAssignments"
      description="Assignments awaiting confirmation"
      :icon="Clock3"
      tone="orange"
    />

    <StatCard
      label="Assigned Clients"
      :value="stats.assignedClients"
      description="Clients with employee assignments"
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