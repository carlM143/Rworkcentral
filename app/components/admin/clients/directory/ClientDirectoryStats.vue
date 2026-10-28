<script setup lang="ts">
import {
  Building2,
  CircleCheck,
  CircleX,
  UsersRound,
} from 'lucide-vue-next'

defineProps<{
  stats: {
    totalClients: number
    activeClients: number
    inactiveClients: number
    assignedEmployees: number
  }
}>()
</script>

<template>
  <div class="stats-grid">

    <StatCard
      label="Total Clients"
      :value="stats.totalClients"
      description="Registered client accounts"
      :icon="Building2"
      tone="blue"
    />

    <StatCard
      label="Active Clients"
      :value="stats.activeClients"
      description="Currently active clients"
      :icon="CircleCheck"
      tone="green"
    />

    <StatCard
      label="Inactive Clients"
      :value="stats.inactiveClients"
      description="Inactive client accounts"
      :icon="CircleX"
      tone="orange"
    />

    <StatCard
      label="Assigned Employees"
      :value="stats.assignedEmployees"
      description="Employees deployed to clients"
      :icon="UsersRound"
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